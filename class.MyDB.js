
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
			}
		}
		
		return;
	}
	
	
	
	
	
	
	
	
}
