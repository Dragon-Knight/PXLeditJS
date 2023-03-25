

var FieldWidth = 128;
var FieldHeight = 16;

var FrameBuffer = [];
var FrameIndex = 0;


var ActiveTools = "pencil"; // ...........................................................................




var mouseDown = false;


















class MyDB
{
	/*
		Структура данных:
		(
			{
				timeout: val,
				frame:
				{
					i: val,
					R: val,
					G: val,
					B: val,
					A: val
				}
			}, ...
		)
	
	*/
	#db = Array();
	
	PutFrame(index, data)
	{
		this.#db[index] = { timeout: data.timeout, frame: data.frame };
		
		return;
	}
	
	GetFrame(index)
	{
		if(this.IsExistsFrame(index) == true)
		{
			return this.#db[index];
		}
		else
		{
			return false;
		}
	}
	
	LengthFrame(index)
	{
		if(this.IsExistsFrame(index) == true)
		{
			return this.#db[index].frame.length;
		}
		else
		{
			return 0;
		}
	}
	
	DeleteFrame(index)
	{
		if(this.IsExistsFrame(index) == true)
		{
			this.#db[index].splice(index, );
		}
		
		return;
	}
	
	IsExistsFrame(index)
	{
		// Проверять длину не объекта а массива frame?
		return (this.#db[index] !== undefined && this.#db[index].length > 0) ? true : false;
	}
	
	
	
	
	
	IterFrame(index, func)
	{
		if(this.IsExistsFrame(index) == true)
		{
			this.#db[index].forEach(function(item)
			{
				func(i);
			});
		}
		
		return;
	}
	
	
	
	
	
	
	
	
}





class GRID
{
	#buffer = new Array();
	#canvas;
	#ctx;
	
	#click_event;
	
	#base_sizes = new Object();
	
	constructor()
	{
		this.#canvas = document.getElementById("canvas");
		
		return;
	}
	
	/*
		Рисуем сетку
			sizeX - Кол-во клеток по оси X;
			sizeY - Кол-во клеток по оси Y;
			grid - Размер одой клетки в px;
			padding - Отступы сетки от блока;
	*/
	Render(sizeX, sizeY, grid, padding)
	{
		this.#buffer = new Array( (sizeX * sizeY) );
		
		
		
		var bw = (sizeX * grid) + 1;
		var bh = (sizeY * grid) + 1;
		
		// Сохраняем на будущие все размеры.
		this.#base_sizes = {sizeX: sizeX, sizeY: sizeY, grid: grid, padding: padding};
		
		this.#canvas.width = bw + padding*2;
		this.#canvas.height = bh + padding*2;
		
		// А можно без этого костыля? В событие свой this, который переопределяется.
		var this2 = this;
		//this.#canvas.addEventListener("click", function(event)
	"click mousemove".split(" ").forEach(function(e)
	{
		this2.#canvas.addEventListener(e, function(event)
		{
			// Неудачная попытка отфильтровать клики вне зоны и на линиях.
			if((event.offsetX - padding) % grid == 0) return;

			if(event.type == "mousemove" && mouseDown == false)
			{
				return;
			}
			
			// Потом перенести в mousemove. Показывать только на клетке но не на сетке.
			event.target.style.cursor = "pointer";
			

			














			// ----------------------
			const tileXY = this2._Real2Tile(event.offsetX, event.offsetY);
			const tileIdx = this2._Tile2Idx(tileXY.x, tileXY.y);
			
			var event_data = { color: this2.GetPixelColor(tileIdx), x: tileXY.x, y: tileXY.y, i: tileIdx };
			var event_resp = this2.#click_event(event.type, event_data);
			
			switch(event_resp.action)
			{
				case 'set_cell':
				{
					this2.DrawPixel(tileXY.x, tileXY.y, tileIdx, event_resp.color);
					
					break
				}
				case 'del_cell':
				{
					this2.ClearPixel(tileXY.x, tileXY.y, tileIdx);
					
					break;
				}
				case 'del_color':
				{
					var delete_color = this2.GetPixelColor(tileIdx);
					if(delete_color != undefined)
					{
						this2.#buffer.forEach(function(pixel_data, idx)
						{
							if(pixel_data.color == delete_color)
							{
								var tmp = this2._Idx2Tile(idx);
								this2.ClearPixel(tmp.x, tmp.y, idx);
							}
						});
					}
					
					break;
				}
				case 'idle':
				{
					break;
				}
				default:
				{
					alert('Неизвестное действие клика по canvas: ' + event_resp.action + '.');
				}
			}
			
			
			
			
			
			
			

			
			//console.log( {offx: event.offsetX, offy: event.offsetY, x: tileX, y: tileY, i: tileNum} );
		});
	});
		
		this.#ctx = this.#canvas.getContext("2d");
		
		for(var i = 0; i <= bw; i += grid)
		{
			this.#ctx.moveTo(0.5 + i + padding, padding);
			this.#ctx.lineTo(0.5 + i + padding, bh + padding);
		}
		
		for(var i = 0; i <= bh; i += grid)
		{
			this.#ctx.moveTo(padding, 0.5 + i + padding);
			this.#ctx.lineTo(bw + padding, 0.5 + i + padding);
		}
		
		this.#ctx.strokeStyle = "black";
		this.#ctx.stroke();
		
		return;
	}
	












	// Рисует пиксель по координатам тайла.
	DrawPixel(tileX, tileY, tileIdx, color)
	{
		var realXY = this._Tile2Real(tileX, tileY);
		
		this.#ctx.beginPath();
		this.#ctx.fillStyle = color;
		this.#ctx.fillRect(realXY.x, realXY.y, (this.#base_sizes.grid - 1), (this.#base_sizes.grid - 1));
		
		this.#buffer[tileIdx] = {idx: tileIdx, color: color};
		
		return;
	}
	
	// Удаляет пиксель по координатам тайла.
	ClearPixel(tileX, tileY, tileIdx)
	{
		var realXY = this._Tile2Real(tileX, tileY);
		
		this.#ctx.clearRect(realXY.x, realXY.y, (this.#base_sizes.grid - 1), (this.#base_sizes.grid - 1));
		
		delete this.#buffer[tileIdx];
		
		return;
	}
	
	// Возвращает цвет пикселя из базы.
	GetPixelColor(idx)
	{
		if(this.IsPixelExist(idx) == true)
		{
			return this.#buffer[idx].color;
		}
	}
	
	// Проверяет налиие пикселя в базе.
	IsPixelExist(idx)
	{
		return (this.#buffer[idx] !== undefined) ? true : false;
	}

	// ---------------------------------
	
	// 
	GetFrameIter(func)
	{
		this.#buffer.forEach(function(obj, idx)
		{
			if(this.IsPixelExist(idx) == true)
			{
				func(obj, idx);
			}
		}, this);
		
		return;
	}
	
	// 
	SetFrame(buffer)
	{
		buffer.forEach(function(obj, idx)
		{
			var tileXY = this._Idx2Tile(obj.idx);
			
			this.DrawPixel(tileXY.x, tileXY.y, obj.idx, obj.color);
		}, this);
		
		return;
	}
	
	// 
	ClearFrame()
	{
		for(var idx = 0; idx < this._MaxIdx(); idx++)
		{
			var tileXY = this._Idx2Tile(idx);
			
			this.ClearPixel(tileXY.x, tileXY.y, idx);
		}

		return;
	}
	
	
	
	SetClickEvent(func)
	{
		this.#click_event = func;
	}







	// Конвертирует реальные координаты в координаты тайла.
	_Real2Tile(realX, realY)
	{
		var x = ~~((realX - this.#base_sizes.padding) / this.#base_sizes.grid);
		var y = ~~((realY - this.#base_sizes.padding) / this.#base_sizes.grid);

		return {x: x, y: y};
	}
	
	// Конвертирует реальные координаты в индекс тайла.
	_Real2Idx(realX, realY)
	{
		var tmp = this._Real2Tile(realX, realY);
		
		return this._Tile2Idx(tmp.x, tmp.y);
	}
	
	// Конвертирует координаты тайла в реальные координаты.
	_Tile2Real(tileX, tileY)
	{
		var x = ((tileX * this.#base_sizes.grid) + this.#base_sizes.padding) + 1;
		var y = ((tileY * this.#base_sizes.grid) + this.#base_sizes.padding) + 1;

		return {x: x, y: y}
	}
	
	// Конвертирует координаты тайла в индекс тайла.
	_Tile2Idx(tileX, tileY)
	{
		return (tileY * this.#base_sizes.sizeX) + tileX;
	}
	
	// Конвертирует индекс тайла в реальные координаты.
	_Idx2Real(idx)
	{
		var tmp = this._Idx2Tile(idx);
		
		return this._Tile2Real(tmp.x, tmp.y);
	}
	
	// Конвертирует индекс тайла в координаты тайла.
	_Idx2Tile(idx)
	{
		var x = (idx % this.#base_sizes.sizeX);
		var y = ~~(idx / this.#base_sizes.sizeX);

		return {x: x, y: y}
	}

	
	// Возращает кол-во тайлов.
	_MaxIdx()
	{
		return this.#base_sizes.sizeX * this.#base_sizes.sizeY;
	}






};











var MyGrid;
















$(document).ready(function()
{
	
	
	document.body.onmousedown = function() { 
		mouseDown = true;
	}
	document.body.onmouseup = function() {
		mouseDown = false;
	}	
	
	
	
	
	
MyGrid = new GRID();
MyGrid.Render(FieldWidth, FieldHeight, 11, 15);
MyGrid.SetClickEvent(function(type, data)
{
	//console.log(type);
	//console.log(data);
	
	
	
	
var result = {};
	
	
switch(ActiveTools)
{
	case 'pencil':
	{
		result = { action: "set_cell", color: GetToolColor() };
		
		break;
	}
	case 'eraser':
	{
		result = { action: "del_cell"};
		
		break;
	}
	case 'clearcolor':
	{
		result = { action: "del_color" };
		
		break;
	}
	case 'pipette':
	{
		if(data.color != undefined)
		{
			$('#ControlColor').val( data.color.slice(0, -2) );
		}
		
		result = { action: "idle" };
	}
	default:
	{
		result = { action: "idle" };
	}
}
	
	
	
	
	
	
	
	
	
	
	return result;
});

	
	
	
	
	
	
	
	
	
	
	
	
	
	$('#avatar').on('change', function(event)
	{
		if (event.target.files[0]) {
    //alert('You selected ' + event.target.files[0].name);
  }
  
  
  
  /*
		var reader = new JinxFramer( event.target.files[0] );
		console.log( reader.Parse() );
		console.log( reader.GetType() );
		console.log( reader.GetFrame(0) );
  */
  
		
/*		
		var jf = JinxFramer2(event.target.files[0], FieldWidth, FieldHeight, function(type, frames)
		{
			console.log(type);
			console.log(frames);
			
			
			if(type == 'bmp')
			{
				frames[0].forEach(function(item, idx)
				{
					
					var color = "#" + INT2HEX(item.R) + INT2HEX(item.G) + INT2HEX(item.B) + INT2HEX(item.A);
					
					Field_SetPixel({ index: idx, color: color });
				});
			}
			
			
			
		});
  
		if(jf == true) return;
*/


		var gld = Glediator(event.target.files[0], {width: FieldWidth, height: FieldHeight}, function(data, index, count)
		{
			
			//console.log(index);
			//console.log(count);
			
			
			

			
			data.forEach(function(item, idx)
			{
				var color = "#" + INT2HEX(item.R) + INT2HEX(item.G) + INT2HEX(item.B) + INT2HEX(item.A);
				//Field_SetPixel({ index: idx, color: color });

				//DrawPixel(tileX, tileY, tileIdx, color)
				
				var tileXY = MyGrid._Idx2Tile(idx);
				MyGrid.DrawPixel(tileXY.x, tileXY.y, idx, color);
			});
			
			if(index < count-1)
			{
				$('.ControlTools[data-type="frames"][data-value="right"]').click();
				//console.log("click");
			}
			
			if(index == count-1)
			{
				$('.ControlTools[data-type="frames"][data-value="tobuff"]').click();
			}
			
			
			
			$('#ImportResultText').text('Загружено кадров: ' + (index+1) + ' из ' + count + '.').delay(3000).fadeIn(400);
			
			
			
			//console.log("---");
		
		});
		if(gld == true) return;







 
  
const file    = event.target.files[0]; // get the file
const blobURL = URL.createObjectURL(file);
const img     = new Image();
img.src       = blobURL;



img.onerror = function () {
URL.revokeObjectURL(this.src);
// Handle the failure properly
console.log("Cannot load image");
};

img.onload = function () {
	
	
	//console.log(img.sizes);
	
	
URL.revokeObjectURL(this.src);
const canvas  = document.createElement("canvas");
canvas.width  = img.width;
canvas.height = img.height;
const ctx     = canvas.getContext("2d"/*, { colorSpace: "srgb" }*/);
ctx.drawImage(img, 0, 0, img.width, img.height);


const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height/*, { colorSpace: "srgb" }*/);
const data = imgData.data;

// enumerate all pixels
// each pixel's r,g,b,a datum are stored in separate sequential array elements


var table = $('td.FieldCell');	// eq(n)

console.log( data );
console.log( data.length );

for(let i = 0; i < data.length; i += 4) {
  const red = data[i];
  const green = data[i + 1];
  const blue = data[i + 2];
  const alpha = data[i + 3];
  
  
  //console.log( red + " " + green + " " + blue + " " + alpha );
  
  
  
  
  if(alpha == 0) continue;
  //if(red == 0 && green == 0 && blue == 0) continue;

  //var new_color = "#" + INT2HEX(red) + "" + INT2HEX(green) + "" + INT2HEX(blue);
  //var hex_color = new_color + "" + INT2HEX(alpha);
  
  //table.eq( i/4 ).attr('data-active', "Y");
  //table.eq( i/4 ).attr('data-color', hex_color);
  //table.eq( i/4 ).css('background-color', new_color);
  
  var color = "#" + INT2HEX(red) + INT2HEX(green) + INT2HEX(blue) + INT2HEX(alpha);
  
  //Field_SetPixel({ index: (i/4), color: color });






  var tileXY = MyGrid._Idx2Tile((i/4));
  MyGrid.DrawPixel(tileXY.x, tileXY.y, (i/4), color);

 





  
}
 $('.ControlTools[data-type="frames"][data-value="tobuff"]').click();



};


// ctx.putImageData(imgData, 0, 0);
  
	});
	
	
	
// https://colorscheme.ru/color-converter.html
	
	
	
	
	
	$('.ControlTools[type="button"]').on('click', function(event)
	{
		ControlsEvent(event);
	});
	$('.ControlTools[type="range"]').on('change', function(event)
	{
		ControlsEvent(event);
	});


	
	
	
	
	$('#ControlColor').on('change', function(event)
	{
		var obj = $(this);
		
		var lastcolor = $('<input type="color" value="' + obj.val() + '" />');
		lastcolor.on('click', function(event)
		{
			//alert("Ещё не готово, Дракон усталь ");
			
			obj.val( event.target.value );
			
			return false;
		});
		
		$('#ControlLastColors').prepend(lastcolor);
		
	});
	
	
	
	
	







	$('.ControlRange').is(function(idx, element)
	{
		var obj = $(this);
		var input_number =  $('<input type="number" class="' + element.className + '" min="' + element.min + '" max="' + element.max + '" value="' + element.value + '" />');
		
		obj.wrap('<div style="display: inline-flex; align-items: center;">');
		
		obj.on('input', function(event){ input_number.val(event.target.value); });
		input_number.on('input', function(event){ obj.val(event.target.value); obj.change() });
		
		obj.after(input_number);
	});


	
	
	
	
	
/*	
	var qii = 0;
	
	while( true )
	{
		var qqqq = Export_PixelIter();
		console.log(qqqq);
		
		if(qqqq === false) break;
		
		setTimeout(function(qi)
		{
			$('td.FieldCell').eq(qi).css('background-color', "#AA0000");
			
		}, 10 * qii, qqqq);
		

		
		
		
		
		qii++;
	}
	
*/	
	
	
	
	
	
	
	
	
	
	
});




/*
	Копирует кадр с экрана в буфер
*/
function CopyScreenToBuff(index)
{
	/*
	var data = [];
	
	var color = "";
	$('td.FieldCell').each(function(idx)
	{
		if(this.dataset.active == "Y")
		{
			color = this.dataset.color.match(/[a-f\d]{1,2}/gi);
			
			data.push(
			{
				i: idx,
				x: this.dataset.x,
				y: this.dataset.y,
				R: HEX2INT(color[0]),
				G: HEX2INT(color[1]),
				B: HEX2INT(color[2]),
				A: HEX2INT(color[3])
			});
		}
	});
	
	FrameBuffer[index] = data;
	
	//console.log(FrameBuffer);
	*/

	var data = [];
	MyGrid.GetFrameIter(function(obj, idx)
	{
		data.push(obj);
	});
	
	FrameBuffer[index] = data;
	
	return;
}

/*
	Копирует кадр из буфера на экран.
*/
function CopyBuffToScreen(index)
{
	/*
	var fields = $('td.FieldCell');
	
	if(InBuffScreenExists(index) == true)
	{
		FrameBuffer[index].forEach(function(item, idx)
		{
			var color = "#" + INT2HEX(item.R) + INT2HEX(item.G) + INT2HEX(item.B) + INT2HEX(item.A);
			
			Field_SetPixel({ index: item.i, color: color });
		});
	}
	*/
	if(InBuffScreenExists(index) == true)
	{
		MyGrid.SetFrame( FrameBuffer[index] );
	}
	
	return;
}

// 
function PutFrameToBuffer(index, data)
{

}

/*
	Очищает текущий экран
*/
function ClearScreen(index)
{
	/*
	$('td.FieldCell').each(function(idx)
	{
		Field_ClrPixel({ index: idx });
	});
	*/

	MyGrid.ClearFrame();
	
	return;
}

/*
	Удалить кадр из буфера.
*/
function ClearBuffScreen(index)
{
	//delete FrameBuffer[index];
	FrameBuffer.splice(index, 1);
	
	return;
}

/*
	Проверяет наличие кадра в буфере.
*/
function InBuffScreenExists(index)
{
	return (FrameBuffer[index] !== undefined && FrameBuffer[index].length > 0) ? true : false;
}








/*
	data.obj   - Объект ячейки. Или это или index.
	data.index - Индекс пикселя ( вертикальный зигзаг с верхнего левого угла )
	data.color - Цвет в формате #RRGGBBAA
*/
function Field_SetPixel(data)
{
	if( HEX2INT(data.color.slice(7)) > 0 )
	{
		var field = (data.obj == undefined) ? $('td.FieldCell').eq(data.index) : data.obj;
		var html_color = data.color.slice(0, -2);
		var rgba_color = data.color.slice(1);
		
		field.css('background-color', html_color);
		field.attr('data-active', "Y");
		field.attr('data-color', rgba_color);
	}
	
	return;
}

/*
	data.obj   - Объект ячейки. Или это или index.
	data.index - Индекс пикселя ( вертикальный зигзаг с верхнего левого угла )
*/
function Field_ClrPixel(data)
{
	var field = (data.obj == undefined) ? $('td.FieldCell').eq(data.index) : data.obj;
	
	field.css('background-color', "");
	field.attr('data-active', "N");
	field.attr('data-color', "00000000");
	
	return;
}



/*
	Вернёт цвет в формате #RRGGBBAA
*/
function GetToolColor()
{
	var rgb = $('.block #ControlColor').val();
	var a = parseInt( $('.block #ControlAlpha').val() ).toString('16').padStart(2, '0');
	
	return rgb + a;
}




function INT2HEX(number)
{
	return parseInt(number).toString('16').padStart(2, '0');
}

function HEX2INT(number)
{
	return parseInt(number, 16);
}












function ControlsEvent(event)
{
		
		console.log(event);
		
		var obj = $(event.target);
		
		switch( obj.data('type') )
		{
			case 'gridsize':
			{
				switch( obj.data('value') )
				{
					case 'width':
					{
						FieldWidth = parseInt(obj.val());
						
						break;
					}
					case 'height':
					{
						FieldHeight = parseInt(obj.val());
						
						break;
					}
				}
				
				//GridRender();
				//CopyBuffToScreen(FrameIndex);
				MyGrid.Render(FieldWidth, FieldHeight, 11, 15);
				CopyBuffToScreen(FrameIndex);
				
				break;
			}
			case 'tools':
			{
				ActiveTools = obj.data('value');
				
				break;
			}
			case 'frames':
			{
				switch( obj.data('value') )
				{
					case 'left':
					{
						if(FrameIndex > 0)
						{
							CopyScreenToBuff(FrameIndex);
							ClearScreen();
							FrameIndex--;
							
							if(InBuffScreenExists(FrameIndex) == true)
							{
								CopyBuffToScreen(FrameIndex);
							}
						}
						
						break;
					}
					case 'right':
					{
						CopyScreenToBuff(FrameIndex);
						ClearScreen();
						FrameIndex++;
						
						if(InBuffScreenExists(FrameIndex) == true)
						{
							CopyBuffToScreen(FrameIndex);
						}
						
						break;
					}
					case 'add':
					{
						FrameIndex++;
						FrameBuffer.splice(FrameIndex, 0, []);

						ClearScreen();
						
						
						break;
					}
					case 'tobuff':
					{
						CopyScreenToBuff(FrameIndex);
						
						break;
					}
					case 'clear':
					{
						ClearScreen();
						
						break;
					}
					case 'delete':
					{
						ClearScreen();
						ClearBuffScreen(FrameIndex);
						
						if(InBuffScreenExists(FrameIndex) == true)
						{
							CopyBuffToScreen(FrameIndex);
						}
						
						break;
					}
				}
				
				var text = (FrameIndex + 1) + "/" + FrameBuffer.length;
				$('#FrameActiveNum').text(text);
				
				break;
			}
			case 'export':
			{
				switch( obj.data('value') )
				{
					case 'run':
					{
						CopyScreenToBuff(FrameIndex);
						Export_Run();
						
						break;
					}
				}
				
				break;
			}
		}
}