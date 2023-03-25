
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
	
	
	var frames_delay = parseInt( $('input.ControlTools[data-type="frames"][data-value="delay"]').val() );
	
	var color_format_id = parseInt( $('#ExportColorFormat').val() );
	var strip_format_id = parseInt( $('#ExportStripFormat').val() );
	
	
	
	
	
	
	
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
	
	data[data_idx++] = 0x00;
	
	
	
	for(index = 0; index < FrameBuffer.length; index++)
	{
		data[data_idx++] = frames_delay & 0xFF;
		data[data_idx++] = (frames_delay >> 8) & 0xFF;
		
		// Отметка адреса, куда нужно вставить кол-во пикселей в кадре.
		var pixel_count_index = data_idx;
		data_idx += 2;
		
		
		
		var pixel_count = 0;
		var skip_idx = 0;
		
		
		var color_parts = [];
		
		
		
		switch(strip_format_id)
		{
			case 1:
			{
				
				FrameBuffer[index].forEach(function(item)
				{
					data[data_idx++] = (item.idx - skip_idx) & 0xFF;
					data[data_idx++] = ((item.idx - skip_idx) >> 8) & 0xFF;
					skip_idx = item.idx + 1;
					
					color_parts = item.color.match(/[a-f\d]{1,2}/gi);
					data[data_idx++] = HEX2INT(color_parts[0]);
					data[data_idx++] = HEX2INT(color_parts[1]);
					data[data_idx++] = HEX2INT(color_parts[2]);
					data[data_idx++] = HEX2INT(color_parts[3]);
					
					pixel_count++;
				});
				
				break;
			}
			case 2:
			{
				
				var idx_map = Export_PixelIter();
				
				idx_map.forEach(function(read_idx, need_idx)
				{
					FrameBuffer[index].forEach(function(item)
					{
						if(item.idx == read_idx)
						{
							data[data_idx++] = (need_idx - skip_idx) & 0xFF;
							data[data_idx++] = ((need_idx - skip_idx) >> 8) & 0xFF;
							skip_idx = need_idx + 1;
							
							color_parts = item.color.match(/[a-f\d]{1,2}/gi);
							data[data_idx++] = HEX2INT(color_parts[0]);
							data[data_idx++] = HEX2INT(color_parts[1]);
							data[data_idx++] = HEX2INT(color_parts[2]);
							data[data_idx++] = HEX2INT(color_parts[3]);
					
							pixel_count++;
							
							
							//break;
						}
					});
				});
				
				break;
			}
			default:
			{
				alert("Неа, ещё не умею...");
			}
		}
		
		
		
		data[ (pixel_count_index + 0) ] = pixel_count & 0xFF;
		data[ (pixel_count_index + 1) ] = (pixel_count >> 8) & 0xFF;
	}
	
	
	
	
	//data.length = data_idx;
	
	
	
	
	console.log(data);
	
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








function Export_PixelIter()
{
	var result = [];
	
	var idx = 0;
	var up = false;
	var stop_val = ((FieldWidth % 2 == 0) ? (FieldWidth) : (FieldWidth * FieldHeight)) - 1;
	
	while(true)
	{
		result.push(idx);
		
		if(idx == stop_val) break;
		
		idx = (up == false) ? (idx + FieldWidth) : (idx - FieldWidth);
		
		if( idx >= (FieldWidth * FieldHeight) )
		{
			idx -= (FieldWidth - 1);
			up = true;
		}
		
		if( idx < 0 )
		{
			idx += (FieldWidth + 1);
			up = false;
		}
	}
	
	return result;
}