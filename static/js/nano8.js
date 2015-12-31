(function () {
    ///////////
    // SETUP //
    ///////////

    // CONSTANTS //

    // pico-8 constants
    var PICO_SCREEN_WIDTH  = 128;
    var PICO_SCREEN_HEIGHT = 128;

    var PICO_DEFAULT_COLORS_VALUES = [
        [0, 0, 0],
        [29, 43, 83],
        [126, 37, 83],
        [0, 135, 81],
        [171, 82, 54],
        [95, 87, 79],
        [194, 195, 199],
        [255, 241, 232],
        [255, 0, 77],
        [255, 163, 0],
        [255, 243, 0],
        [0, 231, 86],
        [41, 173, 255],
        [131, 118, 156],
        [255, 119, 168],
        [255, 193, 151]
    ];

    var PICO_INITIAL_COLOR      = 6; // grey
    var PICO_TRANSPARENT_COLORS = [0];

    var PICO_MAP_BYTES             = 2;
    var PICO_MAP_LOWER_BYTES_LINES = 64;

    var PICO_FPS = 30;

    var PICO_SCALE_FACTOR = 4;

    // nano-8 constants
    var NANO_SCREEN_WIDTH  = 160;
    var NANO_SCREEN_HEIGHT = 144;

    var NANO_MAP_BYTES = 3;

    var NANO_FPS = 30;

    var NANO_SCALE_FACTOR = 4;

    // common constants
    var SCALE_FACTOR = 4;

    var SPRITE_WIDTH  = 8;
    var SPRITE_HEIGHT = 8;

    var SYSTEMFONT_ID     = 0;
    var SYSTEMFONT_CHAR_H = 6;

    var KEYBOARD = [
        [ // player 1
            [37],         // left     [left arrow]
            [39],         // right    [right arrow]
            [38],         // up       [up arrow]
            [40],         // down     [down arrow]
            [90, 67, 78], // button 1 [z, c, n]
            [88, 86, 77]  // button 2 [x, v, m]
        ],
        [ // player 2
            [83],         // left     [s]
            [70],         // right    [f]
            [69],         // up       [e]
            [68],         // down     [d]
            [81],     // button 1 [a] note: original pico-8 also defines left shift
            [65]        // button 2 [q] note: original pico-8 also defines tab
        ]
    ];

    var BUTTON_ACTIVE_DELAY = 12;
    var BUTTON_ACTIVE_SLEEP = 4;

    var NUMBER_OF_FLAGS = 8;

    // NANO VARIABLES
    var screenWidth;
    var screenHeight;

    var fps;
    var scaleFactor;

    // will never change. this is the setting of the palette for the current game
    var palette;

    // originally set = to palette, it can be altered by pal() and palt()
    // the drawing functions refer to this
    var colors;

    // remaps a color to another. this is used in the display phase for colors remapped
    // by pal(c0, c1, p)
    // a dictionary like '0,0,0': [0, 0, 0]
    var colorRemappings;

    var transparentColors;

    var currentColor;

    var screenBitmap;
    var screenBitmapData;
    var screenImage;

    var spritesheet;
    var spritesheetRowLength;
    var spritesheetSpritesPerRow;
    var spriteFlags;

    var mapSheet;
    var mapNumBytes;

    var cameraOffsetX;
    var cameraOffsetY;

    var clipping;

    var cursorX;
    var cursorY;

    var keysPressed;
    var keysPressedP;

    var retroScreen;

    // INNER FUNCTIONS

    function setKeysPressed (e, val) {
        // do it twice to handle both the player keys
        _.times(2, function (p) {
            var keyPressed = _.findIndex(KEYBOARD[p], function (k) { return _.contains(k, e.keyCode); });
            if (keyPressed !== -1) keysPressed[p][keyPressed] = values;
        });
    }

    function setKeysPressedP (e, val) {
        // do it twice to handle both the player keys
        _.times(2, function (p) {
            var keyPressed = _.findIndex(KEYBOARD[p], function (k) { return _.contains(k, e.keyCode); });
            if (keyPressed !== -1) {
                if (val === true) {
                    // if the key is already pressed, ignore it.
                    // set it to -1 so that when the first updateKeysPressedP() is called it sets it to 0
                    // and btnp() can recognize it as "just pressed key"
                    if (!keysPressedP[p][keyPressed][0]) keysPressedP[p][keyPressed] = [true, -1]
                } else {
                    keysPressedP[p][keyPressed] = [false, 0];
                }
            }
        });
    }

    function updateKeysPressedP () {
        _.times(2, function (p) {
            // increases the counter of each currently pressed key
            keysPressedP[p] = _.map(keysPressedP[p], function (k) {
                if (k[0]) k[1]++;
                return k;
            });
        });
    }

   // helper function that implements spr() but adds an "empty" paramenter
    // that fills the sprite with black. it is used by map() when called to
    // draw sprite number 0 (always empty);
    //
    function drawSpr(n, x, y, w, h, flipX, flipY, empty) {
        w     = w !== undefined ? w : 1;
        h     = h !== undefined ? h : 1;
        empty = empty !== undefined ? empty : false;

        var spriteX = n;
        var spriteY = n;

        _.times(SPRITE_HEIGHT * h, function (yy) {
            _.times(SPRITE_WIDTH * w, function (xx) {
                var shiftX = flipX === true ? (SPRITE_WIDTH * w) - 1 - xx : xx;
                var shiftY = flipY === true ? (SPRITE_HEIGHT * h) - 1 - yy : yy;
                var row    = shiftY + (flr(n / spritesheetSpritesPerRow) * SPRITE_HEIGHT);
                var column = ((n * SPRITE_WIDTH) + shiftX) % spritesheetRowLength

                // skip transparent colors
                if (_.contains(transparentColors, spritesheet[row][column])) return;

                if (!empty)
                    pset(x + xx, y + yy, spritesheet[row][column]);
                else
                    pset(x + xx, y + yy, 0);
            });
        });
    }

    function strReverse(str) {
        return str.split("").reverse().join("");
    }

    // EXPOSED FUNCTIONS //

    // graphics
    window.clip = function (x, y, w, h) {
        x += cameraOffsetX;
        y += cameraOffsetY;

        if (arguments.length === 0) {
            clipping = null;
        } else {
            clipping = {
                x0: x,
                y0: y,
                x1: x + w,
                y1: y + h
            };
        }
    };
    window.pget = function (x, y) {
        return retroScreen.getPixel(x, y);
    };
    window.pset = function (x, y, c) {
        retroScreen.setPixel(x, y, colors[c]);
    };
    window.sget = function (x, y) {
        if (spritesheet[y] === undefined || spritesheet[y][x] === undefined) return 0;

        return spritesheet[y][x];
    };
    window.sset = function (x, y, c) {
        if (spritesheet[y] === undefined) return;

        spritesheet[y][x] = c;
    };
    window.fget = function (n, f) {
        var flag = spriteFlags[n] || 0;

        // return the number or the nth bit of it as boolean
        return f !== undefined ? n & (1 << flag) > 0 : flag
    };
    window.fset = function (n, f, v) {
        // sets the number of the flag or a specific bit
        if (arguments.length === 2) {
            spriteFlags[n] = f;
        } else if (arguments.length === 3) {
            if (v === true) {
                spriteFlags[n] |= (1 << f);
            } else if (v === false) {
                spriteFlags[n] &= ~(1 << f);
            }
        }
    };
    window.print = function (str, x, y, c) {
        x   = x !== undefined ? x : cursorX;
        y   = y !== undefined ? y : cursorY;

        retroScreen.print(str, x, y, SYSTEMFONT_ID, c);

        // advance the carriage
        cursorY += SYSTEMFONT_CHAR_H;
    };
    window.cursor = function (x, y) {
        cursorX = x;
        cursorY = y;
    };
    window.color = function (c) {
        currentColor = c;
    };
    window.cls = function (c) {
        retroScreen.clear();
        cursorX = 0;
        cursorY = 0;
    };
    window.camera = function (x, y) {
        x = x !== undefined ? x : 0;
        y = y !== undefined ? y : 0;

        cameraOffsetX = x;
        cameraOffsetY = y;
    };
    window.circ = function (x, y, r, c) {
       retroScreen.circ(x, y, r, c);
    };
    window.circfill = function (x, y, r, c) {
        retroScreen.circFill(x, y, r, c);
    };
    window.line = function (x0, y0, x1, y1, c) {
        retroScreen.line(x0, y0, x1, y1, c);
    };
    window.rect = function (x0, y0, x1, y1, c) {
        retroScreen.rect(x0, y0, x1 - x0, y1 - y0, c);
    };
    window.rectfill = function (x0, y0, x1, y1, c) {
        retroScreen.rectFill(x0, y0, x1 - x0 + 1, y1 - y0 + 1, c)
    };
    window.pal = function (c0, c1, p) {
        p = p !== undefined ? p : 0;

        // reset colors and colorRemappings if no argument is supplied
        if (arguments.length === 0) {
            colors          = _.zipObject(_.zip(_.range(palette.length), _.range(palette.length)))
            colorRemappings = _.zipObject(_.zip(_.range(palette.length), _.range(palette.length)))
        } else {
            // alters the colors at draw time or display time
            if (p === 0) {
                colors[c0] = c1;
            } else {
                colorRemappings[c0] = c1;
            }
        }
    };
    window.palt = function (c, t) {
        // sets the given color to transparent or opaque or reset transparency
        if (c !== undefined && t !== undefined) {
            if (t === true)
                transparentColors = _.uniq(transparentColors.concat([c]));
            else
                transparentColors = _.remove(transparentColors, c);
        }
        else {
            transparentColors = [0];
        }
    };
    window.spr = function (n, x, y, w, h, flipX, flipY) {
        drawSpr(n, x, y, w, h, flipX, flipY);
    };
    window.sspr = function (sx, sy, sw, sh, dx, dy, dw, dh, flipX, flipY) {
        // reproduces pico behaviour
        if (dw !== undefined && dh === undefined) {
            dh = 0;
        } else {
            dw = dw !== undefined ? dw : sw;
            dh = dh !== undefined ? dh : sh;
        }

        var ratioX = sw / dw;
        var ratioY = sh / dh;

        // use the nearest neighbour algorythm to scale the image
        _.each(_.range(dh), function (y) {
            _.each(_.range(dw), function (x) {
                var xx = flipX === true ?  dw - 1 - x : x;
                var yy = flipY === true ?  dh - 1 - y : y;
                var scaledX = flr(xx * ratioX);
                var scaledY = flr(yy * ratioY);
                try {
                    if (_.contains(transparentColors, spritesheet[sy + scaledY][sx + scaledX])) return;

                    pset(dx + x, dy + y, spritesheet[sy + scaledY][sx + scaledX]);
                } catch (err) {}
            });
        })
    };

    // input
    window.btn = function (i, p) {
        p = p !== undefined ? p : 0;

        if (i !== undefined) {
            return keysPressed[p][i];
        } else {
            var bitfield = _.map(keysPressed[p], function (k) { return k ? 1 : 0 }).join('');
            return parseInt(bitfield, 2)
        }
    };
    window.btnp = function (i, p) {
        p = p !== undefined ? p : 0;

        function checkBtnActive(b) {
            return b[0] && (b[1] === 0 || (b[1] >= BUTTON_ACTIVE_DELAY && b[1] % BUTTON_ACTIVE_SLEEP === 0))
        }

        if (i !== undefined) {
            return checkBtnActive(keysPressedP[p][i]);
        } else {
            var bitfield = _.map(keysPressedP[p], function (k) { return checkBtnActive(k) ? 1 : 0 }).join('');
            return parseInt(bitfield, 2)
        }
    };
    // map
    window.mget = function (x, y) {
        if (mapSheet[y] === undefined || mapSheet[y][x] === undefined) return 0;

        return mapSheet[y][x];
    };
    window.mset = function (x, y, v) {
        if (mapSheet[y] === undefined) return;

        mapSheet[y][x] = v;
    };
    window.map = function (celX, celY, sx, sy, celW, celH, layer) {
        // try {
            _.times(celH, function (y) {
                _.times(celW, function (x) {
                    // ignore the tile if a flag layer is set and it does not match
                    if (layer !== undefined && (spriteFlags[mapSheet[celY + y][celX + x]] & layer) !== layer) return;

                    // draw the tile or an empty tile if sprite == 0
                    if (celX + celY !== 0)
                        spr(mapSheet[celY + y][celX + x], (x * SPRITE_WIDTH) + sx, (y * SPRITE_HEIGHT) + sy);
                    else
                        drawSpr(mapSheet[celY + y][celX + x], (x * SPRITE_WIDTH) + sx, (y * SPRITE_HEIGHT) + sy, SPRITE_WIDTH, SPRITE_HEIGHT, false, false, true);
                });
            });
        // } catch (err) {}
    };

    // math
    window.max = Math.max;
    window.min = Math.min;
    window.mid = function (x, y, z) { return x > y && x || y > z && z || y; };
    window.flr = Math.floor;
    window.sin = Math.sin;
    window.cos = Math.cos;
    window.sinp8 = function (x) { return Math.sin(-(x || 0) * (Math.PI * 2)); };
    window.cosp8 = function (x) { return Math.cos((x || 0) * (Math.PI * 2)); };
    window.atan2 = Math.atan2;
    window.atan2p8 = function (dx, dy) {
        // thanks to https://github.com/ftsf/picolove
        function picoAngle(a) { return (((a - Math.PI) / (Math.PI * 2)) + 0.25) % 1.0; }

        return picoAngle(Math.atan2(dy, dx));
    };
    window.sqrt = Math.sqrt;
    window.abs = Math.abs;
    window.rnd = function (x) {
        // NOTE: srand() not implemented since it doesn's make sense in javascript
        return Math.random() * (x || 1);
    };


    // bitwise operations
    window.band = function (x, y) { return x & y; };
    window.bor = function (x, y) { return x | y; };
    window.bxor = function (x, y) { return x ^ y; };
    window.bnot = function (x) { return !x; };
    window.shl = function (x, y) { return x << y; };
    window.shr = function (x, y) { return x >> y; };

    // new functions not in pico-8
    // normalizes number val (that is in range oldMin - oldMax) in the range nuwMin - newMax
    window.normalize = function (val, oldMin, oldMax, newMin, newMax) {
        return (((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
    };

    // GAME LOOP FUNCTIONS
    function init (container) {
        // setup variables according to the version (pico-8 or nano-8)
        if (SYSTEM === 'PICO-8') {
            palette           = PICO_DEFAULT_COLORS_VALUES;
            currentColor      = PICO_INITIAL_COLOR;
            transparentColors = PICO_TRANSPARENT_COLORS;
            mapNumBytes       = PICO_MAP_BYTES;
            fps               = PICO_FPS;
            screenWidth       = PICO_SCREEN_WIDTH;
            screenHeight      = PICO_SCREEN_HEIGHT;
            scaleFactor       = PICO_SCALE_FACTOR;
        } else if (SYSTEM === 'NANO-8') {
            palette           = PALETTE;
            currentColor      = INITIAL_COLOR;
            transparentColors = TRANSPARENT_COLOR;
            mapNumBytes       = NANO_MAP_BYTES;
            fps               = NANO_FPS;
            screenWidth       = NANO_SCREEN_WIDTH;
            screenHeight      = NANO_SCREEN_HEIGHT;
            scaleFactor       = NANO_SCALE_FACTOR;
        }

        // setup the retro screen
        retroScreen = new RetroScreen({
            container: container,
            width:     screenWidth,
            height:    screenHeight
        }, PICO_DEFAULT_COLORS_VALUES, scaleFactor);

        // RetroScreen modifications
        retroScreen.originalSetPixel = RetroScreen.prototype.setPixel;
        retroScreen.setPixel = function (x, y, c) {
            c = c !== undefined ? c : currentColor;

            // skip pixels outside the clipping region, if set
            if (clipping !== null && (x < clipping.x0 || x >= clipping.x1 || y < clipping.y0 || y >= clipping.y1)) return;

            this.originalSetPixel(x - cameraOffsetX, y - cameraOffsetY, c);
        };
        retroScreen.draw =  function () {
            var self = this;
            for (var i = 0; i < self.imageData.data.length; i += 4) {
                var x = (i / 4) % self.canvas.width;
                var y = Math.floor((i / 4) / self.canvas.width);

                var color = colorRemappings[self.data[y][x]];

                self.imageData.data[i]     = this.palette[color][0];
                self.imageData.data[i + 1] = this.palette[color][1];
                self.imageData.data[i + 2] = this.palette[color][2];
            };

            this.ctx.putImageData(this.imageData, 0, 0);

            this.retroDisplay.context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.retroDisplay.width, this.retroDisplay.height);
        };

        // setup intial values
        colors          = _.zipObject(_.zip(_.range(palette.length), _.range(palette.length)));
        colorRemappings = _.zipObject(_.zip(_.range(palette.length), _.range(palette.length)));
        cameraOffsetX   = 0;
        cameraOffsetY   = 0;
        clipping        = null;
        cursorX         = 0;
        cursorY         = 0;
        keysPressed     = [
            _.map(KEYBOARD[0], function (k) { return false; }),
            _.map(KEYBOARD[1], function (k) { return false; })
        ];
        keysPressedP = [
            _.map(KEYBOARD[0], function (k) { return [false, 0]; }),
            _.map(KEYBOARD[1], function (k) { return [false, 0]; })
        ];

        // generate the bitmapData array
        cls();

        spritesheet = _.map(SPRITES, function (row) {
            return _.map(row, function (cell) {
                return parseInt(cell, 16);
            })
        });
        spritesheetRowLength     = spritesheet[0].length;
        spritesheetSpritesPerRow = spritesheetRowLength / SPRITE_WIDTH;

        mapSheet = _.map(MAP, function (row) {
            return _.map(_.chunk(row.split(''), mapNumBytes), function (cell) {
                return parseInt(cell.join(''), 16);
            });
        });
        // pico-8 has the lower bytes in common with the spritesheet
        // this will add the lower bytes of the spritesheet to the map sheet
        // pico-8, for some reason, saves the data in the data in those bytes, when edited
        // from the map editor, in *inverted* digits, so that for example 01 (1) is stored as 10
        // this is ignored here.
        // also, those bytes are not really shared here. modifying the spritesheet with sset does not
        // affet the map data. also, modifying the map with mset does not affet the sprite sheet
        if (SYSTEM === 'PICO-8') {
            mapSheet = mapSheet.concat(_(spritesheet)
                                       .takeRight(PICO_MAP_LOWER_BYTES_LINES)
                                       .chunk(2)
                                       .map(function (l) { return l[0].concat(l[1])})
                                       .map(function (l) { return _.map(_.chunk(l, 2), function (c) { return parseInt(c, 16); }) })
                                       .value());
        }

        spriteFlags = _.map(_.chunk(SPRITE_FLAGS.join('').split(''), 2), function (f) { return parseInt(f.join(''), 16) });

        // add keyboard event listeners
        window.addEventListener('keydown', function (e) {
            e.stopPropagation();
            setKeysPressed(e, true);
            setKeysPressedP(e, true);
        });
        window.addEventListener('keyup', function (e) {
            e.stopPropagation();
            setKeysPressed(e, false);
            setKeysPressedP(e, false);
        });

        // call the game _init() function if exists
        if (window._init) window._init();
    }

    function update () {
        // each frame the print cursor is updated
        cursorY = 0;
        cursorX = 0;

        updateKeysPressedP();
        if (window._update) window._update();
    }

    function render () {
        // call the game _draw() function if exists
        if (window._draw) window._draw();

        retroScreen.draw();
    }

    function start(container) {
        init(container);

        function tick() {
            setTimeout(function() {
                requestAnimationFrame(tick);

                if (window.document.hasFocus()) {
                    update();
                    render();
                }

            }, 1000 / fps);
        }
        tick();
    }

    ////////////////////
    // EXPOSED OBJECT //
    ////////////////////

    window.Nano = {
        PICO_DEFAULT_COLORS_VALUES: PICO_DEFAULT_COLORS_VALUES,
        start: start
    }
})(this);