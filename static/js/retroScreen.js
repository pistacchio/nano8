/////////////////
// RETROSCREEN //
/////////////////

(function () {
    var DEFAULT_SCALE_FACTOR = 4;

    function RetroScreen (canvas, palette, scaleFactor) {
        if (scaleFactor === undefined) scaleFactor = DEFAULT_SCALE_FACTOR;
        if (palette === undefined) throw 'RetroScreen: Palette not set';

        var self = this;

        // get a canvas element, or a jQuery canvas element or create a canvas element if a {width: x, height: y, container: element}
        // object is passed
        if (window.jQuery !== undefined && canvas instanceof jQuery) {
            this.canvas = canvas.get(0);
        } else if (!_.isElement(canvas)) {
            if (canvas.width === undefined || canvas.height === undefined || canvas.container === undefined) {
                throw 'canvas object is not valid. It must be {width: x, height: y, container: element}';
            }

            canvas.container = (window.jQuery !== undefined && canvas instanceof jQuery) ? canvas.container.get(0) : canvas.container;
            var newCanvas = document.createElement('canvas');
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height;
            canvas.container.appendChild(newCanvas);
            this.canvas = newCanvas;
        } else {
            this.canvas = canvas;
        }

        this.scaleFactor = scaleFactor;
        this.palette     = palette; // 0 is considered the "black" color
        this.ctx    = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height, '#ffffff');
        this.canvas.style['display'] = 'none';

        // setup retrodisplay
        this.retroDisplay                               = { scale: this.scaleFactor, canvas: null, context: null, width: 0, height: 0 };
        this.retroDisplay.width                         = this.canvas.width * this.retroDisplay.scale;
        this.retroDisplay.height                        = this.canvas.height * this.retroDisplay.scale;
        this.retroDisplay.canvas                        = document.createElement('canvas');
        this.retroDisplay.canvas.style['background']    = '#000000';
        this.retroDisplay.canvas.className              = 'retro-screen';
        this.retroDisplay.canvas.style.cursor           = 'pointer';
        this.retroDisplay.canvas.width                  = this.canvas.width  * this.retroDisplay.scale;
        this.retroDisplay.canvas.height                 = this.canvas.height * this.retroDisplay.scale;
        this.retroDisplay.context                       = this.retroDisplay.canvas.getContext('2d');
        this.retroDisplay.context.imageSmoothingEnabled = false;
        this.realWidth                                  = this.retroDisplay.canvas.width;
        this.realHeight                                 = this.retroDisplay.canvas.height;
        this.width                                      = this.canvas.width;
        this.height                                     = this.canvas.height;

        this.canvas.parentNode.insertBefore(this.retroDisplay.canvas, this.canvas.nextSibling);

        this.data   = _.map(_.range(this.canvas.height), function () {
            return _.times(self.canvas.width, function () { 0; });
        });
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // remap mouse events
        this.onmousemove = function () {};
        this.retroDisplay.canvas.onmousemove = function (e) {
            e.retroLayerX = e.layerX / self.scaleFactor;
            e.retroLayerY = e.layerY / self.scaleFactor;
            self.onmousemove(e);
        };

        this.onmousedown = function () {};
        this.retroDisplay.canvas.onmousedown = function (e) {
            e.retroLayerX = e.layerX / self.scaleFactor;
            e.retroLayerY = e.layerY / self.scaleFactor;
            self.onmousedown(e);
        };

        this.onmouseup = function () {};
        this.retroDisplay.canvas.onmouseup = function (e) {
            e.retroLayerX = e.layerX / self.scaleFactor;
            e.retroLayerY = e.layerY / self.scaleFactor;
            self.onmouseup(e);
        };

        this.onmouseout = function () {};
        this.retroDisplay.canvas.onmouseout = function (e) {
            e.retroLayerX = e.layerX / self.scaleFactor;
            e.retroLayerY = e.layerY / self.scaleFactor;
            self.onmouseout(e);
        };

        this.onmouseover = function () {};
        this.retroDisplay.canvas.onmouseover = function (e) {
            e.retroLayerX = e.layerX / self.scaleFactor;
            e.retroLayerY = e.layerY / self.scaleFactor;
            self.onmouseover(e);
        };

        this.clear();
    }

    RetroScreen.prototype =  {
        clear: function () {
            var self = this;

            this.data = _.map(_.range(self.canvas.height), function () {
                return _.times(self.canvas.width, function () { return 0; });
            });
        },
        setPixel: function (x, y, c) {
            if (this.data[y] === undefined) return;

            this.data[Math.round(y)][Math.round(x)] = c;
        },
        getPixel: function (x, y) {
            if (this.data[y] === undefined || this.data[y][x] === undefined) return 0;

            return this.data[Math.round(y)][Math.round(x)];
        },
        line: function (x0, y0, x1, y1, c) {
            // bresenham midpoint circle algorithm to draw a pixel-perfect line

            if (!_.isFinite(x0 + y0 + x1 + y1)) return;

            x0 = Math.floor(x0);
            y0 = Math.floor(y0);
            x1 = Math.floor(x1);
            y1 = Math.floor(y1);

            var dx = Math.abs(x1 - x0);
            var dy = Math.abs(y1 - y0);
            var sx = (x0 < x1) ? 1 : -1;
            var sy = (y0 < y1) ? 1 : -1;
            var err = dx - dy;

            while(true) {
                this.setPixel(x0, y0, c);

                if ((x0 === x1) && (y0 === y1)) break;

                var e2 = 2 * err;
                if (e2 >- dy) { err -= dy; x0  += sx; }
                if (e2 <  dx) { err += dx; y0  += sy; }
            }
        },
        rect: function (x, y, w, h, c) {
            // normalize input
            var x0 = Math.min(x, x + w);
            var x1 = Math.max(x, x + w);
            var y0 = Math.min(y, y + h);
            var y1 = Math.max(y, y + h);

            this.line(x0, y0, x1, y0, c);
            this.line(x1, y0, x1, y1, c);
            this.line(x1, y1, x0, y1, c);
            this.line(x0, y1, x0, y0, c);
        },
        rectFill: function (x, y, w, h, c) {
            var self = this;

            // normalize input
            var x0 = Math.floor(Math.min(x, x + w));
            var x1 = Math.floor(Math.max(x, x + w));
            var y0 = Math.floor(Math.min(y, y + h));
            var y1 = Math.floor(Math.max(y, y + h));

            _.each(_.range(y0, y1), function (yy) {
                _.each(_.range(x0, x1), function (xx) {
                    self.setPixel(xx, yy, c);
                });
            });
        },
        circ: function (x, y, r, c) {
            var xx = r;
            var yy = 0;
            var radiusError = 1 - xx;

            while (xx >= yy) {
                this.setPixel( xx + x,  yy + y, c);
                this.setPixel( yy + x,  xx + y, c);
                this.setPixel(-xx + x,  yy + y, c);
                this.setPixel(-yy + x,  xx + y, c);
                this.setPixel(-xx + x, -yy + y, c);
                this.setPixel(-yy + x, -xx + y, c);
                this.setPixel( xx + x, -yy + y, c);
                this.setPixel( yy + x, -xx + y, c);

                yy++;

                if (radiusError < 0) {
                    radiusError += 2 * yy + 1;
                }
                else {
                    xx--;
                    radiusError+= 2 * (yy - xx + 1);
                }
            }
        },
        circFill: function (x, y, r, c) {
            // bresenham midpoint circle algorithm to draw a pixel-perfect line
            var xx = r;
            var yy = 0;
            var radiusError = 1 - xx;

            while (xx >= yy) {
                this.line( xx + x,  yy + y, -xx + x,  yy + y, c);
                this.line( yy + x,  xx + y, -yy + x,  xx + y, c);
                this.line(-xx + x, -yy + y,  xx + x, -yy + y, c);
                this.line(-yy + x, -xx + y,  yy + x, -xx + y, c);

                yy++;

                if (radiusError < 0) {
                    radiusError += 2 * yy + 1;
                }
                else {
                    xx--;
                    radiusError+= 2 * (yy - xx + 1);
                }
            }
        },
        draw: function () {
            var self = this;
            for (var i = 0; i < self.imageData.data.length; i += 4) {
                var x = (i / 4) % self.canvas.width;
                var y = Math.floor((i / 4) / self.canvas.width);

                self.imageData.data[i]     = this.palette[self.data[y][x]][0];
                self.imageData.data[i + 1] = this.palette[self.data[y][x]][1];
                self.imageData.data[i + 2] = this.palette[self.data[y][x]][2];

            };

            this.ctx.putImageData(this.imageData, 0, 0);

            this.retroDisplay.context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.retroDisplay.width, this.retroDisplay.height);
        },
    };

    this.RetroScreen = RetroScreen;
})(this);