// TODO(noffle): fancy module.exports jazz

(function() {
  /**
   * Based off of a Gist of a 4x4 font by Martin Holzhauer:
   * https://gist.github.com/woodworker/7696835
   *
   * Features fairly significant modifications to fit characters into smaller horizontal space.
   */
  var letters = {
      "A":[
          "1111",
          "1001",
          "1111",
          "1001"
      ],
      "B": [
          "100",
          "111",
          "101",
          "111"
      ],
      "C": [
          "1111",
          "1000",
          "1000",
          "1111"
      ],
      "D": [
          "1110",
          "1001",
          "1001",
          "1110"
      ],
      "E": [
          "111",
          "110",
          "100",
          "111"
      ],
      "F": [
          "111",
          "100",
          "110",
          "100"
      ],
      "G": [
          "111",
          "100",
          "101",
          "111"
      ],
      "H": [
          "101",
          "101",
          "111",
          "101"
      ],
      "I": [
          "1",
          "1",
          "1",
          "1"
      ],
      "J": [
          "001",
          "001",
          "101",
          "111"
      ],
      "K": [
          "101",
          "110",
          "101",
          "101"
      ],
      "L": [
          "10",
          "10",
          "10",
          "11"
      ],
      "M": [
          "11011",
          "11011",
          "10101",
          "10001"
      ],
      "N": [
          "1101",
          "1101",
          "1011",
          "1001"
      ],
      "O": [
          "111",
          "101",
          "101",
          "111"
      ],
      "P": [
          "111",
          "101",
          "111",
          "100"
      ],
      "Q": [
          "1110",
          "1010",
          "1110",
          "0001"
      ],
      "R": [
          "111",
          "101",
          "100",
          "100"
      ],
      "S": [
          "111",
          "100",
          "111",
          "011"
      ],
      "T": [
          "111",
          "010",
          "010",
          "010"
      ],
      "U": [
          "101",
          "101",
          "101",
          "111"
      ],
      "V": [
          "101",
          "101",
          "101",
          "010"
      ],
      "W": [
          "10001",
          "10001",
          "10101",
          "01110"
      ],
      "X": [
          "101",
          "010",
          "101",
          "101"
      ],
      "Y": [
          "101",
          "101",
          "010",
          "010"
      ],
      "Z": [
          "111",
          "011",
          "100",
          "111"
      ],
      " ": [
          "0",
          "0",
          "0",
          "0"
      ],
      "!": [
          "1",
          "1",
          "0",
          "1"
      ],
      ".": [
          "0",
          "0",
          "0",
          "1"
      ]
  };

  window.framebuffer = function(width, height) {
    // TODO(noffle): Actually create + insert a canvas dynamically here.

    this.px = new Array(width);
    for(var i=0; i < width; i++) {
      this.px[i] = new Array(height);
      for(var j=0; j < height; j++) {
        this.px[i][j] = [rand(256), rand(256), rand(256)];
      }
    }
    var px = this.px;

    this.width = width;
    this.height = height;

    this.fillrect = function(x, y, w, h, col) {
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
      this.fillrect(0, 0, width, height, col);
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

    this.fillcircle = function(x, y, r, col) {
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
    };

    var drawLetter = function(x, y, chr, rgb) {
      var l = letters[chr.toUpperCase()];
      if(!l) { return 0; }
      for(var i=0; i < l[0].length; i++) {
        for(var j=0; j < l.length; j++) {
          if(l[j].charAt(i) === "1") {
            this.pixel(x+i, y+j, rgb);
          }
        }
      }
      return l[0].length;
    };

    this.text = function(x, y, txt, rgb) {
      for(var i=0; i < txt.length; i++) {
        x += drawLetter(x, y, txt.charAt(i), rgb) + 1;
      }
    };

    this.makesprite = function(width, height) {
      var sprite = new Array(width);
      for(var i=0; i < width; i++) {
        sprite[i] = new Array(height);
        for(var j=0; j < height; j++) {
          sprite[i][j] = [rand(256), rand(256), rand(256)];
        }
      }
      sprite.width = width;
      sprite.height = height;
      return sprite;
    };

    this.blit = function(sprite, x, y, w, h, sx, sy) {
      x = Math.floor(x);
      y = Math.floor(y);
      w = !w ? sprite.width : Math.floor(w);
      h = !h ? sprite.height : Math.floor(h);
      sx = !sx ? 0 : Math.floor(sx);
      sy = !sy ? 0 : Math.floor(sy);
      for(var i=sx; i < sx+w; i++) {
        for(var j=sy; j < sy+h; j++) {
          if(i < 0 || j < 0 || i >= sprite.width || j >= sprite.height) {
            continue;
          }
          var rgb = sprite[i][j];
          if(rgb[0] == 255 && rgb[1] == 0 && rgb[2] == 255) {
            continue;
          }
          this.pixel(x+i-sx, y+j-sy, rgb);
        }
      }
    };

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
    };

    return this;
  }
})();

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
function hsv2rgb(hsv) {
    var r, g, b;
    var i;
    var f, p, q, t;
    var h = hsv[0];
    var s = hsv[1];
    var v = hsv[2];

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
function rgb2hsv(rgb) {
    var rr, gg, bb,
        r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
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
