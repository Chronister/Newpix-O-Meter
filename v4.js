
var gd = require('node-gd');
var fs = require('fs');

var fonts = './font/';

exports.clock = function(req, res, next) {
    var img = gd.createTrueColor(800, 100);
    var font = font = 'DigitalDream.ttf';
    
    img.alphaBlending(1);
	img.setAntiAliased(1);
	
	var almostblack = img.colorAllocate(img, 1, 1, 1),
	   black = img.colorAllocate(0, 0, 0),
	   white = img.colorAllocate(255, 255, 255),
	   green = img.colorAllocate(0, 200, 0),
	   clear = img.colorAllocateAlpha(255, 255, 255, 0);
    
	img.fill(0, 0, black);
	
	var newpix = date.getHours() + date.getDate() * 24 + 2450;
	newpix += date.getMinutes() / 60.0;
	newpix += date.getSeconds() / 3600.0;
	newpix = round(newpix, 2);
	
    var date = new Date(),
	   countdownh = date.getHours() + date.getDate() * 24;
	countdownh = 669 - countdownh;
	var countdownm = 60 - date.getMinutes();
	if (countdownm < 10) { countdownm = "0" + countdownm; }
	if (countdownh < 10) { countdownh = "0" + countdownh; }
	
    //img.stringFTBBox  (color, font, size, angle, x, y, str);
    //img.stringFT      (color, font, size, angle, x, y, str);
	img.stringFT(green, font, 20, 0, 20, 62, "Newpix " + newpix);
	img.stringFT(green, font, 20, 0, 350, 62, "Reconnect in: 0:" + countdownh + ":" + countdownm);
    
    
    img.savePng('./temp');
    var dat = fs.readFileSync('./temp');
    
    res.set('Content-Type', 'image/png');
    res.end(dat, 'binary');
    img.destroy();
}