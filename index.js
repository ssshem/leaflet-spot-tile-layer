var olView = new ol.View({
  center: OlCommon.transformLonLatToCoordinate(109.9, 18.5),
  zoom: 3,
  minZoom: 3,
  maxZoom: 16,
  projection: OlCommon.EPSG3857
});
var olMap = new ol.Map({
  target: 'map-container',
  layers: [
    new ol.layer.Tile({
      visible: false,
      crossOrigin: 'anonymous',
      preload: 1,
      opacity: 1,
      source: new ol.source.OSM()
    })
  ],
  view: olView,
  controls: ol.control.defaults({
    attributionOptions: {
      collapsible: false
    }
  }),
  interactions: ol.interaction.defaults({
    altShiftDragRotate: false,
    pinchRotate: false,
    pinchZoom: false
  }).extend([new ol.interaction.PinchZoom({constrainResolution: true})]),
});





// // map
// var Lmap = L.map('map-container', {
//   center: [18.5, 109.9],
//   zoom: 2,
//   minZoom: 2,
//   inertia: false
// }).on('click', function() {
//   var popup = L.popup();
//   return function(e) {
//     popup
//       .setLatLng(e.latlng)
//       .setContent("You clicked the map at " + e.latlng.toString())
//       .openOn(Lmap);
//   };
// }());

// // layers
// var darkmap = L.tileLayer('https://tiles.windy.com/tiles/v9.0/darkmap/{z}/{x}/{y}.png', {
//   maxZoom: 18,
//   zIndex: 20
// }).addTo(Lmap);

var spotLayer = new SpotGridLayer({
  zIndex: 10,
  debuged: false,
  // opacity: 0
}).updateUrl('./data/tiles/pressure/{z}/{x}_{y}', {
  dataZooms: [2, 5],
  colorSegments: [
    [99000,[142,179,184,255]], [99499.9,[142,179,184,255]],
    [99500,[104,180,179,255]], [99999.9,[104,180,179,255]],
    [100000,[69,167,166,255]], [100299.9,[69,167,166,255]],
    [100300,[57,131,147,255]], [100599.9,[57,131,147,255]],
    [100600,[57,118,147,255]], [100899.9,[57,118,147,255]],
    [100900,[57,91,147,255]], [101499.9,[57,91,147,255]],
    [101500,[58,117,53,255]], [101899.9,[58,117,53,255]],
    [101900,[159,161,65,255]], [102199.9,[159,161,65,255]],
    [102200,[173,136,57,255]], [102499.9,[173,136,57,255]],
    [102500,[170,84,67,255]], [102999.9,[170,84,67,255]],
    [103000,[94,60,81,255]]

    // [99000,[142,179,184,255]],
    // [99500,[104,180,179,255]],
    // [100000,[69,167,166,255]],
    // [100300,[57,131,147,255]],
    // [100600,[57,118,147,255]],
    // [100900,[57,91,147,255]],
    // [101500,[58,117,53,255]],
    // [101900,[159,161,65,255]],
    // [102200,[173,136,57,255]],
    // [102500,[170,84,67,255]],
    // [103000,[94,60,81,255]]
  ]
});

// var a = spotLayer.setOpacity(0.5);
// var aa = spotLayer.options.opacity;

var Lmap = OlCommon.getSingleLMap('leaflet-map-container', olMap);

spotLayer.addTo(Lmap);

var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  pane: 'mapPane',
  zIndex: 10
}).addTo(Lmap);

L.tileLayer('http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i380072576!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0', {
  pane: 'mapPane',
  zIndex: 8
}).addTo(Lmap);

// osm.remove();
// osm.addTo(Lmap);

var bingLayer = L.tileLayer.bing({
  bingMapsKey: 'ApqP8RSw28LVM1exawYi9oyEnKls9B5kA06mhIiE4rJCUcMQBkoEvbJscC21LvNW',
  imagerySet: 'AerialWithLabels',
  pane: 'mapPane',
  zIndex: 3
}).addTo(Lmap);

// var url = 'http://sea.nmc.cn/seamapwms';
// L.tileLayer.wms(url, {
//   layers: 'seamap',
//   format: 'image/png',
//   transparent: true,
//   tiled: true,
//   uppercase: true,
//   attribution: "",
//   pane: 'tilePane',
//   className: 'seamap',
//   zIndex: 9
// }).addTo(Lmap);

// controls
var baseMap = {
  "OSM": osm
};
// var spotLayers = {
//   'spot': spotLayer,
//   'darkmap': darkmap
// };
// L.control.layers(baseMap, spotLayers).addTo(Lmap);

OlCommon.CountriesLayer.show(olMap);

function ajaxGzipFile(url, cb) {
  $.ajax({
    url: url,
    // cache: false,
    xhrFields: {
      responseType: 'blob'
    },
    success: function (data) {
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
    },
    error: function () {
      cb(null);
    }
  });
}

ajaxGzipFile('./libs/swh_2019061123', function (data) {
  console.log();
});

var p1Lat = 89;
var p1Lng = 359.5;
var p1 = L.latLng(p1Lat, p1Lng);
// var dis = p1.distanceTo(L.latLng(31.24063, 121.42575));
// alert(dis);

var bounds = p1.toBounds(2000000);
var maxLat = bounds['_northEast']['lat'];
var maxLng = bounds['_northEast']['lng'];
var minLat = bounds['_southWest']['lat'];
var minLng = bounds['_southWest']['lng'];
console.log('圆点坐标为, lon、lat：' + p1Lng + ',' + p1Lat);
console.log('minLng、minLat、maxLng、maxLat分别是：' + minLng + ',' + minLat + ',' + maxLng + ',' + maxLat);

console.log('距离左上角距离为：' + p1.distanceTo(L.latLng(maxLat, minLng)));
console.log('距离右上角距离为：' + p1.distanceTo(L.latLng(maxLat, maxLng)));
console.log('距离左下角距离为：' + p1.distanceTo(L.latLng(minLat, minLng)));
console.log('距离右下角距离为：' + p1.distanceTo(L.latLng(minLat, maxLng)));

console.log('距离正上方距离为：' + p1.distanceTo(L.latLng(maxLat, p1Lng)));
console.log('距离正下方距离为：' + p1.distanceTo(L.latLng(minLat, p1Lng)));
console.log('距离正左方距离为：' + p1.distanceTo(L.latLng(p1Lat, minLng)));
console.log('距离正右方距离为：' + p1.distanceTo(L.latLng(p1Lat, maxLng)));