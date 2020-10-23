var SpotHandler = function () {
    var colorScale = null;
    var _limitMinValue = null;

    function ajaxGzipFile(url, cb) {
        var xhr = new XMLHttpRequest();
        // xhr.timeout = 3000;
        xhr.ontimeout = function () {
            cb(null);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = xhr.response;
                if (data instanceof Blob) {
                    var result = '';
                    var reader = new FileReader();
                    reader.readAsBinaryString(data);
                    reader.onload = function() {
                        result = JSON.parse(pako.inflate(reader.result,{to:'string'}));
                        cb(result);
                    };
                    reader.onerror = function (ev) {
                        cb(null);
                    };
                } else {
                    cb(null);
                }
            } else {
                cb(null);
            }
        };
        xhr.send();
    }

    var handle = function (url, cb) {

        return ajaxGzipFile(url, function (data) {
            if (data) {
                var builder = createBuilder(data);
                cb(builder);
            } else {
                cb(null);
            }
        });
    };

    var createBuilder = function (set) {
        // lo1 = data.lo1, la1 = data.la1, dx = data.dx, dy = data.dy, nx = data.nx, ny = data.ny;
        var scalarData = set.data;
        return {
            header: set.header,
            data: function (i) {
                return scalarData[i];
            },
            bilinearInterpolate: bilinearInterpolateScalar,
            isScalar: true,
            isValue: function (x) {
                return (x && x !== 9999) || x === 0;
            }
        };
    };

    /**
     *  [fi,fj] g00         [si, fj] g10
     *                [i,j]
     *  [fi, sj] g01        [si, sj] g11
     * @param lon
     * @param lat
     */
    var interpolatePoint = function (lon, lat, builder) {
        var data = builder.header;
        var lo1 = data.lo1, la1 = data.la1, dx = data.dx, dy = data.dy, nx = data.nx, ny = data.ny;

        var i = floorMod(lon - lo1, 360) / dx;
        var j = (la1 - lat) / dy;
        var fi = Math.floor(i), si = fi + 1;
        var fj = Math.floor(j), sj = fj + 1;

        var g00 = builder.data(fj * nx + fi);
        var g10 = builder.data(fj * nx + si);
        var g01 = builder.data(sj * nx + fi);
        var g11 = builder.data(sj * nx + si);

        var s1 = builder.isValue(g00);
        var s2 = builder.isValue(g10);
        var s3 = builder.isValue(g01);
        var s4 = builder.isValue(g11);

        if (s1 && s2 && s3 && s4) {
            return builder.bilinearInterpolate(i - fi, j - fj, g00, g10, g01, g11);
        }
        return null;
    };

    var bilinearInterpolateScalar = function (x, y, g00, g10, g01, g11) {
        var rx = (1 - x);
        var ry = (1 - y);
        return g00 * rx * ry + g10 * x * ry + g01 * rx * y + g11 * x * y;
    };

    var floorMod = function (a, n) {
        return a - n * Math.floor(a / n);
    };

    var createColorScaleInternal = function (segments) {
        return {
            bounds: [segments[0][0], segments[segments.length - 1][0]],
            gradient: segmentedColorScale(segments)
        };
    };

    function segmentedColorScale(segments) {
        var points = [], interpolators = [], ranges = [];
        for (var i = 0; i < segments.length - 1; i++) {
            points.push(segments[i + 1][0]);
            interpolators.push(colorInterpolator(segments[i][1], segments[i + 1][1]));
            ranges.push([segments[i][0], segments[i + 1][0]]);
        }

        return function (point, alpha) {
            var i;
            for (i = 0; i < points.length - 1; i++) {
                if (point <= points[i]) {
                    break;
                }
            }
            var range = ranges[i];
            return interpolators[i](proportion(point, range[0], range[1]), alpha);
        };
    }

    function colorInterpolator(start, end) {
        var r = start[0], g = start[1], b = start[2];
        var dr = end[0] - r, dg = end[1] - g, db = end[2] - b;
        return function (i, a) {
            return [Math.floor(r + i * dr), Math.floor(g + i * dg), Math.floor(b + i * db), a];
        };
    }

    function proportion(x, low, high) {
        return (clamp(x, low, high) - low) / (high - low);
    }

    function clamp(x, low, high) {
        return Math.max(low, Math.min(x, high));
    }

    return {
        handle: handle,
        changeFactor: function (segments, limitMinValue) {
            colorScale = createColorScaleInternal(segments);
            _limitMinValue = limitMinValue;
            return colorScale;
        },
        fillPointColor: function (imgDataArr, canvasWidth, pixelX, pixelY, lnglat, builder) {
            var value = interpolatePoint(lnglat[0], lnglat[1], builder);
            if (value) {
                if (_limitMinValue && value < _limitMinValue) {
                    return;
                }
                var rgba = colorScale.gradient(value, 1000);
                if (rgba) {
                    var i;
                    for (var x = pixelX; x <= pixelX + 1; x++) {
                        for (var y = pixelY; y <= pixelY + 1; y++) {
                            i = (y * canvasWidth + x) * 4;
                            imgDataArr[i] = rgba[0];
                            imgDataArr[i + 1] = rgba[1];
                            imgDataArr[i + 2] = rgba[2];
                            imgDataArr[i + 3] = rgba[3];
                        }
                    }
                }
            }
        }
    };
};

//从 canvas 提取图片 image
function convertCanvasToImage(canvas) {
//新Image对象，可以理解为DOM
    var image = new Image();
// canvas.toDataURL 返回的是一串Base64编码的URL
// 指定格式 PNG
    image.src = canvas.toDataURL("image/png");
    $('body').append(image);
    return image;
}

var SpotGridLayer = L.GridLayer.extend({
    initialize: function (options) {
        L.Util.setOptions(this, options);
        this.options.defers = [];
        this.options.clayerType = 'spotGridLayer';

        this.on('add', function (e) {
            var _layer = this;
            this._map.on('moveend', function (e1) {
                console.log('>>>>>>leaflet moveend execute, defers size:' + _layer.options.defers.length);
                _layer.resolveDefers();
            })
            _layer.resolveDefers();
        });
        this.on('load', function (e) {
            console.log('>>leaflet load execute, defers size:' + this.options.defers.length);
            this.resolveDefers();
        });
    },
    createTile: function (coords, done) {
        var _this = this;
        console.log('******leaflet createTile execute');

        var tile = L.DomUtil.create('canvas', 'leaflet-tile');
        var size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;
        var url = _this.options.url;
        if (!_this.options.spotHandler || !url) {
            return tile;
        }

        var defer = $.Deferred();
        defer.done(function () {
            var g = _this._tileCoordsToNwSe(coords);

            var dataZooms = _this.options.dataZooms;
            var x2 = coords.x, y2 = coords.y, z2 = coords.z;
            // fix tileCoords position to data zoom tileCoords
            for (var i = dataZooms.length - 1; i >= 0; i--) {
                if (z2 >= dataZooms[i]) {
                    var zz = Math.pow(2, z2 - dataZooms[i]);
                    x2 = Math.floor(x2 / zz);
                    y2 = Math.floor(y2 / zz);
                    z2 = dataZooms[i];
                    break;
                }
            }

            var tileUrl = url.replace('{z}', z2)
                .replace('{x}', x2)
                .replace('{y}', y2);
            var pixel = _this._map.latLngToLayerPoint(g[0]);
            // async operation
            var spotHandler = _this.options.spotHandler;
            spotHandler.handle(tileUrl, function (builder) {
                var ctx = tile.getContext("2d");
                if (builder) {
                    var tileSize = 256;
                    ctx.fillStyle = "black",
                    ctx.fillRect(0, 0, 256, 256);
                    var imgData = ctx.getImageData(0, 0, tileSize, tileSize);
                    var rgbaArr = imgData.data;

                    var x, y;
                    for (var i = 0; i < tileSize; i += 2) {
                        x = pixel.x + i;
                        for (var j = 0; j < tileSize; j += 2) {
                            y = pixel.y + j;
                            var latLng = _this._map.layerPointToLatLng({x: x, y: y});
                            spotHandler.fillPointColor(rgbaArr, tileSize, i, j, [latLng.lng, latLng.lat], builder);
                        }
                    }
                    ctx.putImageData(imgData, 0, 0);
                    convertCanvasToImage(tile);
                }

                if (_this.options && _this.options.debuged) {
                    ctx.font = "20px serif";
                    var fi = 256 / 8;
                    var text = 'z:' + coords.z + ', x:' + coords.x + ',y:' + coords.y;
                    ctx.fillText(text, 0, fi);

                    ctx.fillText(('redirect tile position:'), 0, fi * 3);
                    ctx.fillText(('z2:' + z2 + ', x2:' + x2 + ',y2:' + y2), 0, fi * 4);

                    ctx.strokeStyle = 'red';
                    ctx.strokeRect(0, 0, 256, 256);
                }

                done(null, tile);

            });
        });
        _this.options.defers.push(defer);
        return tile;
    },
    // dataZooms must be order by small zoom to big zoom
    updateUrl: function (url, options) {
        var this_ = this;
        this_.options.url = url;
        if (!this_.options.spotHandler) {
            this_.options.spotHandler = new SpotHandler();
        }
        if (options) {
            if (options['dataZooms']) {
                this_.options.dataZooms = options['dataZooms'];
            }
            if (options['colorSegments']) {
                this_.options.colorScale = this_.options.spotHandler.changeFactor(options['colorSegments'], options['limitMinValue']);
            }
        }
        this_.redraw();
        console.log('>>>>>>leaflet updateUrl execute, defers size:' + this_.options.defers.length);
        this_.resolveDefers();
        return this_;
    },
    resolveDefers: function () {
        var defers = this.options.defers;
        if (defers && defers.length) {
            for (; defers.length;) {
                defers.pop().resolve();
            }
        }
    },
    getColorScale: function () {
        return this.options.colorScale;
    }
});