## 说明
地图5级之前的数据和5级之后的数据没有用同一个源数据（当时随便弄了两个精度的数据，只注重了实现），所以显示起来是不一样的，不是程序问题

## 思想
基于Leaflet.GridLayer加载多级别数据瓦片，异步请求渲染色斑图

## 资源
* [Leaflet](https://github.com/Leaflet/Leaflet) gis引擎（之前用的openlayers，用了leaflet之后太香了，无论是各种feature，还是源码）
* [earth](https://github.com/cambecc/earth) 气象数据可视化鼻祖，这一切罪恶的根源
* [windy](https://www.windy.com) 气象数据可视化，把earth发扬光大，企业产品
