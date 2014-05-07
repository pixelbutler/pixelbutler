// TODO(sww): fancy module.exports jazz

function framebuffer(width, height) {
  // TODO(sww): Actually create + insert a canvas dynamically here.

  this.px = new Array(width);
  for(var i=0; i < width; i++) {
    this.px[i] = new Array(height);
      for(var j=0; j < height; j++) {
        this.px[i][j] = [ Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256) ];
      }
  }
  var px = this.px;

  this.width = width;
  this.height = height;

  this.fillRect = function(x, y, w, h, col) {
    x = Math.floor(x);
    y = Math.floor(y);
    w = Math.floor(w);
    h = Math.floor(h);
    for(var i=x; i < x+w; i++) {
      for(var j=y; j < y+h; j++) {
        if(i < 0 || j < 0 || i >= width || j >= height) {
          continue;
        }
        px[i][j][0] = col[0];
        px[i][j][1] = col[1];
        px[i][j][2] = col[2];
      }
    }
  };

  this.clear = function(col) {
    this.fillRect(0, 0, width, height, col);
  }

  this.rect = function(x, y, w, h, col) {
    x = Math.floor(x);
    y = Math.floor(y);
    w = Math.floor(w);
    h = Math.floor(h);
    for(var i=x; i < x+w; i++) {
      for(var j=y; j < y+h; j++) {
        if(i < 0 || j < 0 || i >= width || j >= height) {
          continue;
        }
        if(i == x || j == y || i == x+w-1 || j == y+h-1) {
          this.px[i][j][0] = col[0];
          this.px[i][j][1] = col[1];
          this.px[i][j][2] = col[2];
        }
      }
    }
  };

  this.fillCircle = function(x, y, r, col) {
    x = Math.floor(x);
    y = Math.floor(y);
    r = Math.floor(r);
    for(var i=-r; i <= r; i++) {
      for(var j=-r; j <= r; j++) {
        if(x+i < 0 || y+j < 0 || x+i >= width || y+j >= height) {
          continue;
        }
        if(i*i + j*j <= r*r) {
          px[x+i][y+j][0] = col[0];
          px[x+i][y+j][1] = col[1];
          px[x+i][y+j][2] = col[2];
        }
      }
    }
  };

  this.circle = function(x, y, r, col) {
    x = Math.floor(x);
    y = Math.floor(y);
    r = Math.floor(r);
    for(var i=0; i < 360; i++) {
      var cx = Math.round(Math.cos(i * (Math.PI / 180)) * r) + x;
      var cy = Math.round(Math.sin(i * (Math.PI / 180)) * r) + y;

      if(cx < 0 || cy < 0 || cx >= width || cy >= height) {
        continue;
      }
      px[cx][cy][0] = col[0];
      px[cx][cy][1] = col[1];
      px[cx][cy][2] = col[2];
    }
  };

  this.pixel = function(x, y, col) {
    x = Math.floor(x);
    y = Math.floor(y);

    if(x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }
    px[x][y][0] = col[0];
    px[x][y][1] = col[1];
    px[x][y][2] = col[2];
  };

  this.shader = function(f) {
    for(var i=0; i < width; i++) {
      for(var j=0; j < height; j++) {
        var result = f(i, j, px[i][j]);
        px[i][j][0] = result[0];
        px[i][j][1] = result[1];
        px[i][j][2] = result[2];
      }
    }
  }

  this.render = function() {
    var canvas = document.getElementById('screen');
    var ctx = canvas.getContext('2d');

    var pWidth = Math.floor(canvas.width / px.length);
    var pHeight = Math.floor(canvas.height / px[0].length);
    for(var i=0; i < px.length; i++) {
      for(var j=0; j < px[i].length; j++) {
        var r = Math.floor(px[i][j][0]);
        var g = Math.floor(px[i][j][1]);
        var b = Math.floor(px[i][j][2]);
        ctx.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
        ctx.fillRect(i*pWidth, j*pHeight, pWidth, pHeight);
      }
    }
  }

  return this;
}

function rand(max) {
  return Math.floor(Math.random() * max);
}


/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 *
 * Ported from the excellent java algorithm by Eugene Vishnevsky at
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 *
 * This, in turn, was taken from the snippet at
 * http://snipplr.com/view/14590/hsv-to-rgb/
 */
function hsv2rgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;

    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;

        case 1:
            r = q;
            g = v;
            b = p;
            break;

        case 2:
            r = p;
            g = v;
            b = t;
            break;

        case 3:
            r = p;
            g = q;
            b = v;
            break;

        case 4:
            r = t;
            g = p;
            b = v;
            break;

        default: // case 5:
            r = v;
            g = p;
            b = q;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * RGB to HSV color conversion
 *
 * Gratefully lifted from Mic's code on StackOverflow:
 * http://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript#8023734
 */
function rgb2hsv () {
    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return [
        Math.round(h * 360),
        Math.round(s * 100),
        Math.round(v * 100)
    ];
}
