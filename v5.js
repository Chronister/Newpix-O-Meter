var gd = require('node-gd');
var fs = require('fs');
var path = require('path');

var images = './img/';
var fonts = './font/';

var M_PI = Math.PI;
var H_PI = M_PI * 0.5;

Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

exports.clock = function(req, res, next) {

	var font = path.join(fonts, 'CASTELAR.TTF');
	
    var gear1 =    gd.createFromPng(path.join(images, "gear1.png")),
	   gear2 =     gd.createFromPng(path.join(images, "gear2.png")),
	   gear3 =     gd.createFromPng(path.join(images, "gear3.png")),
	   clock =     gd.createFromPng(path.join(images, "clock5.png")),
	   img =       gd.createFromPng(path.join(images, "clock5.png"));
    
    var width = img.width;
	
	img.alphaBlending(1);
	img.setAntiAliased(1);
	
	almostblack =  img.colorAllocate(1, 1, 1);
	black =        img.colorAllocate(0, 0, 0);
	white =        img.colorAllocate(255, 255, 255);
	clear =        img.colorAllocateAlpha(255, 255, 255, 0);
	dark =         img.colorAllocate(113, 101, 79);
	
	img.colorTransparent(white);
	gear1.colorTransparent(white);
	gear2.colorTransparent(white);
	gear3.colorTransparent(white);
	clock.colorTransparent(white);

    var date =      new Date(),
	    minute =    date.getMinutes(),
	    second =    date.getSeconds(),
        hour =      date.getHours();
    minute += second / 60;

	//Gears
    var gear1_diag = 2 * Math.sqrt(Math.pow(0.5 * gear1.width, 2) + Math.pow(0.5 * gear1.height, 2)),
        gear1_ang = ((minute + hour * 60) * 30),
        gear1_rot = gd.createTrueColor(Math.floor(gear1_diag), Math.floor(gear1_diag)),
        gear2_diag = 2 * Math.sqrt(Math.pow(0.5 * gear2.width, 2) + Math.pow(0.5 * gear2.height, 2)),
        gear2_ang = -(minute * 60),
        gear2_rot = gd.createTrueColor(Math.floor(gear2_diag), Math.floor(gear2_diag)),
        gear3_diag = 2 * Math.sqrt(Math.pow(0.5 * gear3.width, 2) + Math.pow(0.5 * gear3.height, 2)),
        gear3_ang = (minute * 120),
        gear3_rot = gd.createTrueColor(Math.floor(gear3_diag), Math.floor(gear3_diag));
    
    //img.copyRotated(dest, dstX, dstY, srcX, srcY, srcW, srcH, angle);
	gear1.copyRotated(gear1_rot, 
        (gear1_diag - gear1.width) / 2, 
        (gear1_diag - gear1.height) / 2, 
        0, 0,
        gear1.width,
        gear1.height,
        Math.floor(gear1_ang));
	gear2.copyRotated(gear2_rot, 
        (gear2_diag - gear2.width) / 2, 
        (gear2_diag - gear2.height) / 2, 
        0, 0,
        gear2.width,
        gear2.height,
        Math.floor(gear2_ang));
    gear3.copyRotated(gear3_rot, 
        (gear3_diag - gear3.width) / 2, 
        (gear3_diag - gear3.height) / 2, 
        0, 0,
        gear3.width,
        gear3.height,
        Math.floor(gear3_ang));
	
	var offset1 = Math.floor((gear1_rot.width - gear1.width) / 2),
	    offset2 = Math.floor((gear2_rot.width - gear2.width) / 2),
	    offset3 = Math.floor((gear3_rot.width - gear3.width) / 2);
	
    //img.copyMerge(dest, dstX, dstY, srcX, srcY, width, height, pct);
	gear1.copyMerge(img, 403 - offset1, 32 - offset1, 0, 0, gear1.width, gear1.height, 100);
	gear1.copyMerge(img, 278 - offset1, 5 - offset1, 0, 0, gear1.width, gear1.height, 100);
	gear2.copyMerge(img, 317 - offset2, 15 - offset2, 0, 0, gear2.width, gear2.height, 100);
	gear2.copyMerge(img, 388 - offset2, 27 - offset2, 0, 0, gear2.width, gear2.height, 100);
	gear3.copyMerge(img, 113 - offset3, 13 - offset3, 0, 0, gear3.width, gear3.height, 100);
		
	clock.copyMerge(img, 0, 0, 0, 0, width, 100, 100);
	
	//Clock faces
	makeClockFace(img, 224, 49, 33, 3, 5, dark, 50, 10, 1);
	makeClockFace(img, 122, 68, 22, 2, 3, dark, 40, 20, 1);
	makeClockFace(img, 122, 68, 22, 2, 6, dark, 0, 4, 1);
	makeClockFace(img, 329, 66, 22, 2, 3, dark, 20, 10, 1);
	
	makeClockHand(img, 224, 49, ((minute / 60) * 2 * M_PI) + M_PI / 2, 30, 3);
	makeClockHand(img, 122, 68, ((minute / 240 + ((hour + 2) % 4) / 4) * 2 * M_PI) + M_PI / 2 + M_PI / 4, 20, 3);
	makeClockHand(img, 329, 66, (((minute % 30) / 30) * 2 * M_PI) + M_PI / 2, 20, 3);

	var newpix = unixToNewpix(date.getTime() / 1000);
	
	fixedWidthNumber(img, 371, 86, 13.33, 15, newpix, black, font);
    
    //Save to a file and then read it back because pngPtr() doesn't work for some reason
    img.savePng('./temp5');
    var dat = fs.readFileSync('./temp5');
        
    res.set('Content-Type', 'image/png');
    res.end(dat, 'binary');
    img.destroy();
}

function makeClockFace(img, offsetx, offsety, radius, length1, length2, color, num1, num2, thick2) {

    var black = img.colorAllocate(36, 20, 12);

    for (var i = 0; i < num1; i++) {
        x1 = offsetx + (radius - length1) * Math.cos(((i / num1) * 2 * M_PI + H_PI));
        y1 = offsety + (radius - length1) * Math.sin(((i / num1) * 2 * M_PI + H_PI));
        x2 = offsetx + radius * Math.cos(((i / num1) * 2 * M_PI + H_PI));
        y2 = offsety + radius * Math.sin(((i / num1) * 2 * M_PI + H_PI));

        img.line(Math.floor(x1), Math.floor(y1), Math.floor(x2), Math.floor(y2), color);
    }

    for (var i = 0; i < num2; i++) {
        x1 = offsetx + (radius - length2) * Math.cos(((i / num2) * 2 * M_PI + (num2 == 10 ? H_PI : 0)));
        y1 = offsety + (radius - length2) * Math.sin(((i / num2) * 2 * M_PI + (num2 == 10 ? H_PI : 0)));
        x2 = offsetx + radius * Math.cos(((i / num2) * 2 * M_PI + (num2 == 10 ? H_PI : 0)));
        y2 = offsety + radius * Math.sin(((i / num2) * 2 * M_PI + (num2 == 10 ? H_PI : 0)));
        
        img.setThickness(thick2);
        img.line(Math.floor(x1), Math.floor(y1), Math.floor(x2), Math.floor(y2), black);
    }
    if (length2 <= 5) { 
        img.setThickness(thick2*2);
        img.line(Math.floor(offsetx), Math.floor(offsety - radius), Math.floor(offsetx), Math.floor(offsety - (radius - length2 * 3)), black); 
    }
    else { 
        img.setThickness(thick2*2);
        img.line(Math.floor(offsetx), Math.floor(offsety - radius), Math.floor(offsetx), Math.floor(offsety - (radius - length2 * 1.6)), black);
    }
}

function makeClockHand(img, offsetx, offsety, angle, length, thick) {
    var black = img.colorAllocate(0, 0, 0),
        x = offsetx + -length * Math.cos(angle),
        y = offsety + -length * Math.sin(angle),

        x2 = offsetx + -length * 0.64 * Math.cos(angle),
        y2 = offsety + -length * 0.64 * Math.sin(angle),

        x3 = offsetx + -length * 0.36 * Math.cos(angle),
        y3 = offsety + -length * 0.36 * Math.sin(angle);

    img.setThickness(Math.round(thick * 0.333));
    img.line(Math.floor(offsetx), Math.floor(offsety), Math.floor(x), Math.floor(y), black);
    img.setThickness(Math.round(thick * 0.667));
    img.line(Math.floor(offsetx), Math.floor(offsety), Math.floor(x2), Math.floor(y2), black);
    //img.linethick(img, offsetx, offsety, x3, y3, black, thick);
}

function fixedWidthNumber(img, offsetx, offsety, width, height, number, color, font) {
    while (number.toString().length < 5) {
        number = "0" + number;
    }
    for (var i = 0; i < 5; i++) {
        str = number.toString().substr(i, 1);
        extraoffset = width * 0.2;
        if (str == '1') { extraoffset = width * 0.5; }
        if (str == '0') { extraoffset = 0; }
        //img.stringFT      (color, font, size, angle, x, y, str);
        img.stringFT(color, font, height, 0, Math.floor(offsetx + (width + 2) * i + extraoffset), Math.floor(offsety), str);
    }
}

function DateDiff(date1, date2) {
    return date1.getTime() - date2.getTime();
}

// Convert from UNIX epoch to Universal Newpix Time.                             
function unixToNewpix(secondsSinceUnix)
{
  var heret = secondsSinceUnix,
      np;

  // When np == 240:                                                             
  // hr = 1364182200 + (240 * 1800) + (0)                                       
  //    = 1363750200 - (240 * 1800) + (240 * 3600)                             
  //    = 1364614200                                                           
  if (heret > 1364616000) {
    // When np > 241:                                                           
    // $hr = 1364182200 + ($np * 1800) + (($np-241) * 1800)                     
    //     = 1364182200 + ($np * 1800) + ($np * 1800) - (241 * 1800)             
    //     = 1363748400 + ($np * 3600)                                           
    np = (heret - 1363748400) / 3600;
  } else {
    // When np <= 240:                                                           
    // $hr = 1364182200 + ($np * 1800) + (0)                                     
    np = (heret - 1364182200) / 1800;
    // Produce discontinuity at (-1..1) because "there is no year 0"             
    if (np < 1.0) {
      np -= 2.0;
    }
  }
  return np;
}
