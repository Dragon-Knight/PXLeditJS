
/*

http://starpixel.globalzone.su.local/editor/
https://github.com/vvip-68/GyverPanelWiFi/wiki/JinxFramer---%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%BE%D1%80-%D0%B0%D0%BD%D0%B8%D0%BC%D0%B0%D1%86%D0%B8%D0%B8%2C-%D1%80%D0%BE%D0%BB%D0%B8%D0%BA%D0%BE%D0%B2%2C-%D0%BA%D0%B0%D1%80%D1%82%D0%B8%D0%BD%D0%BE%D0%BA/#%D0%A2%D0%B5%D1%85%D0%BD%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B5

https://stackoverflow.com/questions/2442576/how-does-one-convert-16-bit-rgb565-to-24-bit-rgb888

*/


function JinxFramer2(file, width, height, callback)
{
	var result = false;
	
	var ext = file.name.split('.').pop();
	if( (ext == 'p' || ext == 'out') && file.size < 10*1024*1024 )
	{
		var info = confirm("Формат JinxFramer конченый и проектировал его сантехник.. хотя.. ну да.\nБудет произведена попытка разбора файла в формате " + width + " x " + height + ".\nВсё верно? Продолжаем? Точно?");
		if(info == true)
		{
		
		var reader = new FileReader();
		reader.readAsArrayBuffer(file);
		reader.onload = function()
		{
			var bytes = new Uint8Array( reader.result );
			
			var frame_bytes = width * height * 3;
			var frames = Array();
			var type;
			
			switch(ext)
			{
				case 'p':
				{
					type = 'bmp';
					
					var frame = Array();
					
					for(var i = 3; i < frame_bytes; i += 3)
					{
						
						
						frame.push(
						{
							R: bytes[i+0],
							G: bytes[i+1],
							B: bytes[i+2],
							A: 0xFF
						});
					}
					
					frames[0] = frame;
					
					
					
					
					
					
					break;
				}
				case 'out':
				{
					type = 'gif';
					
					break;
				}
			}
			
			callback(type, frames);
		}
		
		}
		
		result = true;
	}
	
	return result;
}
















/*
	Импорт файл в формате Glediator ( протокол Glediator ).
	file - Объект File с входным файлом;
	cfg - Объект с параметрами для разбора файла.
	callback - функция возвращающая данные одного кадра.
	
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

