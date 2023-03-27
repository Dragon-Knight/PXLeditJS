
/*

http://starpixel.globalzone.su.local/editor/
https://github.com/vvip-68/GyverPanelWiFi/wiki/JinxFramer---%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%BE%D1%80-%D0%B0%D0%BD%D0%B8%D0%BC%D0%B0%D1%86%D0%B8%D0%B8%2C-%D1%80%D0%BE%D0%BB%D0%B8%D0%BA%D0%BE%D0%B2%2C-%D0%BA%D0%B0%D1%80%D1%82%D0%B8%D0%BD%D0%BE%D0%BA/#%D0%A2%D0%B5%D1%85%D0%BD%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B5

https://stackoverflow.com/questions/2442576/how-does-one-convert-16-bit-rgb565-to-24-bit-rgb888

*/










/*
	Импорт файл в формате Glediator ( протокол Glediator ).
	file - Объект File с входным файлом;
	cfg - Объект с параметрами для разбора файла.
	callback - Функция возвращающая данные одного кадра.
	
	https://github.com/vvip-68/GyverPanelWiFi/wiki/%D0%AD%D0%BA%D1%81%D0%BF%D0%BE%D1%80%D1%82-%D1%8D%D1%84%D1%84%D0%B5%D0%BA%D1%82%D0%BE%D0%B2-%D0%B0%D0%BD%D0%B8%D0%BC%D0%B0%D1%86%D0%B8%D0%B8-%D0%B8%D0%B7-%D0%9F%D0%9E-%C2%ABJinx!%C2%BB
	
*/
function Glediator(file, cfg, callback)
{
	var result = false;
	
	var ext = file.name.split('.').pop();
	if( ext == 'out' && file.size < 5*1024*1024 )
	{
		var info_txt = 'Формат Glediator требует заранее уставленных параметров:\n\tРазмер: ' + cfg.width + ' x ' + cfg.height + ';\n\tПуть: Слева-направо, сверху вниз;\n\tЦвета: RGB;\nВсё верно?';
		if(confirm(info_txt) == true)
		{
			var reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = function()
			{
				var bytes = new Uint8Array( reader.result );
				
				var frame_length = (cfg.width * cfg.height * 3) + 1;
				var frame_count = bytes.length / frame_length;
				var frame_index = 0;
				var frame_offset = 0;
				
				if( bytes.length % frame_length != 0)
				{
					alert('Не получается разложить данные файл по формату ' + cfg.width + 'x' + cfg.height + '. Проверьте параметры экспорта в программе Jinx!');
					
					return;
				}
				
				do
				{
					if(bytes[frame_offset] != 0x01)
					{
						alert('Формат не распознан. Проверьте параметры экспорта в программе Jinx!');
						
						return;
					}
					
					var frame_data = Array();
					for(var i = (frame_offset + 1); i < (frame_offset + frame_length); i += 3)
					{
						frame_data.push(
						{
							R: bytes[i+0],
							G: bytes[i+1],
							B: bytes[i+2],
							A: 0xFF
						});
					}
					callback(frame_data, frame_index++, frame_count);
					
					frame_offset += frame_length;
					
				} while(bytes.length > frame_offset);
			};
		}
		
		result = true;
	}
	
	return result;
}



/*
	file - Объект File с входным файлом;
	callback_cfg - Функция возвращает настройки файла;
	callback_frame - Функция возвращает массив одного кадра;
*/
function Pixel(file, callback_cfg, callback_frame)
{
	var result = false;
	
	var ext = file.name.split('.').pop();
	if( ext == 'pxl' && file.size < 5*1024*1024 )
	{
		var info_txt = 'Формат Pixel очистит текущую сцену и настройки и загрузит их из файла.\nПродолжаем?';
		if(confirm(info_txt) == true)
		{
			var reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = function()
			{
				var bytes = new Uint8Array( reader.result );
				var bytes_idx = 0;

				if(bytes[bytes_idx++] == 'P'.charCodeAt(0) && bytes[bytes_idx++] == 'X'.charCodeAt(0) && bytes[bytes_idx++] == 'L'.charCodeAt(0))
				{
					if(bytes[bytes_idx++] == 1)
					{
						var cfg_obj = {};
						cfg_obj.tileX = bytes[bytes_idx++];
						cfg_obj.tileY = bytes[bytes_idx++];
						cfg_obj.format_strip = bytes[bytes_idx] & 0x0F;
						cfg_obj.format_color = (bytes[bytes_idx++] >> 4) & 0x0F;
						cfg_obj.frame_count = bytes[bytes_idx++] | (bytes[bytes_idx++] << 8);
						cfg_obj.frame_repeats = bytes[bytes_idx++];
						
						callback_cfg(cfg_obj);



						var mapping_format = GetMappingFormat(cfg_obj.format_strip, cfg_obj.tileX, cfg_obj.tileY);
						
						for(var frame_idx = 0; frame_idx < cfg_obj.frame_count; frame_idx++)
						{
							var frame_pixels = [];
							var frame_timeout = bytes[bytes_idx++] | (bytes[bytes_idx++] << 8);
							var frame_pixels_count = bytes[bytes_idx++] | (bytes[bytes_idx++] << 8);
							var cfg_frame = {index: frame_idx, count: cfg_obj.frame_count, timeout: frame_timeout};

							var skip = 0;
							for(var p = 0; p < frame_pixels_count; p++)
							{
								skip += bytes[bytes_idx++] | (bytes[bytes_idx++] << 8);
								
								var color = "#";
								var color_idx = 0;
								ColorMapArr[cfg_obj.format_color].forEach(function(value)
								{
									if(value != undefined)
									{
										color += INT2HEX(bytes[bytes_idx + value]);
										color_idx++
									}
								});
								bytes_idx += color_idx;
								
								frame_pixels.push({idx: mapping_format[(p + skip)], color: color});
							}
							
							callback_frame(frame_pixels, cfg_frame);
						}



					}
					else
					{
						alert('Версия не поддерживается!');
						return;
					}
				}
				else
				{
					alert('Формат файла не распознан!');
					return;
				}
			};
		}
		
		result = true;
	}
	
	return result;
}
