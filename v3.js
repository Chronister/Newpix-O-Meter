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
      
    var gear1 = gd.createFromPng(path.join(images, 'gear1.png')),
	   gear2 = gd.createFromPng(path.join(images, 'gear2.png')),
	   gear3 = gd.createFromPng(path.join(images, 'gear3.png')),
	   clock = gd.createFromPng(path.join(images, 'clock3.png')),
	
	   img = gd.createFromPng(path.join(images, 'clock3.png'));
	
	img.alphaBlending(1);
	img.setAntiAliased(1);
	
	var almostblack = img.colorallocate(1, 1, 1),
	   black = img.colorallocate(0, 0, 0),
	   white = img.colorallocate(255, 255, 255),
	   clear = img.colorallocatealpha(255, 255, 255, 0),
	   dark = img.colorallocate(113, 101, 79);
	
	img.colorTransparent(img, white);
	clock.colorTransparent(clock, white);
	gear1.colorTransparent(gear1, white);
	gear2.colorTransparent(gear2, white);
	gear3.colorTransparent(gear3, white);

    var date = new Date(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        hour = date.getHours();
    minute += (second / 60)
    
    var gear1_diag = 2 * Math.sqrt(Math.pow(0.5 * gear1.width, 2) + Math.pow(0.5 * gear1.height, 2)),
        gear1_ang = ((minute + hour * 60) * 30),
        gear1_rot = gd.createTrueColor(gear1_diag, gear1_diag),
        gear2_diag = 2 * Math.sqrt(Math.pow(0.5 * gear2.width, 2) + Math.pow(0.5 * gear2.height, 2)),
        gear2_ang = -(minute * 60),
        gear2_rot = gd.createTrueColor(gear2_diag, gear2_diag),
        gear3_diag = 2 * Math.sqrt(Math.pow(0.5 * gear3.width, 2) + Math.pow(0.5 * gear3.height, 2)),
        gear3_ang = (minute * 120),
        gear3_rot = gd.createTrueColor(gear3_diag, gear3_diag);
    
    //img.copyRotated(dest, dstX, dstY, srcX, srcY, srcW, srcH, angle);
	gear1.copyRotated(gear1_rot, 
        (gear1_diag - gear1.width) / 2, 
        (gear1_diag - gear1.height) / 2, 
        0, 0,
        gear1.width,
        gear1.height,
        gear1_ang);
	gear2.copyRotated(gear2_rot, 
        (gear2_diag - gear2.width) / 2, 
        (gear2_diag - gear2.height) / 2, 
        0, 0,
        gear2.width,
        gear2.height,
        gear2_ang);
    gear3.copyRotated(gear3_rot, 
        (gear3_diag - gear3.width) / 2, 
        (gear3_diag - gear3.height) / 2, 
        0, 0,
        gear3.width,
        gear3.height,
        gear3_ang);
	
	offset1 = (gear1_rot.width - gear1.width) / 2;
	offset2 = (gear2_rot.width - gear2.width) / 2;
	offset3 = (gear3_rot.width - gear3.width) / 2;
	
    //img.copyMerge(dest, dstX, dstY, srcX, srcY, width, height, pct);
	gear1.copyMerge(img, 54 - offset1, 7 - offset1, 0, 0, gear1.width, gear1.height, 100);
	gear2.copyMerge(img, 77 - offset2, 40 - offset2, 0, 0, gear2.width, gear2.height, 100);
	gear3.copyMerge(img, 8 - offset3, 45 - offset3, 0, 0, gear3.width, gear3.height, 100);
	
	clock.copymerge(img, 0, 0, 0, 0, 100, 100, 100);
	
	for (i = 0; i < 50; i++) {
		x1 = 50 + 30 * Math.cos(((i / 50) * 2 * Math.PI + (Math.PI * 0.5)));
		y1 = 51 + 30 * Math.sin(((i / 50) * 2 * Math.PI + (Math.PI * 0.5)));
		x2 = 50 + 33 * Math.cos(((i / 50) * 2 * Math.PI + (Math.PI * 0.5)));
		y2 = 51 + 33 * Math.sin(((i / 50) * 2 * Math.PI + (Math.PI * 0.5)));
	
	imagelinethick(img, x1, y1, x2, y2, dark, 0.1);
	}
	
	for (i = 0; i < 10; i++) {
		x1 = 50 + 28 * Math.cos(((i / 10) * 2 * Math.PI + (Math.PI * 0.5)));
		y1 = 51 + 28 * Math.sin(((i / 10) * 2 * Math.PI + (Math.PI * 0.5)));
		x2 = 50 + 33 * Math.cos(((i / 10) * 2 * Math.PI + (Math.PI * 0.5)));
		y2 = 51 + 33 * Math.sin(((i / 10) * 2 * Math.PI + (Math.PI * 0.5)));
	
	imagelinethick(img, x1, y1, x2, y2, black, 2);
	}
	imagelinethick(img, 50, 18, 50, 33, black, 2);
	
	x = 50 + -25 * Math.cos(((minute / 60) * 2 * Math.PI) + Math.PI / 2);
	y = 52 + -25 * Math.sin(((minute / 60) * 2 * Math.PI) + Math.PI / 2);
		
	x2 = 50 + -16 * Math.cos(((minute / 60) * 2 * Math.PI) + Math.PI / 2);
	y2 = 52 + -16 * Math.sin(((minute / 60) * 2 * Math.PI) + Math.PI / 2);
	
	x3 = 50 + -9 * Math.cos(((minute / 60) * 2 * Math.PI) + Math.PI / 2);
	y3 = 52 + -9 * Math.sin(((minute / 60) * 2 * Math.PI) + Math.PI / 2);
		
	imagelinethick(img, 50, 52 , x, y, black, 2);
	imagelinethick(img, 50, 52 , x2, y2, black, 3);
	imagelinethick(img, 50, 52 , x3, y3, black, 4);
    
    //Save to a file and then read it back because pngPtr() doesn't work for some reason
    img.savePng('./temp2');
    var dat = fs.readFileSync('./temp2');
        
    res.set('Content-Type', 'image/png');
    res.end(dat, 'binary');
    img.destroy();
}