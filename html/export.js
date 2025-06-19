
/*
	Функция считает максимально возможный размер файла.
	В последствии размер будет обрезан до фактической длины.
*/
function Export_SizeCalculation()
{
	return (10 + (((6 * (FieldWidth * FieldHeight)) + 4) * FrameBuffer.length));
}

function Export_Run()
{
	var format_version = parseInt( $('#ExportVersion').val() );
	var color_format_id = parseInt( $('#ExportColorFormat').val() );
	var strip_format_id = parseInt( $('#ExportStripFormat').val() );
	
	
	if( isNaN(color_format_id) == true || isNaN(strip_format_id) == true || isNaN(format_version) == true)
	{
		alert("Не выбран формат цвета или ленты или версия!");
		
		return;
	}


	if(format_version == 2)
	{
		let params = 
		{
			width: FieldWidth,				// Ширина экрана, пикселей
			height: FieldHeight,			// Высота экрана, пикселей
			frames: FrameBuffer.length,		// Кол-во кадров, штук
			repeats: ImageRepeats,			// Кол-во повтором анимации
			strip_format: strip_format_id,	// ID формата ленты
			pixel_format: color_format_id,	// ID формата пикселей
		};
		
		const export_obj = new Export_v2( FrameBuffer, params );
		export_obj.Render();
		const buffer = export_obj.GetFileBytes();
		saveByteArray2('image.pxl', buffer);
	
		return;
	}
	
	
	
	
	const data = new Uint8Array( Export_SizeCalculation() );
	var data_idx = 0;
	
	data[data_idx++] = 'P'.charCodeAt(0);
	data[data_idx++] = 'X'.charCodeAt(0);
	data[data_idx++] = 'L'.charCodeAt(0);
	
	data[data_idx++] = 0x01;
	
	data[data_idx++] = FieldWidth;
	
	data[data_idx++] = FieldHeight;
	
	data[data_idx++] = (color_format_id << 4) | strip_format_id;
	
	data[data_idx++] = FrameBuffer.length & 0xFF;
	data[data_idx++] = (FrameBuffer.length >> 8) & 0xFF;
	
	data[data_idx++] = ImageRepeats;
	
	
	
	for(index = 0; index < FrameBuffer.length; index++)
	{
		var frame_timeout = FrameBuffer[index].timeout;
		
		data[data_idx++] = frame_timeout & 0xFF;
		data[data_idx++] = (frame_timeout >> 8) & 0xFF;
		
		// Отметка адреса, куда нужно вставить кол-во пикселей в кадре.
		var pixel_count_index = data_idx;
		data_idx += 2;
		
		
		
		var pixel_count = 0;
		var skip_idx = 0;
		
		
		var color_parts = [];
		
		
		
		switch(strip_format_id)
		{
			case 0:
			{
				
				FrameBuffer[index].pixels.forEach(function(item)
				{
					data[data_idx++] = (item.idx - skip_idx) & 0xFF;
					data[data_idx++] = ((item.idx - skip_idx) >> 8) & 0xFF;
					skip_idx = item.idx + 1;
					
					color_parts = item.color.match(/[a-f\d]{1,2}/gi);
					ColorMapArr[color_format_id].forEach(function(value)
					{
						if(value != undefined)
						{
							data[data_idx++] = HEX2INT(color_parts[value]);
						}
					});
					
					pixel_count++;
				});
				
				break;
			}
			case 2:
			{
				
				var idx_map = Export_PixelIter(FieldWidth, FieldHeight);
				
				idx_map.forEach(function(read_idx, need_idx)
				{
					FrameBuffer[index].pixels.forEach(function(item)
					{
						if(item.idx == read_idx)
						{
							data[data_idx++] = (need_idx - skip_idx) & 0xFF;
							data[data_idx++] = ((need_idx - skip_idx) >> 8) & 0xFF;
							skip_idx = need_idx + 1;
							
							color_parts = item.color.match(/[a-f\d]{1,2}/gi);
							ColorMapArr[color_format_id].forEach(function(value)
							{
								if(value != undefined)
								{
									data[data_idx++] = HEX2INT(color_parts[value]);
								}
							});
					
							pixel_count++;
							
							
							//break;
						}
					});
				});
				
				break;
			}
			default:
			{
				alert("Данный формат ленты ещё не поддерживается!");
				
				return;
			}
		}
		
		
		
		data[ (pixel_count_index + 0) ] = pixel_count & 0xFF;
		data[ (pixel_count_index + 1) ] = (pixel_count >> 8) & 0xFF;
	}
	
	
	
	
	//data.length = data_idx;
	
	
	
	
	//console.log(data);
	
	saveByteArray('image.pxl', data.slice(0, data_idx));
	
	
	
	
	
	
}



function saveByteArray(reportName, byte) {
    var blob = new Blob([byte], {type: "application/octet-stream"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
};

function saveByteArray2(reportName, byteArray) {
    // Получаем текущую дату и время в формате YYYY-MM-DD_HH-MM-SS
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
    
    // Разбиваем имя файла на имя и расширение
    const dotIndex = reportName.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? reportName.slice(0, dotIndex) : reportName;
    const extension = dotIndex !== -1 ? reportName.slice(dotIndex) : '';
    
    // Создаём имя файла с датой и временем перед расширением
    const fileName = `${baseName}_${timestamp}${extension}`;
    
    // Создаём Blob
    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    
    // Создаём ссылку для скачивания
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    // Симулируем клик для скачивания
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    URL.revokeObjectURL(link.href);
}






function GetMappingFormat(format, width, height)
{
	result = undefined;

	switch(format)
	{
		case 0: { result = Export_LineIter(width, height); break; }
		case 2: { result = Export_PixelIter(width, height); break; }
		default:
		{
			alert('Этот формат ленты ещё не поддерживается!');

			break;
		}
	}

	return result;
}










function Export_LineIter(width, height)
{
	var result = [];
	
	for(var i = 0; i < width * height; i++)
	{
		result.push(i);
	}
	
	return result;
}

function Export_PixelIter(width, height)
{
	var result = [];
	
	var idx = 0;
	var up = false;
	var stop_val = ((width % 2 == 0) ? (width) : (width * height)) - 1;
	
	while(true)
	{
		result.push(idx);
		
		if(idx == stop_val) break;
		
		idx = (up == false) ? (idx + width) : (idx - width);
		
		if( idx >= (width * height) )
		{
			idx -= (width - 1);
			up = true;
		}
		
		if( idx < 0 )
		{
			idx += (width + 1);
			up = false;
		}
	}
	
	return result;
}



// Массив соответствия перетасовки байт цветости. На входе RGBA.
const ColorMapArr = 
[
//   R, G, B, A
	[0, 1, 2, undefined],	// 0x00, - RGB
	[0, 1, 2, 3],			// 0x01, - RGBA
	[1, 0, 2, 3],			// 0x02, - GRBA
	[],	// 0x03, - 
	[],	// 0x04, - 
	[],	// 0x05, - 
	[],	// 0x06, - 
	[],	// 0x07, - 
	[],	// 0x08, - 
	[],	// 0x09, - 
	[],	// 0x0A, - 
	[],	// 0x0B, - 
	[],	// 0x0C, - 
	[],	// 0x0D, - 
	[],	// 0x0E, - 
	[]	// 0x0F, - 
];
