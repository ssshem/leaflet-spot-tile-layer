/**
 * openlayers common util(公用工具) gaos@webyun.cn
 */
var OlCommon = function () {

    var EPSG4326 = 'EPSG:4326', EPSG3857 = 'EPSG:3857';
    /*
    * Coordinate:一般指球形墨卡托投影3857坐标
    * LonLat：一般指经纬度未投影4326坐标
    * Pixel：一般指屏幕像素坐标
     */

    // 经纬度坐标 -> 墨卡托投影坐标
    function transformLonLatToCoordinate(lon, lat) {
        if (typeof (lon) != 'number') {
            lon = parseFloat(lon);
        }
        if (typeof (lat) != 'number') {
            lat = parseFloat(lat);
        }
        return ol.proj.transform([lon, lat], EPSG4326, EPSG3857);
    }

    // 墨卡托投影坐标 -> 经纬度坐标
    function transformCoordinateToLonLat(coordinate) {
        return ol.proj.transform(coordinate, EPSG3857, EPSG4326);
    }

    // 墨卡托投影坐标 -> 屏幕像素坐标
    function transformCoordinateToPixel(olMap, coordinate) {
        return olMap.getPixelFromCoordinate(coordinate);
    }

    // 屏幕像素坐标 -> 墨卡托投影坐标
    function transformPixelToCoordinate(olMap, pixel) {
        return olMap.getCoordinateFromPixel(pixel);
    }

    // 经纬度坐标 -> 屏幕像素坐标
    function transformLonLatToPixel(olMap, lngLat) {
        var coordinate = transformLonLatToCoordinate(lngLat[0], lngLat[1]);
        return transformCoordinateToPixel(olMap, coordinate);
    }

    // 屏幕像素坐标 -> 经纬度坐标
    function transformPixelToLonLat(olMap, pixel) {
        var coordinate = transformPixelToCoordinate(olMap, pixel);
        return transformCoordinateToLonLat(coordinate);
    }

    function formatLonLat2DegreeWESN(lonlat) {
        var lng = formatDegree(convertLngIn180(lonlat[0]));
        lng = formatDegreeLngWE(lng);
        var lat = formatDegree(lonlat[1]);
        lat = formatDegreeLatSN(lat);
        return [lng, lat];
    }

    /**
     * 将带正负号度分秒的经度格式化为带W、E符号的经度
     * @param lng
     * @returns {string}
     */
    function formatDegreeLngWE(lng) {
        lng += '';
        return lng = lng.indexOf('-') == 0 ? lng.substring(1) + "W" : lng + "E";
    }

    /**
     * 将带正负号度分秒的纬度格式化为带S、N符号的纬度
     * @param lat
     * @returns {string}
     */
    function formatDegreeLatSN(lat) {
        lat += '';
        return lat = lat.indexOf('-') == 0 ? lat.substring(1) + 'S' : lat + 'N';
    }

    /**
     * 将经纬度度分秒格式转为浮点值格式
     */
    function formatDmsToFloat(d, m, s) {
        return parseInt(d) + parseFloat(m / 60) + parseFloat(s / 3600);
    }

    function formatDms(value) {
        var valueabs = Math.abs(value);
        var v1 = Math.floor(valueabs);
        var v2 = Math.floor((valueabs - v1) * 60);
        var v3 = Math.floor((valueabs - v1) * 3600 % 60);
        var s = '';
        if (value < 0) {
            s = '-';
        }
        return [s + v1, Tools.fillZero(2, v2), Tools.fillZero(2, v3)];
    }

    /**
     * 将经度[纬度]数值格式化为度分秒
     * @param value
     * @returns {string}
     */
    function formatDegree(value) {
        var dms = formatDms(value);
        return dms[0] + '°' + dms[1] + '′' + dms[2] + '″';
    }

// convert lon to -180 ～ 180
    function convertLngIn180(slon) {
        slon = slon % 360;
        if (slon > 180) {
            return slon - 360
        } else if (slon < -180) {
            return slon + 360;
        }
        return slon;
    }

    function convertLngIn0_360(slon) {
        slon = slon % 360;
        if (slon < 0) {
            slon += 360;
        }
        return slon;
    }

    /**
     * @Description: 角度转弧度
     * @Author: songwj
     * @Date: 2018年5月19日 下午6:21:51
     * @param degree 角度
     * @returns {Number}
     */
    function degreeToRadian(degree) {
        return degree * Math.PI / 180;
    }

    /**
     * @Description: 弧度转角度
     * @Author: songwj
     * @Date: 2018年5月22日 下午7:42:56
     * @param radian 弧度
     * @returns {Number}
     */
    function radianToDegree(radian) {
        return 180 * radian / Math.PI;
    }

    function getViewportExtent_EPSG4326(view) {
        return ol.proj.transformExtent(view.calculateExtent(), EPSG3857, EPSG4326);
    }

    function getBBOXGeom_EPSG4326(view) {
        return 'BBOX(geom,' + getViewportExtent_EPSG4326(view).toString() + ')';
    }

    function getWorldPixelWidth(map) {
        var lon0ToPixel = transformLonLatToPixel(map, [0, 0])[0];
        var lon360ToPixel = transformLonLatToPixel(map, [360, 0])[0];
        var earthWidth = lon360ToPixel - lon0ToPixel;
        return earthWidth;
    }

    // 根据屏幕最左边的经度以及世界[0-360]可占据得宽度，算出最左边经度所在世界与世界[0-360]的像素偏移量
    function getFirstWordOffsetX(leftLon, earthWidth) {
        var firstOffsetX = 0;
        if (leftLon < 0) {
            firstOffsetX = -Math.ceil(-leftLon / 360) * earthWidth;
        } else {
            firstOffsetX = Math.floor(leftLon / 360) * earthWidth;
        }
        return firstOffsetX;
    }

    // 根据屏幕最左边经度和最右边经度，计算屏幕可能容纳世界的最大个数
    function getWorldMaxNum(leftLon, rightLon) {
        return Math.ceil((rightLon - leftLon) / 360) + 1;
    }

    function getViewportLng(view, sourceLng) {
        var viewport = getViewportExtent_EPSG4326(view);
        var minLng = viewport[0];
        var maxLng = viewport[2];

        var tempLng;
        if (minLng >= sourceLng) {
            tempLng = sourceLng + Math.ceil((minLng - sourceLng) / 360) * 360;
        } else if (maxLng <= sourceLng) {
            tempLng = sourceLng - Math.ceil((sourceLng - maxLng) / 360) * 360;
        } else {
            tempLng = sourceLng;
        }

        var firstLng = null, secondLng = null;
        if (tempLng - 360 >= minLng) {
            firstLng = tempLng - 360;
            secondLng = tempLng;
        } else if (tempLng + 360 <= maxLng) {
            firstLng = tempLng;
            secondLng = tempLng + 360;
        } else {
            firstLng = tempLng;
        }
        return [firstLng, secondLng];
    }

    /**
     * @Comment:区域限制，超界回弹
     * @Author:gaos@webyun.cn
     **/
    function areaRestrict(map, curCoordinateExtent) {
        var view = map.getView();
        var worldLngLatExtent = view.getProjection().getWorldExtent();

        var curLngLatExtent = ol.proj.transformExtent(curCoordinateExtent, EPSG3857, EPSG4326);
        var size = map.getSize();
        var bottomDegreeOffset = worldLngLatExtent[1] - curLngLatExtent[1];
        var topDegreeOffset = curLngLatExtent[3] - worldLngLatExtent[3];
        if (topDegreeOffset >= 0 && bottomDegreeOffset >= 0) {
            return;
        }
        if (bottomDegreeOffset > 0 || topDegreeOffset > 0) {
            var worldBottomPixelY = transformLonLatToPixel(map, [0, worldLngLatExtent[1]])[1];
            var worldTopPixelY = transformLonLatToPixel(map, [0, worldLngLatExtent[3]])[1];
            var worldPixelHeight = worldBottomPixelY - worldTopPixelY;
            var newCenterOffsetY = worldPixelHeight <= size[1] ? worldPixelHeight / 2 : size[1] / 2;
            var newCenterPixelY = bottomDegreeOffset > 0 ? (worldBottomPixelY - newCenterOffsetY) : (worldTopPixelY + newCenterOffsetY);

            view.animate({
                center: map.getCoordinateFromPixel([size[0] / 2, newCenterPixelY]),
                duration: 200
            });
        }
    }

    function createWmtsTileGrid(projection, tileSize, zoomLen) {
        var projExtent = projection.getExtent();
        var startResolution = ol.extent.getWidth(projExtent) / tileSize;
        var resolutions = new Array(zoomLen);
        var matrixIds = new Array(zoomLen);
        for (var i = 0, ii = resolutions.length; i < ii; ++i) {
            resolutions[i] = startResolution / Math.pow(2, i);
            matrixIds[i] = i;
        }
        var tileGrid = new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
        });
        return tileGrid;
    }

    function createCircleStyle(r, g, b, type) {
        var stroke = (type >= 1) ? new ol.style.Stroke({
            color: 'rgba(' + r + ', ' + g + ', ' + b + ', 1)',
            width: 1
        }) : undefined;
        var fill = (type >= 2) ? new ol.style.Fill({
            color: 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)'
        }) : undefined;
        return new ol.style.Style({
            stroke: stroke,
            fill: fill
        });
    }

    //createLineStyle(0, 0, 0, 1, 1,[4,3])
    function createLineStyle(r, g, b, a, w, dash) {
        var s = new ol.style.Stroke({
            width: w,
            lineDash: dash,
            color: [r, g, b, a]
        });
        return new ol.style.Style({
            stroke: s,
            zIndex: 20
        });
    }

    function createPointStyle(color) {
        return new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: color
                })
            }),
            zIndex: 20
        });
    }

    function createPointTextStyle(text, offset, color) {
        return new ol.style.Style({
            text: new ol.style.Text({
                text: text,
                font: 'bold 12px 微软雅黑',
                offsetX: offset[0],
                offsetY: offset[1],
                fill: new ol.style.Fill({
                    color: color || '#000000'
                })
            })
        });
    }

    function fixPosition(olView, coordinate, zoom) {
        olView.animate({
            zoom: zoom || olView.getZoom(),
            center: coordinate,
            duration: 500
        });
    }

    /**
     * 绘制不规则圆，台风风圈
     * @param center 圆心
     * @param radius [1,2,3,4]表示四个象限的圆弧半径
     * @param splits 每个扇形的边数
     * @returns {ol.geom.Geometry}
     */
    function circularCurveCircle(center, radius, splits) {
        var sphere = new ol.Sphere(6378137);
        if (!splits) {
            splits = 4;
        }
        var n = splits * 4;
        /** @type {Array.<number>} */
        var flatCoordinates = [];
        var i;
        var tmpFlag = 0, tmpKey = 0, tmpKey_old = 0;
        ;
        var jd_0 = 0, jd_1 = 0;
        var hd = 0;
        for (i = 0; i < n; ++i) {
            hd = 2 * Math.PI * i / n;
            var jd = 180 / Math.PI * hd;
            jd_1 = jd;
            if (jd_1 > jd_0 && jd_1 >= 90 && jd_0 < 90) {//第二象限
                tmpKey = 1;
            } else if (jd_1 > jd_0 && jd_1 >= 180 && jd_0 < 180) {//第三象限
                tmpKey = 2;
            } else if (jd_1 > jd_0 && jd_1 >= 270 && jd_0 < 270) {//第四象限
                tmpKey = 3;
            }
            //数据切换象限时，使用上一象限的数据补充一个点
            if (tmpKey_old == tmpKey) {
                tmpKey_old++;
                var tmp_tmpKey = tmpKey - 1;
                if (tmp_tmpKey < 0) {
                    tmp_tmpKey = 3;
                }
                ol.array.extend(flatCoordinates, sphere.offset(center, radius[tmp_tmpKey] * 1000, hd));
            }
            //添加多边形点
            ol.array.extend(flatCoordinates, sphere.offset(center, radius[tmpKey] * 1000, hd));
            jd_0 = jd;
        }
        //多边形左后一个点补充，实现0°线的绘制
        var polygon = new ol.geom.Polygon(null);
        polygon.setFlatCoordinates(
            ol.geom.GeometryLayout.XY, flatCoordinates, [flatCoordinates.length]);
        var polygon3857 = polygon.clone().transform('EPSG:4326', 'EPSG:3857');
        return polygon3857;
    }

    /**
     * 根据uv分量获取速度和角度
     */
    function getWindSpeedAndDirection(u, v, noFixed) {
        var data = {
            speed: "",
            direction: ""
        };
        // 风速
        var speed = 0;
        // 风向
        var direction = 0;
        // 当水平和垂直风不同时为0时做如下处理
        if (!(u === 0 && v === 0)) {
            speed = Math.sqrt(u * u + v * v);
            if (u >= 0) {
                direction = Math.PI * 3 / 2 - Math.atan(v / u);
            } else {
                direction = Math.PI / 2 - Math.atan(v / u);
            }
            direction = (direction * 180 / Math.PI);
        }
        data.speed = noFixed ? speed : speed.toFixed(1);
        data.direction = noFixed ? direction : direction.toFixed(1);
        return data;
    }

    /**
     * 国内标准：根据风速判断风杆
     * @param windS 单位：m/s
     * @returns {*}
     */
    function getImgFromWinds(windS) {
        if (windS != null && (typeof windS != 'undefined') && windS !== "" && windS != "9999" && windS != "999999") {
            var wind_s = parseFloat(windS);
            if (wind_s >= 27) {
                return 14;
            } else if (wind_s >= 25) {
                return 13;
            } else if (wind_s >= 23) {
                return 12;
            } else if (wind_s >= 21) {
                return 11;
            } else if (wind_s >= 19) {
                return 10;
            } else if (wind_s >= 17) {
                return 9;
            } else if (wind_s >= 15) {
                return 8;
            } else if (wind_s >= 13) {
                return 7;
            } else if (wind_s >= 11) {
                return 6;
            } else if (wind_s >= 9) {
                return 5;
            } else if (wind_s >= 7) {
                return 4;
            } else if (wind_s >= 5) {
                return 3;
            } else if (wind_s >= 3) {
                return 2;
            } else if (wind_s >= 2) {
                return 1;
            } else {
                return 0;
            }
        }
        return null;
    }

    /**
     * 国内标准：根据风速判断风级
     * @param windS 单位：m/s
     * @returns {*}
     */
    function getLevelFromWinds(windS) {
        if (windS != null && (typeof windS != 'undefined') && windS !== "" && windS != "9999" && windS != "999999") {
            var wind_s = parseFloat(windS);
            if (wind_s > 41.4) {
                return 14;
            } else if (wind_s > 36.9) {
                return 13;
            } else if (wind_s > 32.6) {
                return 12;
            } else if (wind_s > 28.4) {
                return 11;
            } else if (wind_s > 24.4) {
                return 10;
            } else if (wind_s > 20.7) {
                return 9;
            } else if (wind_s > 17.1) {
                return 8;
            } else if (wind_s > 13.8) {
                return 7;
            } else if (wind_s > 10.7) {
                return 6;
            } else if (wind_s > 7.9) {
                return 5;
            } else if (wind_s > 5.4) {
                return 4;
            } else if (wind_s > 3.3) {
                return 3;
            } else if (wind_s > 1.5) {
                return 2;
            } else if (wind_s > 0.2) {
                return 1;
            } else {
                return 0;
            }
        }
        return null;
    }

    /**
     * 国际标准：根据风速判断风级
     * @param speed 单位：m/s
     * @returns {number}
     */
    function getWindLevelBySpeed_Global(speed) {
        var s = Math.round(speed * 1.943844); //单位转换成节kn
        if(s < 3) {
            s = 0;
        }else if(s < 8) {
            s = 1;
        } else if(s < 13) {
            s = 2;
        } else if(s < 18) {
            s = 3;
        } else if(s < 23) {
            s = 4;
        } else if(s < 28) {
            s = 5;
        } else if(s < 33) {
            s = 6;
        } else if(s < 38) {
            s = 7;
        } else if(s < 43) {
            s = 8;
        } else if(s < 48) {
            s = 9;
        } else if(s < 53) {
            s = 10;
        } else if(s < 58) {
            s = 11;
        } else if(s < 63) {
            s = 12;
        } else if(s < 68) {
            s = 13;
        } else if(s < 73) {
            s = 14;
        } else if(s < 78) {
            s = 15;
        } else if(s < 83) {
            s = 16;
        } else if(s < 88) {
            s = 17;
        } else if(s < 93) {
            s = 18;
        } else if(s < 98) {
            s = 19;
        } else if(s < 103) {
            s = 20;
        } else {
            s = 21;
        }
        return s;
    }

    var CountriesLayer = function () {
        var _countriesLayer = null;
        var inited = false;

        function init(map) {
            if (inited) {
                return;
            }
            inited = true;
            _countriesLayer = new ol.layer.Tile({
                visible: true,
                zIndex: 6,
                opacity: 0.8,
                source: new ol.source.XYZ({
                    url: 'https://tiles.windy.com/tiles/v9.0/darkmap/{z}/{x}/{y}.png'
                })
            });
            map.addLayer(_countriesLayer);
        }

        return {
            show: function (map) {
                init(map);
                _countriesLayer.setVisible(true);
            },
            hide: function () {
                _countriesLayer && _countriesLayer.setVisible(false);
            }
        };
    }();

    function getWeatherTextByCode(code) {
        var text = '';
        switch (code) {
            case 0:
                text = '晴';
                break;
            case 1:
                text = '多云';
                break;
            case 2:
                text = '阴';
                break;
            case 3:
                text = '阵雨';
                break;
            case 4:
                text = '雷阵雨';
                break;
            case 5:
                text = '雷阵雨冰雹';
                break;
            case 6:
                text = '雨夹雪';
                break;
            case 7:
                text = '小雨';
                break;
            case 8:
                text = '中雨';
                break;
            case 9:
                text = '大雨';
                break;
            case 10:
                text = '暴雨';
                break;
            case 11:
                text = '大暴雨';
                break;
            case 12:
                text = '特大暴雨';
                break;
            case 13:
                text = '阵雪';
                break;
            case 14:
                text = '小雪';
                break;
            case 15:
                text = '中雪';
                break;
            case 16:
                text = '大雪';
                break;
            case 17:
                text = '暴雪';
                break;
            case 18:
                text = '轻雾';
                break;
            case 19:
                text = '冻雨';
                break;
            case 20:
                text = '沙尘暴';
                break;
            case 29:
                text = '浮尘';
                break;
            case 30:
                text = '扬沙';
                break;
            case 31:
                text = '强沙尘暴';
                break;
            case 32:
                text = '浓雾';
                break;
            case 57:
                text = '大雾';
                break;
        }
        return text;
    }

    /**
     * 从一组坐标中计算出由它们构成的最大区域坐标
     * @param lonLats [ [lon1, lat1], [lon2, lat2], ...]
     * @return array [minLon, minLat, maxLon, maxLat]
     */
    function calculateMaxAreaFromLonLats(lonLats) {
        var minLon = lonLats[0][0],
          minLat = lonLats[0][1],
          maxLon = minLon,
          maxLat = minLat;

        for (var i = 1; i < lonLats.length; i++) {
            var lon = lonLats[i][0], lat = lonLats[i][1];
            if (lon > maxLon) {
                maxLon = lon;
            } else if (lon < minLon) {
                minLon = lon;
            }
            if (lat > maxLat) {
                maxLat = lat;
            } else if (lat < minLat) {
                minLat = lat;
            }
        }
        return [minLon, minLat, maxLon, maxLat];
    }

    function parseMultiLonLatStr(multiLonLatStr, pointSplitChar, lonLatSplitChar, coordinateType) {
        var arr = [];
        var lonLatStrArr = multiLonLatStr.split(pointSplitChar);
        for (var i = 0; i < lonLatStrArr.length; i++) {
            var lonLatStr = lonLatStrArr[i].split(lonLatSplitChar);
            if (coordinateType === '4326') {
                arr.push([parseFloat(lonLatStr[0]), parseFloat(lonLatStr[1])]);
            } else if (coordinateType === '3857') {
                arr.push(OlCommon.transformLonLatToCoordinate(parseFloat(lonLatStr[0]), parseFloat(lonLatStr[1])));
            }
        }
        return arr;
    }

    /**
     * 将经纬度字符串转为经纬度坐标4326数组
     * @param multiLonLatStr   100,10/110,20/130/10
     * @param pointSplitChar   /
     * @param lonLatSplitChar  ,
     * @return {Array}
     */
    function parseMultiLonLatStr2LonLatArray(multiLonLatStr, pointSplitChar, lonLatSplitChar) {
        return parseMultiLonLatStr(multiLonLatStr, pointSplitChar, lonLatSplitChar, '4326');
    }

    /**
     * 将经纬度字符串转为墨卡托投影坐标3857数组
     * @param multiLonLatStr   100,10/110,20/130/10
     * @param pointSplitChar   /
     * @param lonLatSplitChar  ,
     * @return {Array}
     */
    function parseMultiLonLatStr2CoordinateArray(multiLonLatStr, pointSplitChar, lonLatSplitChar) {
        return parseMultiLonLatStr(multiLonLatStr, pointSplitChar, lonLatSplitChar, '3857');
    }

    /**
     * 对gribJson格式数据进行区域截取
     * @param areaLonLatArr 围成区域的经纬度点坐标
     * @param gribJson
     * @return [{data: Array, header: {dx: number, dy: number, nx: number, ny: number, la2: *, la1: *, lo2: *, lo1: *}]
     */
    function interceptAreaGribJsonData(areaLonLatArr, gribJson) {
        var coordinates = [];
        for (var i = 0; i < areaLonLatArr.length; i++) {
            coordinates.push(OlCommon.transformLonLatToCoordinate(areaLonLatArr[i][0], areaLonLatArr[i][1]));
        }
        var areaFeature = new ol.Feature(new ol.geom.Polygon([coordinates]));
        var geometry = areaFeature.getGeometry();

        var maxAreaExtent4326 = OlCommon.calculateMaxAreaFromLonLats(areaLonLatArr);

        var header = gribJson[0].header;
        var dx = header.dx, dy = header.dy;
        var la1 = header.la1;
        var lo1 = header.lo1;
        var nx = header.nx;

        var uarray = gribJson[0].data;
        var varray = gribJson.length === 2 ? gribJson[1].data : null;

        // 将最大区域落在格点上
        maxAreaExtent4326[0] = Math.floor(OlCommon.convertLngIn0_360(maxAreaExtent4326[0]) / dx) * dx;
        maxAreaExtent4326[1] = Math.floor(maxAreaExtent4326[1] / dy) * dy;
        maxAreaExtent4326[2] =  Math.ceil(OlCommon.convertLngIn0_360(maxAreaExtent4326[2]) / dx) * dx;
        maxAreaExtent4326[3] =  Math.ceil(maxAreaExtent4326[3] / dy) * dy;
        if (maxAreaExtent4326[2] < maxAreaExtent4326[0]) {
            maxAreaExtent4326[2] = maxAreaExtent4326[2] + 360;
        }

        var areaHeader = {
            la1: maxAreaExtent4326[3], la2: maxAreaExtent4326[1],
            lo1: maxAreaExtent4326[0], lo2: maxAreaExtent4326[2],
            dx: dx, dy: dy,
            nx: ((maxAreaExtent4326[2] - maxAreaExtent4326[0]) / dx),
            ny: ((maxAreaExtent4326[3] - maxAreaExtent4326[1]) / dy)
        };
        var areaData = [{header: areaHeader, data: []}];
        if (gribJson.length === 2) {
            areaData.push({header: areaHeader, data: []});
        }

        var startX = ((maxAreaExtent4326[0] - lo1) / dx);
        var startY = ((la1 - maxAreaExtent4326[3]) / dy);
        var endX = startX + areaHeader.nx;
        var endY = startY + areaHeader.ny;

        for (var i = startY; i < endY; i++) {
            var lat = la1 - (i * dy);
            for (var j = startX; j < endX; j++) {
                var lon = lo1 + (j * dx);
                var isIn = geometry.intersectsCoordinate(OlCommon.transformLonLatToCoordinate(lon, lat));
                if (isIn) {
                    var offsetX = j >= nx ? (j - nx) : j;
                    areaData[0].data.push(uarray[i * nx + offsetX]);
                    if (varray) {
                        areaData[1].data.push(varray[i * nx + offsetX]);
                    }
                } else {
                    areaData[0].data.push(null);
                    if (varray) {
                        areaData[1].data.push(null);
                    }
                }
            }
        }

        return areaData;
    }

    /**
     * 获取leaflet map对象，并让openalyer map的状态变化来驱动leaflet map的状态变化。
     *    若第一次调用(会有创建lmap流程)，则必须传入以下两个参数，否则返回null。
     *    非第一次调用，则直接返回之前创建好的lmap对象，因此它属于单例
     *
     * 参数leafletContainerId：leaflet地图容器id
     * 参数olMap：openlayers map对象
     *
     * 额外依赖：OlCommon.transformCoordinateToLonLat
     */
    var getSingleLMap = function() {

        var _LMap = null;

        /**
         * leaflet map初始化
         */
        function init(leafletContainerId, _olMap) {
            if (_LMap) {
                return _LMap;
            }
            if (!leafletContainerId || !_olMap) {
                return null;
            }
            var olView = _olMap.getView();
            var center4326 = OlCommon.transformCoordinateToLonLat(olView.getCenter());
            _LMap = L.map(leafletContainerId, {
                center: [center4326[1], center4326[0]],
                zoom: olView.getZoom(),
                minZoom: olView.getMinZoom(),
                maxZoom: olView.getMaxZoom(),
                inertia: false
            });

            _olMap.on('moveend', function (evt) {
                var viewState = evt.frameState.viewState;
                var center = viewState.center;
                var zoom = viewState.zoom;
                var center4326 = OlCommon.transformCoordinateToLonLat(center);
                console.log('--------olmap moveend execute, set lmap position');
                _LMap.setView([center4326[1], center4326[0]], zoom, {
                    animate: _LMap.getZoom() !== zoom
                });
                _LMap.eachLayer(function (layer) {
                    if (layer && layer.options && layer.options['clayerType'] === 'spotGridLayer') {
                        layer.fire('load');
                    }
                });
            });
            return _LMap;
        }

        return function (leafletContainerId, olMap) {
            return init(leafletContainerId, olMap);
        }
    }();


    return {
        EPSG4326: EPSG4326,
        EPSG3857: EPSG3857,
        transformCoordinateToLonLat: transformCoordinateToLonLat,
        transformLonLatToCoordinate: transformLonLatToCoordinate,
        transformCoordinateToPixel: transformCoordinateToPixel,
        transformPixelToCoordinate: transformPixelToCoordinate,
        transformLonLatToPixel: transformLonLatToPixel,
        transformPixelToLonLat: transformPixelToLonLat,
        formatLonLat2DegreeWESN: formatLonLat2DegreeWESN,
        formatDegreeLngWE: formatDegreeLngWE,
        formatDegreeLatSN: formatDegreeLatSN,
        formatDms: formatDms,
        formatDegree: formatDegree,
        formatDmsToFloat: formatDmsToFloat,
        convertLngIn180: convertLngIn180,
        degreeToRadian: degreeToRadian,
        radianToDegree: radianToDegree,
        getViewportExtent_EPSG4326: getViewportExtent_EPSG4326,
        getBBOXGeom_EPSG4326: getBBOXGeom_EPSG4326,
        getWorldPixelWidth: getWorldPixelWidth,
        getFirstWordOffsetX: getFirstWordOffsetX,
        getWorldMaxNum: getWorldMaxNum,
        getViewportLng: getViewportLng,
        convertLngIn0_360: convertLngIn0_360,
        areaRestrict: areaRestrict,
        createWmtsTileGrid: createWmtsTileGrid,
        createCircleStyle: createCircleStyle,
        createLineStyle: createLineStyle,
        createPointStyle: createPointStyle,
        createPointTextStyle: createPointTextStyle,
        fixPosition: fixPosition,
        circularCurveCircle: circularCurveCircle,
        getWindSpeedAndDirection: getWindSpeedAndDirection,
        getLevelFromWinds: getLevelFromWinds,
        getImgFromWinds: getImgFromWinds,
        getWindLevelBySpeed_Global: getWindLevelBySpeed_Global,
        CountriesLayer: CountriesLayer,
        getWeatherTextByCode: getWeatherTextByCode,
        parseMultiLonLatStr2LonLatArray: parseMultiLonLatStr2LonLatArray,
        parseMultiLonLatStr2CoordinateArray: parseMultiLonLatStr2CoordinateArray,
        calculateMaxAreaFromLonLats: calculateMaxAreaFromLonLats,
        interceptAreaGribJsonData: interceptAreaGribJsonData,
        getSingleLMap: getSingleLMap
    };
}();

