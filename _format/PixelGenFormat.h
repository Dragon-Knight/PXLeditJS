
// Типы и порядок ленты.
// Заполнить согласно актуальным типам !!!
enum format_strip_t : uint8_t
{
	STRIP_NONE = 0x00,
	STRIP_LINE = 0x01,
	STRIP_ZIGZAG = 0x02,
	STRIP_X03 = 0x03,
	STRIP_X04 = 0x04,
	STRIP_X05 = 0x05,
	STRIP_X06 = 0x06,
	STRIP_X07 = 0x07,
	STRIP_X08 = 0x08,
	STRIP_X09 = 0x09,
	STRIP_X0A = 0x0A,
	STRIP_X0B = 0x0B,
	STRIP_X0C = 0x0C,
	STRIP_X0D = 0x0D,
	STRIP_X0E = 0x0E,
	STRIP_X0F = 0x0F
};

// Типы и порядок цветов.
// Заполнить согласно актуальным типам !!!
enum format_color_t : uint8_t
{
	COLOR_RGB  = 0x00,
	COLOR_RGBA = 0x01,
	COLOR_GRBA = 0x02,
	COLOR_X03  = 0x03,
	COLOR_X04  = 0x04,
	COLOR_X05  = 0x05,
	COLOR_X06  = 0x06,
	COLOR_X07  = 0x07,
	COLOR_X08  = 0x08,
	COLOR_X09  = 0x09,
	COLOR_X0A  = 0x0A,
	COLOR_X0B  = 0x0B,
	COLOR_X0C  = 0x0C,
	COLOR_X0D  = 0x0D,
	COLOR_X0E  = 0x0E,
	COLOR_X0F  = 0x0F
};

// Структура описывает поле формата данных.
struct file_format_t
{
	// Младшие 4 бита, - Формат порядка и типа ленты.
	format_strip_t strip:4;
	
	// Старшие 4 бита, - Формат порядка и типа цветов.
	format_color_t color:4;
};


// Структура описывает заголовок файла.
struct file_header_t
{
	// 3 байта, - Заголовка формата, символы таблицы ASCII. Например: 'PIX'.
	char type[3];
	
	// 1 байт, - версия формата файла.
	uint8_t version;
	
	// 1 байт, - Полный размер изображения в пикселях по оси X.
	uint8_t size_x;
	
	// 1 байт, - Полный размер изображения в пикселях по оси Y.
	uint8_t size_y;
	
	// 1 байт, - Формат данных: Порядок цветов и способ подключения ленты.
	file_format_t format;
	
	// 2 байта, - Число кадров анимации, от 1 до 65535. ( по сути кол-во структур file_frame_t )
	uint16_t img_frames;
	
	// 1 байт, - Кол-во повторов анимации, от 0 до 255. 0 - статичная картинка, 255 - бесконечно.
	uint8_t img_repeats;
	
	// Далее идут кадры, описанные структурой file_frame_t.
};

// Структура заголовка кадра.
struct file_frame_t
{
	// 2 байта, - Время, в мс, отображения текущего кадра, от 0 до 65535.
	uint16_t frame_timeout;
	
	// 2 байта, - Число пикселей в текущем кадре. ( по сути кол-во структур file_pixel_t )
	uint16_t frame_pixels;
	
	// Далее идут пиксели, описанные структурой file_pixel_t.
};

// Структура данных каждого пикселя.
struct file_pixel_t
{
	// Кол-во пропущенных пикселей относительно предыдущего.
	// При итерации по пикселям проверять смещение чтобы < (size_x * size_y).
	uint16_t skip;
	
	// 4 х 1 байт, - Компоненты цвета согласно переданному формату.
	uint8_t color1;
	uint8_t color2;
	uint8_t color3;
	uint8_t color4;
};
