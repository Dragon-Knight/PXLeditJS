

var FieldWidth;
var FieldHeight;
var FieldGrid;

var FrameBuffer = [];
var FrameIndex = 0;

var ImageRepeats = 0;


var ActiveTools = "pencil"; // ...........................................................................




var mouseDown = false;








Object.defineProperty(Number.prototype, "between", 
{
	enumerable: false,
	value: function(min, max)
	{
		return (this >= min && this <= max);
	}
});









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




		// Не удаляются события. Почему?
		$(this.#canvas).unbind();
		//this.#canvas.removeEventListener('click', function(event){ this2.EventHandler(event); });
		//this.#canvas.removeEventListener('mousemove', function(event){ this2.EventHandler(event); });
		
		this.#canvas.addEventListener('click', function(event){ this2.EventHandler(event); });
		this.#canvas.addEventListener('mousemove', function(event){ this2.EventHandler(event); });;





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
		
		this.#ctx.strokeStyle = "#AAAAAA80"; //  = "black";
		this.#ctx.stroke();
		
		
		
		
		
		/*
		this.#ctx.beginPath();
		
		this.#ctx.moveTo( (this.#canvas.width / 2), padding - (padding - 3) );
		this.#ctx.lineTo( (this.#canvas.width / 2), (padding - 3) );
		
		this.#ctx.strokeStyle = "black"; //  = "black";
		this.#ctx.stroke();
		*/
		
		
		
		
		return;
	}
	





	EventHandler(event)
	{
		var sizeX = this.#base_sizes.sizeX;
		var sizeY = this.#base_sizes.sizeY;
		var grid = this.#base_sizes.grid;
		var padding = this.#base_sizes.padding;
			
			// Неудачная попытка отфильтровать клики вне зоны и на линиях.
			//if((event.offsetX - padding) % grid == 0) return;
			//if((event.offsetY - padding) % grid == 0) return;
			if(event.offsetX < padding || event.offsetX > (sizeX * grid-1) + padding) return;
			if(event.offsetY < padding || event.offsetY > (sizeY * grid-1) + padding) return;
			
			
			
		const tileXY = this._Real2Tile(event.offsetX, event.offsetY);	
			
			
		this.#ctx.beginPath();
		this.#ctx.clearRect(0, 0, this.#canvas.width, padding);
		this.#ctx.clearRect(0, 0, padding, this.#canvas.height);
		this.#ctx.clearRect( (this.#canvas.width - padding), 0, this.#canvas.width, this.#canvas.height);
			
			
			
			
			
		let text_x = String(tileXY.x + 1).padStart(3, '0') + ' | ' + String(sizeX - tileXY.x).padStart(3, '0');
		//this.#ctx.beginPath();
		//this.#ctx.moveTo( event.offsetX, padding - (padding - 3) );
		//this.#ctx.lineTo( event.offsetX, (padding - 3) );
		//this.#ctx.strokeStyle = "black"; //  = "black";
		//this.#ctx.stroke();
		this.#ctx.fillStyle = "#000000";
		this.#ctx.font = "12px serif monospace";
		this.#ctx.textBaseline = "top";
		this.#ctx.textAlign = "center";
		this.#ctx.fillText( text_x, event.offsetX+1, (padding - (padding - 3) + 1) );
		
		let text_y = '' + (tileXY.y+1) + '';
		//this.#ctx.beginPath();
		//this.#ctx.moveTo( padding - (padding - 3), event.offsetY);
		//this.#ctx.lineTo( (padding - 3), event.offsetY );
		//this.#ctx.strokeStyle = "black"; //  = "black";
		//this.#ctx.stroke();
		//this.#ctx.font = "12px serif";
		//this.#ctx.textBaseline = "middle";
		this.#ctx.textAlign = "right";
		this.#ctx.fillText( text_y, (padding - (padding - 3) + 11), (event.offsetY - 4));
		
		this.#ctx.textAlign = "left";
		this.#ctx.fillText( text_y, (this.#canvas.width - padding + 2), (event.offsetY - 4));
			
			
			
			
			
			
			
			
			
			

			if(event.type == "mousemove" && mouseDown == false)
			{
				return;
			}
			
			// Потом перенести в mousemove. Показывать только на клетке но не на сетке.
			event.target.style.cursor = "pointer";


			
			// ----------------------
			//const tileXY = this._Real2Tile(event.offsetX, event.offsetY);
			const tileIdx = this._Tile2Idx(tileXY.x, tileXY.y);
			
			var event_data = { color: this.GetPixelColor(tileIdx), x: tileXY.x, y: tileXY.y, i: tileIdx };
			var event_resp = this.#click_event(event.type, event_data);
			
			switch(event_resp.action)
			{
				case 'set_cell':
				{
					this.DrawPixel(tileXY.x, tileXY.y, tileIdx, event_resp.color);
					
					break
				}
				case 'del_cell':
				{
					this.ClearPixel(tileXY.x, tileXY.y, tileIdx);
					
					break;
				}
				case 'del_color':
				{
					var delete_color = this.GetPixelColor(tileIdx);
					if(delete_color != undefined)
					{
						this.#buffer.forEach(function(pixel_data, idx)
						{
							if(pixel_data.color == delete_color)
							{
								var tmp = this._Idx2Tile(idx);
								this.ClearPixel(tmp.x, tmp.y, idx);
							}
						}, this);
					}
					
					break;
				}
				case 'replace_color':
				{
					var current_color = this.GetPixelColor(tileIdx);
					if(current_color != undefined)
					{
						this.#buffer.forEach(function(pixel_data, idx)
						{
							if(pixel_data.color == current_color)
							{
								var tmp = this._Idx2Tile(idx);
								this.DrawPixel(tmp.x, tmp.y, idx, event_resp.color);
							}
						}, this);
					}
					
					break;
				}
				case 'cross_line':
				{
					for(let idx = 0; idx < sizeX * sizeY; idx++)
					{
						var tmp = this._Idx2Tile(idx);
						if(tmp.x == tileXY.x || tmp.y == tileXY.y)
						{
							this.DrawPixel(tmp.x, tmp.y, idx, event_resp.color);
						}
					};
					
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
	}






	// Рисует пиксель по координатам тайла.
	DrawPixel(tileX, tileY, tileIdx, color)
	{
		var realXY = this._Tile2Real(tileX, tileY);
		
		//console.log(tileX);
		//console.log(tileY);

		//if(tileX.between(0, this.#base_sizes.sizeX) && tileY.between(0, this.#base_sizes.sizeY))
		{
			this.#ctx.beginPath();
			this.#ctx.fillStyle = color;
			this.#ctx.fillRect(realXY.x, realXY.y, (this.#base_sizes.grid - 1), (this.#base_sizes.grid - 1));
		}
		
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
//MyGrid.Render(FieldWidth, FieldHeight, FieldGrid, 15);
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
		// Когда водим мышкой с пипеткой то событие вызывается постоянно.
		
		if(data.color != undefined)
		{
			$('#ControlColor').val( data.color.slice(0, -2) ).change();
		}
		
		result = { action: "idle" };
		
		break;
	}
	case 'crossline':
	{
		result = { action: "cross_line", color: GetToolColor() };
		
		break;
	}
	case 'replacecolor':
	{
		result = { action: "replace_color", color: GetToolColor() };
		
		break;
	}
	default:
	{
		result = { action: "idle" };
		
		break;
	}
}
	
	
	
	
	
	
	
	
	
	
	return result;
});

	
	
	
	
	
	
	
	
	
	
	
	
	
	$('#avatar').on('change', function(event)
	{
		if (event.target.files[0]) {
    //alert('You selected ' + event.target.files[0].name);
  }
  
		var remove_color = $('#ImportRemoveColor').val();
		if(remove_color.length != 7) remove_color = undefined;

		var gld = Glediator(event.target.files[0], {width: FieldWidth, height: FieldHeight}, function(pixels, config)
		{
			
			pixels.forEach(function(pixel)
			{
				if(pixel.color.indexOf(remove_color) == 0) return;
				
				var tileXY = MyGrid._Idx2Tile(pixel.idx);
				MyGrid.DrawPixel(tileXY.x, tileXY.y, pixel.idx, pixel.color);
			});
			
			if(config.idx < config.count-1)
			{
				$('.ControlTools[data-type="frames"][data-value="right"]').click();
				//console.log("click");
			}
			
			if(config.idx == config.count-1)
			{
				$('.ControlTools[data-type="frames"][data-value="tobuff"]').click();
			}
			
			
			
			$('#ImportResultText').text('Загружено кадров: ' + (config.idx+1) + ' из ' + config.count + '.').delay(3000).fadeIn(400);
		
		});
		if(gld == true) return;





		var rxf = Pixel(event.target.files[0], function(config)
		{
			//console.log(config);

			MyGrid.Render(config.tileX, config.tileY, FieldGrid, 15);
			
			$('input[data-type="frames"][data-value="repeats"]').val(config.frame_repeats).trigger('input');
			
		}, function(pixels, config)
		{
			//console.log(pixels);

			$('input[data-type="frames"][data-value="timeout"]').val(config.timeout).trigger("input");
			
			ClearScreen();
			pixels.forEach(function(pixel)
			{
				var tileXY = MyGrid._Idx2Tile(pixel.idx);
				MyGrid.DrawPixel(tileXY.x, tileXY.y, pixel.idx, pixel.color);
			});
			CopyScreenToBuff(FrameIndex);
			if(config.idx < config.count-1) FrameIndex++;

		});
		if(rxf == true) return;









		var gifoff = GifOffload(event.target.files[0], function(pixels, config)
		{
			
			$('input[data-type="frames"][data-value="timeout"]').val(config.timeout).trigger("input");
			
			ClearScreen();
			pixels.forEach(function(pixel)
			{
				if(pixel.color.indexOf(remove_color) == 0) return;
				
				var tileXY = MyGrid._Idx2Tile(pixel.idx);
				MyGrid.DrawPixel(tileXY.x, tileXY.y, pixel.idx, pixel.color);
			});
			CopyScreenToBuff(FrameIndex);
			if(config.idx < config.count-1) FrameIndex++;
			
		});
		if(gifoff == true) return;









		var stim = StaticImage(event.target.files[0], function(pixels, config)
		{
			
			$('input[data-type="frames"][data-value="timeout"]').val(config.timeout).trigger("input");
			
			//CopyScreenToBuff(FrameIndex++);
			pixels.forEach(function(pixel)
			{
				if(pixel.color.indexOf(remove_color) == 0) return;
				
				var tileXY = MyGrid._Idx2Tile(pixel.idx);
				MyGrid.DrawPixel(tileXY.x, tileXY.y, pixel.idx, pixel.color);
			});
			//CopyScreenToBuff(FrameIndex);
			CopyScreenToBuff(FrameIndex);
			if(config.idx < config.count-1) FrameIndex++;
			
		});
		if(stim == true) return;




		$(event.target).val(null);


	});
	
	
	
// https://colorscheme.ru/color-converter.html
	
	
	
	
	
	$('.ControlTools[type="button"]').on('click', function(event)
	{
		ControlsEvent(event);
	});
	$('.ControlTools[type="range"]').on('input', function(event) // change
	{
		ControlsEvent(event);
	});
	$('div.ControlTools').on('click', function(event)
	{
		ControlsEvent(event);
	});


	
	
	
	
	$('#ControlColor').on('change', function(event)
	{
		var obj = $(this);
		
		var lastcolor = $('<input type="color" value="' + obj.val() + '" />');
		lastcolor.on('click', function(event)
		{
			obj.val( event.target.value );
			return false;
		});
		
		if( $('#ControlLastColors input[value="' + obj.val() + '"]').length == 0 )
		{
			$('#ControlLastColors').prepend(lastcolor);
		}
		
		if( $('#ControlLastColors input').length > 8)
		{
			$('#ControlLastColors input').last().remove();
		}
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
	
	
	
	
	
	
	
	
	
	
	
	
	
	$('#FrameSlider').is(function(idx, element)
	{
		let root = $(this);
		
		let before = $('<span>').text( element.min );
		let after = $('<span>').text( element.max );
		
		
		$(this).before(before);
		$(this).after(after);
		
	});
	
	$('#FrameSlider').on('input', function(event)
	{
		
		let idx = event.target.value - 1;
		
		if(InBuffScreenExists(idx) == true)
		{
			CopyBuffToScreen(idx);
		}
		
	});
	
	
	
	
	
	
	
	
	
	
$('input[data-type="gridsize"][data-value="width"]').val(128);
$('input[data-type="gridsize"][data-value="height"]').val(16);
$('input[data-type="gridsize"][data-value="gridsize"]').val(10);
$('input[data-type="gridsize"]').trigger('input');	
	
	
	
	
	
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
	
	var timeout = parseInt( $('input[data-type="frames"][data-value="timeout"]').val() );
	FrameBuffer[index] = {timeout: timeout, pixels: data};
	
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
		MyGrid.SetFrame( FrameBuffer[index].pixels );

		$('input[data-type="frames"][data-value="timeout"]').val(FrameBuffer[index].timeout).trigger("input");
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
	return (FrameBuffer[index] !== undefined /*&& FrameBuffer[index].pixels.length > 0*/) ? true : false;
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




/*

После импорта, если нажать Назад, то последний кадр дублируется.

*/







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
					case 'preset':
					{
						FieldWidth = obj.data('w');
						FieldHeight = obj.data('h');

						break;
					}
					case 'gridsize':
					{
						FieldGrid = parseInt(obj.val());
						
						break;
					}
				}
				
				if(FieldWidth !== undefined && FieldHeight !== undefined && FieldGrid !== undefined)
				{
				
						var tmp = ': ' + FieldWidth + ' x ' + FieldHeight + ', ' + FieldGrid;
						var timeout_obj = obj.siblings('legend');
						timeout_obj.html( timeout_obj.html().replace(/: (.*) x (.*), (.*)$/gm, tmp) );
				
				CopyScreenToBuff(FrameIndex);
				MyGrid.Render(FieldWidth, FieldHeight, FieldGrid, 15);
				CopyBuffToScreen(FrameIndex);
				}
				
				break;
			}
			case 'tools':
			{
				ActiveTools = obj.data('value');
				
				$('.MyGUIIcon').removeClass('Active');
				obj.addClass('Active');
				
				break;
			}
			case 'frames':
			{
				switch( obj.data('value') )
				{
					case 'timeout':
					{
						/*
						
						//var tmp = TernaryEx( obj.val(), {0: ': Нет', 255: ': Бесконечно'}, ': ' + obj.val() );
						
						var tmp = ': ' + ~~logslider( parseInt(obj.val()) ) + ' мс';
						var timeout_obj = obj.siblings('legend');
						timeout_obj.html( timeout_obj.html().replace(/: (.*)$/gm, tmp) );
						
						*/
						
						break;
					}
					case 'left':
					{
						/*
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
						*/
						
						CopyScreenToBuff(FrameIndex);
						if(InBuffScreenExists(FrameIndex-1) == true)
						{
							ClearScreen();
							FrameIndex--;
							CopyBuffToScreen(FrameIndex);
						}
						
						
						break;
					}
					case 'right':
					{
						/*
						CopyScreenToBuff(FrameIndex);
						ClearScreen();
						FrameIndex++;
						
						if(InBuffScreenExists(FrameIndex) == true)
						{
							CopyBuffToScreen(FrameIndex);
						}
						*/
						
						CopyScreenToBuff(FrameIndex);
						if(InBuffScreenExists(FrameIndex+1) == true)
						{
							ClearScreen();
							FrameIndex++;
							CopyBuffToScreen(FrameIndex);
						}
						
						break;
					}
					case 'add':
					{
						CopyScreenToBuff(FrameIndex);
						FrameIndex++;
						FrameBuffer.splice(FrameIndex, 0, []);

						ClearScreen();

						// Если добавить после рисования, то пропадает кадр
						
						
						break;
					}
					case 'copy':
					{
						CopyScreenToBuff(FrameIndex);
						FrameIndex++;
						FrameBuffer.splice(FrameIndex, 0, []);
						
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
					case 'repeats':
					{
						ImageRepeats = parseInt(obj.val());
						
						var tmp = TernaryEx( obj.val(), {0: ': Нет', 255: ': Бесконечно'}, ': ' + obj.val() );
						
						var legend_obj = obj.siblings('legend');
						legend_obj.html( legend_obj.html().replace(/: (.*)$/gm, tmp) );
						
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









/*
	Вызывает callback на каждый найденный пиксель или возвращает массиве всех пикселей одного кадра.
		img_src - Значение src объекта Image().
		every - Вызов callback на каждый новый пиксель.
		callback - Функция в которую передаются след. параметры:
			pixels - Объект пикселя который содержит его индекса и цвет.
			cfg - Объект информации о изображении, его размеры.
*/
function GetImagePixels(img_src, every, callback)
{
	const img = new Image();
	
	//img.src = 'data:image/gif;base64,' + file;
	//img.src = URL.createObjectURL(file);
	img.src = img_src;
	img.onerror = function()
	{
		URL.revokeObjectURL(this.src);
		
		console.log("Cannot load image");
	};
	img.onload = function()
	{
		URL.revokeObjectURL(this.src);
		
		const canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		
		const ctx = canvas.getContext("2d", { colorSpace: "srgb" });
		ctx.drawImage(img, 0, 0, img.width, img.height);
		
		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height, { colorSpace: "srgb" });
		const data = imgData.data;
		
		var result = Array();
		for(let i = 0; i < data.length; i += 4)
		{
			const red = data[i];
			const green = data[i + 1];
			const blue = data[i + 2];
			const alpha = data[i + 3];
			
			if(alpha == 0) continue;
			//if(red == 0 && green == 0 && blue == 0) continue;
			
			let color = "#" + INT2HEX(red) + INT2HEX(green) + INT2HEX(blue) + INT2HEX(alpha);
			
			if(every == true)
			{
				callback( {idx: (i/4), color: color}, {width: img.width, height: img.height} );
			}
			else
			{
				result.push( {idx: (i/4), color: color} );
			}
		}
		
		if(every == false)
		{
			callback(result, {width: img.width, height: img.height});
		}
	};
	
	return;
}








function TernaryEx(val, obj, def)
{
	if(val in obj)
	{
		return obj[val];
	}
	else
	{
		return def;
	}
}


function logslider(position) {
  // position will be between 0 and 255
  var minp = 10;
  var maxp = 255;

  // The result should be between 100 an 10000000
  var minv = Math.log(10);
  var maxv = Math.log(65535);

  // calculate adjustment factor
  var scale = (maxv-minv) / (maxp-minp);

  return Math.exp(minv + scale*(position-minp));
}