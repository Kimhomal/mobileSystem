// define epsg:5179 projection code
proj4.defs("EPSG:5179", "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// define epsg:5181 projection code
proj4.defs("EPSG:5181", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// define epsg:5187 projection code
proj4.defs("EPSG:5187", "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");
// define epsg:5183 projection code
proj4.defs("EPSG:5183", "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs");
// define epsg:5186 projection code
proj4.defs("EPSG:5186", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");

// 출처: https://www.osgeo.kr/17 [OSGeo(Open Source GeoSpatial) 한국어 지부 - OSGeo Korean Chapter]

ol.proj.setProj4 = proj4;
var resolutions = [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25];


var bound_naver = [907651.1349561698734760,1662903.7395033719949424,971534.7456867226865143,1707934.4982475454453379];
var bound_daum =[153282.0999035192653537, 162739.5019012193079107, 216964.5848095570108853, 207466.8868613340309821];


var extent_naver = [90112, 1192896, 2187264, 2765760];  // 4 * 3
var extent_daum = [-30000, -60000, 494288, 988576];
// var extent_daum = ol.proj.transformExtent([122.71,28.6,134.28,40.27],'EPSG:4326','EPSG:5181');
var extent_vworld = [13756219.106426602, 3860987.1727408236, 14666125.491133342, 4863840.983842337];
var extent_image = [0, 0, 20037508.3427890, 20037508.3427890];
var geom, circleCenter, circleRadius, circularPolygon;
var wgs84sphere = new ol.Sphere(6378137);

// var prevCRS, currentCRS = 'EPSG:3857';
var prevCRS, currentCRS = 'EPSG:5181';
var vectorPointSource, vectorPointLayer, feature;
var recentPointsVectorSource, recentPointsVectorLayer, recentPointFeatures;
var indexVectorSource, indexVectorLayer, indexFeatures, indexLayerFeatures;
var polygonVectorSource, polygonVectorLayer, polygonFeatures;
var measureTooltipElement, measureTooltip;
var pointInfo, mainPointInfo;
var basemapLayerIndex = 0;
var wmsLayerIndex = 50;
var vectorLayerIndex = 100;
var indexYearsArr = [];
var overlayObj = {
    pointInfoArr: [],
    measurementInfo: [],
    mainPointInfoArr: []
}

// 도형선택 vector source
var vectorSource = new ol.source.Vector({
    wrapX: false
});
// 도형선택 vector layer
var vector = new ol.layer.Vector({
    name: "vectorLayer",
    source: vectorSource,
    zIndex: vectorLayerIndex,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: "rgba(255,255,255,0.1)"
        }),
        stroke: new ol.style.Stroke({
            color: "blue"
        })
    })
});

// 주점검색의
var mainPointsVectorSource = new ol.source.Vector();
var mainPointsVectorLayer = new ol.layer.Vector({
    title:"mainPointLayer"
});
var mainPointFeatures;

// 수치지형도 도형선택 vector source
var vectorSourceDmap = new ol.source.Vector({
    wrapX: false
});
// 도형선택 vector layer
var vectorDmapLayer = new ol.layer.Vector({
    name: "vectorLayerDmap",
    source: vectorSourceDmap,
    zIndex: vectorLayerIndex,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: "rgba(255,255,255,0.1)"
        }),
        stroke: new ol.style.Stroke({
            color: "blue"
        })
    })
});

// XX재기 vector source
var measurementVectorSource = new ol.source.Vector({
    wrapX: false
});
// XX재기 vector layer
var measurementVector = new ol.layer.Vector({
    name: "measurementLayer",
    source: measurementVectorSource,
    zIndex: 50
});
// Marker vector source
var markerVectorSource = new ol.source.Vector();
// Marker Icon Style
var iconStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [20, 40],
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        opacity: 0.75,
        src: gp.ctxPath + '/images/marker_red.png'
        // src: gp.ctxPath+'/images/pin-red0019.png'
    }))
});
// Marker vector layer
var markerVectorLayer = new ol.layer.Vector({
    source: markerVectorSource,
    style: iconStyle,
    zIndex: 50
});

// digital map vector source
var multiPolygonVectorSource = new ol.source.Vector({
    wrapX: false
});
// digital map vector layer
var multiPolygonVectorLayer = new ol.layer.Vector({
    source: multiPolygonVectorSource,
    zIndex: 100,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: "rgba(255,255,255,0.1)"
        }),
        stroke: new ol.style.Stroke({
            color: "blue"
        })
    })
});

// set projection for NAVER MAP
var projection_naver = new ol.proj.Projection({
    code: 'EPSG:5179',
    extent: extent_naver,
    units: 'm'
});

// set projection for DAUM MAP
var projection_daum = new ol.proj.Projection({
    code: 'EPSG:5181',
    units: 'm',
    extent: extent_daum,
});


// set projection for VWORLD
var projection_vworld = new ol.proj.Projection({
    code: 'EPSG:3857',
    extent: extent_vworld,
    units: 'm'
});

// set projection for VWORLD
var projection_image = new ol.proj.Projection({
    code: 'EPSG:3857',
    extent: extent_image,
    units: 'm'
});

// Polygon vector source
var polygonVectorSource = new ol.source.Vector({
    // projection:projection_vworld
    projection: projection_daum
});

var polygonVectorLayer = new ol.layer.Vector({
    name: "polygonVector",
    zIndex: 100
})

//define Vworld Aerial Photography tile layer
var vworldAp = new ol.layer.Tile({
    title: 'M0006',
    visible: false,
    type: 'base',
    zIndex: basemapLayerIndex,
    source: new ol.source.XYZ({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg'
        url: gp.proxyPath + 'http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg',
        // crossDomain: true
        // crossOrigin: "Anonymous"
    })
});

// define Daum Map Aerial Photography Tiles layer
var daumAp = new ol.layer.Tile({
    title: 'M0005',
    visible: false,
    type: 'base',
    zIndex: basemapLayerIndex,
    source: new ol.source.XYZ({
        projection: projection_daum,
        tileSize: 256,
        //crossDomain: true,
        // crossOrigin: "Anonymous",
        minZoom: 1,
        maxZoom: resolutions.length - 1,
        initZoom: 1,
        tileGrid: new ol.tilegrid.TileGrid({
            extent: extent_daum,
            origin: [extent_daum[0], extent_daum[1]],
            resolutions: resolutions
        }),
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            if (tileCoord == null) return undefined;
            var s = Math.floor(Math.random() * 4);  // 0 ~ 3
            var z = resolutions.length - tileCoord[0];
            var x = tileCoord[1];
            var y = tileCoord[2];
            // return gp.ctxPath + '/proxy/proxy.jsp?url=https://map' + s + '.daumcdn.net/map_skyview/L' + z + '/' + y + '/' + x + '.jpg';
            return gp.proxyPath + 'https://map' + s + '.daumcdn.net/map_skyview/L' + z + '/' + y + '/' + x + '.jpg';
        }
    })
});

// define Naver map Aerial Photography Tiles layer
var naverAp = new ol.layer.Tile({
    title: 'M0004',
    visible: false,
    type: 'base',
    zIndex: basemapLayerIndex,
    source: new ol.source.XYZ({
        projection: projection_naver,
        // crossOrigin: "Anonymous",
        //crossDomain: true,
        tileSize: 256,
        minZoom: 1,
        maxZoom: resolutions.length - 1,
        initZoom: 8,
        // bounds: [90112, 1192896, 1990673, 2765760],
        tileGrid: new ol.tilegrid.TileGrid({
            extent: extent_naver,
            origin: [extent_naver[0], extent_naver[1]],
            resolutions: resolutions
        }),
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            if (tileCoord == null) return undefined;
            var s = Math.floor(Math.random() * 3) + 1;  // 1 ~ 4
            var z = tileCoord[0] + 1;
            var x = tileCoord[1];
            var y = tileCoord[2];
            // return gp.ctxPath + '/proxy/proxy.jsp?url=https://simg.pstatic.net/onetile/get/201/0/1/' + z + '/' + x + '/' + y + '/bl_st_bg'
            // return 'http://onetile' + s + '.map.naver.net/get/135/0/1/' + z + '/' + x + '/' + y + '/bl_st_bg'
            return gp.proxyPath + 'https://simg.pstatic.net/onetile/get/201/0/1/' + z + '/' + x + '/' + y + '/bl_st_bg'
        }
    })
});

var naverTiles = new ol.layer.Tile({
    title: 'M0003',
    visible: false,
    type: 'base',
    zIndex: basemapLayerIndex,
    source: new ol.source.XYZ({
        projection: projection_naver,
        // crossOrigin: "Anonymous",
        //crossDomain: true,
        tileSize: 256,
        minZoom: 1,
        maxZoom: resolutions.length - 1,
        initZoom: 8,
        // bounds: [90112, 1192896, 1990673, 2765760],
        tileGrid: new ol.tilegrid.TileGrid({
            extent: extent_naver,
            origin: [extent_naver[0], extent_naver[1]],
            resolutions: resolutions
        }),
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            if (tileCoord == null) return undefined;
            var s = Math.floor(Math.random() * 3) + 1;  // 1 ~ 4
            var z = tileCoord[0] + 1;
            var x = tileCoord[1];
            var y = tileCoord[2];
            // return gp.ctxPath + '/proxy/proxy.jsp?url=http://onetile' + s + '.map.naver.net/get/135/0/0/' + z + '/' + x + '/' + y + '/bl_vc_bg/ol_vc_an'
            return gp.proxyPath + 'http://onetile' + s + '.map.naver.net/get/202/0/0/' + z + '/' + x + '/' + y + '/bl_vc_bg/ol_vc_an'
        }
    })
});

// define Daum Map Tiles layer
var daumTiles = new ol.layer.Tile({
    title: 'M0002',
    visible: false,
    type: 'base',
    zIndex: basemapLayerIndex,
    source: new ol.source.XYZ({
        projection: projection_daum,
        // crossOrigin: "Anonymous",
        //crossDomain: true,
        tileSize: 256,
        minZoom: 1,
        maxZoom: resolutions.length - 1,
        initZoom: 1,
        tileGrid: new ol.tilegrid.TileGrid({
            extent: extent_daum,
            origin: [extent_daum[0], extent_daum[1]],
            resolutions: resolutions
        }),
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            if (tileCoord == null) return undefined;
            var s = Math.floor(Math.random() * 4);  // 0 ~ 3
            var z = resolutions.length - tileCoord[0];
            var x = tileCoord[1];
            var y = tileCoord[2];
            // return gp.ctxPath + '/proxy/proxy.jsp?url=http://map' + s + '.daumcdn.net/map_2d/1807hsm/L' + z + '/' + y + '/' + x + '.png';
            return gp.proxyPath + 'https://map' + s + '.daumcdn.net/map_2d/1912uow/L' + z + '/' + y + '/' + x + '.png';
        }
    })
});
//define Daum Map Tiles layer
var emptyTiles = new ol.layer.Tile({
    title: 'M0000',
    visible: false,
    type: 'base',
    zIndex: basemapLayerIndex,
    source: new ol.source.XYZ({
        projection: projection_daum,
        // crossOrigin: "Anonymous",
        //crossDomain: true,
        tileSize: 256,
        minZoom: 1,
        maxZoom: resolutions.length - 1,
        initZoom: 1,
        tileGrid: new ol.tilegrid.TileGrid({
            extent: extent_daum,
            origin: [extent_daum[0], extent_daum[1]],
            resolutions: resolutions
        }),
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            if (tileCoord == null) return undefined;
            var s = Math.floor(Math.random() * 4);  // 0 ~ 3
            var z = resolutions.length - tileCoord[0];
            var x = tileCoord[1];
            var y = tileCoord[2];
            // return gp.ctxPath + '/proxy/proxy.jsp?url=http://map' + s + '.daumcdn.net/map_2d/1807hsm/L' + z + '/' + y + '/' + x + '.png';
            return gp.proxyPath + 'https://map' + s + '.daumcdn.net/map_2d/1912uow/L' + z + '/' + y + '/' + x + '.png';
        }
    })
});

//define Vworld tile layer
var vworldTiles = new ol.layer.Tile({
    title: 'M0001',
    visible: false,
    type: 'base',
    zIndex: basemapLayerIndex,
    source: new ol.source.XYZ({
        //url: gp.ctxPath + '/proxy/proxy.jsp?url=http://xdworld.vworld.kr:8080/2d/Base/201612/{z}/{x}/{y}.png'
        url: gp.proxyPath +'http://xdworld.vworld.kr:8080/2d/Base/201612/{z}/{x}/{y}.png',
        // crossOrigin: "Anonymous"
    })
});


var baroEMapTiles = new ol.layer.Tile({
    title: 'M0007',
    visible: false,
    type: 'base',
    zIndex: basemapLayerIndex,
    source: new ol.source.XYZ({
        projection: projection_naver,
        // crossOrigin: "Anonymous",
        //crossDomain: true,
        tileSize: 256,
        minZoom: 1,
        maxZoom: resolutions.length - 1,
        initZoom: 1,
        tileGrid: new ol.tilegrid.TileGrid({
            extent: [-200000.0, -3015.4524155292, 3803015.45241553, 4000000.0],
            origin: [-200000, 4000000],
            tileSize : 256,
            resolutions : [ 2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28,32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255 ],
            minZoom : 1
        }),
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {

            if (tileCoord === null) return undefined;

            var str = (tileCoord[0] + 5).toString();

            var strAdd = "";

            var diffLen = 2 - str.length;

            for(var i = 0; i < diffLen; i++) {
                strAdd += "0";
            }

            var z =  strAdd + str;

            var x = Math.abs(tileCoord[2].toString())-1;
            var y = tileCoord[1].toString();

            return gp.proxyPath + 'http://map.ngii.go.kr/openapi/Gettile.do?service=WMTS&request=GetTile&version=1.0.0&layer=korean_map&style=korean&format=image/png&tilematrixset=korean&tilematrix=L'+z+'&tilerow='+x+'&tilecol='+y+'&apikey=C5E774C432AFCCCA7B47BC819FBC42DE';
        }
    })
});



// set Tile Layer for 지적
var lpbnLayer = new ol.layer.Tile({
    title: 'lpbnLayer',
    //미사용
//    extent:extent_daum,
    //미사용 - 속도적 문제
    // preload : Infinity,
    visible: true,
    type: 'wms',
    //미사용
//	maxResolution : 0.2,
    zIndex: wmsLayerIndex,
    source: new ol.source.TileWMS({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wms',
        // url: gp.geoUrl + '/gwc/service/wms',
        url: gp.geoUrl + '/wms',
        serverType: 'geoserver',
        //1.1.0 확인
        // projection: 'EPSG:5187',
        transition: 0,
        params: {
            'LAYERS': 'gj:gj_lpbn'
            , 'FORMAT': 'image/png'
            , 'WIDTH': 256
            , 'HEIGHT': 256
            , 'TILED': true
            , 'VERSION': '1.1.0'
            , 'SRS': 'EPSG:5187'
        }
    })
});

// set Tile Layer for EMD
var emdLayer = new ol.layer.Tile({
    title: 'emdLayer',
    visible: true,
    type: 'wms',
    zIndex: wmsLayerIndex,
    source: new ol.source.TileWMS({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wms',
        // url: gp.geoUrl + '/gwc/service/wms',
        url: gp.geoUrl + '/wms',
        serverType: 'geoserver',
        // projection: 'EPSG:5187',
        transition: 0,
        params: {
            'LAYERS': 'gj:gj_emd1'
            , 'FORMAT': 'image/png'
            , 'WIDTH': 256
            , 'HEIGHT': 256
            , 'TILED': true
            , 'VERSION': '1.1.0'
            , 'TRANSPARENT': 'true'
            , 'SRS': 'EPSG:5187'
        }
    })
});

// set Tile Layer for LI
var liLayer = new ol.layer.Tile({
    title: 'liLayer',
    visible: true,
    type: 'wms',
    zIndex: wmsLayerIndex,
    source: new ol.source.TileWMS({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wms',
        // url: gp.geoUrl + '/gwc/service/wms',
        url: gp.geoUrl + '/wms',
        serverType: 'geoserver',
        // projection: 'EPSG:5187',
        transition: 0,
        params: {
            'LAYERS': 'gj:gj_ri'
            , 'FORMAT': 'image/png'
            , 'WIDTH': 256
            , 'HEIGHT': 256
            , 'TILED': true
            , 'VERSION': '1.1.0'
            , 'SRS': 'EPSG:5187'
        }
    })
});

// set Tile Layer for SIG
var sigLayer = new ol.layer.Tile({
    title: 'sigLayer',
    visible: true,
    type: 'wms',
    zIndex: wmsLayerIndex,
    source: new ol.source.TileWMS({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wms',
        // url: gp.geoUrl + '/gwc/service/wms',
        url: gp.geoUrl + '/wms',
        serverType: 'geoserver',
        // projection: 'EPSG:5187',
        transition: 0,
        params: {
            'LAYERS': 'gj:gj_sgg'
            , 'FORMAT': 'image/png'
            , 'WIDTH': 256
            , 'HEIGHT': 256
            , 'TILED': true
            , 'VERSION': '1.1.0'
            , 'TRANSPARENT': 'true'
            , 'SRS': 'EPSG:5187'
        }
    })
});

// set Tile Layer for scale 1:1000
var layer1000 = new ol.layer.Tile({
    title: 'layer1000',
    visible: true,
    type: 'wms',
    zIndex: wmsLayerIndex,
    source: new ol.source.TileWMS({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wms',
        url: gp.geoUrl + '/wms',
        serverType: 'geoserver',
        // projection: 'EPSG:5183',
        params: {
            'LAYERS': 'gj:gj_inx10'
            , 'FORMAT': 'image/png'
            , 'VERSION': '1.1.0'
            , 'WIDTH': 256
            , 'HEIGHT': 256
            , 'SRS': 'EPSG:5186'
        }
    })
});

// set Tile Layer for scale 1:5000
var layer5000 = new ol.layer.Tile({
    title: 'layer5000',
    visible: true,
    type: 'wms',
    zIndex: wmsLayerIndex,
    source: new ol.source.TileWMS({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wms',
        url: gp.geoUrl + '/wms',
        serverType: 'geoserver',
        // projection: 'EPSG:5183',
        params: {
            'LAYERS': 'gj:gj_inx50'
            , 'FORMAT': 'image/png'
            , 'WIDTH': 256
            , 'HEIGHT': 256
            , 'VERSION': '1.1.0'
            , 'SRS': 'EPSG:5186'
        }
    })
});

// set Tile Layer for scale 1:5000
var layer10000 = new ol.layer.Tile({
    title: 'layer10000',
    visible: true,
    type: 'wms',
    zIndex: wmsLayerIndex,
    source: new ol.source.TileWMS({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wms',
        url: gp.geoUrl + '/wms',
        serverType: 'geoserver',
        // projection: 'EPSG:5183',
        params: {
            'LAYERS': 'gj:gj_inx100'
            , 'FORMAT': 'image/png'
            , 'WIDTH': 256
            , 'HEIGHT': 256
            , 'VERSION': '1.1.0'
            , 'SRS': 'EPSG:5183'
        }
    })
});

// set Tile Layer for scale 1:5000
var layer25000 = new ol.layer.Tile({
    title: 'layer25000',
    visible: true,
    type: 'wms',
    zIndex: wmsLayerIndex,
    source: new ol.source.TileWMS({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wms',
        url: gp.geoUrl + '/wms',
        serverType: 'geoserver',
        // projection: 'EPSG:5183',
        params: {
            'LAYERS': 'gj:gj_inx250'
            , 'FORMAT': 'image/png'
            , 'WIDTH': 256
            , 'HEIGHT': 256
            , 'VERSION': '1.1.0'
            , 'SRS': 'EPSG:5183'
        }
    })
});

var bml_bound_as = new ol.layer.Tile({ // 배경 검정바탕
    title: 'bml_bound_as',
    visible: true,
    type: 'wms',
    // zIndex: 0,
    opacity : 0.8,
    source: new ol.source.TileWMS({
        // url: gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wms',
        url: gp.geoUrl + '/wms',
        serverType: 'geoserver',
        // projection: 'EPSG:5186',
        params: {
            'LAYERS': 'gj:bml_bound_as'
            , 'FORMAT': 'image/png'
            , 'WIDTH': 256
            , 'HEIGHT': 256
            , 'VERSION': '1.1.0'
            ,titled : true
            , 'SRS': 'EPSG:5186'
        }
    })
});

var layers = {
    wms : {},
    wfs : {},
};
// BASIC FUNCTIONS ===================================================START
function replacer(match, letter, value) {
    var str = Number(value).toString(letter == 'L' ? 10 : 16);
    var len = letter == 'L' ? 2 : 8;
    while (str.length < len) {
        str = '0' + str;
    }
    return letter + str;
}
/**
 * Finds recursively the layer with the specified key and value.
 * @param {ol.layer.Base} layer
 * @param {String} key
 * @param {any} value
 * @returns {ol.layer.Base}
 */
function findBy(layer, key, value) {

    if (layer.get(key) === value) {
        return layer;
    }

    // Find recursively if it is a group
    if (layer.getLayers) {
        var layers = layer.getLayers().getArray(),
            len = layers.length, result;
        for (var i = 0; i < len; i++) {
            result = findBy(layers[i], key, value);
            if (result) {
                return result;
            }
        }
    }

    return null;
}

function getLayerByName(layerName) {
    var layers = this.getLayers().getArray();
    var layer = null;
    $.each(layers, function (index, lyr) {
        if (lyr.get("name") == layerName) {
            layer = lyr;
            return false;
        }
    });
    return layer;
}

function getLayerById(layerId) {
    var layers = this.getLayers().getArray();
    var layer = null;
    $.each(layers, function (index, lyr) {
        if (lyr.get("id") == layerId) {
            layer = lyr;
            return false;
        }
    });
    return layer;
}

// get WKT format from ol.geom types with accordance EPSG code transformation
function getWkt(geom, epsg_origin, epsg_destination) {
    var bbox = geom.clone().transform(epsg_origin, epsg_destination);
    var format = new ol.format.WKT();
    var wkt = format.writeGeometry(bbox);
    return wkt;
}

function formatLength(line) {
    var length = line.getLength();
    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    } else {
        output = (Math.round(length * 100) / 100) + ' ' + 'm';
    }
    return output;
};

function formatArea(polygon) {
    var area = polygon.getArea();
    var output;
    if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
    } else {
        output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
    }
    return output;
}

function formatRadius(circle) {
    var output;
    var radius = circle.getRadius();

    if (radius > 100) {
        output = (Math.round(radius / 1000 * 100) / 100) + ' ' + 'km';
    } else {
        output = (Math.round(radius * 100) / 100) + ' ' + 'm';
    }
    return output;
}

function createTooltip(map) {
    /*if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }*/
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';
    measureTooltip = new ol.Overlay({
        id: 'measurementOverlay',
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    overlayObj.measurementInfo.push(measureTooltip);
    map.addOverlay(measureTooltip)
}

// BASIC FUNCTIONS ============================================================= END

var views = new ol.View({
    // projection: 'EPSG:3857',
    projection: projection_daum,
    maxZoom: 15,
    minZoom: 6,
    extent: bound_daum,
    center: new ol.geom.Point([126.851570, 35.160009]).transform('EPSG:4326', 'EPSG:5181').getCoordinates(),
    zoom: 10
});

// initialize Map object
function initMap() {
    // initialize map with center at Busan City Hall
    var map = new ol.Map({
        target: 'map',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [
            new ol.layer.Group({
                'title': 'Base maps',
                layers: [
                    vworldAp
                    , emptyTiles
                    , daumAp
                    , naverAp
                    , naverTiles
                    , vworldTiles
                    , daumTiles
                    , baroEMapTiles
                    , measurementVector
                ]
            }),
            new ol.layer.Group({
                'title': 'WMS',
                layers: [
                    // 속도 문제 떼문에 임시로 비활성화
                    lpbnLayer,
                    emdLayer
                    // , liLayer
                    ,sigLayer
                ]
            }),
            bml_bound_as

        ],
        interactions: ol.interaction.defaults({
            dragPan: false,
            mouseWheelZoom: false,
            enableRotation : false
        }).extend([
            new ol.interaction.DragPan({kinetic: false}),
            new ol.interaction.MouseWheelZoom({duration: 0})
        ]),
        view: views
    });

    // use layer switcher plugin for basemap switching
    var layerSwitcher = new ol.control.LayerSwitcher();

    // Add Zoom slider object to map
    var zoomslider = new ol.control.ZoomSlider({
        maxResolution: resolutions.length,
        minResolution: 1
    });

    var zoomBtn = new ol.control.Zoom({
        className: "btn_zoom"
    });

    var mouseControl = new ol.control.MousePosition({
        projection:projection_daum,
        target:document.getElementById("mousePos")
    });
    // Add Zoom button and zoom slider object to map
    map.addControl(zoomBtn);
    map.addControl(zoomslider);
    map.addControl(layerSwitcher);
    // map.addControl(mouseControl);

    // insert all map data into #map element for further use
    $("#map").data('map', map);
    return map;
}

function initMap1(view) {
    // initialize map with center at Busan City Hall
    var map1 = new ol.Map({
        target: 'map1',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [
            new ol.layer.Group({
                'title': 'Base maps',
                layers: [
                    vworldAp
                    , daumAp
                    , naverAp
                    , naverTiles
                    , vworldTiles
                    , daumTiles
                    , baroEMapTiles
                ]
            }),
            new ol.layer.Group({
                'title': 'WMS',
                layers: [
                    // lpbnLayer
                    // , emdLayer
                    // , liLayer
                    // , sigLayer
                ]
            })
        ],
        interactions: ol.interaction.defaults({
            dragPan: false,
            mouseWheelZoom: false
        }).extend([
            new ol.interaction.DragPan({kinetic: false}),
            new ol.interaction.MouseWheelZoom({duration: 0})
        ]),
        view: view
    });
    // use layer switcher plugin for basemap switching
    var layerSwitcher = new ol.control.LayerSwitcher();

    var zoomslider = new ol.control.ZoomSlider({
        maxResolution: resolutions.length,
        minResolution: 1
    });

    var zoomBtn = new ol.control.Zoom({
        className: "btn_zoom"
    });

    // Add Zoom button and slider object to map
    map1.addControl(zoomBtn);
    map1.addControl(zoomslider);
    map1.addControl(layerSwitcher);

    // insert all map data into #map element for further use
    $("#map1").data('map', map1);
    return map1;
}

function initMap2(view) {
    // initialize map with center at Busan City Hall
    var map2 = new ol.Map({
        target: 'map2',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [
            new ol.layer.Group({
                'title': 'Base maps',
                layers: [
                    vworldAp
                    , daumAp
                    , naverAp
                    , naverTiles
                    , vworldTiles
                    , daumTiles
                    , baroEMapTiles
                ]
            }),
            new ol.layer.Group({
                'title': 'WMS',
                layers: [
                    // lpbnLayer
                    // , emdLayer
                    // , liLayer
                    // , sigLayer
                ]
            })
        ],
        interactions: ol.interaction.defaults({
            dragPan: false,
            mouseWheelZoom: false
        }).extend([
            new ol.interaction.DragPan({kinetic: false}),
            new ol.interaction.MouseWheelZoom({duration: 0})
        ]),
        view: view
    });

    // use layer switcher plugin for basemap switching
    var layerSwitcher = new ol.control.LayerSwitcher();

    var zoomslider = new ol.control.ZoomSlider({
        maxResolution: resolutions.length,
        minResolution: 1
    });

    var zoomBtn = new ol.control.Zoom({
        className: "btn_zoom"
    });

    // Add Zoom button and slider object to map
    map2.addControl(zoomBtn);
    map2.addControl(zoomslider);
    map2.addControl(layerSwitcher);

    // insert all map data into #map element for further use
    $("#map2").data('map', map2);
    return map2;
}

function initMap3(view) {
    // initialize map with center at Busan City Hall
    var map3 = new ol.Map({
        target: 'map3',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [
            new ol.layer.Group({
                'title': 'Base maps',
                layers: [
                    vworldAp
                    , daumAp
                    , naverAp
                    , naverTiles
                    , vworldTiles
                    , daumTiles
                    , baroEMapTiles
                ]
            }),
            new ol.layer.Group({
                'title': 'WMS',
                layers: [
                    // lpbnLayer
                    // , emdLayer
                    // , liLayer
                    // , sigLayer
                ]
            })
        ],
        interactions: ol.interaction.defaults({
            dragPan: false,
            mouseWheelZoom: false
        }).extend([
            new ol.interaction.DragPan({kinetic: false}),
            new ol.interaction.MouseWheelZoom({duration: 0})
        ]),
        view: view
    });

    // use layer switcher plugin for basemap switching
    var layerSwitcher = new ol.control.LayerSwitcher();

    var zoomslider = new ol.control.ZoomSlider({
        maxResolution: resolutions.length,
        minResolution: 1
    });

    var zoomBtn = new ol.control.Zoom({
        className: "btn_zoom"
    });

    // Add Zoom button and slider object to map
    map3.addControl(zoomBtn);
    map3.addControl(zoomslider);
    map3.addControl(layerSwitcher);

    // insert all map data into #map element for further use
    $("#map3").data('map', map3);
    return map3;
}

function initMap4(view) {
    // initialize map with center at Busan City Hall
    var map4 = new ol.Map({
        target: 'map4',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [
            new ol.layer.Group({
                'title': 'Base maps',
                layers: [
                    vworldAp
                    , daumAp
                    , naverAp
                    , naverTiles
                    , vworldTiles
                    , daumTiles
                    , baroEMapTiles
                ]
            }),
            new ol.layer.Group({
                'title': 'WMS',
                layers: [
                    // lpbnLayer
                    // , emdLayer
                    // , liLayer
                    // , sigLayer
                ]
            })
        ],
        interactions: ol.interaction.defaults({
            dragPan: false,
            mouseWheelZoom: false
        }).extend([
            new ol.interaction.DragPan({kinetic: false}),
            new ol.interaction.MouseWheelZoom({duration: 0})
        ]),
        view: view
    });

    // use layer switcher plugin for basemap switching
    var layerSwitcher = new ol.control.LayerSwitcher();

    var zoomslider = new ol.control.ZoomSlider({
        maxResolution: resolutions.length,
        minResolution: 1
    });

    var zoomBtn = new ol.control.Zoom({
        className: "btn_zoom"
    });

    // Add Zoom button and slider object to map
    map4.addControl(zoomBtn);
    map4.addControl(zoomslider);
    map4.addControl(layerSwitcher);

    // insert all map data into #map element for further use
    $("#map4").data('map', map4);
    return map4;
}

function geometrySearch(years, geomwkt, currentCRS) {

    var map = $("#map").data('map');
    var sb = new StringBuilder();
    var sb2 = new StringBuilder();
    var sb3 = new StringBuilder();
    var singleYear,singleDisp,yearsArr = [],dispArr = [];

    for(var i = 0; i<years.length; i++){
        singleYear = years[i].split("-")[0];
        singleDisp = years[i].split("-")[1];
        yearsArr.push(singleYear);
        dispArr.push(singleDisp);
    }

    var queryData = {
        'wkt': geomwkt,
        'years': years,
    };

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectIntersectedGis.json',
        type: "POST",
        dataType: "json",
        data: queryData,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {

            $('.loadingWrap').hide();

            var format = new ol.format.WKT();
            var result = resData.result;
            var totCount = resData.totCnt;
            var geomType = resData.geomType;
            var features = [];
            var featureCoordArr = [];

            /*$.each(result, function (idx, val) {

                var geom = val.geom;
                feature = format.readFeature(geom);
                feature.getGeometry().transform('EPSG:5187', 'EPSG:3857');
                features.push(feature);
                console.log('데이터 PSH후');
            })*/


            // show the list of points at the side bar
            if (result.length > 0 && totCount.length > 0) {

                sb3.Append('<p id="geometrySearchBtnArea" style="position:absolute; top:263px; left: 10px;">');
                sb3.Append('<a class="btn_lineS_Black mr5" id="mainPointDownloadAllJpeg" data-image = "jpg" onclick="downloadAllPoint(this);" name="mainPointDownloadAllJpeg"  >JPEG 다운로드</a>');
                sb3.Append('<a class="btn_lineS_Black mr5" id="mainPointDownloadAll" data-image = "tif" onclick="downloadAllPoint(this);" name="mainPointDownloadAll">TIF 다운로드</a>');
                sb3.Append('<a class="btn_lineS_Red mr5" id="mainPointUncheckAll" onclick="uncheckAllPoint();" name="mainPointUncheckAll" >전체해제</a>');
                sb3.Append('<a class="btn_lineS_Blue mr5" id="mainPointCheckAll" onclick="checkAllPoint();" name="mainPointCheckAll" >전체선택</a>');
                sb3.Append('</p>');

                for (var i = 0; i < yearsArr.length; i++) {
                    for (var j = 0; j < totCount.length; j++) {
                        if (totCount[j].yeardisp === years[i]) {
                            var colidx = i + 1;

                            var dispType;
                            if(dispArr[i] == 'p') {
                                dispType = '낱장';
                            }else if(dispArr[i] == 'g'){
                                dispType = '경남'
                            }else if (dispArr[i] == '1'){
                                dispType = '1회차'
                            }else {
                                dispType = '2회차'
                            }

                            if (geomType === "notPoint") {
                                sb.Append('<li><input style="position:relative; float:left; top : 15px; left: 10px; z-index:10" type="checkbox" class= "headerCheck" id="' +years[i]+ '" onclick="partCheck(this)"/><a href="#" style="padding-left:22px"><span class="color' + colidx + '"></span><span>' + yearsArr[i] + '년 -' + dispType + ' (' + totCount[j].totcnt + ' 건)</span><span id="totCnt"></span><span class="i"></span></a>');
                            } else {
                                sb.Append('<li><input style="position:relative; float:left; top : 15px; left: 10px; z-index:10" type="checkbox" class= "headerCheck" id="' +years[i]+ '" onclick="partCheck(this)"/><a href="#" style="padding-left:22px"><span class="color' + colidx + '"></span><span>' + yearsArr[i] + '년 -' + dispType + ' </span><span id="totCnt"></span><span class="i"></span></a>');
                            }
                            sb.Append('<ul style="display:block;">');
                        }
                    }

                    $.each(result, function (idx, val) {
                        // console.log(val);
                        if ($.inArray(val.yeardisp, years) > -1) {
                            if (val.yeardisp === years[i]) {

                                // make pointInfo element
                                sb2.Append('<div id="pointInfo_area">' + val.corse + ' - ' + val.corseNum + '</div>');

                                var geom = val.geom;
                                var dispType = val.disparity;
                                feature = format.readFeature(geom);
                                feature.getGeometry().transform('EPSG:5186', currentCRS);
                                if (dispType == '1') {
                                    feature.setStyle(mainPointStyle[mainPointStyleKeys[i]]);
                                } else {
                                    feature.setStyle(mainPointStyle2[mainPointStyleKeys2[i]]);
                                }
                                feature.setId(val.airfilenam + '-' + dispType + '-' + val.corse + '-' + val.corseNum);
                                features.push(feature);
                                var featureCoord = feature.getGeometry().getCoordinates();
                                featureCoordArr.push(featureCoord);

                                sb.Append('<li>');
                                sb.Append('<a href="#">');
                                sb.Append('<input type="checkbox" class="'+years[i]+'" name="mainPointCheck" value="'+val.airfilenam+'"/>');
                                sb.Append('<span class="pointResults" data-epsg="' + currentCRS + '" onclick="moveToPoint(' + val.centerX + ',' + val.centerY + ',this)">');

                                if (dispType == 'p'){
                                    sb.Append('낱장 - ' + val.corse + '코스 -' + val.corseNum + '(축척:1/' + numberWithCommas(val.reducedsca) + ')');
                                }else if (dispType == 'g'){
                                    sb.Append('경남 - ' + val.corse + '코스 -' + val.corseNum + '');
                                }else{
                                    sb.Append('' + val.disparity + '회차 - ' + val.corse + '코스 -' + val.corseNum + '');
                                }

                                sb.Append('</span>');
                                sb.Append('<button class="sbtn_view" onclick="openImage(' + '\'' + val.airfilenam + '\'' + ',' + '\'' + val.disparity + '\'' + ',' + '\'' + val.corse + '\'' + ',' + '\'' + val.corseNum + '\'' + ')">사진보기</button></a>');
                                sb.Append('</li>');
                            }
                        } else {
                            sb.Append('<li>');
                            sb.Append('<span>데이터가 존재하지 않습니다.</span>');
                            sb.Append('</li>');
                        }

                    });
                    sb.Append('</ul>');
                    sb.Append('</li>');
                }
            }
            else {
                sb.Append('<li>');
                sb.Append('<span>데이터가 존재하지 않습니다.</span>');
                sb.Append('</li>');
            }

            // console.log(sb.ToString());

            $("#resultPanel").before(sb3.ToString());
            // $("#geometrySearchBtnArea").html(sb3.ToString());
            $("#resultList").html(sb.ToString());
            $("#resultList > li:first-child > ul").children().addClass("active");

            // parse String builder into HTML element
            var pointInfoEmt = $.parseHTML(sb2.ToString());

            // create overlay object for point Info
            for (var i = 0; i < pointInfoEmt.length; i++) {
                pointInfo = new ol.Overlay({
                    id: 'pointInfo',
                    element: pointInfoEmt[i],
                    positioning: 'bottom-center',
                    stopEvent: false,
                    insertFirst: true
                });
                overlayObj.pointInfoArr.push(pointInfo);

                // set coordinate for overlay
                pointInfo.setPosition(featureCoordArr[i]);

                // add overlay to map
//                map.addOverlay(pointInfo);
            }

            // Side Menu accordion script -------start
            var menu_v = $('div.menu_v');
            var sItem = menu_v.find('>ul>li');
            var ssItem = menu_v.find('>ul>li>ul>li');
            var lastEvent = null;

            sItem.find('>ul').css('display', 'none');
            menu_v.find('>ul>li>ul>li[class=active]').parents('li').attr('class', 'active');
            menu_v.find('>ul>li[class=active]').find('>ul').css('display', 'block');

            function menu_vToggle(event) {
                var t = $(this);

                if (this == lastEvent) return false;
                lastEvent = this;
                setTimeout(function () {
                    lastEvent = null
                }, 200);

                if (t.next('ul').is(':hidden')) {
//                    sItem.find('>ul').slideUp(100);
                    t.next('ul').slideDown(100);
                } else if (!t.next('ul').length) {
//                    sItem.find('>ul').slideUp(100);
                } else {
                    t.next('ul').slideUp(100);
                }

                if (t.parent('li').hasClass('active')) {
                    t.parent('li').removeClass('active');
                } else {
                    sItem.removeClass('active');
                    t.parent('li').addClass('active');
                }
            }

            sItem.find('>a').click(menu_vToggle).focus(menu_vToggle);

            function subMenuActive() {
                ssItem.removeClass('active');
                $(this).parent(ssItem).addClass('active');
            };
            ssItem.find('>a').click(subMenuActive).focus(subMenuActive);

            //icon
            menu_v.find('>ul>li>ul').prev('a').append('<span class="i"></span>');
            // Side Menu accordion script -------end (consider making common js file for this?)

            // console.log(features);
            // show points on the map
            vectorPointSource = new ol.source.Vector({
                // projection:projection_vworld,
                projection: projection_daum,
                features: features
            });
            vectorPointLayer = new ol.layer.Vector({
                name: "pointLayer",
                source: vectorPointSource,
                zIndex: 100,
            });
            map.getLayers().insertAt(100, vectorPointLayer);
            map.getLayers().insertAt(99, vector);
            mainPointFeatures = features;
        }
    });
}

function partCheck(obj){

    var checkBoxId = $(obj).attr('id');
    if($(obj).prop("checked") === true){
        $("."+checkBoxId).prop("checked",true);
    }else{
        $("."+checkBoxId).prop("checked",false);
    }

}

//전체 선택
function checkAllPoint(){

    $("input:checkbox[name=mainPointCheck]").prop("checked",true);
    $(".headerCheck").prop("checked",true);

}

// 전체 해제
function uncheckAllPoint(){

    $("input:checkbox[name=mainPointCheck]").prop("checked",false);
    $(".headerCheck").prop("checked",false);
}

// 파일 압축 및 다운로드
function downloadAllPoint(obj){
    var $this = $(obj);
    var imgGbn = $this.attr('data-image');
    var filenameArr = [];
    var yearArr = [];
    var checkStatus = $('input[name="mainPointCheck"]:checked');

    if(imgGbn === 'tif'){
        if(checkStatus.length > 10){
            alert("최대 10개 까지만 선택 할 수 있습니다.");
            return false;
        }
    }

    if(imgGbn === 'jpg'){
        if(checkStatus.length > 20){
            alert("최대 20개 까지만 선택 할 수 있습니다.");
            return false;
        }
    }

    if(checkStatus.length < 1){
        alert("최소 1개를 선택 해야합니다.");
        return;
    }

    $.each(checkStatus,function(idx,val){
        filenameArr.push(val.value);
        yearArr.push(val.value.substr(0,4));
    });

    var sb = new StringBuilder();
    sb.Append('<input type="hidden" name="airfilenam" value="' + filenameArr +'" />');
    sb.Append('<input type="hidden" name="years" value="' + yearArr +'" />');

    $(sb.ToString()).appendTo('body');

    var queryData = {
        years: $('input[name="years"]').val(),
// 		years: '2018,2018,2018,2018,2018,2018,2018,2018,2018,2018',
//		years: '2018',
        imgFlag: imgGbn,
        airfilenam: $('input[name="airfilenam"]').val()
//      airfilenam: '2018042800N0150001,2018042800N0150002,2018050500B0370034,2018050500B0370035,2018050500B0370036,2018050500B0370037,2018050500N0370034,2018050500N0370035,2018050500N0370036,2018050500N0370037'
//		airfilenam: '2018042800N0150001'
    }
    $('input[name="airfilenam"], input[name="years"]').remove();

    $.ajax({
        url: gp.ctxPath + "/aeroGis/aeroGisCheckDownload.do",
        type: "post",
        dataType: "json",
        data: queryData,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            // 압축파일 다운로드 호출
            aeroPictureZipDownload(resData.archiveFileNm);
            $('.loadingWrap').hide();
        }
    });
}
// 압축파일 다운로드
function aeroPictureZipDownload(archiveFileNm){

//	var targetUrl = gp.ctxPath + "/aeroGis/aeroPictureZipDownload.do";
//	$('.loadingWrap').show();
//	$.fileDownload(targetUrl, {
//
//		httpMethod: "post",
//		data:{filePath : zipFilePath},
//		successCallback: function (url){
//			console.log("successCallback");
//			$('.loadingWrap').hide();
//		},
//		failCallback: function(responseHtml, url, error){
//			console.log("failCallback");
//			$('.loadingWrap').hide();
//		}
//	});

    var targetUrl = gp.aeroArchiveUrl + "/" + archiveFileNm;
    $.fileDownload(targetUrl);
}

function clearGeometry() {
    var map = $("#map").data('map');
    var vectorLayers = map.getLayers().getArray();
    var mapInteractions = map.getInteractions().getArray();

    for (var i = 0; i < mapInteractions.length; i++) {
        if (mapInteractions[i] instanceof ol.interaction.Select) {
            // 해당 interactions 관련환 모든 features 삭제
            mapInteractions[i].getFeatures().clear();
        }
    }

    // clear the 도형선택 source and remove the layer
    vectorSource.clear();
    map.removeLayer(vector);

    for (var i = 0; i < vectorLayers.length; i++) {

        // get only the inquired points layer
        if (vectorLayers[i] instanceof ol.layer.Vector) {
            if (vectorLayers[i].get('name') == "pointLayer") {
                map.removeLayer(vectorLayers[i]);
            }
        }

    }

    // delete marker layer
    map.removeLayer(markerVectorLayer);

    // delete the overlays
    for (var i = 0; i < overlayObj.pointInfoArr.length; i++) {
        map.removeOverlay(overlayObj.pointInfoArr[i]);
    }

    // empty the result list
    $("#resultList").html('');
    $("#metaResultList").html('');
    $("#geometrySearchBtnArea").remove();


    // empty the filter condition fields
    /*$("#yearSelector").val("");
    $("#yearSelectorMeta").val("");
    $("#corse").val("");
    $("#corse_num").val("");*/


    // delete recent Points layer
    clearRecentPoints();
}

function clearMainPoints(yearData, dispData,reducedsca, currentCRS) {
    var map = $("#map").data('map');

    var mapInteractions = map.getInteractions().getArray();
    for (var i = 0; i < mapInteractions.length; i++) {
        if (mapInteractions[i] instanceof ol.interaction.Select) {
            // map.removeInteraction(mapInteractions[i]);
            mapInteractions[i].getFeatures().clear();
        }
    }

    var querydata = {
        mainYear: yearData,
        disparity: dispData,
        reducedsca: reducedsca
    };

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectMainPoints.do',
        type: "POST",
        dataType: "json",
        data: querydata,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {

            $('.loadingWrap').hide();

            var format = new ol.format.WKT();
            var result = resData.rList;
            var delFeature;
            var delFeatures = [];

            // show the list of points at the side bar
            $.each(result, function (idx, val) {
                var geom = val.geom;
                delFeature = format.readFeature(geom);
                delFeature.getGeometry().transform('EPSG:5187', currentCRS);
                delFeature.setId(val.airfilenam + '-' + val.disparity + '-' + val.corse + '-' + val.corseNum);
                delFeatures.push(delFeature);
            });

            $.each(delFeatures,function(idx,val){
                mainPointsVectorSource.removeFeature(mainPointsVectorSource.getFeatureById(val.getId()));
            });

            mainPointsVectorSource.refresh();
        }
    });
}

function clearRecentPoints() {
    var deletedLayer;
    var map = $("#map").data('map');
    var mapInteractions = map.getInteractions().getArray();
    for (var i = 0; i < mapInteractions.length; i++) {
        if (mapInteractions[i] instanceof ol.interaction.Select) {
            // map.removeInteraction(mapInteractions[i]);
            mapInteractions[i].getFeatures().clear();
        }
    }

    var layerArr = map.getLayers().getArray();
    for (var i = 0; i < layerArr.length; i++) {
        if (layerArr[i] instanceof ol.layer.Vector) {
            var name = 'recentPointLayer';
            deletedLayer = findBy(layerArr[i], 'name', name.toString());
            map.removeLayer(deletedLayer);
        }
    }

    var overlayArr = map.getOverlays().getArray();
    for (var i = 0; i < overlayArr.length; i++) {
        if (overlayArr[i].getId() == 'recentPointInfo') {
            map.removeOverlay(overlayArr[i]);
        }
    }
}

function clearAllMainPoints() {
    var len = $("input[name='layerCheck']").length;
    for (var i = 0; i < len; i++) {
        if ($("input[name='layerCheck']").eq(i).is(":checked") === true) {
            $("input[name='layerCheck']").eq(i).trigger('click');
        }
    }

}

function clearDigitalMap() {
    var map = $("#map").data('map');
    vectorSourceDmap.clear();
    multiPolygonVectorSource.clear();
    map.removeLayer(multiPolygonVectorLayer);
    map.removeLayer(vectorDmapLayer);

    var mapInteractions = map.getInteractions().getArray();
    for (var i = 0; i < mapInteractions.length; i++) {
        if (mapInteractions[i] instanceof ol.interaction.Select) {
            mapInteractions[i].getFeatures().clear();
        }
    }
    // reset the index features preventing click interaction conflict between 공간검색 and 인덱스
    indexFeatures = '';


    $("#dmapSearchResultArea").html('');
    $("#digitalMapInfoArea").html('');
    $("#dmapPop_01").hide();
}

function clearIndex(yearData) {
    var deletedLayer;
    var map = $("#map").data('map');
    // remove interactions
    var mapInteractions = map.getInteractions().getArray();
    for (var i = 0; i < mapInteractions.length; i++) {
        if (mapInteractions[i] instanceof ol.interaction.Select) {
            mapInteractions[i].getFeatures().clear();
        }
    }
    //remove layer
    var layerArr = map.getLayers().getArray();
    for (var i = 0; i < layerArr.length; i++) {
        if (layerArr[i] instanceof ol.layer.Vector) {
            var name = 'indexLayer_' + yearData;
            deletedLayer = findBy(layerArr[i], 'name', name.toString());
            map.removeLayer(deletedLayer);
        }
    }

    // remove legend from the list
    var legendElements = $("#pop_legend_result > ul > li");
    $.each(legendElements, function (idx, val) {
        if (val.id === yearData) {
            legendElements[idx].parentNode.removeChild(legendElements[idx]);
        }
    })
}

function clearIndexAll() {
    var checkboxes = $("input[name='indexCheck']");
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes.eq(i).is(":checked")) {
            checkboxes.eq(i).prop("checked", false);
            $("#colorWrap" + checkboxes.eq(i).val()).hide();
            clearIndex(checkboxes.eq(i).val());
        }
    }
    closeLegendPop();
    indexYearsArr = [];
    countIndex(indexYearsArr);
}

function clearMeasurementGeometry() {
    var map = $("#map").data('map');
    measurementVectorSource.clear();
    map.removeLayer(measurementVector);

    for (var i = 0; i < overlayObj.measurementInfo.length; i++) {
        map.removeOverlay(overlayObj.measurementInfo[i]);
    }
}

function zoomTo(obj) {

    var map = $("#map").data('map');
    var view = map.getView();
    var zoomVal = $(obj).attr('data-value');
    view.setZoom(zoomVal);

    $("#map").data('map', map);
}

function leftZoomTo(obj) {

    var map1 = $("#map1").data('map');
    var view1 = map1.getView();
    var zoomVal = $(obj).attr('data-value');
    view1.setZoom(zoomVal);

    $("#map1").data('map', map1);
}

function rightZoomTo(obj) {

    var map2 = $("#map2").data('map');
    var view2 = map2.getView();
    var zoomVal = $(obj).attr('data-value');
    view2.setZoom(zoomVal);

    $("#map2").data('map', map2);
}

function moveToPoint(x, y, obj) {

    markerVectorSource.clear();

    var map = $('#map').data('map');
    var zoom = map.getView().getZoom();
    var toProj = $(obj).attr('data-epsg');
    var coord = ol.proj.transform([x, y], 'EPSG:5186', toProj);

    map.getView().setCenter(coord);
    map.getView().setZoom(zoom);
    map.removeLayer(markerVectorLayer);

    // add marker to selected point

    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(coord),
        name: 'aerialPoint'
    });
    markerVectorSource.addFeature(iconFeature);

    map.getLayers().insertAt(101, markerVectorLayer);

}

function moveToIndex(x, y, toProj) {

    // console.log(toProj);
    var map = $('#map').data('map');
    var coord = ol.proj.transform([x, y], 'EPSG:5183', toProj);

    map.getView().setCenter(coord);
    map.getView().setZoom(12);

    // add styled geometry to selected index

    /*multiPolygonVectorSource = new ol.source.Vector({
        wrapX:false,
    })

    multiPolygonVectorLayer = new ol.layer.Vector({
        source:multiPolygonVectorSource,
        features:feature
    })

    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(coord),
        name:'aerialPoint'
    });
    markerVectorSource.addFeature(iconFeature);

    map.getLayers().insertAt(9,markerVectorLayer);*/

}

/*function openImage(fileNm, disparity, corse, corseNum) {
    var airYear = fileNm.substring(0, 4);

    // var w = 1920;
    // var h = 1050;
    // var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    // var top = ((height / 2) - (h / 2)) + dualScreenTop;

    var w = screen.width;
    var h = screen.height;
    var left = 0;
    var top = 0;

    var url = gp.ctxPath + "/aeroGis/aeroGisImgPopView.do?" + 'airfilenam=' + fileNm + '&airYear=' + airYear + '&disparity=' + disparity + '&corse=' + corse + '&corseNum=' + corseNum;
    var title = "항공사진" + fileNm;

    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    window.open(url, title, 'scrollbars=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    // window.open(url,'_blank');
    // window.open(url, 'aaa');

//    frm.target = title;
//    frm.action = url;
//    frm.method = "post";
//    frm.submit();
}*/

function openImage(fileNm, disparity, corse, corseNum) {

    var userIdVal = $("#userIdVal").val();
    var airYear = fileNm.substring(0, 4);

    var queryData = {
        airfilenam : fileNm,
        airYear : airYear,
        disparity : disparity,
        corse : corse,
        corseNum : corseNum
    }
    // var url = gp.ctxPath + "/aeroGis/aeroGisImgPopView.do?" + 'airfilenam=' + fileNm + '&airYear=' + airYear + '&disparity=' + disparity + '&corse=' + corse + '&corseNum=' + corseNum;

    $.ajax({
        url: gp.ctxPath + "/aeroGis/aeroGisImgPopView.do",
        type: "post",
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
        data: queryData,
        beforeSend	: function(){
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            // 압축파일 다운로드 호출
            var jsonData = JSON.stringify(resData.imgData);
            var listData = JSON.stringify(resData.rList);
            console.log(jsonData);
            console.log(listData);
            location.href = "airphoto://"+jsonData+"@"+userIdVal;
            // location.href = "busan://"+resData.imgData[0].airfilenam+"@"+userIdVal+"/";
        },
        complete	: function(){
            $('.loadingWrap').hide();
        },
    });

    // $.get(url,function(data,status){
    //     console.log(data);
    // });

    // CS call method
    // location.href = "busan://"+fileNm+"@"+userIdVal;
    // location.href = "busan://"+fileNm;

    /*var airYear = fileNm.substring(0, 4);
    var title = "항공사진" + fileNm;
    var tiled = '1';

    var url = gp.ctxPath + "/aeroGis/aeroGisImgPopView.do?" + 'airfilenam=' + fileNm + '&airYear=' + airYear + '&disparity=' + disparity + '&corse=' + corse + '&corseNum=' + corseNum + '&tiled=' + tiled;
    var title = "항공사진" + fileNm;
    var w = 700;
    var h = 800;

    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;

    window.open(url, title, 'scrollbars=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left + ', resizable=yes, status=no,menubar=no');*/

}
function previewThumb(fileNm, disparity, corse, corseNum) {

    var map = $("#map").data('map');
    var userIdVal = $("#userIdVal").val();
    var airYear = fileNm.substring(0, 4);
    map.getLayers().forEach(function(e){

        if(e.get("title")=='geoImage'){
            map.removeLayer(e);
        }
    });
//	map.removeLayer(map.getLayers().getArray().pop());
    var queryData = {
        airfilenam : fileNm,
        airYear : airYear,
        disparity : disparity,
        corse : corse,
        corseNum : corseNum
    }
    // var url = gp.ctxPath + "/aeroGis/aeroGisImgPopView.do?" + 'airfilenam=' + fileNm + '&airYear=' + airYear + '&disparity=' + disparity + '&corse=' + corse + '&corseNum=' + corseNum;

    $.ajax({
        url: gp.ctxPath + "/aeroGis/aeroGisImgPopView.do",
        type: "post",
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
        data: queryData,
        beforeSend	: function(){
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            var jsonData = JSON.stringify(resData.imgData);
            var listData = JSON.stringify(resData.rList);
            var geoimg = new ol.layer.GeoImage({
                name: "Georef",
                title: "geoImage",
                opacity: 1,
                source: new ol.source.GeoImage({
//			      url: 'file:///D:/APIS_DB/thumb/2016100900B0190031.jpg',
                    url: 'http://175.116.181.151:8080/air_photo/'+resData.imgData[0].createyear+'/'+resData.imgData[0].airfilenam+'.jpg',
//			      url: '/images/bono.jpg',
//				  file:///C:/Users/Lee/gj/gjAm/src/main/webapp/images/bono.jpg
                    imageCenter: [parseFloat(resData.imgData[0].centerX),parseFloat(resData.imgData[0].centerY)-100000],
                    imageScale: [0.3,0.3],
//			      imageCrop: [0, 0, 5526, 5000],
//			      imageCrop: [parseFloat(resData.imgData[0].llX), parseFloat(resData.imgData[0].llY), parseFloat(resData.imgData[0].urX), parseFloat(resData.imgData[0].urY)],
                    imageMask: [[parseFloat(resData.imgData[0].llX),parseFloat(resData.imgData[0].llY)-100000],[parseFloat(resData.imgData[0].lrX),parseFloat(resData.imgData[0].lrY)-100000],[parseFloat(resData.imgData[0].urX),parseFloat(resData.imgData[0].urY)-100000],[parseFloat(resData.imgData[0].ulX),parseFloat(resData.imgData[0].ulY)-100000],[parseFloat(resData.imgData[0].llX),parseFloat(resData.imgData[0].llY)-100000]],
//			      imageRotate: Number($("#rotate").val()*Math.PI/180),
                    projection: 'EPSG:5181',
                    // attributions: [ "<a href='http://www.geoportail.gouv.fr/actualite/181/telechargez-les-cartes-et-photographies-aeriennes-historiques'>Photo historique &copy; IGN</a>" ]
                })

            });

            geoimg.on("change",function(){
                $('.loadingWrap').hide();
            }); // 이미지 추가되면 로딩바 숨김 -한봄-

            map.getLayers().insertAt(101, geoimg);
            // $('.loadingWrap').hide();
        }
    });

}

function removeWMSLayer(side) {
    if (side == "left") {
        var map1 = $("#map1").data('map');
        map1.removeLayer(lpbnLayer);
        map1.removeLayer(liLayer);
        map1.removeLayer(emdLayer);
        map1.removeLayer(sigLayer);

        $("#toolTipLeft").children().removeClass("on");
    } else {
        var map2 = $("#map2").data('map');
        map2.removeLayer(lpbnLayer);
        map2.removeLayer(liLayer);
        map2.removeLayer(emdLayer);
        map2.removeLayer(sigLayer);

        $("#toolTipRight").children().removeClass("on");
    }
}

function getCanvas(){
    var canvas1 = document.querySelector('#map > div > canvas ');
    console.log(canvas1);


    //var imageData = canvas1.toDataURL();

    //return imageData;
}


var saveMap = function () {


    $(".ol-zoom.ol-unselectable.ol-control").css("display", "none");
    $(".ol-zoomslider.ol-unselectable.ol-control").css("display", "none");
    $(".btn_zoom.ol-unselectable.ol-control").css("display", "none");

    var def = $.Deferred();
    var mapId = $("#map").eq(0);
    var windowWidth = window.innerWidth;

    if (windowWidth > 1900) {
        html2canvas(mapId, {
            logging: true,
            proxy: gp.ctxPath+"/proxy/proxy.jsp",
            // allowTaint: true,
            // useCORS:true,
//             width : 1900,
//             height : 1080,
            x: 0.25 * windowWidth,
            onrendered: function (canvas) {
                // console.log(canvas);
                var imageData = canvas.toDataURL("image/png");
                def.resolve(imageData);
            }
        });
    } else {
        html2canvas(mapId, {
            logging: true,

            // proxy: gp.ctxPath+"/proxy/proxy.jsp",
            // allowTaint: true,
            // useCORS:true,
            //      width : 1900,
            //      height: 680,
            //      x: 0.25 * windowWidth,
            onrendered: function (canvas) {
                console.log(canvas);
                var imageData = canvas.toDataURL("image/png");
                def.resolve(imageData);
            }
        });
    }

    $("#map").css("height", "100%");
    $(".ol-zoom.ol-unselectable.ol-control").css("display", "block");
    $(".ol-zoomslider.ol-unselectable.ol-control").css("display", "block");
    $(".btn_zoom.ol-unselectable.ol-control").css("display", "block");
    return def.promise();
}

var saveMap1 = function () {
    $(".ol-zoom.ol-unselectable.ol-control").css("display", "none");
    $(".ol-zoomslider.ol-unselectable.ol-control").css("display", "none");
    $(".btn_zoom.ol-unselectable.ol-control").css("display", "none");
    $(".date_sel").css("display", "none");
    $("#btn_lock").css("display", "none");
    $(".toggle_wrap").css("display", "none");

    var def = $.Deferred();
    var mapId = $("#map1").eq(0);

    html2canvas(mapId, {
        logging: false,
        // proxy: gp.ctxPath+"/proxy/proxy.jsp",
        allowTaint: false,
        // useCORS:true,
        //  width :950,
        //  height : 1080,
        onrendered: function (canvas) {
            var imageData = canvas.toDataURL("image/png");
            def.resolve(imageData);
        }
    });

    $("#map").css("height", "100%");
    $("#map1").css("height", "100%");
    $(".ol-zoom.ol-unselectable.ol-control").css("display", "block");
    $(".ol-zoomslider.ol-unselectable.ol-control").css("display", "block");
    $(".btn_zoom.ol-unselectable.ol-control").css("display", "block");
    $(".date_sel").css("display", "block");
    $("#btn_lock").css("display", "block");
    $(".toggle_wrap").css("display", "block");
    return def.promise();
}

var saveMap2 = function () {
    $(".ol-zoom.ol-unselectable.ol-control").css("display", "none");
    $(".ol-zoomslider.ol-unselectable.ol-control").css("display", "none");
    $(".btn_zoom.ol-unselectable.ol-control").css("display", "none");
    $(".date_sel").css("display", "none");
    $("#btn_lock").css("display", "none");
    $(".toggle_wrap").css("display", "none");

    var def = $.Deferred();
    var mapId = $("#map2").eq(0);

    html2canvas(mapId, {
        logging: false,
        // proxy: gp.ctxPath+"/proxy/proxy.jsp",
        allowTaint: false,
        // useCORS:true,
        // width :950,
        // height : 1080,
        onrendered: function (canvas) {
            var imageData = canvas.toDataURL("image/png");
            def.resolve(imageData);
        }
    });

    $("#map").css("height", "100%");
    $("#map2").css("height", "100%");
    $(".ol-zoom.ol-unselectable.ol-control").css("display", "block");
    $(".ol-zoomslider.ol-unselectable.ol-control").css("display", "block");
    $(".btn_zoom.ol-unselectable.ol-control").css("display", "block");
    $(".date_sel").css("display", "block");
    $("#btn_lock").css("display", "block");
    $(".toggle_wrap").css("display", "block");
    return def.promise();
}

function saveImg() {
    if ($("#splitMap").hasClass('on')) {
        saveMap1().done(function (imageData1) {
            saveMap2().done(function (imageData2) {
                download(imageData1, "map1.png", "image/png");
                download(imageData2, "map2.png", "image/png");
            })
        })
    } else {
        saveMap().done(function (imageData) {
            download(imageData, "map.png", "image/png");
        })
    }
}

var connString = '__';
var collapsedIcon = gp.ctxPath + '/images/select_arrow_rgt.gif';
var expandedIcon = gp.ctxPath + '/images/select_arrow_down.gif';

function showLeftPane(num) {
    var map = $("#map").data('map');
    if (num == 1) {
        $("#aeroSearchLeftPane").hide();
        $("#intSearchLeftPane").show();
        $("#digitalMapLeftPane").hide();
        $("#layerLeftPane").hide();
        $("#searchKeyword").focus();
        if ($("#dataSideBox").css('margin-left') < '0px') {
            $("#pollSlider-button").trigger("click");
        }

    } else if (num == 2) {
        $("#aeroSearchLeftPane").show();
        $("#intSearchLeftPane").hide();
        $("#digitalMapLeftPane").hide();
        $("#layerLeftPane").hide();

        //reset 항공사진검색
        // $("#yearSelector").val("").trigger("chosen:updated");
        // clearGeometry();

        //reset 수치지형도
        removeDigitalMap();
        clearDigitalMap();
        $("#dMapYearSelector").val("dummy").trigger("chosen:updated");
        $("#mapScaleSelector").val("1000");
        $("#indexScaleSelector").val("1000");
        $("#dmapIndexClearBtn").trigger('click');


        if ($("#dataSideBox").css('margin-left') < '0px') {
            $("#pollSlider-button").trigger("click");
        }

    } else if (num == 3) {

        $("#aeroSearchLeftPane").hide();
        $("#intSearchLeftPane").hide();
        $("#digitalMapLeftPane").show();
        $("#layerLeftPane").hide();

        //reset 항공사진검색
        $("#yearSelector").val("").trigger("chosen:updated");
        $("#yearSelectorMeta").val("").trigger("chosen:updated");
        $("#corse").val("");
        $("#corse_num").val("");
        $("#metaResultList").html("");
        clearGeometry();
        clearAllMainPoints();

        //reset 수치지형도
        /*removeDigitalMap();
        clearDigitalMap();*/
        $("#dMapYearSelector").val("dummy").trigger("chosen:updated");
        $("#mapScaleSelector").val("1000");
        $("#mapScaleSelector").trigger('change');

        if ($("#dataSideBox").css('margin-left') < '0px') {
            $("#pollSlider-button").trigger("click");
        }

    } else if (num == 4) {
        if ($("#dataSideBox").css('margin-left') < '0px') {
            $("#pollSlider-button").trigger("click");
        }
        var connString = '__';

        $.ajax({
            url: gp.ctxPath + '/aeroGis/getCodeTreeList.do',
            type: "POST",
            dataType: "json", // 응답받을 타입
            async: true, // true : 비동기, false : 동기
            error : function(xhs, status, error) {
                if(xhs.status == 600){
                    alert("세션이 만료되었습니다.");
                    location.href = gp.ctxPath + "/mainPage.do";
                }else{
                    alert('서버와의 통신에 실패했습니다.');
                }
            },
            success: function (responseData, textStatus) {

//            	$("#dataBoard").html('');
                var sb = new StringBuilder();
                var prevLev = '';
                var prevId = '';
                sb.Append("<ul>");
                $.each(responseData.rList, function (key, val) {
                    var lev = val.level;
                    var stdGrp = val.stdGrp;
                    var stdCode = val.stdCode;
                    var stdNm = val.stdNm;
                    var isleaf = val.isleaf;
                    var value = prevId + connString + stdGrp + connString + stdCode;
                    if (lev == '1') {
                        value = stdCode + connString + stdGrp + connString + stdCode;
                        if (prevLev == '1') {
                            sb.Append("</dl>");
                            sb.Append("</li>");
                        }
                        sb.Append("<li>");
                        sb.Append("<dl>");
                        sb.Append("<dd class='m10 mt10 off' id='" + value + "'>");
                        sb.Append("<ul>");
                        sb.Append("<li><img id='expIcon' class='expIcon' src='" + collapsedIcon + "'/></li>");
                        sb.Append("<li><span>" + stdNm + "</span></li>");
                        sb.Append("</ul>");
                        sb.Append("</dd>");
                        prevLev = lev;
                        prevId = stdCode;
                    } else {
                        sb.Append("<dd class='" + fn_styleCalcFromDepth(lev) + "' id='" + value + "' style='display:none;'>");
                        sb.Append("<ul class='list'>");
                        if (isleaf != '1') {
                            sb.Append("<li><img id='expIcon' class='expIcon' src='" + collapsedIcon + "'/></li>");
                        } else {
                            sb.Append("<li>ㄴ</li>");
                            sb.Append("<input type='checkbox'>");
                        }
                        sb.Append("<li><span>" + stdNm + "</span></li>");
                        sb.Append("</ul>");
                        sb.Append("</dd>");
                    }
                });
                sb.Append("</li>");
                sb.Append("</ul>");
                $("#dataBoard").html(sb.ToString());
                fn_setEventForTree();
            }
        });

        $("#aeroSearchLeftPane").hide();
        $("#intSearchLeftPane").hide();
        $("#digitalMapLeftPane").hide();
        $("#layerLeftPane").show();
        // removeDigitalMap();

//        console.log($("#BOUD00__LYRGP__BOUD00 > ul > li #expIcon"));
//        $("#BOUD00__LYRGP__BOUD00 > ul > li").trigger('click');

//        console.log($("#BOUD00__LYRGP__BOUD00"));
//        $("#BOUD00__LYRGP__BOUD00").find('img').attr('src', expandedIcon);
    }
}

function fn_styleCalcFromDepth(depth) {
    return 'ml' + String(Number(depth - 1) * 20) + ' off';
}

//트리레이어 이벤트 세팅
function fn_setEventForTree() {

    var map = $("#map").data('map');
    var wmsLayerGroup = findBy(map.getLayerGroup(), 'title', 'WMS');
    var wmsLayerArray = wmsLayerGroup.getLayers().getArray();
    var connString = '__';

    // 행정경계 아이콘 -로 변경
    $("#BOUD00__LYRGP__BOUD00").find('img').attr('src', expandedIcon);
    // 행정경게 트리 펼치기
    fn_showChildNode($("#BOUD00__LYRGP__BOUD00"), connString, 'BOUD00', 'BOUD00');
    // 읍면동체크
    $("#BOUD00__BOUD00__BOUD02 > ul").find('input').prop("checked", true);

    // set default checked for 시군구,읍면동,리,지적 layers
    if (findBy(wmsLayerGroup, 'title', 'sigLayer') != undefined) {
        $("#BOUD00__BOUD00__BOUD01 > ul").find('input').prop("checked", true);
    } else {
        $("#BOUD00__BOUD00__BOUD01 > ul").find('input').prop("checked", false);
    }

    if (findBy(wmsLayerGroup, 'title', 'emdLayer') != undefined) {
        $("#BOUD00__BOUD00__BOUD02 > ul").find('input').prop("checked", true);
    } else {
        $("#BOUD00__BOUD00__BOUD02 > ul").find('input').prop("checked", false);
    }

    if (findBy(wmsLayerGroup, 'title', 'liLayer') != undefined) {
        $("#BOUD00__BOUD00__BOUD03 > ul").find('input').prop("checked", true);
    } else {
        $("#BOUD00__BOUD00__BOUD03 > ul").find('input').prop("checked", false);
    }

    if (findBy(wmsLayerGroup, 'title', 'lpbnLayer') != undefined) {
        $("#BOUD00__BOUD00__BOUD04 > ul").find('input').prop("checked", true);
    } else {
        $("#BOUD00__BOUD00__BOUD04 > ul").find('input').prop("checked", false);
    }

    $("#BOUD00__BOUD00__BOUD01 > ul").find('input').on("change", function () {
        if ($(this).is(":checked")) {
            wmsLayerArray.splice(3, 0, sigLayer);
        } else {
            $.each(wmsLayerArray, function (idx, val) {
                if (val != undefined && val.get('title') === 'sigLayer') {
                    wmsLayerArray.splice(idx, 1);
                }
            })
        }
        map.render();
    })

    $("#BOUD00__BOUD00__BOUD02 > ul").find('input').on("change", function () {
        if ($(this).is(":checked")) {
            wmsLayerArray.splice(2, 0, emdLayer);
        } else {
            $.each(wmsLayerArray, function (idx, val) {
                if (val != undefined && val.get('title') === 'emdLayer') {
                    wmsLayerArray.splice(idx, 1);
                }
            })
        }
        map.render();
    })

    $("#BOUD00__BOUD00__BOUD03 > ul").find('input').on("change", function () {
        if ($(this).is(":checked")) {
            wmsLayerArray.splice(1, 0, liLayer);
        } else {
            $.each(wmsLayerArray, function (idx, val) {
                if (val != undefined && val.get('title') === 'liLayer') {
                    wmsLayerArray.splice(idx, 1);
                }
            })
        }
        map.render();
    })

    $("#BOUD00__BOUD00__BOUD04 > ul").find('input').on("change", function () {
        if ($(this).is(":checked")) {
            wmsLayerArray.splice(0, 0, lpbnLayer);
        } else {
            $.each(wmsLayerArray, function (idx, val) {
                if (val != undefined && val.get('title') === 'lpbnLayer') {
                    wmsLayerArray.splice(idx, 1);
                }
            })
        }
        map.render();
    })

    $(".expIcon").on('click', function (event) {
        var obj = $(this).parent().parent().parent();
        var value = $(obj).attr('id');
        var grp = value.split(connString)[0];
        var pId = value.split(connString)[1];
        var mId = value.split(connString)[2];

        if ($(obj).attr('class').indexOf('off') > -1) {
            // 트리 열기
            $(this).attr('src', expandedIcon);
            fn_showChildNode(obj, connString, grp, mId);

            // set default checked for 시군구,읍면동,리,지적 layers
            if (findBy(wmsLayerGroup, 'title', 'sigLayer') != undefined) {
                $("#BOUD00__BOUD00__BOUD01 > ul").find('input').prop("checked", true);
            } else {
                $("#BOUD00__BOUD00__BOUD01 > ul").find('input').prop("checked", false);
            }

            if (findBy(wmsLayerGroup, 'title', 'emdLayer') != undefined) {
                $("#BOUD00__BOUD00__BOUD02 > ul").find('input').prop("checked", true);
            } else {
                $("#BOUD00__BOUD00__BOUD02 > ul").find('input').prop("checked", false);
            }

            if (findBy(wmsLayerGroup, 'title', 'liLayer') != undefined) {
                $("#BOUD00__BOUD00__BOUD03 > ul").find('input').prop("checked", true);
            } else {
                $("#BOUD00__BOUD00__BOUD03 > ul").find('input').prop("checked", false);
            }

            if (findBy(wmsLayerGroup, 'title', 'lpbnLayer') != undefined) {
                $("#BOUD00__BOUD00__BOUD04 > ul").find('input').prop("checked", true);
            } else {
                $("#BOUD00__BOUD00__BOUD04 > ul").find('input').prop("checked", false);
            }

            $("#BOUD00__BOUD00__BOUD01 > ul").find('input').on("change", function () {
                if ($(this).is(":checked")) {
                    wmsLayerArray.splice(3, 0, sigLayer);
                } else {
                    $.each(wmsLayerArray, function (idx, val) {
                        if (val != undefined && val.get('title') === 'sigLayer') {
                            wmsLayerArray.splice(idx, 1);
                        }
                    })
                }
                map.render();
            })

            $("#BOUD00__BOUD00__BOUD02 > ul").find('input').on("change", function () {
                if ($(this).is(":checked")) {
                    wmsLayerArray.splice(2, 0, emdLayer);
                } else {
                    $.each(wmsLayerArray, function (idx, val) {
                        if (val != undefined && val.get('title') === 'emdLayer') {
                            wmsLayerArray.splice(idx, 1);
                        }
                    })
                }
                map.render();
            })

            $("#BOUD00__BOUD00__BOUD03 > ul").find('input').on("change", function () {
                if ($(this).is(":checked")) {
                    wmsLayerArray.splice(1, 0, liLayer);
                } else {
                    $.each(wmsLayerArray, function (idx, val) {
                        if (val != undefined && val.get('title') === 'liLayer') {
                            wmsLayerArray.splice(idx, 1);
                        }
                    })
                }
                map.render();
            })

            $("#BOUD00__BOUD00__BOUD04 > ul").find('input').on("change", function () {
                if ($(this).is(":checked")) {
                    wmsLayerArray.splice(0, 0, lpbnLayer);
                } else {
                    $.each(wmsLayerArray, function (idx, val) {
                        if (val != undefined && val.get('title') === 'lpbnLayer') {
                            wmsLayerArray.splice(idx, 1);
                        }
                    })
                }
                map.render();
            })
        } else {
            // 트리 닫기
            $(this).attr('src', collapsedIcon);
            fn_hideChildNode(obj, connString, grp, mId);
        }
    });

}


//코드트리 보여주기
function fn_showChildNode(obj, connString, grp, mId) {
    $(obj).removeClass("off");
    $(obj).addClass("on");
    $(obj).parent().children('[id*=' + grp + connString + mId + connString + ']').not(obj).show();
    $(obj).parent().children('[id*=' + grp + connString + mId + connString + ']').not(obj).each(function (idx, val) {
        var value = $(val).attr('id');
        var connString = '__';
        var grp = value.split(connString)[0];
        var pId = value.split(connString)[1];
        var mId = value.split(connString)[2];
        if (!$(val).hasClass('off')) {
            $(val).parent().children('[id*=' + grp + connString + mId + connString + ']').not(obj).show();
        }

    });

}

// 코드트리 숨기기
function fn_hideChildNode(obj, connString, grp, mId) {
    $(obj).removeClass("on");
    $(obj).addClass("off");
    $(obj).find('#plusBtn').attr('src', '-');
    $(obj).parent().children('[id*=' + grp + connString + mId + connString + ']').not(obj).hide();
    $(obj).parent().children('[id*=' + grp + connString + mId + connString + ']').not(obj).each(function (idx, val) {
        var value = $(val).attr('id');
        var connString = '__';
        var grp = value.split(connString)[0];
        var pId = value.split(connString)[1];
        var mId = value.split(connString)[2];
        $(val).parent().children('[id*=' + grp + connString + mId + connString + ']').not(obj).hide();
        //fn_hideChildNode(val, connString, grp, mId);
    });
}

function displayRecentPoint(filename, obj) {

    var map = $("#map").data('map')
    var crsCode = $(obj).attr('data-epsg');
    var sb = new StringBuilder();


    var querydata = {
        airfilenam: filename
    }

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectRecentPoints.do',
        type: "POST",
        dataType: "json",
        data: querydata,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {

            $('.loadingWrap').hide();

            var format = new ol.format.WKT();
            var result = resData.rList;
            var features = [];
            var featuresCoord = [];

            if (result == '' && result == null) {
                alert("데이터 없음");
                return false;
            }

            clearRecentPoints();

            // show the list of points at the side bar
            $.each(result, function (idx, val) {
                // console.log(val);

                sb.Append('<div class="pointInfo_area" style="color:#FFFFFF; position:relative; top:30px; ">' + val.corse + ' - ' + val.corseNum + '</div>');

                var geom = val.geom;
                feature = format.readFeature(geom);
                feature.getGeometry().transform('EPSG:5187', crsCode);
                feature.setStyle(mainPointStyle[mainPointStyleKeys[8]]);
                feature.setId(val.airfilenam + '-' + val.disparity + '-' + val.corse + '-' + val.corseNum);
                features.push(feature);
                featuresCoord.push(feature.getGeometry().getCoordinates());
                moveToPoint(val.centerX, val.centerY, obj);
            });

            // parse String builder into HTML element
            var mainPointInfoEmt = $.parseHTML(sb.ToString());

            // create overlay object for point Info
            for (var i = 0; i < mainPointInfoEmt.length; i++) {
                mainPointInfo = new ol.Overlay({
                    id: 'recentPointInfo',
                    element: mainPointInfoEmt[i],
                    positioning: 'bottom-center',
                    stopEvent: false,
                    insertFirst: true
                });
                overlayObj.mainPointInfoArr.push(mainPointInfo);

                // set coordinate for overlay
                mainPointInfo.setPosition(featuresCoord[i]);

                // add mainpoint overlay to map
                map.addOverlay(mainPointInfo);
            }

            // show points on the map
            recentPointsVectorSource = new ol.source.Vector({
                projection: projection_vworld,
                features: features
            });
            recentPointsVectorLayer = new ol.layer.Vector({
                name: "recentPointLayer",
                source: recentPointsVectorSource,
                zIndex: 100,
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 5,
                        fill: new ol.style.Fill({
                            color: "rgba(255, 255, 255, 0.5)"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "#FF0000",
                            width: 1
                        })
                    })
                })
            });
            map.getLayers().insertAt(100, recentPointsVectorLayer);
            mainPointFeatures = features;
        }
    });


}

function callRecentSearch() {

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectRecentSearch.do',
        type: "POST",
        dataType: "json",
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            $('.loadingWrap').hide();

            var result = resData.rList;
            // console.log(result);

            var sb = new StringBuilder();

            sb.Append('<h2 class="dragArea" style="cursor:move;">최근검색 <span onclick="closeRecentSearch();" id="recentSrcCloseBtn" style="cursor:pointer;">X</span></h2>');
            sb.Append('<ul>');

            $.each(result, function (idx, val) {
                var dispType = val.disparity;
                var dispText;
                if(dispType == 'p'){
                    dispText = '낱장 - '
                }else if (dispType == 'g'){
                    dispText = '경남 - '
                }else{
                    dispText = val.disparity + '회차 - '
                }

                sb.Append('<li value="' + val.airfilenam + '" style="cursor:pointer;">' +
                    '<span data-epsg= "' + currentCRS + '" onclick="displayRecentPoint(' + '\'' + val.airfilenam + '\'' + ',this);">' + val.airYear + '년 - ' + dispText + val.corse + '코스 - ' + val.corseNum + '</span>' +
                    '<button class="sbtn_view" style="margin-top: 4px" onclick="openImage(' + '\'' + val.airfilenam + '\'' + ',' + '\'' + val.disparity + '\'' + ',' + '\'' + val.corse + '\'' + ',' + '\'' + val.corseNum + '\'' + ');">사진보기</button></li>');

            });

            sb.Append('</ul>');

            $("#recentSrc_area").html(sb.ToString());
            $("#recentSrc_area").show();

        }
    });

}


function closeRecentSearch() {
    $("#recentSrc_area").hide();
    $("#recentSrc_area").html("");
}

function closeMemo(num) {
    var map = $("#map").data('map');
    var overlay = map.getOverlayById(num);
    map.removeOverlay(overlay);
    return false;
}

//메타 검색
function pointSearch(currentCRS) {
    var years = $("#yearSelectorMeta").val();
    var corseVal = $("#corse").val();
    var corseNumVal = $("#corse_num").val();
    var map = $("#map").data('map');
    var sb = new StringBuilder();
    var sb2 = new StringBuilder();
    var sb3 = new StringBuilder();
    var singleYear,singleDisp,yearsArr = [],dispArr = [];

    for(var i = 0; i<years.length; i++){
        singleYear = years[i].split("-")[0];
        singleDisp = years[i].split("-")[1];
        yearsArr.push(singleYear);
        dispArr.push(singleDisp);
    }

    // validation check for year selector
    if (years.length === 0) {
        alert("년도는 필수입니다.");
        return false;
    }
    if (corseVal === null || corseVal === '') {
        alert("코스는 필수 입니다.");
        $("#corse").focus();
        return false;
    }

    var querydata = {
        'years': years,
        'corse': corseVal,
        'corseNum': corseNumVal
    };

    $.ajax({
        url: gp.ctxPath + '/aeroGis/searchPointsByCorse.do',
        type: "POST",
        dataType: "json",
        data: querydata,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            $('.loadingWrap').hide();

            var format = new ol.format.WKT();
            var result = resData.rList;
            var totCount = resData.totCnt;
            var features = [];
            var featureCoordArr = [];

            // show the list of points at the side bar
            if (result.length > 0 && totCount.length > 0) {

                sb3.Append('<p class="mb5 fr" id="geometrySearchBtnArea" style="position:absolute; top:300px; left: 10px;">');
                sb3.Append('<a class="btn_lineS_Black mr5" id="metaMainPointDownloadAllJpeg" data-image = "jpg" onclick="downloadAllPoint(this);" name="metaMainPointDownloadAllJpeg"  >JPEG 다운로드</a>');
                sb3.Append('<a class="btn_lineS_Black mr5" id="metaMainPointDownloadAll" data-image = "tif" onclick="downloadAllPoint(this);" name="metaMainPointDownloadAll"  >TIF 다운로드</a>');
                sb3.Append('<a class="btn_lineS_Red mr5" id="metaMainPointUncheckAll" onclick="uncheckAllPoint();" name="metaMainPointUncheckAll" >전체해제</a>');
                sb3.Append('<a class="btn_lineS_Blue mr5" id="metaMainPointCheckAll" onclick="checkAllPoint();" name="metaMainPointCheckAll" >전체선택</a>');
                sb3.Append('</p>');


                for (var i = 0; i < years.length; i++) {
                    for (var j = 0; j < totCount.length; j++) {
                        if (totCount[j].yeardisp === years[i]) {
                            var colidx = i + 1;

                            var dispType;
                            if(dispArr[i] == 'p') {
                                dispType = '낱장';
                            }else if(dispArr[i] == 'g'){
                                dispType = '경남'
                            }else if (dispArr[i] == '1'){
                                dispType = '1회차'
                            }else {
                                dispType = '2회차'
                            }

                            sb.Append('<li><input style="position:relative; float:left; top : 15px; left: 10px; z-index:10" type="checkbox" class= "headerCheck" id="' +years[i]+ '" onclick="partCheck(this)"/><a href="#" style="padding-left:22px"><span class="color' + colidx + '"></span><span>' + yearsArr[i] + '년 -' + dispType + ' (' + totCount[j].totcnt + ' 건)</span><span id="totCnt"></span><span class="i"></span></a>');
                            sb.Append('<ul style="display:block;">');
                        }
                    }
                    $.each(result, function (idx, val) {
                        // console.log(val);
                        if ($.inArray(val.yeardisp, years) > -1) {
                            if (val.yeardisp === years[i]) {

                                // make pointInfo element
                                sb2.Append('<div id="pointInfo_area">' + val.corse + ' - ' + val.corseNum + '</div>');

                                var geom = val.geom;
                                var dispType = val.disparity;
                                var feature = format.readFeature(geom);
                                feature.getGeometry().transform('EPSG:5186', currentCRS);
                                if (dispType == '1') {
                                    feature.setStyle(mainPointStyle[mainPointStyleKeys[i]]);
                                } else {
                                    feature.setStyle(mainPointStyle2[mainPointStyleKeys2[i]]);
                                }
                                feature.setId(val.airfilenam + '-' + val.disparity + '-' + val.corse + '-' + val.corseNum);
                                features.push(feature);
                                var featureCoord = feature.getGeometry().getCoordinates();
                                featureCoordArr.push(featureCoord);

                                sb.Append('<li>');
                                sb.Append('<a href="#"><input class="'+years[i]+'" type="checkbox" name="mainPointCheck" value="'+val.airfilenam+'"/>');
                                sb.Append('<span class="pointResults" data-epsg="' + currentCRS + '" onclick="moveToPoint(' + val.centerX + ',' + val.centerY + ',this)">');

                                if (dispType == 'p'){
                                    sb.Append('낱장 - ' + val.corse + '코스 -' + val.corseNum + '(축척:1/' + numberWithCommas(val.reducedsca) + ')');
                                }else if (dispType == 'g'){
                                    sb.Append('경남 - ' + val.corse + '코스 -' + val.corseNum + '');
                                }else{
                                    sb.Append('' + val.disparity + '회차 - ' + val.corse + '코스 -' + val.corseNum + '');
                                }

                                sb.Append('</span>');
                                sb.Append('<button class="sbtn_view" onclick="openImage(' + '\'' + val.airfilenam + '\'' + ',' + '\'' + val.disparity + '\'' + ',' + '\'' + val.corse + '\'' + ',' + '\'' + val.corseNum + '\'' + ')">사진보기</button></a>');
                                sb.Append('</li>');
                            }
                        } else {
                            sb.Append('<li>');
                            sb.Append('<span>데이터가 존재하지 않습니다.</span>');
                            sb.Append('</li>');
                        }

                    });
                    sb.Append('</ul>');
                    sb.Append('</li>');
                }
            }
            else {
                sb.Append('<li>');
                sb.Append('<span>데이터가 존재하지 않습니다.</span>');
                sb.Append('</li>');
            }

            $("#resultPanel").before(sb3.ToString());
            $("#metaResultList").html(sb.ToString());
            $("#metaResultList > li:first-child > ul").children().addClass("active");

            // parse String builder into HTML element
            var pointInfoEmt = $.parseHTML(sb2.ToString());

            // create overlay object for point Info
            for (var i = 0; i < pointInfoEmt.length; i++) {
                pointInfo = new ol.Overlay({
                    id: 'pointInfo',
                    element: pointInfoEmt[i],
                    positioning: 'bottom-center',
                    stopEvent: false,
                    insertFirst: true
                });
                overlayObj.pointInfoArr.push(pointInfo);

                // set coordinate for memo
                pointInfo.setPosition(featureCoordArr[i]);

                // add memo overlay to map
//                map.addOverlay(pointInfo);
            }

            // Side Menu accordion script -------start
            var menu_v = $('div.menu_v');
            var sItem = menu_v.find('>ul>li');
            var ssItem = menu_v.find('>ul>li>ul>li');
            var lastEvent = null;

            sItem.find('>ul').css('display', 'none');
            menu_v.find('>ul>li>ul>li[class=active]').parents('li').attr('class', 'active');
            menu_v.find('>ul>li[class=active]').find('>ul').css('display', 'block');

            function menu_vToggle(event) {
                var t = $(this);

                if (this == lastEvent) return false;
                lastEvent = this;
                setTimeout(function () {
                    lastEvent = null
                }, 200);

                if (t.next('ul').is(':hidden')) {
//                    sItem.find('>ul').slideUp(100);
                    t.next('ul').slideDown(100);
                } else if (!t.next('ul').length) {
//                    sItem.find('>ul').slideUp(100);
                } else {
                    t.next('ul').slideUp(100);
                }

                if (t.parent('li').hasClass('active')) {
                    t.parent('li').removeClass('active');
                } else {
                    sItem.removeClass('active');
                    t.parent('li').addClass('active');
                }
            }

            sItem.find('>a').click(menu_vToggle).focus(menu_vToggle);

            function subMenuActive() {
                ssItem.removeClass('active');
                $(this).parent(ssItem).addClass('active');
            };
            ssItem.find('>a').click(subMenuActive).focus(subMenuActive);

            //icon
            menu_v.find('>ul>li>ul').prev('a').append('<span class="i"></span>');
            // Side Menu accordion script -------end (consider making common js file for this?)

            // show points on the map
            vectorPointSource = new ol.source.Vector({
                projection: projection_vworld,
                features: features
            });
            vectorPointLayer = new ol.layer.Vector({
                name: "pointLayer",
                source: vectorPointSource,
                zIndex: 100
            });

            map.getLayers().insertAt(100, vectorPointLayer);
//            mainPointFeatures = features;
        }
    });


}

function requestData(url, param, method, dataType, contentType, noShowLoading, noContext) {
    // if (noShowLoading) this.showLoading(true);
    if (typeof method == "undefined" || method == "") {
        method = "POST";
    }
    if (typeof contentType == "undefined" || contentType == "") {
        contentType = "application/x-www-form-urlencoded; charset=UTF-8";
    }

    var deferred = $.Deferred();
    /*if (MapPlatform.StringUtils.startsWith(url, "http://")) {
        url = MapPlatform.Config.getProxy() + url;
    } else if (!noContext) {
        url = MapPlatform.Config.getContextPath() + url;
    }*/

    $.ajax({
        type: method,
        url: url,
        data: param,
        dataType: dataType,
        // global : noShowLoading,
        contentType: contentType,
    }).done(function (result) {
        // if (!noShowLoading) this.showLoading(false);
        if (typeof result === "string") {
            result = JSON.parse(result);
        }
        deferred.resolve(result);
    }.bind(this)).fail(function (result) {
        // if (!noShowLoading) this.showLoading(false);
        console.error("[Http.requestData] err.", param, result);
        deferred.reject(result);
    }.bind(this));
    return deferred.promise();
};

var sgg_code, emd_code;
// var url = gp.ctxPath + '/proxy/proxy.jsp?url=' + gp.geoUrl + '/wfs';

var url = gp.geoUrl + '/wfs';

function loadSGG() {

    var param = {
        SERVICE: 'WFS',
        VERSION: '1.1.0',
        REQUEST: 'GETFEATURE',
        TYPENAME: 'tl_scco_sig',
        PROPERTYNAME: 'sig_kor_nm,sig_cd',
        OUTPUTFORMAT: 'application/json',
    }

    var select = $('#top_sgg');
    var selectChange = $('#top_sgg_change');

    requestData(url, param, 'GET', 'json', "", false).done(function (result) {
        var features = result.features;
        var list = [];
        for (var i = 0; i < features.length; i++) {
            var address = features[i].properties['sig_kor_nm'];
            var pnu_no = features[i].properties['sig_cd'];
            list.push({
                address: address,
                pnu_no: pnu_no
            });
        }
        list = list.sort(function (a, b) {
            return a.address.localeCompare(b.address);
        });
        $(select).empty();
        for (var i = 0; i < list.length; i++) {
            $(select).append(new Option(list[i].address, list[i].pnu_no));
        }
        $(select).val(sgg_code);

        $(selectChange).empty();
        for (var i = 0; i < list.length; i++) {
            $(selectChange).append(new Option(list[i].address, list[i].pnu_no));
        }
        $(selectChange).val(sgg_code);
    })

}

function setSggByCenter(currentCRS) {
    var map = $("#map").data('map');
    var center;
    center = map.getView().getCenter();
    var transProjCenter = ol.proj.transform(center, currentCRS, 'EPSG:5187');

    var xml = "";
    xml += '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<wfs:GetFeature service="WFS"';
    xml += ' version="1.1.0"';
    xml += ' maxFeatures="10"';
    xml += ' outputFormat="application/json"';
    xml += ' xmlns:wfs="http://www.opengis.net/wfs"';
    xml += ' xmlns:ogc="http://www.opengis.net/ogc"';
    xml += ' xmlns:gml="http://www.opengis.net/gml"';
    xml += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
    xml += ' xsi:schemaLocation="http://www.opengis.net/wfs ../wfs/1.1.0/WFS.xsd">';
    xml += '<wfs:Query typeName="gj:tl_scco_sig">';
    xml += '<wfs:PropertyName>sig_kor_nm</wfs:PropertyName>';
    xml += '<wfs:PropertyName>sig_cd</wfs:PropertyName>';
    xml += '<ogc:Filter><ogc:Contains>';
    xml += '<ogc:PropertyName>geom</ogc:PropertyName>';
    xml += '<gml:Point><gml:pos>' + transProjCenter[1] + " " + transProjCenter[0] + '</gml:pos></gml:Point>';
    xml += '</ogc:Contains></ogc:Filter></wfs:Query></wfs:GetFeature>';

    requestData(url, xml, "POST", "json", "text/xml", false).done(function (result) {
        if (result.features.length == 0) {
            return;
        }
        var response = result.features[0].properties;

        var address = response.sig_kor_nm;
        var pnu_no = response.sig_cd;
        $("#top_sgg").siblings("label").text(address);
        $("#top_sgg").val(pnu_no);
        sgg_code = pnu_no;
        var trimPnuNo = pnu_no.toString().substr(0, 5);
        loadEMD(trimPnuNo);
    })
}

function setSggByCenter2(currentCRS) {
    var map = $("#map1").data('map');
    var center = map.getView().getCenter();
    var transProjCenter = ol.proj.transform(center, currentCRS, 'EPSG:5187');

    var xml = "";
    xml += '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<wfs:GetFeature service="WFS"';
    xml += ' version="1.1.0"';
    xml += ' maxFeatures="10"';
    xml += ' outputFormat="application/json"';
    xml += ' xmlns:wfs="http://www.opengis.net/wfs"';
    xml += ' xmlns:ogc="http://www.opengis.net/ogc"';
    xml += ' xmlns:gml="http://www.opengis.net/gml"';
    xml += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
    xml += ' xsi:schemaLocation="http://www.opengis.net/wfs ../wfs/1.1.0/WFS.xsd">';
    xml += '<wfs:Query typeName="gj:tl_scco_sig">';
    xml += '<wfs:PropertyName>sig_kor_nm</wfs:PropertyName>';
    xml += '<wfs:PropertyName>sig_cd</wfs:PropertyName>';
    xml += '<ogc:Filter><ogc:Contains>';
    xml += '<ogc:PropertyName>geom</ogc:PropertyName>';
    xml += '<gml:Point><gml:pos>' + transProjCenter[1] + " " + transProjCenter[0] + '</gml:pos></gml:Point>';
    xml += '</ogc:Contains></ogc:Filter></wfs:Query></wfs:GetFeature>';

    requestData(url, xml, "POST", "json", "text/xml", false).done(function (result) {
        if (result.features.length == 0) {
            return;
        }
        var response = result.features[0].properties;

        var address = response.sig_kor_nm;
        var pnu_no = response.sig_cd;
        $("#top_sgg_change").siblings("label").eq(1).text(address);
        $("#top_sgg_change").val(pnu_no);
        sgg_code = pnu_no;
        var trimPnuNo = pnu_no.toString().substr(0, 5);
        loadEMD(trimPnuNo);
    })
}

function setCenterBySgg(map, code, currentCRS) {
    var cql = "sig_cd like '" + code + "%'";

    var param = {
        SERVICE: 'WFS',
        VERSION: '1.1.0',
        REQUEST: 'GETFEATURE',
        TYPENAME: 'gj_sgg',
        PROPERTYNAME: 'geom',
        OUTPUTFORMAT: 'application/json',
        CQL_FILTER: cql
    }

    var select = $('#top_sgg');

    requestData(url, param, 'GET', 'json', "", true).done(function (result) {
        var features = result.features[0];
        var format = new ol.format.GeoJSON();

        var feature = format.readFeature(features);
        feature.getGeometry().transform("EPSG:5186", currentCRS);
        var extent = feature.getGeometry();
        map.getView().fit(extent, map.getSize());
        /*map.addUserFeature("ADDR_LOC", feature);
        setTimeout(function() {
            MapPlatform.Manager.map.removeUserFeatures("ADDR_LOC");
        }, 1000);*/
    })

}

function loadEMD(code) {
    var cql = "emd_cd like '" + code + "%'";

    var param = {
        SERVICE: 'WFS',
        VERSION: '1.1.0',
        REQUEST: 'GETFEATURE',
        TYPENAME: 'tl_scco_emd',
        PROPERTYNAME: 'emd_kor_nm,emd_cd',
        OUTPUTFORMAT: 'application/json',
        CQL_FILTER: cql
    }

    var select = $('#top_emd');
    var selectChange = $('#top_emd_change');

    requestData(url, param, 'GET', 'json', "", false).done(function (result) {
        var features = result.features;
        var list = [];
        for (var i = 0; i < features.length; i++) {
            var address = features[i].properties['emd_kor_nm'];
            var pnu_no = features[i].properties['emd_cd'];
            list.push({
                address: address,
                pnu_no: pnu_no
            });
        }
        list = list.sort(function (a, b) {
            return a.address.localeCompare(b.address);
        });
        $(select).empty();
        for (var i = 0; i < list.length; i++) {
            $(select).append(new Option(list[i].address, list[i].pnu_no));
        }
        $(select).val(emd_code);

        $(selectChange).empty();
        for (var i = 0; i < list.length; i++) {
            $(selectChange).append(new Option(list[i].address, list[i].pnu_no));
        }
        $(selectChange).val(emd_code);
    })
}

function setEmdByCenter(currentCRS) {
    var map = $("#map").data('map');
    var center = map.getView().getCenter();
    var transProjCenter = ol.proj.transform(center, currentCRS, 'EPSG:5187');

    var xml = "";
    xml += '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<wfs:GetFeature service="WFS"';
    xml += ' version="1.1.0"';
    xml += ' maxFeatures="10"';
    xml += ' outputFormat="application/json"';
    xml += ' xmlns:wfs="http://www.opengis.net/wfs"';
    xml += ' xmlns:ogc="http://www.opengis.net/ogc"';
    xml += ' xmlns:gml="http://www.opengis.net/gml"';
    xml += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
    xml += ' xsi:schemaLocation="http://www.opengis.net/wfs ../wfs/1.1.0/WFS.xsd">';
    xml += '<wfs:Query typeName="gj:gj_emd1">';
    xml += '<wfs:PropertyName>bjd_nam</wfs:PropertyName>';
    xml += '<wfs:PropertyName>bjd_cde</wfs:PropertyName>';
    xml += '<ogc:Filter><ogc:Contains>';
    xml += '<ogc:PropertyName>geom</ogc:PropertyName>';
    xml += '<gml:Point><gml:pos>' + transProjCenter[1] + " " + transProjCenter[0] + '</gml:pos></gml:Point>';
    xml += '</ogc:Contains></ogc:Filter></wfs:Query></wfs:GetFeature>';

    requestData(url, xml, "POST", "json", "text/xml", false).done(function (result) {

        if (result.features.length == 0) {
            return;
        }
        var response = result.features[0].properties;

        var address = response.emd_nm;
        var pnu_no = response.emd_cd;
        $("#top_emd").siblings("label").text(address);
        $("#top_emd").val(pnu_no);
        emd_code = pnu_no;

    })
}

function setEmdByCenter2(currentCRS) {
    var map = $("#map1").data('map');
    var center = map.getView().getCenter();
    var transProjCenter = ol.proj.transform(center, currentCRS, 'EPSG:5187');

    var xml = "";
    xml += '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<wfs:GetFeature service="WFS"';
    xml += ' version="1.1.0"';
    xml += ' maxFeatures="10"';
    xml += ' outputFormat="application/json"';
    xml += ' xmlns:wfs="http://www.opengis.net/wfs"';
    xml += ' xmlns:ogc="http://www.opengis.net/ogc"';
    xml += ' xmlns:gml="http://www.opengis.net/gml"';
    xml += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
    xml += ' xsi:schemaLocation="http://www.opengis.net/wfs ../wfs/1.1.0/WFS.xsd">';
    xml += '<wfs:Query typeName="gj:gj_emd1">';
    xml += '<wfs:PropertyName>bjd_nam</wfs:PropertyName>';
    xml += '<wfs:PropertyName>bjd_cde</wfs:PropertyName>';
    xml += '<ogc:Filter><ogc:Contains>';
    xml += '<ogc:PropertyName>geom</ogc:PropertyName>';
    xml += '<gml:Point><gml:pos>' + transProjCenter[1] + " " + transProjCenter[0] + '</gml:pos></gml:Point>';
    xml += '</ogc:Contains></ogc:Filter></wfs:Query></wfs:GetFeature>';

    requestData(url, xml, "POST", "json", "text/xml", false).done(function (result) {

        if (result.features.length == 0) {
            return;
        }
        var response = result.features[0].properties;

        var address = response.emd_nm;
        var pnu_no = response.emd_cd;
        $("#top_emd_change").siblings("label").eq(1).text(address);
        $("#top_emd_change").val(pnu_no);
        emd_code = pnu_no;

    })
}

function setCenterByEmd(map, code, currentCRS) {
    var cql = "bjd_cde LIKE '" + code + "%'";

    var param = {
        SERVICE: 'WFS',
        VERSION: '1.1.0',
        REQUEST: 'GETFEATURE',
        TYPENAME: 'gj_emd1',
        PROPERTYNAME: 'geom',
        OUTPUTFORMAT: 'application/json',
        CQL_FILTER: cql
    }

    var select = $('#top_sgg');

    requestData(url, param, 'GET', 'json', "", true).done(function (result) {
        var features = result.features[0];

        var format = new ol.format.GeoJSON();
        var feature = format.readFeature(features);
        feature.getGeometry().transform("EPSG:5186", currentCRS);
        var extent = feature.getGeometry();
        map.getView().fit(extent, map.getSize());
        /*map.addUserFeature("ADDR_LOC", feature);
        setTimeout(function() {
            MapPlatform.Manager.map.removeUserFeatures("ADDR_LOC");
        }, 1000);*/
    })

}

function displayMainPoint(year, disparity, currentCRS, colorCode) {
    var map = $("#map").data('map');
    var trimColorCode = colorCode.substr(5, 2);
    var sb = new StringBuilder();

    var querydata = {
        mainYear: year,
        disparity: disparity
    };

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectMainPoints.do',
        type: "POST",
        dataType: "json",
        data: querydata,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {

            $('.loadingWrap').hide();

            var format = new ol.format.WKT();
            var result = resData.rList;
            var features = [];
            var featuresCoord = [];

            if (result == '' && result == null) {
                alert("데이터 없음");
                return false;
            }

            // show the list of points at the side bar
            $.each(result, function (idx, val) {

                sb.Append('<div class="mainPointInfo_area">' + val.corse + ' - ' + val.corseNum + '</div>');

                var geom = val.geom;
                feature = format.readFeature(geom);
                feature.getGeometry().transform('EPSG:5187', currentCRS);
                feature.setStyle(mainPointStyle[mainPointStyleKeys[trimColorCode - 1]]);
                feature.setId(val.airfilenam + '-' + val.disparity + '-' + val.corse + '-' + val.corseNum);
                features.push(feature);
                featuresCoord.push(feature.getGeometry().getCoordinates());
            });

            // parse String builder into HTML element
            var mainPointInfoEmt = $.parseHTML(sb.ToString());

            // create overlay object for point Info
            for (var i = 0; i < mainPointInfoEmt.length; i++) {
                mainPointInfo = new ol.Overlay({
                    id: 'mainPointInfo',
                    element: mainPointInfoEmt[i],
                    positioning: 'bottom-center',
                    stopEvent: false,
                    insertFirst: true
                });
                overlayObj.mainPointInfoArr.push(mainPointInfo);

                // set coordinate for overlay
                mainPointInfo.setPosition(featuresCoord[i]);

                // add mainpoint overlay to map
                // map.addOverlay(mainPointInfo);
            }

            // show points on the map
            mainPointsVectorSource = new ol.source.Vector({
                projection: projection_vworld,
                features: features
            });
            mainPointsVectorLayer = new ol.layer.Vector({
                name: "mainPointLayer_" + year + "_" + disparity,
                source: mainPointsVectorSource,
                zIndex: 100,
            });
            map.getLayers().insertAt(100, mainPointsVectorLayer);
            mainPointFeatures = features;
        }
    });
}

function displayMainPoint1(year, disparity, reducedsca, currentCRS, colorCode) {
    var map = $("#map").data('map');
    var trimColorCode = colorCode.substr(5, 2);
    var sb = new StringBuilder();

    var querydata = {
        mainYear: year,
        disparity: disparity,
        reducedsca: reducedsca
    };

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectMainPoints.do',
        type: "POST",
        dataType: "json",
        data: querydata,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            $('.loadingWrap').hide();

            var format = new ol.format.WKT();
            var result = resData.rList;
            var features = [];
            var featuresCoord = [];

            if (result == '' && result == null) {
                alert("데이터 없음");
                return false;
            }

            var layerArr = map.getLayers().getArray();
            for (var i = 0; i < layerArr.length; i++) {
                if (layerArr[i] instanceof ol.layer.Vector) {
                    var title = 'mainPointLayer';
                    var deletedLayer = findBy(layerArr[i], 'title', title);
                    map.removeLayer(deletedLayer);
                }
            }

            // show the list of points at the side bar
            $.each(result, function (idx, val) {

                sb.Append('<div class="mainPointInfo_area">' + val.corse + ' - ' + val.corseNum + '</div>');

                var geom = val.geom;
                feature = format.readFeature(geom);
                feature.getGeometry().transform('EPSG:5186', currentCRS);
                feature.setStyle(mainPointStyle[mainPointStyleKeys[trimColorCode - 1]]);
                feature.setId(val.airfilenam + '-' + val.disparity + '-' + val.corse + '-' + val.corseNum);
                features.push(feature);
                featuresCoord.push(feature.getGeometry().getCoordinates());
            });

            // parse String builder into HTML element
            var mainPointInfoEmt = $.parseHTML(sb.ToString());

            // create overlay object for point Info
            for (var i = 0; i < mainPointInfoEmt.length; i++) {
                mainPointInfo = new ol.Overlay({
                    id: 'mainPointInfo',
                    element: mainPointInfoEmt[i],
                    positioning: 'bottom-center',
                    stopEvent: false,
                    insertFirst: true
                });
                overlayObj.mainPointInfoArr.push(mainPointInfo);

                // set coordinate for overlay
                mainPointInfo.setPosition(featuresCoord[i]);

                // add mainpoint overlay to map
                // map.addOverlay(mainPointInfo);
            }

            // show points on the map
            mainPointsVectorSource.set("projection",projection_vworld);
            mainPointsVectorSource.addFeatures(features);

            /*mainPointsVectorSource = new ol.source.Vector({
                projection: projection_vworld,
                features: features
            });*/
            mainPointsVectorSource.refresh();
            mainPointsVectorLayer.set("name","mainPointLayer_"+ year + "_" + disparity);
            mainPointsVectorLayer.setSource(mainPointsVectorSource);
            mainPointsVectorLayer.setZIndex(100);
            /*mainPointsVectorLayer = new ol.layer.Vector({
                name: "mainPointLayer_" + year + "_" + disparity,
                source: mainPointsVectorSource,
                zIndex: 100,
            });*/

            map.getLayers().insertAt(100, mainPointsVectorLayer);
            mainPointFeatures = features;
        }
    });
}

var wfs = {};

function displayMainPointLayer(year, disparity, reducedsca, currentCRS, colorCode) {
    var map = $("#map").data('map');
    var geoJsonFormat = new ol.format.GeoJSON();
    var trimColorCode = colorCode.substr(5, 2);
    lyrName = 'gj_point_'+year+"_"+disparity;
    // set Tile Layer for scale 1:5000
    // mainPointsVectorLayer = new ol.layer.Vector({
    wfs["mainPointLayer_"+year+"_"+disparity] = new ol.layer.Vector({
//	    title: lyrName,
        visible: true,
        name : "mainPointLayer_"+year+"_"+disparity,
        type: 'wfs',
        zIndex: wmsLayerIndex,
        source: new ol.source.Vector({
            loader: function(extent, resolution, projection) {
                currentCRS = map.getView().getProjection().getCode();
                wfs["mainPointLayer_"+year+"_"+disparity].getSource().clear(true);
                extent = ol.proj.transformExtent(extent, currentCRS, "EPSG:5186");

                $.ajax({
                    url: gp.geoUrl + '/wfs',
                    dataType : "json",
                    data :{
                        request: "GetFeature",
                        version: "1.0.0",
                        typename: 'gj:gj_point_'+year+"_"+disparity,
                        outputFormat: "application/json",
                        bbox: extent.join(",") + "," + "EPSG:5186",
                    },
                    success:function(response){
                        var fs = geoJsonFormat.readFeatures(response, {
                            dataProjection : "EPSG:5186" ,
                            featureProjection : currentCRS
                        });
                        fs.forEach(function(feature){
                            feature.setId(feature.get("airfilenam") + '-' + feature.get("disparity") + '-' + feature.get("corse") + '-' + feature.get("corse_num"));
                            feature.setStyle(mainPointStyle[mainPointStyleKeys[trimColorCode - 1]]);
                        });
                        wfs["mainPointLayer_"+year+"_"+disparity].getSource().addFeatures(fs);
//							layers.wfs[lyrName].getSource().addFeatures(fs);
                        mainPointFeatures = fs;
                    },
                    error : function(a, b, c){
                        console.log("error : " + lyrName);
                    }
                })
            },
            strategy: ol.loadingstrategy.bbox
        }),
    });
    map.getLayers().insertAt(990, wfs["mainPointLayer_"+year+"_"+disparity]);
}

function countIndex(years) {

    if (years.length > 0) {
        var scale = $("#indexScaleSelector").val();
        var indexAuthor = $("#indexAuthor").val();

        var querydata = {
            years: years,
            scale: scale,
            indexAuthor: indexAuthor
        };

        $.ajax({
            url: gp.ctxPath + '/aeroGis/countIndex.do',
            type: "POST",
            dataType: "json",
            data: querydata,
            beforeSend: function (xhs, status) {
                $('.loadingWrap').show();
            },
            error: function (xhs, status, error) {
                $('.loadingWrap').hide();
                if(xhs.status == 600){
                    alert("세션이 만료되었습니다.");
                    location.href = gp.ctxPath + "/mainPage.do";
                }else{
                    alert('서버와의 통신에 실패했습니다.');
                }
            },
            success: function (resData, textStatus) {
                $("#counterArea").text("");
                var counter = resData.counter[0];
                $.each(counter, function (idx, val) {
                    var counter = val;
                    $("#counterArea").text("총도엽수 (" + counter + " 도엽)");
                })
                $('.loadingWrap').hide();
            }
        })
    } else {
        $("#counterArea").text("총도엽수 (0 도엽)");
    }

}

function displayIndex(year, currentCRS, colorCode) {
    var map = $("#map").data('map');
    var trimColorCode = colorCode.substr(5, 2);
    var scaleVal = $("#indexScaleSelector").val();
    var author = $("#indexAuthor").val();

    var querydata = {
        mainYear: year,
        scale: scaleVal,
        indexAuthor: author
    };

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectIndex.do',
        type: "POST",
        dataType: "json",
        data: querydata,
        // async:false,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            var format = new ol.format.WKT();
            var result = resData.result;
            var features = [];

            if (result == '' && result == null) {
                alert("데이터 없음");
                return false;
            }

            // show index's legend
            $("#pop_legend_result").html("");
            var legendElmtArr = $("input[name=indexCheck]");
            var legend = new StringBuilder();
            legend.Append('<ul>');
            $.each(legendElmtArr, function (idx, val) {
                var check = $(val).prop('checked');
                if (check === true) {
                    var color = $(val).siblings('span')[0].outerHTML;
                    var label = $(val).siblings('label')[0].outerHTML;
                    legend.Append('<li id="' + val.value + '">');
                    legend.Append(color);
                    legend.Append(label);
                    legend.Append('</li>');
                }
            })
            legend.Append('</ul>');
            $("#pop_legend_result").html(legend.ToString());
            $("#pop_legend").show();

            // show index on the map
            $.each(result, function (idx, val) {
                // console.log(val);
                var geom = val.geom;
                feature = format.readFeature(geom);
                feature.getGeometry().transform('EPSG:5183', currentCRS);
                feature.setStyle(digitalMapStyle[digitalMapStyleKeys[trimColorCode - 1]]);
                feature.setId(val.dom + '_' + querydata.mainYear);
                features.push(feature);
            });

            indexVectorSource = new ol.source.Vector({
                projection: projection_vworld,
                features: features
            });
            indexVectorLayer = new ol.layer.Vector({
                name: "indexLayer_" + querydata.mainYear,
                source: indexVectorSource,
                zIndex: 100
            });


            map.getLayers().insertAt(101, indexVectorLayer);
            indexLayerFeatures = features;

            $('.loadingWrap').hide();
        }

    });

    /*stackIndexFeatures(querydata,currentCRS,trimColorCode).done(function(){
        $(".loadingWrap").hide();
    });*/

}

function checkIndexAll() {
    if (!confirm("화면에 표시되는 시간이 10초이상 소요되며\n" +
        "전체 표시 후 지도이동이 매우 느려집니다.\n" +
        "그래도 진행하시겠습니까?")) {
        return false;
    }
    // set map zoom level
    var map = $("#map").data('map');
    map.getView().setZoom(7);

    // check number of checkbox
    var checkBoxArr = $("input[name='indexCheck']");

    // clear all dmapLayer from map and unchecked all checkboxes
    clearIndexAll();

    // show loading screen
    $(".loadingWrap").show();

    for (var i = checkBoxArr.length - 1; i > -1; i--) {
        // check each checkbox one by one
        checkBoxArr.eq(i).prop("checked", true);

        // parameters
        var yearsVal = checkBoxArr.eq(i).val();
        indexYearsArr.push(yearsVal);
        var colorVal = checkBoxArr.eq(i).siblings().eq(0).attr('class');
        var color = $('.' + colorVal).css("backgroundColor");
        var newColorVal;
        var hexColor = rgb2hex(color);
        var trimColorCode = colorVal.substr(5, 2);
        var scaleVal = $("#indexScaleSelector").val();
        var author = $("#indexAuthor").val();
        var lineWidth = $(this).siblings().eq(2).children().eq(1).val();

        var querydata = {
            mainYear: yearsVal,
            scale: scaleVal,
            indexAuthor: author
        };

        // call each color pallete & line width

        if (lineWidth === 0 || lineWidth === '') {
            lineWidth = 3;
        }

        if (checkBoxArr.eq(i).is(":checked")) {
            $("#colorWrap" + yearsVal).show();
            // $("#color_"+yearData).val(hexColor);
            $("#color_" + yearsVal).spectrum({
                color: hexColor,
                showPalette: true,
                showSelectionPalette: true,
                hideAfterPaletteSelect: true,
                clickoutFiresChange: true,
                chooseText: "선택",
                cancelText: "취소",
                palette: [
                    ['#ff0000', '#ff9900', '#33cccc', '#ff00ff', '#9900ff'],
                    ['#3bfff0', '#00ff00', '#6600cc', '#3333ff', '#990099'],
                    ['#990000', '#cc6699', '#6699ff', '#666699', '#000099']
                ],
            });

            // displayIndex(yearsVal, currentCRS, colorCode);

        } else {
            clearIndex(yearsVal);
            $("#colorWrap" + yearsVal).hide();
            $("#lineWidth_" + yearsVal).val("");
        }

        $.ajax({
            url: gp.ctxPath + '/aeroGis/selectIndex.do',
            type: "POST",
            dataType: "json",
            data: querydata,
            async: false,
            beforeSend: function (xhs, status) {
            },
            error: function (xhs, status, error) {
                // $('.loadingWrap').hide();
                if(xhs.status == 600){
                    alert("세션이 만료되었습니다.");
                    location.href = gp.ctxPath + "/mainPage.do";
                }else{
                    alert('서버와의 통신에 실패했습니다.');
                }
            },
            success: function (resData, textStatus) {
                var format = new ol.format.WKT();
                var result = resData.result;
                var features = [];

                if (result == '' && result == null) {
                    alert("데이터 없음");
                    return false;
                }

                // show index's legend
                $("#pop_legend_result").html("");
                var legendElmtArr = $("input[name=indexCheck]");
                var legend = new StringBuilder();
                legend.Append('<ul>');
                $.each(legendElmtArr, function (idx, val) {
                    var check = $(val).prop('checked');
                    if (check === true) {
                        var color = $(val).siblings('span')[0].outerHTML;
                        var label = $(val).siblings('label')[0].outerHTML;
                        legend.Append('<li id="' + val.value + '">');
                        legend.Append(color);
                        legend.Append(label);
                        legend.Append('</li>');
                    }
                })
                legend.Append('</ul>');
                $("#pop_legend_result").html(legend.ToString());
                $("#pop_legend").show();

                // show index on the map
                $.each(result, function (idx, val) {
                    // console.log(val);
                    var geom = val.geom;
                    feature = format.readFeature(geom);
                    feature.getGeometry().transform('EPSG:5183', currentCRS);
                    feature.setStyle(digitalMapStyle[digitalMapStyleKeys[trimColorCode - 1]]);
                    feature.setId(val.dom + '_' + querydata.mainYear);
                    features.push(feature);
                });

                indexVectorSource = new ol.source.Vector({
                    projection: projection_vworld,
                    features: features
                });
                indexVectorLayer = new ol.layer.Vector({
                    name: "indexLayer_" + querydata.mainYear,
                    source: indexVectorSource,
                    zIndex: 100
                });

                map.getLayers().insertAt(101, indexVectorLayer);
                indexLayerFeatures = features;

            }

        });
        // checkBoxArr.eq(i).trigger('click');
        $('.loadingWrap').hide();
    }

    countIndex(indexYearsArr);


    $.each(checkBoxArr, function (idx, val) {
        var $this = $(val);
        var yearsVal = $this.val();
        var colorVal = $this.siblings().eq(0).attr('class');
        var lineWidth = $("#lineWidth_" + yearsVal).val();

        if (lineWidth == "" || lineWidth == 0) {
            lineWidth = 3;
        }

        $("#lineWidth_" + yearsVal).on('keypress', function (e) {
            if (e.keyCode == '13') {
                $("#lineWidthBtn_" + yearsVal).trigger('click');
            }
        })

        $("#color_" + yearsVal).on('change.spectrum', function (e, color) {
            newColorVal = color.toHexString();
            $('.' + colorVal).css("backgroundColor", newColorVal);
            $('.' + colorVal).attr("data-change_flag", 1);
            clearIndex(yearsVal);
            reDrawIndex(yearsVal, currentCRS, newColorVal, lineWidth);
        })
    })


}

function reDrawIndex(year, currentCRS, hexCode, lineWidth) {
    var map = $("#map").data('map');
    var style = new ol.style.Style({
        // fill: new ol.style.Fill({
        //     color: hexCode
        // }),
        stroke: new ol.style.Stroke({
            color: hexCode,
            width: lineWidth
        })
    })

    var scaleVal = $("#indexScaleSelector").val();
    var author = $("#indexAuthor").val();

    var querydata = {
        mainYear: year,
        scale: scaleVal,
        indexAuthor: author
    }
    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectIndex.do',
        type: "POST",
        dataType: "json",
        data: querydata,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            $('.loadingWrap').hide();
            var format = new ol.format.WKT();
            var result = resData.result;
            var features = [];

            if (result == '' && result == null) {
                alert("데이터 없음");
                return false;
            }

            clearIndex(year);
            // show the list of points at the side bar
            $.each(result, function (idx, val) {
                // console.log(val);
                var geom = val.geom;
                feature = format.readFeature(geom);
                feature.getGeometry().transform('EPSG:5183', currentCRS);
                feature.setStyle(style);
                feature.setId(val.dom + '_' + year);
                features.push(feature);
            });

            $("#pop_legend_result").html("");
            var legendElmtArr = $("input[name=indexCheck]");
            var legend = new StringBuilder();
            legend.Append('<ul>');
            $.each(legendElmtArr, function (idx, val) {
                var check = $(val).prop('checked');
                if (check === true) {
                    var color = $(val).siblings('span')[0].outerHTML;
                    var label = $(val).siblings('label')[0].outerHTML;
                    legend.Append('<li id="' + val.value + '">');
                    legend.Append(color);
                    legend.Append(label);
                    legend.Append('</li>');
                }
            })
            legend.Append('</ul>');
            $("#pop_legend_result").html(legend.ToString());
            $("#pop_legend").show();

            // show points on the map
            indexVectorSource = new ol.source.Vector({
                projection: projection_vworld,
                features: features
            });
            indexVectorLayer = new ol.layer.Vector({
                name: "indexLayer_" + year,
                source: indexVectorSource,
                zIndex: 100
            });
            map.getLayers().insertAt(101, indexVectorLayer);
            indexLayerFeatures = features;
        }
    });
}

function addAirPhotoLayers(paramObj, map, view) {

    // 객체로 변경
    var obj = jQuery.parseJSON(paramObj);
    var year = obj.years;
    var crs = obj.disparity;
    var x, y, z, url;

    // removeAirPhotolayers(paramObj,map);

    var _self = this;
    var zRegEx = /\{z\}/g;
    var xRegEx = /\{x\}/g;
    var yRegEx = /\{y\}/g;
    var projection = ol.proj.get('EPSG:5181');

    // The tile size supported by the ArcGIS tile service.
    var tileSize = 256;
    var origin=[-5423200, 6294600];
    //L02-376
    if(year=='2017'||year=='2012')
        origin=[-5423200, 6194600];
    //L02-394
    else if(year=='2001'||year=='2002'||year=='2008'||year=='2000'||year=='1999')
        origin=[-5423200, 6394600];
//    var origin = [-20037508.3427890, -20037508.3427890];
//		    var urlTemplate = "file:///D:/광주 항공사진/cache/"+year+"/Layers/_alllayers/L{z}/R{y}/C{x}.png";
//		    var urlTemplate = "file:///D:/busan/2017/{z}/{y}/{x}.png";

    //yull pc
    // var urlTemplate = "file:///C:/Users/yull/Desktop/2017_1/2017_1/{z}/{y}/{x}.png";

//    var urlTemplate = gp.aeroDataTiles + '/' + year + '/{z}/{y}/{x}.png';
    var urlTemplate = "file:///D:/광주 항공사진/cache/"+year+"/Layers/_alllayers/L{z}/R{y}/C{x}.png";
//    var urlTemplate = 'file:///D:/광주 항공사진/cache/' + year + '/{z}/{y}/{x}.png';

    var test = new ol.layer.Tile({
        // kind : "bs_"+year+"_"+disparity,
        // title : "bs_"+year+"_"+disparity,
        // name: "bs_"+year+"_"+disparity,
        // id :  "bs_"+year+"_"+disparity,
        kind: "gj_" + year,
        title: "gj_" + year,
        name: "gj_" + year,
        id: "gj_" + year,
        opacity: 1,
        source: new ol.source.XYZ({
            tileLoadFunction: function (imageTile, src) {
                $.ajax({
                    type: "post",
                    url: gp.ctxPath + "/aeroGis/TileImageConvert.json",
                    data: "url=" + src,
                    dataType: "json",
//                    cache: false,
//							async : false,
                    success: function (value) {
                        if (value === "" || value === null) {
                            alert("선택하신 항공사진 데이터가 없습니다.");
                            return false;
                        } else {
                            imageTile.getImage().src = value.src;
                        }
                    }
                });
            },
//		              attributions: 'Copyright:© 2013 ESRI, i-cubed, GeoEye',
            maxZoom: 16,
            projection: projection,
            tileSize: tileSize,
            tileGrid: new ol.tilegrid.TileGrid({

                extent : [ 165727.00000019523, 169818.29999650625, 204613.14999997505, 197718.89999695309 ],
//                extent: [13756219.106426602, 3860987.1727408236, 14666125.491133342, 4863840.983842337],
                origin: origin,
                tileSize: 256,
                resolutions : [ 79.37515875031751, 52.916772500211671, 26.458386250105836, 13.229193125052918, 5.2916772500211673, 2.6458386250105836, 1.3229193125052918, 0.52916772500211673, 0.26458386250105836],
                minZoom: 1
            }),

            tileUrlFunction: function(tileCoord) {
                var z = (tileCoord[0]).toString();
                var x = (tileCoord[1]).toString();
                var y = (-tileCoord[2]-1).toString();

                var url = urlTemplate.replace(xRegEx, x).replace(yRegEx, y).replace(zRegEx, z);
                return url.replace(/(L)([0-9]+)/, replacer).replace(/(R)([0-9]+)/, replacer).replace(/(C)([0-9]+)/, replacer);

            },
            wrapX: true
        }),
        view: view
        // view: new ol.View({
        //     center: [14368861.888132, 4190430.764650],
        //     projection: projection,
        //     zoom: 9,
        //     minZoom: 9
        // }),
    });
    map.getLayers().insertAt(3, test);
    return test;
}

function removeAirPhotolayers(map) {
    var mapLayers = map.getLayers().getArray();
    for (var i = 0; i < mapLayers.length; i++) {
        if (mapLayers[i] instanceof ol.layer.Tile) {
            map.removeLayer(mapLayers[i]);
        }
    }

    /*if(val != null && val != ""){
        var obj = jQuery.parseJSON(val);
        var year = obj.years;
        var disparity = obj.disparity;

        var nameTemplate = 'gj_' + year + '_' + disparity;
        for (var i=0; i < mapLayers.length; i++){
            if(mapLayers[i].get("name") === nameTemplate){
                map.removeLayer(mapLayers[i]);
            }
        }
    }else{
        for (var i=0; i < mapLayers.length; i++){
            if(mapLayers[i] instanceof ol.layer.Tile){
                map.removeLayer(mapLayers[i]);
            }
        }
    }*/

}

// 도형에 따른 수치지형도 검색
function dmapSearch(years, geomwkt, scale, currentCRS) {
    var map = $("#map").data('map');
    var sb = new StringBuilder();
    var sb2 = new StringBuilder();

    var queryData = {
        wkt: geomwkt,
        years: years,
        scale: scale
    };

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectIntersectedDigitalMap.do',
        type: "POST",
        dataType: "json",
        data: queryData,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            $('.loadingWrap').hide();
            var format = new ol.format.WKT();
            var result = resData.result;
            var features = [];
            var featureCoordArr = [];

            // show the list of points at the side bar
            if (result.length > 0) {

                $.each(result, function (idx, val) {

                    // make pointInfo element
                    sb2.Append('<div id="pointInfo_area">' + val.year + ' - ' + val.dom + '</div>');

                    var geom = val.geom;
                    var centroidGeom = val.centerpoint;
                    feature = format.readFeature(geom);
                    var centroid = format.readFeature(centroidGeom);
                    feature.getGeometry().transform('EPSG:5183', currentCRS);
                    if (val.cnt > 1) {
                        feature.setStyle(digitalMapStyle[digitalMapStyleKeys[0]]);
                    }
                    feature.setId(val.dom);
                    features.push(feature);
                    var featureCoord = centroid.getGeometry().getCoordinates();
                    // featureCoordArr.push(val.centerPoint);

                    sb.Append('<li>');
                    if (val.cnt > 1) {
                        sb.Append('<a href="#"><span style=" color:#d20018" onclick="moveToIndex(' + featureCoord[0] + ',' + featureCoord[1] + ',' + '\'' + currentCRS + '\'' + ');">' + val.dom + ' (' + val.cnt + '건)</span>');
                    } else {
                        sb.Append('<a href="#"><span style=" color:#0043b1" onclick="moveToIndex(' + featureCoord[0] + ',' + featureCoord[1] + ',' + '\'' + currentCRS + '\'' + ');">' + val.dom + ' (' + val.cnt + '건)</span>');
                    }
                    sb.Append('<button class="sbtn_view" onclick="showDetailDmap(' + val.dom + ')">이력정보</button></a>');
                    sb.Append('</li>');

                });
                sb.Append('</ul>');
                sb.Append('</li>');
            }
            else {
                sb.Append('<li>');
                sb.Append('<span>데이터가 존재하지 않습니다.</span>');
                sb.Append('</li>');
            }
            // $("#dmapSearchResultArea").html(sb.ToString());
            $("#dmapSearchResultArea").html(sb.ToString());
            $("#dmapSearchResultArea > li:first-child > ul").children().addClass("active");

            // parse String builder into HTML element
            var pointInfoEmt = $.parseHTML(sb2.ToString());

            // create overlay object for point Info
            for (var i = 0; i < pointInfoEmt.length; i++) {
                pointInfo = new ol.Overlay({
                    id: 'pointInfo',
                    element: pointInfoEmt[i],
                    positioning: 'bottom-center',
                    stopEvent: false,
                    insertFirst: true
                });
                overlayObj.pointInfoArr.push(pointInfo);

                // set coordinate for memo
                pointInfo.setPosition(featureCoordArr[i]);

                // add memo overlay to map
                map.addOverlay(pointInfo);
            }

            // console.log(features);
            // show index on map

            multiPolygonVectorSource.set("projection",projection_vworld);
            multiPolygonVectorSource.addFeatures(features);
            multiPolygonVectorSource.refresh();
            /*multiPolygonVectorSource = new ol.source.Vector({
                projection: projection_vworld,
                features: features
            });*/
            multiPolygonVectorLayer.set("name","indexLayer");
            multiPolygonVectorLayer.setSource(multiPolygonVectorSource);
            multiPolygonVectorLayer.setZIndex(100);
            /*multiPolygonVectorLayer = new ol.layer.Vector({
                name: "indexLayer",
                source: multiPolygonVectorSource,
                zIndex: 100
            });*/
            map.getLayers().insertAt(100, multiPolygonVectorLayer);
            map.getLayers().insertAt(99, vectorDmapLayer);
            indexFeatures = features;
        }
    });
}

// 도형 없음 수치지형도 검색
function dmapSearchByYear(years, scale, dom, currentCRS) {
    var map = $("#map").data('map');
    var sb = new StringBuilder();
    var sb2 = new StringBuilder();

    var queryData = {
        years: years,
        scale: scale,
        dom:dom
    };

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectDigitalMapByYear.do',
        type: "POST",
        dataType: "json",
        data: queryData,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {
            $('.loadingWrap').hide();
            var format = new ol.format.WKT();
            var result = resData.result;
            var features = [];
            var featureCoordArr = [];

            // show the list of points at the side bar
            if (result.length > 0) {

                $.each(result, function (idx, val) {

                    // make pointInfo element
                    sb2.Append('<div id="pointInfo_area">' + val.year + ' - ' + val.dom + '</div>');

                    var geom = val.geom;
                    var centroidGeom = val.centerpoint;
                    feature = format.readFeature(geom);
                    var centroid = format.readFeature(centroidGeom);
                    feature.getGeometry().transform('EPSG:5183', currentCRS);
                    if (val.cnt > 1) {
                        feature.setStyle(digitalMapStyle[digitalMapStyleKeys[0]]);
                    }
                    feature.setId(val.dom);
                    features.push(feature);
                    var featureCoord = centroid.getGeometry().getCoordinates();
                    // featureCoordArr.push(val.centerPoint);

                    sb.Append('<li>');
                    if (val.cnt > 1) {
                        sb.Append('<a href="#"><span style=" color:#d20018" onclick="moveToIndex(' + featureCoord[0] + ',' + featureCoord[1] + ',' + '\'' + currentCRS + '\'' + ');">' + val.dom + ' (' + val.cnt + '건)</span>');
                    } else {
                        sb.Append('<a href="#"><span style=" color:#0043b1" onclick="moveToIndex(' + featureCoord[0] + ',' + featureCoord[1] + ',' + '\'' + currentCRS + '\'' + ');">' + val.dom + ' (' + val.cnt + '건)</span>');
                    }
                    sb.Append('<button class="sbtn_view" onclick="showDetailDmap(' + val.dom + ')">이력정보</button></a>');
                    sb.Append('</li>');

                });
                sb.Append('</ul>');
                sb.Append('</li>');
            }
            else {
                sb.Append('<li>');
                sb.Append('<span>데이터가 존재하지 않습니다.</span>');
                sb.Append('</li>');
            }
            $("#dmapSearchResultArea").html(sb.ToString());
            $("#dmapSearchResultArea > li:first-child > ul").children().addClass("active");

            // parse String builder into HTML element
            var pointInfoEmt = $.parseHTML(sb2.ToString());

            // create overlay object for point Info
            for (var i = 0; i < pointInfoEmt.length; i++) {
                pointInfo = new ol.Overlay({
                    id: 'pointInfo',
                    element: pointInfoEmt[i],
                    positioning: 'bottom-center',
                    stopEvent: false,
                    insertFirst: true
                });
                overlayObj.pointInfoArr.push(pointInfo);

                // set coordinate for memo
                pointInfo.setPosition(featureCoordArr[i]);

                // add memo overlay to map
                map.addOverlay(pointInfo);
            }

            // console.log(features);
            // show index on map
            multiPolygonVectorSource = new ol.source.Vector({
                projection: projection_vworld,
                features: features

            });
            multiPolygonVectorLayer = new ol.layer.Vector({
                name: "indexLayer",
                source: multiPolygonVectorSource,
                zIndex: 100
            });
            map.getLayers().insertAt(100, multiPolygonVectorLayer);
            map.getLayers().insertAt(99, vector);
            indexFeatures = features;
        }
    });
}

/*function showDetailDmap(dom){

    var scaleVal = $("#mapScaleSelector").val();
    var yearsVal = $("#dMapYearSelector").val();

    var queryData = {
        dom:dom,
        scale:scaleVal,
        years:yearsVal
    }

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectDetailDigitalMap.do',
        type: "POST",
        dataType: "json",
        data:queryData,
        beforeSend: function (xhs, status) {
        },
        error: function (xhs, status, error) {
            alert('서버와의 통신에 실패했습니다.');
            console.log(xhs);
            console.log(status);
            console.log(error);
        },
        success: function (resData, textStatus) {
            var result = resData.result;
            var sb = new StringBuilder();

            $.each(result,function(idx,val){
                var path = encodeURIComponent(val.path);
                sb.Append('<tr>');
                sb.Append('<td>'+val.year+'</td>');
                sb.Append('<td>'+val.desc+'</td>');
                sb.Append('<td>관리자</td>');
                // sb.Append('<td><button class="sbtn_down" data-path ="'+val.path+'">다운로드</button></td>');
                sb.Append('<td><button class="sbtn_down" onclick="fn_downloadAction('+'\''+val.path+'\''+')">다운로드</button></td>');
                sb.Append('</tr>');
            })

            $("#dmapNumberTitle").text(dom);
            $("#digitalMapInfoArea").html(sb.ToString());
            $("#dmapPop_01").show();
        }
    });
}*/

/*function fn_downloadAction(path){
    console.log(path);
}*/

function showDetailIndex(dom, yearsVal) {

    var scaleVal = $("#indexScaleSelector").val();
    var yearsArr = [];
    yearsArr.push(yearsVal);

    var queryData = {
        dom: dom,
        scale: scaleVal,
        years: yearsArr
    }

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectDetailDigitalMap.do',
        type: "POST",
        dataType: "json",
        data: queryData,
        beforeSend: function (xhs, status) {
            $('.loadingWrap').show();
        },
        error: function (xhs, status, error) {
            $('.loadingWrap').hide();
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData, textStatus) {

            $('.loadingWrap').hide();

            var result = resData.result;
            var sb = new StringBuilder();

            $.each(result, function (idx, val) {
                sb.Append('<tr>');
                sb.Append('<td>' + val.year + '</td>');
                sb.Append('<td>' + val.desc + '</td>');
                sb.Append('<td>관리자</td>');
                sb.Append('<td><button class="sbtn_down" onclick="fn_downloadAction(' + val.path + ')">다운로드</button></td>');
                sb.Append('</tr>');
            })

            $("#dmapNumberTitle").text(dom);
            $("#digitalMapInfoArea").html(sb.ToString());
            $("#dmapPop_01").show();
        }
    });
}

var tileGrid2015 = new ol.tilegrid.TileGrid({
    extent: [14421527.0006206, 4226661.9160571, 14323687.6044156, 4128822.5198520],
    tileSize: 256,
    resolutions: [76.4370283, 38.2185141, 19.1092571, 9.5546285, 4.7773143, 2.3886571, 1.1943286, 0.5971643, 0.2985821],
    minZoom: 1
})

// 항공사진 handler 객체
var airPhotoLayersMng = {

    getInfo: {},
    setInfo: function (paramObj, tileObj) {
        if (!paramObj) {
            return false;
        }
        var jsonObj = $.parseJSON(paramObj);
        var key = jsonObj.key;
        this.getInfo[key] = {
            'uid': jsonObj.key,
            'selectedTile': tileObj
        }
    },
    remove: function (paramObj, map) {
        var mapLayers = map.getLayers().getArray();
        var parse = jQuery.parseJSON(paramObj);
        var year = parse.years;
//	    var disparity = parse.disparity;
        var nameTemplate = 'gj_' + year;
        for (var i = 0; i < mapLayers.length; i++) {
            // console.log(mapLayers[i]);
            if (mapLayers[i].get("name") == nameTemplate) {
                map.removeLayer(mapLayers[i]);
            }
        }
    },
    display: function (paramObj, map) {
        // 객체로 변경
        if (!paramObj) {
            return false;
        }
        var obj = jQuery.parseJSON(paramObj);
        var year = obj.years;
//	    var disparity = obj.disparity;
        var _self = this;
        var zRegEx = /\{z\}/g;
        var xRegEx = /\{x\}/g;
        var yRegEx = /\{y\}/g;
//         var projection = ol.proj.get('EPSG:900913');
//        var projection = ol.proj.get('EPSG:3857');
        var mapLayers = map.getLayers().getArray();
        var insertIndex = 3;
        var x, y, z, url;

        var projection = ol.proj.get('EPSG:5181');

        // The tile size supported by the ArcGIS tile service.
        var tileSize = 256;
        var origin=[-5423200, 6294600];
        //L02-376
        if(year=='2017'||year=='2012')
            origin=[-5423200, 6194600];
        //L02-394
        else if(year=='2001'||year=='2002'||year=='2008'||year=='2000'||year=='1999')
            origin=[-5423200, 6394600];

//	    var urlTemplate = gp.aeroDataTiles + '/' + year + '/' + disparity + '/{z}/{y}/{x}.png';
//        var urlTemplate = gp.aeroDataTiles + '/' + year + '/{z}/{y}/{x}.png';
        var urlTemplate = "file:///D:/광주 항공사진/cache/"+year+"/Layers/_alllayers/L{z}/R{y}/C{x}.png";
//        var urlTemplate = 'file:///D:/광주 항공사진/cache/' + year + '/{z}/{y}/{x}.png';

        var tileObj = new ol.layer.Tile({
            kind: "gj_" + year,
            title: "gj_" + year,
            name: "gj_" + year,
            id: "gj_" + year,
            opacity: 1,
            source: new ol.source.XYZ({
                tileLoadFunction: function (imageTile, src) {
                    $.ajax({
                        type: "post",
                        url: gp.ctxPath + "/aeroGis/TileImageConvert.json",
                        data: "url=" + src,
                        dataType: "json",
//                        cache: true,
//								async : false,
                        success: function (value) {
//                            if (value === "" || value === null) {
//                                alert("선택하신 항공사진 데이터가 없습니다.");
//                                return false;
//                            } else {
//                                imageTile.getImage().src = value.src;
//                            }
                            imageTile.getImage().src = value.src;
                        }
                    });
                },
                maxZoom: 16,
                projection: projection,
//                tileSize: tileSize,
                tileGrid: new ol.tilegrid.TileGrid({

                    extent : [ 165727.00000019523, 169818.29999650625, 204613.14999997505, 197718.89999695309 ],
//                      extent: [13756219.106426602, 3860987.1727408236, 14666125.491133342, 4863840.983842337],
                    origin: origin,
                    tileSize: 256,
                    resolutions : [ 79.37515875031751, 52.916772500211671, 26.458386250105836, 13.229193125052918, 5.2916772500211673, 2.6458386250105836, 1.3229193125052918, 0.52916772500211673, 0.26458386250105836],
                    minZoom: 1
                }),

                tileUrlFunction: function(tileCoord) {
                    var z = (tileCoord[0]).toString();
                    var x = (tileCoord[1]).toString();
                    var y = (-tileCoord[2]-1).toString();

                    var url = urlTemplate.replace(xRegEx, x).replace(yRegEx, y).replace(zRegEx, z);
                    return url.replace(/(L)([0-9]+)/, replacer).replace(/(R)([0-9]+)/, replacer).replace(/(C)([0-9]+)/, replacer);

                },
                wrapX: true
            }),
            view: new ol.View({
                center: [14368861.888132, 4190430.764650],
                // projection: projection,
                zoom: 9,
                minZoom: 9
            }),
            visible: true
        });

        $.each(mapLayers, function (idx, val) {
            if (val instanceof ol.layer.Tile) {
                insertIndex = idx + 1;
                // console.log(insertIndex);
            }
        })

        map.getLayers().insertAt(insertIndex, tileObj);
        return tileObj;
    }
}

// 수치지형도 삭제
function removeDigitalMap() {
    var map = $("#map").data('map');
    map.removeLayer(layer1000);
    map.removeLayer(layer5000);
    map.removeLayer(layer10000);
    map.removeLayer(layer25000);
}

var hexDigits = new Array
("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

//Function to convert rgb color to hex format
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

function displayIndexYearList(scale, production) {
    var map = $("#map").data('map');
    var sb = new StringBuilder();


    var queryData = {
        scale: scale,
        indexAuthor: production
    }

    $.ajax({
        url: gp.ctxPath + '/aeroGis/selectIndexYearList.do',
        type: "POST",
        dataType: 'json',
        data: queryData,
        error: function (err) {
            if(xhs.status == 600){
                alert("세션이 만료되었습니다.");
                location.href = gp.ctxPath + "/mainPage.do";
            }else{
                alert('서버와의 통신에 실패했습니다.');
            }
        },
        success: function (resData) {
            var res = resData.result;

            if (res.length > 0) {
                sb.Append('<p><span id="counterArea"></span><button id="indexCheckAll" onclick="checkIndexAll();" name="indexCheckAll">전체선택</button></p>');
                $.each(res, function (idx, val) {
                    sb.Append('<p><input type="checkbox" name="indexCheck" value="' + val.year + '"/>' +
                        '<span data-change_flag = "0" class="color' + (parseInt(idx) + 1) + '"></span>' +
                        '<label for="">' + val.year + ' ( ' + val.cnt + ' 도엽)</label>' +
                        '<span class="color_wrap" id="colorWrap' + val.year + '" style="display:none;">' +
                        '<input type="text" id="color_' + val.year + '" name="colorPicker"/>' +
                        '<input type="text" id="lineWidth_' + val.year + '" class="sform-control" placeholder="두께"/>' +
                        '<a class="btn_mapOK" id="lineWidthBtn_' + val.year + '" onclick="changeLineWidth(this,' + val.year + ');">변경</a></span></p>');
                })
            } else {
                sb.Append('<li>');
                sb.Append('<span>데이터가 존재하지 않습니다.</span>');
                sb.Append('</li>');
            }
            $("#indexTabView").html(sb.ToString());

            $("input[name='indexCheck']").on('click', function () {
                var $this = $(this);
                var yearData = $this.val();
                var colorCode = $this.siblings().eq(0).attr('class');
                var changeFlag = $this.siblings().eq(0).attr('data-change_flag');
                var colorVal = $('.' + colorCode).css("backgroundColor");
                var hexColor = rgb2hex(colorVal);
                var newColorVal;
                var lineWidth = $(this).siblings().eq(2).children().eq(1).val();

                if (lineWidth == 0 || lineWidth == '') {
                    lineWidth = 3;
                }

                if ($this.is(":checked")) {

                    for (var i = 0; i < $this.length; i++) {
                        if ($this.eq(i).is(":checked")) {
                            indexYearsArr.push($this.eq(i).val());
                        }
                    }

                    map.getView().setZoom(7);
                    $("#colorWrap" + yearData).show();
                    // $("#color_"+yearData).val(hexColor);
                    $("#color_" + yearData).spectrum({
                        color: hexColor,
                        showPalette: true,
                        showSelectionPalette: true,
                        hideAfterPaletteSelect: true,
                        clickoutFiresChange: true,
                        chooseText: "선택",
                        cancelText: "취소",
                        palette: [
                            ['#ff0000', '#ff9900', '#33cccc', '#ff00ff', '#9900ff'],
                            ['#3bfff0', '#00ff00', '#6600cc', '#3333ff', '#990099'],
                            ['#990000', '#cc6699', '#6699ff', '#666699', '#000099']
                        ],
                    });

                    countIndex(indexYearsArr);

                    if (changeFlag == 0) {
                        // unchanged state
                        displayIndex(yearData, currentCRS, colorCode);
                    } else {
                        // changed state
                        reDrawIndex(yearData, currentCRS, hexColor, lineWidth);
                    }

                    $("#lineWidth_" + yearData).on('keypress', function (e) {
                        if (e.keyCode == '13') {
                            $("#lineWidthBtn_" + yearData).trigger('click');
                        }
                    })

                    $("#color_" + yearData).on('change.spectrum', function (e, color) {
                        newColorVal = color.toHexString();
                        lineWidth = $("lineWidth_" + yearData).val();
                        // console.log(lineWidth);
                        $('.' + colorCode).css("backgroundColor", newColorVal);
                        $('.' + colorCode).attr("data-change_flag", 1);

                        if (lineWidth == 0 || lineWidth == "") {
                            lineWidth = 3;
                        }

                        clearIndex(yearData);
                        reDrawIndex(yearData, currentCRS, newColorVal, lineWidth);
                    })

                } else {
                    clearIndex(yearData);
                    $("#colorWrap" + yearData).hide();
                    $("#lineWidth_" + yearData).val("");

                    indexYearsArr.splice($.inArray(yearData, indexYearsArr), 1);

                    if (indexYearsArr.length > 0) {
                        countIndex(indexYearsArr);
                    } else {
                        $("#counterArea").text("총도엽수 (0 도엽)");
                    }

                }
            })

        }
    })
}


//$(document).ready(function(){
//
//	$('#digitalmap_warning').on('shown.bs.modal', function (e) {
//		console.log("show");
//		console.log(e);
//	});
//
//	$('#digitalmap_warning').on('hidden.bs.modal', function (e) {
//		console.log("hide");
//		console.log(e);
//	});
//});
//
//function fn_indexCheckAll(){
//
//	var map = $("#map").data('map');
//
//	$("#digitalmap_warning").modal({
//		keyboard: false,
//		backdrop: 'static',
//		show: true
//	});
//
//	map.getView().setZoom(7);
//	var checkBoxArr = $("input[name='indexCheck']");
//	for (var i = 0; i < checkBoxArr.length; i++) {
//		if (!checkBoxArr.eq(i).is(":checked")) {
//			checkBoxArr.eq(i).trigger('click');
//		}
//	}
//}

function setMapScale(map) {
    var mapLevel = map.getView().getZoom();
    $("#mapScale").val(mapLevel);
    $("#mapScaleChange").val(mapLevel);
}

function changeLineWidth(obj, year) {
    var lineWidthVal = $('#lineWidth_' + year).val();
    if (lineWidthVal == 0 || lineWidthVal == "") {
        alert("라인 두께를 입력하세요.");
        $('#lineWidth_' + year).focus();
        return false;
    }
    var colorCode = $(obj).parent().siblings().eq(1).attr('class');
    var colorVal = $('.' + colorCode).css("backgroundColor");
    var hexColor = rgb2hex(colorVal);
    $('.' + colorCode).attr("data-change_flag", 1);
    clearIndex(year);
    reDrawIndex(year, currentCRS, hexColor, lineWidthVal);

}

function changeDaumMapByYear (year){

    var yearVal = $(year).val();
    var selectedIndex = $(year).prop('selectedIndex');
    var map = $("#map").data('map');
    var map1 = $("#map1").data('map');
    var map2 = $("#map2").data('map');

    var oldSource = new ol.source.XYZ({
        projection: projection_daum,
        tileSize: 256,
        //crossDomain: true,
        // crossOrigin: "Anonymous",
        minZoom: 1,
        maxZoom: resolutions.length - 1,
        initZoom: 1,
        tileGrid: new ol.tilegrid.TileGrid({
            extent: extent_daum,
            origin: [extent_daum[0], extent_daum[1]],
            resolutions: resolutions
        }),
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            if (tileCoord == null) return undefined;
            var s = Math.floor(Math.random() * 4);  // 0 ~ 3
            var z = resolutions.length - tileCoord[0];
            var x = tileCoord[1];
            var y = tileCoord[2];
            // return gp.ctxPath + '/proxy/proxy.jsp?url=https://map' + s + '.daumcdn.net/map_skyview/L' + z + '/' + y + '/' + x + '.jpg';
            return gp.proxyPath + 'https://map' + s + '.daumcdn.net/map_skyview/L' + z + '/' + y + '/' + x + '.jpg';
        }
    })

    var newSource = new ol.source.XYZ({
        projection: projection_daum,
        tileSize: 256,
        //crossDomain: true,
        // crossOrigin: "Anonymous",
        minZoom: 1,
        maxZoom: resolutions.length - 1,
        initZoom: 1,
        tileGrid: new ol.tilegrid.TileGrid({
            extent: extent_daum,
            origin: [extent_daum[0], extent_daum[1]],
            resolutions: resolutions
        }),
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            if (tileCoord == null) return undefined;
            var s = Math.floor(Math.random() * 4);  // 0 ~ 3
            var z = resolutions.length - tileCoord[0];
            var x = tileCoord[1];
            var y = tileCoord[2];
            // return gp.ctxPath + '/proxy/proxy.jsp?url=https://map' + s + '.daumcdn.net/map_skyview/L' + z + '/' + y + '/' + x + '.jpg';
            return gp.proxyPath + 'https://map' + s + '.daumcdn.net/map_skyview_past/' + yearVal + '/L' + z + '/' + y + '/' + x + '.jpg';
        }
    })

    if($("#splitDisplayBtn").hasClass('on')){
        var daumAppLayer1 = findBy(map1.getLayerGroup(), 'title', 'M0005');
        var daumAppLayer2 = findBy(map2.getLayerGroup(), 'title', 'M0005');
        if(selectedIndex == '0'){
            daumAppLayer1.setSource(oldSource);
            daumAppLayer2.setSource(oldSource);
        }else{
            daumAppLayer1.setSource(newSource);
            daumAppLayer2.setSource(newSource);
        }

    }else{
        // for 1 base map
        var daumAppLayer = findBy(map.getLayerGroup(), 'title', 'M0005');
        if(selectedIndex == '0'){
            daumAppLayer.setSource(oldSource);
        }else{
            daumAppLayer.setSource(newSource);
        }
    }


}

var oldSelectFt = null;

$(document).ready(function () {

    var map = initMap();
    var previousOpt, currentOpt;
    var cLcenter, nLcenter, zoom, maxZoom, res;
    var prevLayer, currentLayer;
    // var prevCRS, currentCRS = 'EPSG:3857';
    var prevCRS, currentCRS = 'EPSG:5181';
    var prevExtent, currentExtent = extent_vworld;
    var newView, newView1, newView2;
    var layerGroup;
    var draw, digimapDraw;
    var photoLayer, photoLayerName, selectedLayerName;
    var tIdx, sIdx;
    var opacityVal, dataValue;
    var toggleArry = $("input[name='airPhotoCheck']");
    var sliderArry = $("input[name='range_slider']");
    var sliderArryAll = $("input[name='all_range_slider']");
    var mapLayers, mapOverlays;

    // toggle create
    toggleArry.lc_switch();
    // first toggle on
    toggleArry.eq(0).lcs_on();
    // first 항공사진 display
    photoLayer = airPhotoLayersMng.display(toggleArry.eq(0).val(), map);
    // first 항공사진 정보 put
    airPhotoLayersMng.setInfo(toggleArry.eq(0).val(), photoLayer)
    // toggle event listener 추가
    $(document).on('lcs-statuschange', '.lcs_check', function () {

        var status = ($(this).is(':checked')) ? 'checked' : 'unchecked';
        var tVal = $(this).val();

        tIdx = $("input[name='airPhotoCheck']").index(this);
        if($(this).attr("id")=="allPhoto"){
            if (status == "checked") {
                $('#autoPlay').attr("style","display:inline-block");
                sliderArryAll.eq(0).asRange('set', 0);
                sliderArryAll.eq(0).asRange('enable');
            } else {
                clearInterval(timerId);
                $('#autoPlay').attr("style","display:none");
                sliderArryAll.eq(0).asRange('set', 0);
                $.each(toggleArry, function(i){
                    if(i != toggleArry.length-1)
                        toggleArry.eq(i).lcs_off();
                });
                toggleArry.eq(0).lcs_on();
                // 슬라이드바 disable
                sliderArryAll.eq(0).asRange('disable');
                sliderArry.asRange('disable');
//            	toggleArry.lcs_off();
                sliderArry.eq(0).asRange('enable');
                // 슬라이드바 값 초기화
                sliderArry.eq(0).asRange('set', '1');
                sliderArry.eq(0).siblings().closest('span').text(100 + '%');
            }
        }else{
            if (status == "checked") {
                // 항공사진 display
                photoLayer = airPhotoLayersMng.display(toggleArry.eq(tIdx).val(), map);
                // 항공사진 정보 PUT
                airPhotoLayersMng.setInfo(toggleArry.eq(tIdx).val(), photoLayer);
                // 슬라이드바 enable
                sliderArry.eq(tIdx).asRange('enable');
            } else {
                // 항공사진 off
                airPhotoLayersMng.remove(tVal, map);
                // 슬라이드바 disable
                sliderArry.eq(tIdx).asRange('disable');
                // 슬라이드바 값 초기화
                sliderArry.eq(tIdx).asRange('set', '1');
                sliderArry.eq(tIdx).siblings().closest('span').text(100 + '%');
            }
        }
    });

    // slidebar create
    sliderArry.asRange({
        namespace: 'asRange',
        range: false,
        tip: {active: 'onMove'},
        step: 0.01,
        min: 0,
        max: 1,
        format: function (value) {
            return Math.round(value * 100) + '%';
        }
    });
    // slidebar create
    sliderArryAll.asRange({
        namespace: 'asRange',
        range: false,
        tip: {active: 'onMove'},
        step: 0.01,
        min: 0,
        max: 1,
        format: function (value) {
            return Math.round(value * 100) + '%';
        }
    });
    var temp = $('.asRange')[$('.asRange').length-1];
    $(temp).attr("style","width:150px !important")
    // slider bar init
    sliderArry.asRange('disable');
    sliderArryAll.asRange('disable');
    // first slider bar enable
    sliderArry.eq(0).asRange('enable');

    // slider bar event listener 추가
    sliderArry.on('asRange::change', function (e) {

        sIdx = sliderArry.index(this);
        opacityVal = sliderArry.eq(sIdx).asRange('get');
        dataValue = sliderArry.eq(sIdx).attr('data-value');

        airPhotoLayersMng.getInfo[dataValue].selectedTile.setOpacity(opacityVal);
        sliderArry.eq(sIdx).siblings().closest('span').text(Math.round(opacityVal * 100) + '%');
    });
    // slider bar event listener 추가
    sliderArryAll.on('asRange::change', function (e) {
        toggleArry.lcs_on();
        sliderArry.asRange('set', '0');
        var mainArray=[1997,2001,2002,2012,2013,2014,2016,2017];
        var revArray=mainArray.reverse();
        var splitValue = 100 / (mainArray.length-1);
        var opacityValAll = sliderArryAll.eq(0).asRange('get');
        var idx = (opacityValAll*100)/splitValue;
//    	sliderArry.eq(Math.round(idx)).asRange('set', String(1-idx)/Math.round(idx)*splitValue);
        sliderArry.eq(Math.floor(idx)).asRange('set', String(1-idx-Math.floor(1-idx)));

        sliderArry.eq(Math.floor(idx)+1).asRange('set', String(idx-Math.floor(idx)));
        if(1-idx-Math.floor(1-idx)==0)
            sliderArry.eq(Math.floor(idx)).asRange('set', '100');
        else if(idx-Math.floor(idx)==0)
            sliderArry.eq(Math.floor(idx)+1).asRange('set', '100');
//    	if(opacityVal<33){
//    		dataValue = 2014
//        	nextValue = 2016
//    		idx = 2
//    	}else if(33 < opacityVal && opacityVal< 66){
//    		dataValue = 2016
//        	nextValue = 2017
//    		idx = 1
//    	}else if(66 < opacityVal){
//    		dataValue = 2017
//        	nextValue = 2018
//    		idx = 0
//    	}
//    	debugger;
//    	airPhotoLayersMng.getInfo[dataValue].selectedTile.setOpacity(100 - opacityVal*300);
//    	airPhotoLayersMng.getInfo[nextValue].selectedTile.setOpacity(opacityVal*300);
//    	sliderArry.eq(idx).siblings().closest('span').text(Math.round((100 - opacityVal*3)) + '%');
//    	sliderArry.eq(idx-1).siblings().closest('span').text(Math.round((opacityVal*3)) + '%');
    });

    // load Sigungu List
    loadSGG();
    // load Emd list after each sgg selection
    $("#top_sgg").on("change", function () {
        var sggVal = $(this).val();
        var sggText = $("#top_sgg option:selected").text();
        var sggValSub = sggVal.substr(0, 5);
        $("#top_sgg").siblings("label").text(sggText);
        loadEMD(sggValSub);
        // console.log($("#top_emd").find("option:first-child").text());
        /*var emdText = $("#top_emd").find("option:first").text();
        $("#top_emd").siblings("label").text(emdText);*/
        setCenterBySgg(map, sggValSub, currentCRS);
    })

    $("#top_emd").on("change", function () {
        var emdVal = $(this).val();
        var emdText = $("#top_emd option:selected").text();
        $("#top_emd").siblings("label").text(emdText);
        setCenterByEmd(map, emdVal, currentCRS);
    })

    // map moveend event to set the SGG and EMD based on map center point
    map.on('moveend', function (event) {
        setSggByCenter(currentCRS);
        setEmdByCenter(currentCRS);
		getCenterAddr("map");
        setMapScale(map);
        // console.log("map zoom level : " + map.getView().getZoom());
        var resolution = map.getView().getResolution();
        // console.log(resolution);
        var newZoom = map.getView().getZoomForResolution(resolution);
        // console.log( "newZoom = " + newZoom);

    });



    var switchedToDaum = 0;
    var emptyMap = 1;

    // BASE MAP selector dropdown (select box)
    $("#mapSelector").on("focus", function () {
        previousOpt = this.value;

        res = map.getView().getResolution();
        mapLayers = map.getLayers().getArray();
        mapOverlays = map.getOverlays().getArray();
        // console.log(mapOverlays);


    }).change(function () {
        currentOpt = this.value;
        if(currentOpt == 'M0000'){
            prevLayer = findBy(map.getLayerGroup(), 'title', 'Base maps');
            var layers = prevLayer.getLayers().getArray();
            $.each(layers, function(idx, lyr){
                lyr.setVisible(false);
            });
            emptyMap = 1;
        }else if(emptyMap==1&&currentOpt == 'M0002'){
            // get currently selected item
            currentLayer = findBy(map.getLayerGroup(), 'title', currentOpt);
            currentCRS = currentLayer.getSource().getProjection().getCode();
            currentExtent = currentLayer.getSource().getProjection().getExtent();
            currentLayer.setVisible(true);
        }else{
            emptyMap = 0;
            // get previous map informations
            cLcenter = map.getView().getCenter();
            zoom = map.getView().getZoom();
            maxZoom = map.getView().getMaxZoom();

            //process zoom level to and from Daum map
            if (previousOpt == "M0000") {
                if (switchedToDaum == 0) {
                    zoom = parseInt(zoom) + 5;
                }
            } else if (currentOpt == 'M0002') {
                switchedToDaum = 1;
            }

            // get previously selected item
            prevLayer = findBy(map.getLayerGroup(), 'title', previousOpt);
            prevCRS = prevLayer.getSource().getProjection().getCode();
            prevExtent = prevLayer.getSource().getProjection().getExtent();
            prevLayer.setVisible(false);

            // get currently selected item
            currentLayer = findBy(map.getLayerGroup(), 'title', currentOpt);
            currentCRS = currentLayer.getSource().getProjection().getCode();
            currentExtent = currentLayer.getSource().getProjection().getExtent();
            currentLayer.setVisible(true);

            // transform coordinate 2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28,32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255
            nLcenter = ol.proj.transform(cLcenter, prevCRS, currentCRS);

            if (currentOpt === "M0002" || currentOpt === "M0005") {
                // 다음 지도
                newView = new ol.View({
                    projection: currentCRS,
                    maxZoom: 20,
                    minZoom: 11,
                    extent: bound_daum,
                    center: nLcenter,
                    zoom: zoom
                });
                newView1 = new ol.View({
                    projection: currentCRS,
                    maxZoom: 20,
                    minZoom: 11,
                    center: nLcenter,
                    extent: bound_daum,
                    zoom: zoom
                });
                newView2 = new ol.View({
                    projection: currentCRS,
                    maxZoom: 20,
                    minZoom: 11,
                    center: nLcenter,
                    extent: bound_daum,
                    zoom: zoom
                });
            }else if(currentOpt === "M0007") {
                //바로이맵 e
                newView = new ol.View({
                    projection: currentCRS,
                    maxZoom: 20,
                    minZoom: 11,
                    resolutions: [65.28,32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255],
                    extent: bound_naver,
                    center: nLcenter,
                    zoom: zoom
                });
                newView1 = new ol.View({
                    projection: currentCRS,
                    maxZoom: 20,
                    minZoom: 11,
                    center: nLcenter,
                    resolutions: [65.28,32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255],
                    extent: bound_naver,
                    zoom: zoom
                });
                newView2 = new ol.View({
                    projection: currentCRS,
                    maxZoom: 20,
                    minZoom: 11,
                    center: nLcenter,
                    resolutions: [65.28,32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255],
                    extent: bound_naver,
                    zoom: zoom
                });
            } else if(currentOpt === "M0003" || currentOpt === "M0004") {
                //Vworld & naver 지도
                newView = new ol.View({
                    projection: currentCRS,
                    maxZoom: 20,
                    minZoom: 11,
                    extent: bound_naver,
                    center: nLcenter,
                    zoom: zoom
                });
                newView1 = new ol.View({
                    projection: currentCRS,
                    maxZoom: 20,
                    minZoom: 11,
                    center: nLcenter,
                    extent: bound_naver,
                    zoom: zoom
                });
                newView2 = new ol.View({
                    projection: currentCRS,
                    maxZoom: 20,
                    minZoom: 11,
                    center: nLcenter,
                    extent: bound_naver,
                    zoom: zoom
                });
            }


            // set new View to current Map
            map.setView(newView);

            // vector layers 유지 하기위한 script
            $.each(mapLayers, function (idx, val) {
                if (val instanceof ol.layer.Vector) {
                    var featuresArr = val.getSource().getFeatures();
                    $.each(featuresArr, function (fidx, feature) {
                        feature.getGeometry().transform(prevCRS, currentCRS);
                    })
                }
            });

            // overlay layers 유지 하기위한 script
            $.each(mapOverlays, function (idx, val) {
                var coordinate = val.get("position");
                if (coordinate != null && coordinate != "") {
                    var transCoordinate = ol.proj.transform(coordinate, prevCRS, currentCRS);
                    val.setPosition(transCoordinate);
                }
            });

            var map1 = $("#map1").data('map');
            if ($("#splitDisplayBtn").hasClass('on')) {
                var map2 = $("#map2").data('map');
                map1.setView(newView1);
                map2.setView(newView2);
            }

            // update the value to current one
            previousOpt = currentOpt;

            // update properties with new EPSG code
            $(".pointResults").attr('data-epsg', currentCRS);
            $(".m_01").attr('data-value', 17);
            $(".m_03").attr('data-value', 15);
            $(".m_04").attr('data-value', 13);
            $(".m_05").attr('data-value', 11);
            $("#mapScaleChange").show();
            $("#mapScale").hide();

//            map1.on('moveend', function (event) {
//        		getCenterAddr("map1");
//            })
            map.on('moveend', function (event) {
                setSggByCenter(currentCRS);
                setEmdByCenter(currentCRS);
//        		getCenterAddr("map1");
                setMapScale(map);
//    		mainPointsVectorLayer.getSource().clear(true);
            })
        }
    });


    // handler geometry search using buttons
    $("a[name='shp_btn']").on("click", function (e) {
//    	var prevCRS, currentCRS = 'EPSG:5187';
        var $this = $(this);
        var geoFunction;
        var yearVals = $("#yearSelector").val();
        var view = map.getView();
        // get draw shape Type
        var shapeType = $(this).attr("data-drawtype");

        $this.toggleClass("on");

        if ($this.siblings().hasClass("on")) {
            $this.siblings().removeClass("on");
        }

        if ($this.hasClass("on")) {
            if (shapeType != "" && shapeType != null) {

                map.removeInteraction(draw);

                // validation check for year selector
                if (yearVals.length === 0) {
                    alert("년도는 필수입니다.");
                    $this.removeClass("on");
                    return false;
                }

                // clear previous existing vectors
                clearGeometry();

                // set zoom level to 읍.면.동
                var emdZoomLevel = $(".m_03").attr('data-value');
                // view.setZoom(emdZoomLevel);


                if (shapeType == "Box") {
                    shapeType = "Circle";
                    geoFunction = ol.interaction.Draw.createBox();
                }

                draw = new ol.interaction.Draw({
                    type: shapeType,
                    source: vectorSource,
                    geometryFunction: geoFunction
                });

                map.addInteraction(draw);

            }

            draw.on("drawend", function (e) {

                // draw 객체
                geom = e.feature.getGeometry();


                // draw 이벤트와 연결을 끊는다.
                map.removeInteraction(draw);

                // Circle 일때
                if (geom instanceof ol.geom.Circle) {
                    geom = ol.geom.Polygon.fromCircle(geom);
                    // Box 일때
                } else if (geom instanceof ol.geom.Polygon) {

                    // Point 일때
                } else if (geom instanceof ol.geom.Point) {

                }
                // 복제(clone) 하지 않으면 draw 한 객체가 지도에서 사라진다.
                var cloneGeom = geom.clone();
                // console.log(cloneGeom);
                var transGeom = cloneGeom.transform(currentCRS, "EPSG:5186");
                var format = new ol.format.WKT();
                var wkt = format.writeGeometry(transGeom);

                // console.log(wkt);
                // 조회
                geometrySearch(yearVals, wkt, currentCRS);

                $("#map").data('map', map);

                //Call to double click zoom control function to deactivate zoom event
                controlDoubleClickZoom(false);
                //Delay execution of activation of double click zoom function
                setTimeout(function () {
                    controlDoubleClickZoom(true);
                }, 251);

                $this.removeClass("on");

                /*var collection = map.getInteractions().getArray();
                collection.forEach(function(ctrl){
                    if(ctrl instanceof ol.interaction.DoubleClickZoom){
                        setTimeout(function(){
                            ctrl.setActive(true);
                        },3000)
                    }
                });*/
            });

        } else {
            map.removeInteraction(draw);
        }
    });

    map.on('click', function () {
        map.removeOverlay(this.getOverlayById('listOv'));
        // 해당 interaction이 특정한 레이어에 만 적영 해야 다른 레이어의 이벤트 과 충돌 안함

        var result = [];

        for(var i in wfs) {
            result.push(wfs[i]);
        }

        var clickInteraction = new ol.interaction.Select({
            layers: result.concat([vectorPointLayer, polygonVectorLayer, recentPointsVectorLayer])
        });
        // debugger;
        clickInteraction.un('select');

        if (mainPointFeatures != null && mainPointFeatures != '') {
            // click interaction event
            clickInteraction.on('select', function (e) {

                var selected = e.selected[0];

                var oldFillStyle = selected.getStyle().getImage().getFill();
                var oldStroke = selected.getStyle().getImage().getStroke();

                if(oldSelectFt == null){
                    oldSelectFt = selected;
                }else{
                    if(selected.get("select") != "true"){
                        oldSelectFt.setStyle(new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 5,
                                fill: new ol.style.Fill({color: oldFillStyle.getColor()}),
                                stroke: new ol.style.Stroke({
                                    color: oldStroke.getColor(),
                                    width: oldStroke.getWidth()
                                })
                            })
                        }));  //선택한 스타일 변경
                        oldSelectFt.set("select","false"); //선택여부 값 변경
                    }
                    oldSelectFt = selected;
                }

                var featureId = selected.getId();
                if (featureId != null && featureId != '') {
                    var infoArr = featureId.split('-');

                    if (infoArr.length > 1) {

                        var airFileNam = infoArr[0];
                        var disparity = infoArr[1];
                        var corse = infoArr[2];
                        var corseNum = infoArr[3];


                        if(selected.get("select") == "true"){  //피처에 선택값이 true 일경우
                            openImage(airFileNam,disparity,corse,corseNum); // 출력프로그램 실행
                            selected.set("select","false"); //선택여부 값 변경
                        }else{
                            previewThumb(airFileNam,disparity,corse,corseNum); // 이미지 미리보기 실행



                            selected.setStyle(new ol.style.Style({
                                image: new ol.style.Circle({
                                    radius: 10,
                                    fill: new ol.style.Fill({color: oldFillStyle.getColor()}),
                                    stroke: new ol.style.Stroke({
                                        color: oldStroke.getColor(),
                                        width: oldStroke.getWidth()
                                    })
                                })
                            }));  //선택한 스타일 변경

                            selected.set("select","true"); //선택여부 값 변경
                        }
//                        map.getOverlayContainer("#selectPop");

                        // var tempEle = $('#selectPop').clone();
                        // var overlayLayer = new ol.Overlay({
                        //     id : 'listOv',
                        //     element : document.getElementById('selectPop').cloneNode(true),
                        //     offset : [ 15, 15 ],
                        //     position : e.selected[0].getGeometry().getCoordinates(),
                        //     positioning : 'top-left'
                        // });

                        // map.addOverlay(overlayLayer);
                        // $(".ol-overlaycontainer-stopevent #selectPop").show();
                        // var hhh = "<h3>항공사진("+corse+"_"+corseNum+")</h3>";
                        // $('.layer_header').html(hhh);
                        // var li = "<li onClick=openImage('"+airFileNam+"','"+ disparity+"','"+ corse+"','"+ corseNum+"')>항공사진 상세보기</li>";
                        // li += "<li onClick=previewThumb('"+airFileNam+"','"+ disparity+"','"+ corse+"','"+ corseNum+"')>항공사진 미리보기</li>";
                        // $('.mapInfo_list').html(li);



//                        $("#selectPop").html("");
//                        $("#selectPop").show();
                        //주점 상세보기 팝업
//                        openImage(airFileNam, disparity, corse, corCseNum);
                        //주점 미리보기 테스트
//                        previewThumb(airFileNam, disparity, corse, corseNum, map);
                    } else {
                        fn_openLandInfo(featureId);
                    }
                }

            });

            map.addInteraction(clickInteraction);
//        	map.removeOverlay(map.getOverlays().array_[0]);
        }else{
        }

    });


    //Control active state of double click zoom interaction
    function controlDoubleClickZoom(active) {
        //Find double click interaction
        var interactions = map.getInteractions();
        for (var i = 0; i < interactions.getLength(); i++) {
            var interaction = interactions.item(i);
            if (interaction instanceof ol.interaction.DoubleClickZoom) {
                interaction.setActive(active);
            }
        }
    }

//    $("#printBtn").printPreview();

    var output, tooltipCoord, listener, sketch;
    var index = 20;
    // Handler for measurement
    $("a[name='measureBtn']").on('click', function (e) {

        map.removeInteraction(draw);

        var $this = $(this);

        $this.toggleClass("on");

        $("#clearBtn").removeClass("on");

        if ($this.parents().siblings().children().hasClass("on")) {
            $this.parents().siblings().children().removeClass("on");
        }

        if ($this.hasClass("on")) {
            var option = $(this).attr('data-drawtype');
            if (option != "" && option != null) {
                index++;
                draw = new ol.interaction.Draw({
                    type: option,
                    source: measurementVectorSource
                });

                map.addInteraction(draw);
                option = null;
            } else {
                map.removeInteraction(draw);
                clearMeasurementGeometry();

                if ($this.parents().siblings().children().hasClass("on")) {
                    $this.parents().siblings().children().removeClass("on");
                }
            }

            createTooltip(map);

            draw.on("drawstart", function (e) {
                sketch = e.feature.getGeometry();
                tooltipCoord = e.coordinate;

                listener = sketch.on('change', function (evt) {
                    var geom = evt.target;
                    if (geom instanceof ol.geom.Polygon) {
                        output = "총면적 : " + formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    } else if (geom instanceof ol.geom.LineString) {
                        output = "총거리 : " + formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    } else {
                        output = "반경 : " + formatRadius(geom);
                        tooltipCoord = geom.getCenter();
                    }
                    measureTooltipElement.className = 'tip tipMeasure';
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            }, this);

            draw.on("drawend", function (e) {
                measureTooltipElement.className = 'tip tipStatic';
                measureTooltip.setOffset([0, -7]);
                sketch = null;
                measureTooltipElement = null;
                createTooltip(map);
                ol.Observable.unByKey(listener);

                $("#map").data('map', map);

                // map.getLayers().insertAt(6,measurementVector);
                //Call to double click zoom control function to deactivate zoom event
                controlDoubleClickZoom(false);
                //Delay execution of activation of double click zoom function
                setTimeout(function () {
                    controlDoubleClickZoom(true);
                }, 251);

                map.removeInteraction(draw);

                $this.removeClass("on");

            }, this);
        } else {
            map.removeInteraction(draw);
        }

    })

    $("#memoBtn").on('click', function () {
        var date = new Date();
        var mil = date.getMilliseconds();

        var sb = new StringBuilder();

        sb.Append('<div id="memo_area">');
        sb.Append('<h2>메모쓰기 <span onclick="closeMemo(' + mil + ');" id="memoCloseBtn" style="cursor:pointer;">닫기</span></h2>');
        sb.Append('<textarea id="memo" name="memo" placeholder="텍스트를 입력하세요" style="resize:none;"></textarea>');
        sb.Append('</div>');

        var memoEmt = $.parseHTML(sb.ToString());
        var memo = new ol.Overlay({
            id: mil,
            element: memoEmt[0],
            positioning: 'bottom-center',
            stopEvent: true,
            insertFirst: true
        });

        var key = map.on('singleclick', function (event) {
            // prevent map to add overlay after each click
            map.removeOverlay(memo);

            // get mouse clicked coordinate
            var coord = event.coordinate;

            // set coordinate for memo
            memo.setPosition(coord);

            // add memo overlay to map
            map.addOverlay(memo);

            $("#closeMemoBtn").trigger('click');
        });

        $("#closeMemoBtn").on('click', function () {
            ol.Observable.unByKey(key);

        });

    })

    // print preview script
    $('#printMapBtn').on("click", function () {
        var map = $("#map").data('map');
        var map1 = $("#map1").data('map');
        var map2 = $("#map2").data('map');
        $('#printMapContent').html('');
        var printArea = $('#printMapContent').eq(0);
        // print preview script for split display

        if ($("#splitMap").hasClass('on')) {
            /*var style1 = $("#container").css("position");
            var style2 = $("#container").css("top");
            var style3 = $("#container").css("left");
            var style4 = $("#container").css("right");
            var style5 = $("#container").css("bottom");
            
            $("#container").css("top","0");
            $(".m_01").hide();
            $(".m_03").hide();
            $(".m_04").hide();
            $(".m_05").hide();
            $('.header_Wrap').hide();
            $('#mapbarWrap').hide();
            $(".btn_zoom").hide();
            $(".lcs_checkbox_switch").hide();
            $("#btn_lock").hide();
            $("#imgYearSelLeft").hide();
            $("#imgYearSelRight").hide();
            $("#dataSideBox").hide();

            window.print();

            setTimeout(function(){
                $("#container").css("position",style1);
                $("#container").css("top",style2);
                $("#container").css("left",style3);
                $("#container").css("right",style4);
                $("#container").css("bottom",style5);
                $(".m_01").show();
                $(".m_03").show();
                $(".m_04").show();
                $(".m_05").show();
                $('.header_Wrap').show();
                $('#mapbarWrap').show();
                $(".btn_zoom").show();
                $(".lcs_checkbox_switch").show();
                $("#btn_lock").show();
                $("#imgYearSelLeft").show();
                $("#imgYearSelRight").show();
                $("#dataSideBox").show();
                map1.updateSize();
                map2.updateSize();
            },1000);*/


            saveMap1().done(function (imageData1) {
                saveMap2().done(function (imageData2) {
                    var img1 = $('<img id="mapImage1">');
                    img1.attr('src', imageData1);
                    var img2 = $('<img id="mapImage2">');
                    img2.attr('src', imageData2);
                    img1.appendTo('#printMapContent');
                    img2.appendTo('#printMapContent');
                })
            })
        } else {

            /*$("#container").css("top","0");
            $(".m_01").hide();
            $(".m_03").hide();
            $(".m_04").hide();
            $(".m_05").hide();
            $('.header_Wrap').hide();
            $('#mapbarWrap').hide();
            $("#dataSideBox").hide();

            window.print();

            setTimeout(function(){
                $("#container").css("top","149px");
                $(".m_01").show();
                $(".m_03").show();
                $(".m_04").show();
                $(".m_05").show();
                $('.header_Wrap').show();
                $('#mapbarWrap').show();
                $("#dataSideBox").show();
                map.updateSize();
            },1000);*/

            // print preview script for single display
            saveMap().done(function (imageData) {
                var openDiv = $('<div class="map_printWrap">');
                var img = $('<img id="mapImage">');

                img.attr('src', imageData);
                openDiv.appendTo('#printMapContent');
                img.appendTo('.map_printWrap');

                // include index in print preview page
                if (indexLayerFeatures != null && indexLayerFeatures != "") {
                    var legendElmtArr = $("input[name=indexCheck]");
                    var legend = new StringBuilder();
                    legend.Append('<div  class="legend"><ul>');
                    $.each(legendElmtArr, function (idx, val) {
                        var check = $(val).prop('checked');
                        if (check === true) {
                            var color = $(val).siblings('span')[0].outerHTML;
                            var label = $(val).siblings('label')[0].outerHTML;
                            legend.Append('<li>');
                            legend.Append(color);
                            legend.Append(label);
                            legend.Append('</li>');
                        }
                    })
                    legend.Append('</ul></div>');
                    $(".map_printWrap").append(legend.ToString());
                }
            });
        }

    });

    // 항고사진 속성검색 "검색" 버튼 클릭 이벤트
    $('#src_btn').on("click", function () {
        clearGeometry();
        pointSearch(currentCRS);
    });

    // 항고사진 속성검색 초기화 버튼 클릭 이벤트
    $("#meta_reset_btn").on("click", function () {
        clearGeometry();
        $("#metaResultList").html('');
    })

    // 항고사진 주점검색 채크박스 클릭 이벤트
    $("input[name='layerCheck']").on('click', function () {
        var yearData = $(this).attr('data-year');
        var dispData = $(this).attr('data-disparity');
        var reducedsca = $(this).attr('reducedsca');
        var colorCode = $(this).siblings().eq(0).attr('class');
        var yearDataArr = [];
        var dispDataArr = [];

        if ($(this).is(":checked")) {
            yearDataArr.push(yearData);
            dispDataArr.push(dispData);
//            map.getView().setZoom(9);
//            displayMainPoint1(yearData, dispData, reducedsca, currentCRS, colorCode);
            displayMainPointLayer(yearData, dispData, reducedsca, currentCRS, colorCode);
        } else {
            map.removeLayer(findBy(map.getLayerGroup(), 'name', 'mainPointLayer_'+yearData+'_'+dispData))
            clearGeometry()
//            clearMainPoints(yearData, dispData, reducedsca, currentCRS);
        }
    })

    // 수치지형도 관련 Javascript---------------------------------------------------------------------------------------------

    // 수치지형도 공간검색 도형선택 클릭 이벤트
    $("a[name='dmap_shp_btn']").on("click", function (e) {
        var $this = $(this);
        var geoFunction;
        var yearVals = $("#dMapYearSelector").val();
        var scaleVal = $("#mapScaleSelector").val();
        var view = map.getView();
        // get draw shape Type
        var shapeType = $(this).attr("data-drawtype");

        $this.toggleClass("on");

        if ($this.siblings().hasClass("on")) {
            $this.siblings().removeClass("on");
        }

        if ($this.hasClass("on")) {
            if (shapeType != "" && shapeType != null) {

                map.removeInteraction(digimapDraw);

                // validation check for year selector
                if (yearVals.length === 0) {
                    alert("년도는 필수입니다.");
                    $this.removeClass("on");
                    return false;
                }

                // clear previous existing vectors
                clearDigitalMap();

                // set zoom level to 읍.면.동
                var emdZoomLevel = $(".m_03").attr('data-value');
                // view.setZoom(emdZoomLevel);

                if (shapeType == "Box") {
                    shapeType = "Circle";
                    geoFunction = ol.interaction.Draw.createBox();
                }

                digimapDraw = new ol.interaction.Draw({
                    type: shapeType,
                    source: vectorSourceDmap,
                    geometryFunction: geoFunction
                });

                map.addInteraction(digimapDraw);

            }

            digimapDraw.on("drawend", function (e) {

                // draw 객체
                geom = e.feature.getGeometry();

                // draw 이벤트와 연결을 끊는다.
                map.removeInteraction(digimapDraw);

                // Circle 일때
                if (geom instanceof ol.geom.Circle) {
                    geom = ol.geom.Polygon.fromCircle(geom);
                    // Box 일때
                } else if (geom instanceof ol.geom.Polygon) {

                    // Point 일때
                } else if (geom instanceof ol.geom.Point) {

                }
                // 복제(clone) 하지 않으면 draw 한 객체가 지도에서 사라진다.
                var cloneGeom = geom.clone();
                var transGeom = cloneGeom.transform(currentCRS, "EPSG:5183");
                var format = new ol.format.WKT();
                var wkt = format.writeGeometry(transGeom);

                // console.log(wkt);
                // 조회
                dmapSearch(yearVals, wkt, scaleVal, currentCRS);

                $("#map").data('map', map);

                //Call to double click zoom control function to deactivate zoom event
                controlDoubleClickZoom(false);
                //Delay execution of activation of double click zoom function
                setTimeout(function () {
                    controlDoubleClickZoom(true);
                }, 251);

                $this.removeClass("on");

                /*var collection = map.getInteractions().getArray();
                collection.forEach(function(ctrl){
                    if(ctrl instanceof ol.interaction.DoubleClickZoom){
                        setTimeout(function(){
                            ctrl.setActive(true);
                        },3000)
                    }
                });*/
            });

        } else {
            map.removeInteraction(digimapDraw);
        }
    });

    // 수치지형도 공간검색 축척 change 이벤트
    $("#mapScaleSelector").on('change', function () {
        var val = $(this).val();
        removeDigitalMap();
        clearDigitalMap();
        if (val === '1000') {
            map.getLayers().insertAt(50, layer1000);
        } else if (val === '5000') {
            map.getLayers().insertAt(50, layer5000);
        } else if (val === '10000') {
            map.getLayers().insertAt(50, layer10000);
        } else {
            map.getLayers().insertAt(50, layer25000);
        }
    })

    // 수치지형도 인덱스 축척 change 이벤트
    /*$("#indexScaleSelector").on('change', function () {
        var val = $(this).val();
        removeDigitalMap();
        clearIndexAll();
        $("#indexTabView").html("");
        if (val === '1000') {
            map.getLayers().insertAt(50, layer1000);
        } else if (val === '5000') {
            map.getLayers().insertAt(50, layer5000);
        } else if (val === '10000'){
            map.getLayers().insertAt(50, layer10000);
        } else {
            map.getLayers().insertAt(50, layer25000);
        }
    })*/

    // 수치지형도 인덱스 축척 change 이벤트
    $("#dmapIndexSearchBtn").on('click', function () {
        closeLegendPop();
        var scale = $("#indexScaleSelector").val();
        var production = $("#indexAuthor").val();

        removeDigitalMap();
        $("#dmapIndexClearBtn").trigger('click');
        if (scale === '1000') {
            map.getLayers().insertAt(50, layer1000);
            displayIndexYearList(scale, production);
        } else if (scale === '5000') {
            map.getLayers().insertAt(50, layer5000);
            displayIndexYearList(scale, production);
        } else if (scale === '10000') {
            map.getLayers().insertAt(50, layer10000);
            displayIndexYearList(scale, production);
        } else {
            map.getLayers().insertAt(50, layer25000);
            displayIndexYearList(scale, production);
        }
    })

    // 수치지형도 인덱스 초기화 버튼 클릭 이벤트
    $("#dmapIndexClearBtn").on('click', function () {

    })

    map.on('click', function (e) {

        var deleteStyle = new ol.style.Style();
        // 해당 interaction이 특정한 레이어에 만 적영 해야 다른 레이어의 이벤트 과 충돌 안함
        var clickInteraction = new ol.interaction.Select({
            // layers:[multiPolygonVectorLayer,indexVectorLayer]
            layers: [multiPolygonVectorLayer],
        });
        var index = 0;

        clickInteraction.un('select');

        if (indexFeatures != null && indexFeatures != '') {
            // click interaction event
            clickInteraction.on('select', function (e) {
                var selected = e.selected[0];
                var featureId = selected.getId();
                var featureStyle = selected.getStyle();
                if (featureId != null && featureId != '') {
                    // console.log(featureStyle);
                    // selected.setStyle(deleteStyle);
                    // selected.setStyle(featureStyle);
                    showDetailDmap(featureId);
                }
            });

            map.addInteraction(clickInteraction);
        }
        /*else if(indexLayerFeatures != null && indexLayerFeatures != ''){
            // click interaction event

            map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                var featureId = feature.getId();
                if(featureId != null && featureId != ''){
                    var info = featureId.split('_');
                    var domInfo = info[0];
                    var yearInfo = info[1];
                    showDetailIndex(domInfo,yearInfo);
                }
                layer.setZIndex(index+1);
            });

            map.addInteraction(clickInteraction);
        }*/

    });

    $("#mapScale,#mapScaleChange").on('change', function () {
        var zoomVal = $(this).val();
        map.getView().setZoom(zoomVal);

        var map1 = $("#map1").data('map');
        var map2 = $("#map2").data('map');

        if (map1 != null && map1 != undefined) {
            map1.getView().setZoom(zoomVal);
        }
        if (map2 != null && map2 != undefined) {
            map2.getView().setZoom(zoomVal);
        }

    })

    $("#dmapSearchBtn").on('click', function () {
        var yearsVal = $("#dMapYearSelector").val();
        var scaleVal = $("#mapScaleSelector").val();
        var domVal = $("#dom_num").val();

        if (yearsVal.length < 1) {
            alert("년도는 필수 입니다");
            return false;
        }

        clearDigitalMap();
        dmapSearchByYear(yearsVal, scaleVal, domVal, currentCRS);

    })

    // 수치지형도 관련 Javascript---------------------------------------------------------------------------------------------


    // for addding event listener on map view if there is any propert change event
    /*
    map.getView().on('propertychange', function(e) {
        switch (e.key) {
            case 'resolution':
                console.log(e.oldValue);
                break;
        }
    });

    map.on('moveend',function(){
        var center = map.getView().getCenter();
        var px = map.getPixelFromCoordinate(center);
        // console.log(px);
    })
    */

})
function getCenterAddr(map){
    var map = $("#"+map+"").data('map');
			var feature = new ol.Feature({
				geometry : new ol.geom.Point(ol.proj.transform(map.getView().getCenter(), map.getView().projection_.code_, 'EPSG:5186')),
			});
			var format = new ol.format.WKT();
			var geom = feature.getGeometry();

			if (geom instanceof ol.geom.Circle) {
				geom = ol.geom.Polygon.fromCircle(geom);
			}

			var wkt = format.writeGeometry(geom);

			var type = geom.getType();

			switch(type){
				case "LineString" :
					wkt = wkt.replace("LINESTRING", "MULTILINESTRING(");
					wkt += ")";
					break;
				case "Polygon" :
					wkt = wkt.replace("POLYGON", "MULTIPOLYGON(");
					wkt += ")";
					break;
			}

			$.ajax({
				type : 'post',
				url : gp.ctxPath + "/status/getCenterAddr.json",
				dataType : "json",
				data :"wkt="+wkt,
				cache : false,
				async : false,
				success : function(response){
					$("#location_div2 span.con").html("광주광역시 " + response.addr.guNam + " " + response.addr.bjdNam);
				}
			});
		}
function numberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
