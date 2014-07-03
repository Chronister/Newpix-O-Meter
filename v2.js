var gd = require('node-gd');
var fs = require('fs');
var path = require('path');

var images = './img/';

function imagelinethick(img, x1, y1, x2, y2, color, thick)
{
    if (thick == undefined) { thick = 1; }

    if (thick == 1) {
        return img.line(x1, y1, x2, y2, color);
    }
    var t = thick / 2.0 - 0.5;
    if (x1 == x2 || y1 == y2) {
        return img.filledRectangle(Math.round(Math.min(x1, x2) - t), Math.round(Math.min(y1, y2) - t), Math.round(Math.max(x1, x2) + t), Math.round(Math.max(y1, y2) + t), color);
    }
    
    var k = (y2 - y1) / (x2 - x1); //y = kx + q
    var a = t / Math.sqrt(1 + Math.pow(k, 2));
    var points = [
        Math.round(x1 - (1+k)*a), Math.round(y1 + (1-k)*a),
        Math.round(x1 - (1-k)*a), Math.round(y1 - (1+k)*a),
        Math.round(x2 + (1+k)*a), Math.round(y2 - (1-k)*a),
        Math.round(x2 + (1-k)*a), Math.round(y2 + (1+k)*a),
    ];
    img.filledPolygon(points, color);
    img.polygon(points, color);
}

exports.clock = function(req, res, next) {
    var img = gd.createFromPng(path.join(images, 'clock2.png'));
    img.setAntiAliased(1);
    
    var almostblack = img.colorAllocate(1, 1, 1),
	   black = img.colorAllocate(0, 0, 0),
	   white = img.colorAllocate(255, 255, 255),
	   clear = img.colorAllocateAlpha(255, 255, 255, 0);
    
    img.colorTransparent(white);
    
    for (var i = 0; i < 16; i++) {
        var x1 = 50 + 32 * Math.cos(((i / 16) * 2 * Math.PI)),
		  y1 = 50 + 32 * Math.sin(((i / 16) * 2 * Math.PI)),
		  x2 = 50 + 36 * Math.cos(((i / 16) * 2 * Math.PI)),
		  y2 = 50 + 36 * Math.sin(((i / 16) * 2 * Math.PI));
	    img.line(Math.floor(x1), Math.floor(y1), Math.floor(x2), Math.floor(y2), black);
    }
    imagelinethick(img, 49, 18, 49, 26, black, 2);
        
    var minute = new Date().getMinutes(),
	   x = 50 + -32 * Math.cos(((minute / 60) * 2 * Math.PI) + Math.PI / 2),
	   y = 50 + -32 * Math.sin(((minute / 60) * 2 * Math.PI) + Math.PI / 2);
	img.setThickness(2);
	img.line(50, 50, Math.floor(x), Math.floor(y), black);
    
    //Save to a file and then read it back because pngPtr() doesn't work for some reason
    img.savePng('./temp2');
    var dat = fs.readFileSync('./temp2');
        
    res.set('Content-Type', 'image/png');
    res.end(dat, 'binary');
    img.destroy();
}