import sys, io, base64
from PIL import Image

def iter_frames(im):
	try:
		i= 0
		while 1:
			im.seek(i)
			imframe = im.copy()
			yield imframe
			i += 1
	except EOFError:
		pass


print("GIF splitter by Dragon_Knight")

#filename = "input.gif"
filename = io.BytesIO( sys.stdin.buffer.read() )
img = Image.open(filename, mode="r", formats=['gif'])

print( "File: %s, foramt: %s, animated: %c, frames: %d" % (filename, img.format, ('Y', 'N')[img.is_animated], img.n_frames) )

if img.format == "GIF":
	
	for i, frame in enumerate(iter_frames(img)):
		#frame.save('out/test%03d.png' % i,**frame.info)
		
		output = io.BytesIO()
		frame.save(output, format='png')
		
		# > | frame current | frame total | frame duration | frame bytes | frame data (new line)
		print( "> | %d | %d | %d | %d | %s" % ( (i+1), img.n_frames, frame.info['duration'], output.getbuffer().nbytes, base64.b64encode(output.getvalue()).decode('ascii')) )

else:
	print("File is not GIF")

print("Done")
