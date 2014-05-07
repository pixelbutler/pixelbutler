framebufferJS
=============
framebufferJS is a framebuffer abstraction build on top of Canvas. It provides simple access to a raw framebuffer (big 'ol array of RGB values), as well as a collection of helper functions for graphical effects.

Coded with ♥ for the [2014 lowrezjam](http://www.deviever.com/lowrezjam2014/).

<p align="center">
  <img src="https://github.com/noffle/lowrez-js/raw/master/screenshot.png"/>
</p>

Usage
=====
<Some sort of example + how to include it in an .html file.>

API
===
`$fb = framebuffer()`
---------------------
...

`$fb.clear(rgb)`
----------------
...

`$fb.rect(x, y, w, h, rgb)`
---------------------------
...

`$fb.fillrect(x, y, w, h, rgb)`
-------------------------------
...

`$fb.circle(x, y, r, rgb)`
--------------------------
...

`$fb.fillcircle(x, y, r, rgb)`
------------------------------
...

`$fb.pixel(x, y, rgb)`
----------------------
...

`$fb.shader(f(x, y, rgb) -> rgb)`
---------------------------------
...

`$fb.text(x, y, txt, rgb)`
--------------------------
...

`$fb.makesprite(w, h)`
----------------------
...

`$fb.blit(sprite, x, y, w, h, sx, sy)`
--------------------------------------
...

`$fb.render()`
--------------
...


Utilities
=========
framebufferJS also (callously) injects a few helper methods into your global namespace.

`rand(n)`
---------
...

`rgb2hsv(rgb)`
--------------
...

`hsv2rgb(hsv)`
--------------
...

