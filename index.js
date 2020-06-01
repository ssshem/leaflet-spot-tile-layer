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
  opacity: 0.9
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

var Lmap = OlCommon.getSingleLMap('leaflet-map-container', olMap);

spotLayer.addTo(Lmap);

var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(Lmap);

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

