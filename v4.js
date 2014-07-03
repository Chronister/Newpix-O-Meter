
var gd = require('node-gd');
var fs = require('fs');

exports.clock = function(req, res, next) {
    var img = gd.createTrueColor(100, 100);
    img.setAntiAliased(1);
    
    var almostblack = img.colorAllocate(1, 1, 1),
	   black = img.colorAllocate(0, 0, 0),
	   white = img.colorAllocate(255, 255, 255),
	   clear = img.colorAllocateAlpha(255, 255, 255, 0);
    
    img.colorTransparent(almostblack);
	img.fill(0, 0, white);
	img.filledEllipse(50, 50, 98, 98, black);
	img.filledEllipse(50, 50, 94, 94, white);
    img.savePng('./temp');
    var dat = fs.readFileSync('./temp');
    
    res.set('Content-Type', 'image/png');
    res.end(dat, 'binary');
    img.destroy();
}