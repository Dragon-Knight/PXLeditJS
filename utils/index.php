<?php

$data = array();

$method = $_GET['method'];

if($method == "gif2png")
{
	$file_raw = base64_decode($_POST['file']);
	//$file_raw = file_get_contents("input.gif");
	
	$process = proc_open('gif2png.py', array(0 => array("pipe", "r"), 1 => array("pipe", "w")), $pipes /*, __DIR__, null, array(array('bypass_shell', true)) */);
	if(is_resource($process) === true)
	{
		fwrite($pipes[0], $file_raw);
		fclose($pipes[0]);
		
		$out_raw = stream_get_contents($pipes[1]);
		fclose($pipes[1]);
		
		if(proc_close($process) == 0)
		{
			$lines = preg_split("/\R/", $out_raw);
			foreach($lines as $line)
			{
				ParseLine($line, $data);
			}
		}
	}
}
else
{

}


function ParseLine($line, &$data)
{
	static $old_frame_crc32 = 0;
	static $idx = 0;
	
	list($frame_line, $frame_idx, $frame_total, $frame_duration, $frame_bytes, $frame_data) = explode(" | ", $line);
	
	if($frame_line != ">") return;
	
	$frame_crc32 = crc32($frame_data);
	if($frame_crc32 != $old_frame_crc32)
	{
		$old_frame_crc32 = $frame_crc32;
		
		$data[$idx]['timeout'] = $frame_duration;
		$data[$idx]['data'] = "data:image/gif;base64," . $frame_data;
		$idx++;
	}
	else
	{
		$data[$idx-1]['timeout'] += $frame_duration;
	}
	
	return;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($data, JSON_NUMERIC_CHECK | JSON_UNESCAPED_UNICODE);

?>