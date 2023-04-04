<?php

require_once("GifFrameExtractor.php");

//use GifFrameExtractor;

//$gifFilePath = 'Init_kira.gif';
//$gifFilePath = 'Init_kira_frame.gif';

//$json_input = json_decode($_POST)

$gifFilePath = "./_tmp.gif";
$input_file = base64_decode($_POST['file']);
file_put_contents($gifFilePath, $input_file);


$data = array();

//$gifFilePath = 'Init_kira.gif';

if (GifFrameExtractor::isAnimatedGif($gifFilePath)) { // check this is an animated GIF

    $gfe = new GifFrameExtractor();

    $gfe->extract($gifFilePath);

	$old_frame_crc32 = 0;
	$idx = 0;
    // Do something with extracted frames ...
    foreach ($gfe->getFrames() as $frame) {

        // The frame resource image var
       // $img = $frame['image'];
	   //$filename = "out/frame-" . $idx++ . ".gif";
	   
		//$img = imagegif($frame['image'], $filename);
        //echo $img;

        // The frame duration
        $duration = $frame['duration'] * 10;
		
		
		ob_start();
		imagegif($frame['image']);
		$stringdata = ob_get_contents();
		ob_end_clean();
		
		$frame_crc32 = crc32($stringdata);
		if($frame_crc32 != $old_frame_crc32)
		{
			$old_frame_crc32 = $frame_crc32;
			
			$data[$idx]['timeout'] = $duration;
			$data[$idx]['data'] = "data:image/gif;base64," . base64_encode($stringdata);
			$idx++;
		}
		else
		{
			$data[$idx-1]['timeout'] = $data[$idx-1]['timeout'] + $duration;
		}
		
		
		
		
		

    }
	
	unset($gfe);

}

unlink($gifFilePath);


header('Content-Type: application/json; charset=utf-8');

echo json_encode($data, JSON_NUMERIC_CHECK | JSON_UNESCAPED_UNICODE);


?>