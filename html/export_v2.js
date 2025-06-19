
class Export_v2
{
	#buffer = null;
	#buffer_idx = 0;
	
	#frame_buffer = null;
	#params = 
	{
		width: 0,			// Ширина экрана, пикселей
		height: 0,			// Высота экрана, пикселей
		frames: 0,			// Кол-во кадров, штук
		repeats: 0,			// Кол-во повтором анимации
		strip_format: 0,	// ID формата ленты
		pixel_format: 0,	// ID формата пикселей
	};

	// Размеры заголовков файла PXL, байт
	#size_headers = 
	{
		file: 10,						// Размер заголовка файла
		frame: 4,						// Размер заголовка кадра
	};

	// Размеры и формат пикселя файла PXL
	#pixel_formats = 
	{
		//	                                       R, G, B, A
		0:  {size: (2 + 3),     pack: 0,  format: [0, 1, 2, undefined], name: "RGB"},
		1:  {size: (2 + 4),     pack: 0,  format: [0, 1, 2, 3],         name: "RGBA"},
		2:  {size: (2 + 4),     pack: 0,  format: [1, 0, 2, 3],         name: "GRBA"},
		3:  {size: (0),         pack: 0,  format: [],                   name: "---"},
		4:  {size: (0),         pack: 0,  format: [],                   name: "---"},
		5:  {size: (2 + 3),     pack: 1,  format: [0, 1, 2, undefined], name: "RGB + сжатие с индексом, 4 бит/цвет"},
		6:  {size: (2 + 4),     pack: 1,  format: [0, 1, 2, 3],         name: "RGBA + сжатие с индексом, 4 бит/цвет"},
		7:  {size: (2 + 3),     pack: 2,  format: [0, 1, 2, undefined], name: "RGB + сжатие без индекса, 5 бит/цвет"},	// FRRRRRGG GGGBBBBB
		8:  {size: (2 + 4),     pack: 2,  format: [0, 1, 2, 3],         name: "RGBA + сжатие без индекса, 5 бит/цвет"},	// FRRRRGGG GBBBBAAA
		9:  {size: (2 + 3),     pack: 3,  format: [0, 1, 2, undefined], name: "---"},
		10: {size: (0),         pack: 0,  format: [],                   name: "---"},
		11: {size: (0),         pack: 0,  format: [],                   name: "---"},
		12: {size: (0),         pack: 0,  format: [],                   name: "---"},
		13: {size: (0),         pack: 0,  format: [],                   name: "---"},
		14: {size: (0 + 2),     pack: 14, format: [0, 1, 2, undefined], name: "---"},	// RGB555, без индекса, сжатие повторов и пропусков
		15: {size: (0),         pack: 0,  format: [],                   name: "---"}
	};


	constructor( frame_buffer, params )
	{
		this.#frame_buffer = frame_buffer
		//this.#params = params;
		this.#params = Object.assign({}, this.#params, params);
	}

	Render()
	{
		this.#CreateBuffer();
		this.#FillHeader();
		this.#FillFrames();
		this.#TrimBuffer();

		return;
	}
	
	GetFileBytes()
	{
		return this.#buffer.subarray(0, this.#buffer_idx);
	}
	
	
	#CreateBuffer()
	{
		this.#buffer = new Uint8Array( this.#GetMaxDataSize() );

		return;
	}
	
	#TrimBuffer()
	{
		return;
	}
	
	// Вычисляет максимальный размер буфера (файла). После он будет обрезан.
	#GetMaxDataSize()
	{
		let size = 0;
		
		// Заголовок файла
		size += this.#size_headers.file;

		// Все заголовки всех кадров
		size += this.#params.frames * this.#size_headers.frame;
		
		// Все пиксели всех кадров
		let format = this.#pixel_formats[this.#params.pixel_format];
		size += ((this.#params.width * this.#params.height) * format.size) * this.#params.frames;

		return size;
	}

	// Заполняет заголовок файла
	#FillHeader()
	{
		this.#buffer[this.#buffer_idx++] = 'P'.charCodeAt(0);
		this.#buffer[this.#buffer_idx++] = 'X'.charCodeAt(0);
		this.#buffer[this.#buffer_idx++] = 'L'.charCodeAt(0);

		this.#buffer[this.#buffer_idx++] = 0x02;

		this.#buffer[this.#buffer_idx++] = this.#params.width;

		this.#buffer[this.#buffer_idx++] = this.#params.height;

		this.#buffer[this.#buffer_idx++] = (this.#params.pixel_format << 4) | this.#params.strip_format;

		this.#buffer[this.#buffer_idx++] = (this.#params.frames >> 0) & 0xFF;
		this.#buffer[this.#buffer_idx++] = (this.#params.frames >> 8) & 0xFF;

		this.#buffer[this.#buffer_idx++] = this.#params.repeats;

		return;
	}

	// Заполняет файл кадрами
	#FillFrames()
	{
		let format = this.#pixel_formats[this.#params.pixel_format];

		switch( this.#params.strip_format )
		{
			// Линейное
			case 0:
			{
				switch(format.pack)
				{
					case 0:
					case 1:
					{
						this.#FillFrames_Linear(); break;
					};

					case 2:
					{
						this.#FillFrames_Linear_pack_v2(); break;
					}

					case 3:
					{
						this.#FillFrames_Linear_pack_v3(); break;
					}
					
					case 14:
					{
						this.#FillFrames_Linear_RGB555_Pack(); break;
					}
				}

				break;
			}

			// Зигзаг
			case 2: { this.#FillFrames_ZigZag(); break; };

			default:
			{
				alert("Данный формат ленты ещё не поддерживается!");
				
				break;
			}
		}
		
		return;
	}


	#FillFrames_Linear()
	{
		let format = this.#pixel_formats[this.#params.pixel_format];
		
		this.#frame_buffer.forEach((frame) => 
		{
			this.#buffer[this.#buffer_idx++] = (frame.timeout >> 0) & 0xFF;
			this.#buffer[this.#buffer_idx++] = (frame.timeout >> 8) & 0xFF;
			
			// Отметка адреса, куда нужно вставить кол-во пикселей в кадре.
			let pixel_count_index = this.#buffer_idx;
			this.#buffer_idx += 2;
			
			let pixel_count = 0;
			let current_pixel_color = [];
			
			// Для алгоритма поиска одинаковых пикселей между предыдущим и текущим пикселем
			let last_pixel_color = [];

			// Объект пикселя, чтобы не менять оригинальный буффер
			let current_pixel = null;
			
			frame.pixels.forEach((pixel) => 
			{
				current_pixel = structuredClone(pixel);

/*
				let current_pixel_color_raw = current_pixel.color.match(/[a-f\d]{1,2}/gi).map((number) => parseInt(number, 16));
				format.format.forEach((map) => 
				{
					if(map === undefined) return;
					current_pixel_color.push(current_pixel_color_raw[map]);
				});
*/
				
				current_pixel_color = format.format.map(map => 
					map !== undefined ? current_pixel.color.match(/[a-f\d]{1,2}/gi).map(num => parseInt(num, 16))[map] : null).filter(value => value !== null);




				// Тут нужно играть с форматом. Сейчас хардкор

				if(format.pack == 1 && last_pixel_color.length > 0)
				{
					// Проверяем, что все компоненты цвета имеют разницу не более 7
					let isWithinThreshold = current_pixel_color.every((curr, i) => Math.abs(curr - last_pixel_color[i]) <= 7);

					if(isWithinThreshold == true)
					{
/*
						let diff_pixel_color = current_pixel_color.map((curr, i) => 
						{
							// 7 это типа 0.
							return curr - last_pixel_color[i] + 7;
						});
*/
						current_pixel.idx |= 0x8000;
					}
				}
				
				// idx в формате Big-endian
				this.#buffer[this.#buffer_idx++] = (current_pixel.idx >> 8) & 0xFF;
				this.#buffer[this.#buffer_idx++] = (current_pixel.idx >> 0) & 0xFF;
				
				if(current_pixel.idx & 0x8000)
				{
					let color_component_count = 0;
					
					current_pixel_color.forEach((color, i) => 
					{
						let diff = color - last_pixel_color[i] + 7;
						
						if(i % 2 === 0)
						{
							this.#buffer[this.#buffer_idx] = (diff << 4);
						}
						else 
						{
							this.#buffer[this.#buffer_idx] |= (diff & 0x0F);
							this.#buffer_idx++;
						}

						color_component_count++;
					});

					if(color_component_count % 2 !== 0)
						this.#buffer_idx++;
				}
				else
				{
					current_pixel_color.forEach((color) => 
					{
						this.#buffer[this.#buffer_idx++] = color;
					});
					
				}
				
				last_pixel_color = current_pixel_color;

				pixel_count++;
			});
			
			this.#buffer[(pixel_count_index + 0)] = (pixel_count >> 0) & 0xFF;
			this.#buffer[(pixel_count_index + 1)] = (pixel_count >> 8) & 0xFF;
		});
		
		return;
	}









	// Конвертор в формат с сжатием до двух байт на все цвета и удаление индекса, если пиксели подрят идут.
	// Цвет в любом формате согластно маппингу
	#FillFrames_Linear_pack_v2()
	{
		let format = this.#pixel_formats[this.#params.pixel_format];
		
		this.#frame_buffer.forEach((frame) => 
		{
			this.#buffer[this.#buffer_idx++] = (frame.timeout >> 0) & 0xFF;
			this.#buffer[this.#buffer_idx++] = (frame.timeout >> 8) & 0xFF;
			
			// Отметка адреса, куда нужно вставить кол-во пикселей в кадре.
			let pixel_count_index = this.#buffer_idx;
			this.#buffer_idx += 2;
			
			let pixel_count = 0;
			let current_pixel_color = [];
			
			// Для алгоритма поиска одинаковых пикселей между предыдущим и текущим пикселем
			let last_pixel_color = [];
			let last_pixel_idx = 0;

			// Объект пикселя, чтобы не менять оригинальный буффер
			let current_pixel = null;
			
			frame.pixels.forEach((pixel) => 
			{
				current_pixel = structuredClone(pixel);
				
				current_pixel_color = format.format.map(map => 
					map !== undefined ? current_pixel.color.match(/[a-f\d]{1,2}/gi).map(num => parseInt(num, 16))[map] : null).filter(value => value !== null);
				
				// Проверяем, что все компоненты цвета имеют разницу не более X
				let isWithinThreshold = current_pixel_color.every((curr, i, arr) => 
				{
					let len = (arr.length == 4) ? ((i < 3) ? 7 : 3) : 15;
					return Math.abs(curr - last_pixel_color[i]) <= len
				});
				
				// Если пред. пиксель последователен, и все компоненты цвета укладываюся в диапазон
				if(last_pixel_color.length > 0 && last_pixel_idx + 1 == current_pixel.idx && isWithinThreshold == true)
				{
					let color_pack = 0x8000;
					
					// Формат сжатого байта: FRRRRRGG GGGBBBBB
					if(current_pixel_color.length == 3)
					{
						color_pack |= ((current_pixel_color[0] - last_pixel_color[0] + 15) & 0x1F) << 10;
						color_pack |= ((current_pixel_color[1] - last_pixel_color[1] + 15) & 0x1F) << 5;
						color_pack |= ((current_pixel_color[2] - last_pixel_color[2] + 15) & 0x1F) << 0;

						this.#buffer[this.#buffer_idx++] = (color_pack >> 8) & 0xFF;
						this.#buffer[this.#buffer_idx++] = (color_pack >> 0) & 0xFF;
					}
					
					// Формат сжатого байта: FRRRRGGG GBBBBAAA
					if(current_pixel_color.length == 4)
					{
						color_pack |= ((current_pixel_color[0] - last_pixel_color[0] + 7) & 0x0F) << 11;
						color_pack |= ((current_pixel_color[1] - last_pixel_color[1] + 7) & 0x0F) << 7;
						color_pack |= ((current_pixel_color[2] - last_pixel_color[2] + 7) & 0x0F) << 3;
						color_pack |= ((current_pixel_color[3] - last_pixel_color[3] + 3) & 0x07) << 0;
						
						this.#buffer[this.#buffer_idx++] = (color_pack >> 8) & 0xFF;
						this.#buffer[this.#buffer_idx++] = (color_pack >> 0) & 0xFF;
					}

					last_pixel_idx++;
				}

				// Вставляет обычный пиксель
				else
				{
					// idx в формате Big-endian
					this.#buffer[this.#buffer_idx++] = (current_pixel.idx >> 8) & 0xFF;
					this.#buffer[this.#buffer_idx++] = (current_pixel.idx >> 0) & 0xFF;
					
					current_pixel_color.forEach((color) => 
					{
						this.#buffer[this.#buffer_idx++] = color;
					});

					last_pixel_idx = current_pixel.idx;
				}
				
				last_pixel_color = current_pixel_color;
				
				pixel_count++;
			});
			
			this.#buffer[(pixel_count_index + 0)] = (pixel_count >> 0) & 0xFF;
			this.#buffer[(pixel_count_index + 1)] = (pixel_count >> 8) & 0xFF;
		});
		
		return;
	}




















	#FillFrames_Linear_pack_v3()
	{
		let format = this.#pixel_formats[this.#params.pixel_format];
		
		this.#frame_buffer.forEach((frame) => 
		{
			this.#buffer[this.#buffer_idx++] = (frame.timeout >> 0) & 0xFF;
			this.#buffer[this.#buffer_idx++] = (frame.timeout >> 8) & 0xFF;
			
			// Отметка адреса, куда нужно вставить кол-во пикселей в кадре.
			let pixel_count_index = this.#buffer_idx;
			this.#buffer_idx += 2;
			
			let pixel_count = 0;
			let current_pixel_color = [];
			
			// Для алгоритма поиска одинаковых пикселей между предыдущим и текущим пикселем
			let last_pixel_color = [];
			let last_pixel_idx = 0;

			// Объект пикселя, чтобы не менять оригинальный буффер
			let current_pixel = null;
			
			frame.pixels.forEach((pixel) => 
			{
				current_pixel = structuredClone(pixel);
				
				current_pixel_color = format.format.map(map => 
					map !== undefined ? current_pixel.color.match(/[a-f\d]{1,2}/gi).map(num => parseInt(num, 16))[map] : null).filter(value => value !== null);

/*
				// Проверяем, что все компоненты цвета имеют разницу не более X
				let isWithinThreshold = current_pixel_color.every((curr, i, arr) => 
				{
					let len = (arr.length == 4) ? ((i < 3) ? 7 : 3) : 15;
					return Math.abs(curr - last_pixel_color[i]) <= len
				});
*/

				// Если пред. пиксель последователен, и все компоненты цвета укладываюся в диапазон
				if(last_pixel_color.length > 0 && last_pixel_idx + 1 == current_pixel.idx/* && isWithinThreshold == true*/)
				{
					let color_pack = 0x800000;
					
					// Формат сжатого байта: FRRRRRRR RGGGGGGG GBBBBBBB
					if(current_pixel_color.length == 3)
					{
						color_pack |= (current_pixel_color[0] << 15);
						color_pack |= (current_pixel_color[1] << 7);
						color_pack |= (current_pixel_color[2] >> 1);

						this.#buffer[this.#buffer_idx++] = (color_pack >> 16) & 0xFF;
						this.#buffer[this.#buffer_idx++] = (color_pack >> 8) & 0xFF;
						this.#buffer[this.#buffer_idx++] = (color_pack >> 0) & 0xFF;
					}
					
/*
					// Формат сжатого байта: FRRRRGGG GBBBBAAA
					if(current_pixel_color.length == 4)
					{
						color_pack |= ((current_pixel_color[0] - last_pixel_color[0] + 7) & 0x0F) << 11;
						color_pack |= ((current_pixel_color[1] - last_pixel_color[1] + 7) & 0x0F) << 7;
						color_pack |= ((current_pixel_color[2] - last_pixel_color[2] + 7) & 0x0F) << 3;
						color_pack |= ((current_pixel_color[3] - last_pixel_color[3] + 3) & 0x07) << 0;
						
						this.#buffer[this.#buffer_idx++] = (color_pack >> 8) & 0xFF;
						this.#buffer[this.#buffer_idx++] = (color_pack >> 0) & 0xFF;
					}
*/
					last_pixel_idx++;
				}

				// Вставляет обычный пиксель
				else
				{
					// idx в формате Big-endian
					this.#buffer[this.#buffer_idx++] = (current_pixel.idx >> 8) & 0xFF;
					this.#buffer[this.#buffer_idx++] = (current_pixel.idx >> 0) & 0xFF;
					
					current_pixel_color.forEach((color) => 
					{
						this.#buffer[this.#buffer_idx++] = color;
					});

					last_pixel_idx = current_pixel.idx;
				}
				
				last_pixel_color = current_pixel_color;
				
				pixel_count++;
			});
			
			this.#buffer[(pixel_count_index + 0)] = (pixel_count >> 0) & 0xFF;
			this.#buffer[(pixel_count_index + 1)] = (pixel_count >> 8) & 0xFF;
		});
		
		return;
	}



	// RGB555, без индекса, сжатие пропусков и пробелов.
	// Формат цвета, 2 байта: 0RRRRRGG GGGBBBBB
	// Формат сжатия, 1 байт: 1MNNNNNN, M - mode (0: пропуски, 1: повторы), N - кол-во.
	#FillFrames_Linear_RGB555_Pack()
	{
		let format = this.#pixel_formats[this.#params.pixel_format];
		const rgb888to555 = 
		[
			0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x02, 0x02, 0x02, 0x02, 
			0x02, 0x02, 0x02, 0x02, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x04, 0x04, 0x04, 0x04, 
			0x04, 0x04, 0x04, 0x04, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x06, 0x06, 0x06, 0x06, 
			0x06, 0x06, 0x06, 0x06, 0x07, 0x07, 0x07, 0x07, 0x07, 0x07, 0x07, 0x07, 0x08, 0x08, 0x08, 0x08, 
			0x08, 0x08, 0x08, 0x08, 0x09, 0x09, 0x09, 0x09, 0x09, 0x09, 0x09, 0x09, 0x0A, 0x0A, 0x0A, 0x0A, 
			0x0A, 0x0A, 0x0A, 0x0A, 0x0B, 0x0B, 0x0B, 0x0B, 0x0B, 0x0B, 0x0B, 0x0B, 0x0C, 0x0C, 0x0C, 0x0C, 
			0x0C, 0x0C, 0x0C, 0x0C, 0x0D, 0x0D, 0x0D, 0x0D, 0x0D, 0x0D, 0x0D, 0x0D, 0x0E, 0x0E, 0x0E, 0x0E, 
			0x0E, 0x0E, 0x0E, 0x0E, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x10, 0x10, 0x10, 0x10, 
			0x10, 0x10, 0x10, 0x10, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x12, 0x12, 0x12, 0x12, 
			0x12, 0x12, 0x12, 0x12, 0x13, 0x13, 0x13, 0x13, 0x13, 0x13, 0x13, 0x13, 0x14, 0x14, 0x14, 0x14, 
			0x14, 0x14, 0x14, 0x14, 0x15, 0x15, 0x15, 0x15, 0x15, 0x15, 0x15, 0x15, 0x16, 0x16, 0x16, 0x16, 
			0x16, 0x16, 0x16, 0x16, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x18, 0x18, 0x18, 0x18, 
			0x18, 0x18, 0x18, 0x18, 0x19, 0x19, 0x19, 0x19, 0x19, 0x19, 0x19, 0x19, 0x1A, 0x1A, 0x1A, 0x1A, 
			0x1A, 0x1A, 0x1A, 0x1A, 0x1B, 0x1B, 0x1B, 0x1B, 0x1B, 0x1B, 0x1B, 0x1B, 0x1C, 0x1C, 0x1C, 0x1C, 
			0x1C, 0x1C, 0x1C, 0x1C, 0x1D, 0x1D, 0x1D, 0x1D, 0x1D, 0x1D, 0x1D, 0x1D, 0x1E, 0x1E, 0x1E, 0x1E, 
			0x1E, 0x1E, 0x1E, 0x1E, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 
		];
		
		this.#frame_buffer.forEach((frame) => 
		{
			// Сохраняем timeout в заголовке кадра
			this.#buffer[this.#buffer_idx++] = (frame.timeout >> 0) & 0xFF;
			this.#buffer[this.#buffer_idx++] = (frame.timeout >> 8) & 0xFF;
			
			// Отметка адреса, куда нужно вставить кол-во пикселей в кадре.
			let pixel_count_index = this.#buffer_idx;
			this.#buffer_idx += 2;
			
			let pixel_count = 0;
			let current_pixel_color = [];
			
			// Для алгоритма поиска одинаковых пикселей между предыдущим и текущим пикселем
			let last_pixel_color = [];
			let last_pixel_idx = -1;

			// Объект пикселя, чтобы не менять оригинальный буффер
			let current_pixel = null;
			
			frame.pixels.forEach((pixel) => 
			{
				current_pixel = structuredClone(pixel);
				
				// Парсим и маппим компоненты цвета пикселя
				current_pixel_color = format.format.map(map => 
					map !== undefined ? current_pixel.color.match(/[a-f\d]{1,2}/gi).map(num => parseInt(num, 16))[map] : null).filter(value => value !== null);
				
				// Алгоритм пропуска пустых пикселей
				let pixel_delta_last_to_current = (last_pixel_idx === -1) 
					? current_pixel.idx
					: current_pixel.idx - last_pixel_idx - 1;
				
				// Заполняем пустые пиксели
				while(pixel_delta_last_to_current > 0)
				{
					let skip = Math.min(64, pixel_delta_last_to_current);
					
					this.#buffer[this.#buffer_idx++] = (0x80 | (skip - 1));
					
					pixel_delta_last_to_current -= skip;
					pixel_count++;
				}

				// Вставляем несжатый пиксель RGB555
				{
					let color555 = 0x0000;
					color555 |= rgb888to555[current_pixel_color[0]] << 10;
					color555 |= rgb888to555[current_pixel_color[1]] << 5;
					color555 |= rgb888to555[current_pixel_color[2]] << 0;
					
					this.#buffer[this.#buffer_idx++] = (color555 >> 8) & 0xFF;
					this.#buffer[this.#buffer_idx++] = (color555 >> 0) & 0xFF;
					
					last_pixel_idx = current_pixel.idx;
					pixel_count++;
				}
			});
			
			this.#buffer[(pixel_count_index + 0)] = (pixel_count >> 0) & 0xFF;
			this.#buffer[(pixel_count_index + 1)] = (pixel_count >> 8) & 0xFF;
		});
		
		return;
	}








	#FillFrames_ZigZag()
	{
		
		
		return;
	}
	

}
