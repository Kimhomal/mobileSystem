/**
 * 레이어 추가 및 맵 객체를 추가하는 곳
 */
(function(window, $) {
	"use strict";

	var MapMaker = function(mapId, options){
		this.mapId = mapId;
		this._options = options;
		this.init();
	};

	MapMaker.prototype = {
		// 임시레이어
		layer : {
			measure : null,			// 측정
			polygon : null,
			select : null,
		},
		overlay : {
			overlayElement : null,				// 측정용
            overlayLayer : null,				// 측정용
            overlayViewElement : null,			// 측정용
            overlayViewLayer : null,			// 측정용
            overlayFacilityElement : null,		// 시설물 거리 면적
            overlayFacilityLayer : null,		// 시설물 거리 면적
			overlayTooltipElement : null,		// 시설물 선택 레이어 툴팁
			overlayTooltipLayer : null,			// 시설물 선택 레이어 툴팁
			overlayTooltipAppend : null,		// 시설물 선택 레이어 툴팁
			overlayTooltipAppendElem : null,	// 시설물 선택 레이어 툴팁
			overlayDrawElement : null,			// 그리기용
			overlayDrawLayer : null,			// 그리기용
		},
		control : {
			measure : {
				polyline : null,
				polygon : null,
			},
		},

		drag : {
		},
		measure : {
			properties : {
				continueMsg : '마우스 우측 버튼 클릭시 종료',
				overlayClassName : 'measure-tooltip tooltip-static',
				overlayViewClassName : 'measure-tooltip',
//				wgs84Sphere : new ol.Sphere(6378137),
				isMeasure : false
			},
			feature : null,
			features : null,
		},
		map : null,					// OL Map 객체

        mapAction : null,		// 지도 액션 관리
		mapLayerMng : null,		// 레이어 관리
		mapFacilityMng : null,	// 시설물 레이어
        mapEvtMng : null,		// 지도 이벤트 관리

		baseMapList : [],			// 배경지도 리스트(ex : 바로이맵, 다음, 네이버 등등)
		baseMapLayers : null,	// 배경지도 서브 리스트(ex:기본지도, 위성지도 등등)

		baseMap : null,				// 배경지도 객체
		mapName : null,			// 배경지도 한글 이름
		crsCode : null,				// 배경지도 좌표체계 코드
		center : null,					// 중심 좌표
		zoomLvl : null,				// 줌 레벨

		config : null,					// MapMaker 설정 객체
		history : [],
		historyLimit : 50,
		historyNow : -1,
		historyClick : false,

		mode : "",

		moveEndEvt : null,

		keyVal : null,				// 판독현황 상세화면 키 값
		
		_defaults : {
			proxyWms : G.baseUrl + "map/proxy/wms.do",
			proxyWfs : G.baseUrl + "map/proxy/wfs.do",
			noProxyWms : "http://1.234.21.200:8062/geoserver/gb/wms",
			noProxyWfs : "http://1.234.21.200:8062/geoserver/gb/wfs",
			proxyBackground : "",
//			proxyBackground : G.baseUrl + "map/proxy/proxyBackground.do?url=",
			workspace : "gb",
			facilityCrsCode : "EPSG:5187",

			initBaseMap : "VWorld",
			arrOlDefaultCtrl : [ new ol.control.ScaleLine(), new ol.control.ZoomSlider() ],
		},

		init : function(){
			
			var _self = this;
//			_self.config =  _self._options;
			_self.config = $.extend({}, _self._defaults, _self._options);

			$.each(BaseMapConfig, function(idx, lyr){
				_self.baseMapList.push(lyr);
			});
			
			_self.baseMap = BaseMapConfig[_self.config.initBaseMap];

			_self.mapName = _self.baseMap.korName;
			_self.crsCode = _self.baseMap.crsCode;

			_self.center = _self.baseMap.center;
			_self.zoomLvl = 0;

			_self.map = new ol.Map({
				renderer : 'canvas',
//				controls : ol.control.defaults({ attribution: false }).extend(_self.config.arrOlDefaultCtrl),
				target : _self.mapId,
//				loadTilesWhileAnimating : true,
				interactions : ol.interaction.defaults({
					shiftDragZoom : false,
					altShiftDragRotate : false,
					doubleClickZoom : false,
					pinchRotate : false,
					dragPan: false,
		        }).extend([
		            new ol.interaction.DragPan({kinetic: false})]),
				view : _self.getViewByCrsCode(_self.crsCode)
			});

			_self.mapAction = new MapAction(_self); 			//지도 액션 처리
			_self.mapLayerMng = new MapLayerMng(_self); 		//지도 레이어 관리
			_self.mapFacilityMng = new MapFacilityMng(_self);	//지도 시설물 관리
			_self.mapEvtMng = new MapEvtMng(_self); 			//지도 이벤트 관리

			_self.addBaseMapLayers(); //배경지도 레이어 추가(BaseMapConfig)

			_self.initCenter(_self.center);
			
			_self._loadEvent();
		},
		getWktFromGeom : function(geom) {
			var format = new ol.format.WKT();
			var wkt = format.writeGeometry(geom);
			return wkt;
		},
		initCenter : function(center) {
			this.map.getView().setCenter(center);
			this.map.getView().setZoom(this.zoomLvl);
		},
		setExtent : function() {
			var extent = this.baseMap.extent;
			this.map.getView().fit(extent);
		},
		
		getViewByCrsCode : function(crsCode) {
			var resolutions;

			if (crsCode == "EPSG:4326") {
				resolutions = [ 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 0.0006866455078125, 0.00034332275390625, 0.000171661376953125, 0.0000858306884765625, 0.00004291534423828125, 0.000021457672119140625, 0.000010728836059570312, 0.000005364418029785156, 0.000002682209014892578 ]
			} else {
				resolutions = this.baseMap.resolutions;
			}

			var projection = new ol.proj.Projection({
				code : crsCode,
				units : 'm',
				axisOrientation : 'enu'
			});
//197334	176219
//			var center = ol.proj.transform(this.baseMap.center, this.baseMap.crsCode, projection);
			var center =this.baseMap.center;

			var mapView = new ol.View({
				projection : projection,
				center : center,
				resolutions : resolutions
			})

			return mapView;
		},

		addBaseMapLayers : function(params) {

			this.mapLayerMng.addBaseMapLayers();

			this.setExtent();
		},

		changeBaseMapWithName : function(baseMapName){
			var baseMapCrsCode;
			var oldProj;
			var newProj;
			var coord;
			var zoom;

			var baseMap = BaseMapConfig[baseMapName];
			baseMapCrsCode = baseMap.crsCode;
			oldProj = this.baseMap.crsCode;
			coord = this.map.getView().getCenter();
			zoom = this.map.getView().getZoom();

			this.changeCrsCode(baseMapCrsCode);
			this.changeBaseMap(baseMap);
			this.mapAction.setCenter(oldProj, baseMapCrsCode, coord, zoom);

		},

		changeCrsCode : function(crsCode){
			var prevCrsCode = this.crsCode;
			this.crsCode = crsCode;
			this.map.setView(this.getViewByCrsCode(crsCode));
			this.mapAction.setExtent();

			if(prevCrsCode != this.crsCode){
				this.mapAction.transformFeature(prevCrsCode, this.crsCode);
			}
		},

		changeBaseMap : function(baseMap) {
			this.baseMap = baseMap;
			// basemap 교체
			this.addBaseMapLayers();
		},
		
		createMeasureTooltip : function() {
			this.overlay.overlayElement = document.createElement('div');
			this.overlay.overlayElement.className = this.measure.properties.overlayClassName;

			this.overlay.overlayLayer = new ol.Overlay({
				element : this.overlay.overlayElement,
				offset : [ 0, -15 ],
				positioning : 'bottom-center'
			});
			this.map.addOverlay(this.overlay.overlayLayer);
		},

		createHelpTooltip : function(){
			if (this.overlay.overlayViewLayer) {
				this.map.removeOverlay(this.overlay.overlayViewLayer);
			}
			this.overlay.overlayViewElement = document.createElement('div');
			this.overlay.overlayViewElement.className = this.measure.properties.overlayViewClassName;
			this.overlay.overlayViewLayer = new ol.Overlay({
//				element : this.overlay.overlayViewElement,
//				offset : [ 15, 0 ],
//				positioning : 'center-left'
			});
			this.map.addOverlay(this.overlay.overlayViewLayer);
		},

		setOverlayLayerTooltip : function(params) {
			this.overlay = $.extend({}, this.overlay, params);

			this.overlay.overlayTooltipLayer = new ol.Overlay({
				id : "layer-tooltip",
				element : this.overlay.overlayTooltipElement,
				offset : [10, 0],
				positioning : "bottom-left"
			});

			this.map.addOverlay(this.overlay.overlayTooltipLayer);
		},
		
		getWkt : function (feature) {
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

			return wkt;
		},
		
		_loadEvent : function() {

			var _self = this;
			
			this.moveEndEvt = _self.map.on('moveend', function(evt) { //이동이 끝날때 시작함

				var map = _self.map;
				var moveEndEvt = _self.moveEndEvt;

				map.un(moveEndEvt);

				try {
                    mapMaker1.map.getView().setCenter(map.getView().getCenter());//map1 센터를 맞춤
                    mapMaker1.map.getView().setZoom(map.getView().getZoom());//map1 줌값을 맞춤
                }catch (e) {

                }

				map.updateSize();

				map.on(moveEndEvt);
				
				// 현재 위치 주소 취득
				var feature = new ol.Feature({
					geometry : new ol.geom.Point(ol.proj.transform(map.getView().getCenter(), map.getView().projection_.code_, 'EPSG:5187')),
				});

				var wkt = _self.getWkt(feature);

				var geom = feature.getGeometry();

				if (geom instanceof ol.geom.Circle) {
					geom = ol.geom.Polygon.fromCircle(geom);
				}

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
				
//				$.ajax({
//					type : 'post',
//					url : gp.ctxPath + "/status/getCenterAddr.json",
//					dataType : "json",
//					data :"wkt="+wkt,
////					cache : false,
////					async : false,
//					success : function(response){
//						$("#location_div2 span.con").html("광주광역시 " + response.addr.guNam + " " + response.addr.bjdNam);
//						$("#sgg").val(response.addr.guCde || '');
//						$("#emd").val(response.addr.bjdCde ? response.addr.bjdCde.slice(0, 8) : '');
//					}
//				});
			});
		},
		
		searchAddr : function(params){
			var addrLen = params.literal.length;

			switch(true){
				case addrLen == 2:
					params.layer = "lp_aa_sido,bjcd";
					break;
				case addrLen == 5:
					params.layer = "lp_aa_sgg,bjcd";
					break;
				case addrLen == 8:
					params.layer = "lp_aa_emd,bjd_cde";
					break;
				case addrLen == 19:
					params.layer = "gj_lpbn,pnu";
					break;
				default:
					params.layer = "";
					break;
			}

			if ( addrLen < 10 ) params.literal = $.rpad(params.literal, 10, "0");

			this.sendWFS(params);
		},

		sendWFS : function(params) {
			var _self = this;

			$.ajax({
				type : 'post',
				url : G.baseUrl + "status/GetFeatureInfo.json",
				dataType : "json",
				data :"type=literal"+"&layers="+params.layer+"&literals="+params.literal+"&srsName=EPSG:5187",
				cache : false,
				success : function(response){
					params.response = response.jsonView;
					_self._setXml(params);
				},
				complete: function(){
					makeCircle();
				},
				error : function(xhs, status, error)
				{
					alert('서버와의 통신에 실패했습니다.');
				},
			});
		},

		_setXml : function(params){
			var mapMaker = this;
			var map = mapMaker.map;

			var theParser = new ol.format.WFS();

			var features = theParser.readFeatures(params.response);

			if (features) {
				if (features.length > 0) {
					features.forEach(function(feature) {
//						if(mapMaker.config.facilityCrsCode == "EPSG:4326"){
//							feature.getGeometry().applyTransform(function (coords, coords2, stride) {
//								for (var j = 0 ; j < coords.length ; j += stride) {
//									var y = coords[j];
//									var x = coords[j+1];
//									coords[j] = x;
//									coords[j + 1] = y;
//								}
//							});
//						}
						feature.setGeometry(feature.getGeometry().transform("EPSG:5187", mapMaker.crsCode));

						var view = map.getView();
						view.fit(feature.getGeometry().getExtent());

						if (view.getZoom() > 4) {
							map.getView().setZoom(4);
						}
							mapMaker.baseMapLayers[0].setVisible(true);

					});
				} else 
					{
//					console.log(params.literal)
					var center = ol.proj.transform([params.x, params.y], "EPSG:5183", "EPSG:3857");
				 	mapMaker1.map.getView().setCenter(center);
				 	mapMaker1.map.getView().setZoom(4);
//					alert("현재 시스템은 부산광역시에 대한 서비스만 제공하고 있으므로, 타 지역은 위치 이동이 되지 않습니다.");
				}
			}
		},
		//거리,면적,메모 20181211 여기서부터
		startMeasure : function(type) {
			var mapMaker = this;
			this.offControl();
			var map = mapMaker.map;

			if (map == null || map == "" || map == "undefined") return;

			this._initMeasure();
			this.measure.properties.isMeasure = true;

			this.measure.feature = null;
			this.measure.features = mapMaker.layer.measure.getSource().getFeatures();

			var control = mapMaker.control.measure[type];
			control.setActive(true);

			mapMaker.createMeasureTooltip();
			mapMaker.createHelpTooltip();

			control.on("drawstart", function(evt){
				mapMaker.measure.feature = evt.feature;
			}, this);

			control.on('drawend', function(evt) {
				mapMaker.measure.features.push(evt.feature);

				mapMaker.overlay.overlayElement.className = mapMaker.measure.properties.overlayClassName;
				mapMaker.overlay.overlayLayer.setOffset([0, -7]);

				mapMaker.measure.feature = null;
				mapMaker.overlay.overlayLayer = null;

				mapMaker.createMeasureTooltip();
				mapMaker.offMeasure();
			}, this);

			mapMaker.setMeasureEvt();
		},
		setControl : function (keyValue) {
			$.each(this._mapMaker.control.draw, function(kind, control){
				if(kind == keyValue){
					this.setActive(true);
				}else{
					this.setActive(false);
				}
			});
		},
		offControl : function () {
			var mapMaker = this;
			$.each(mapMaker.control, function(kind, control){
				$.each(control, function(name){
					this.setActive(false);
				});
			});

			var $measureOverlay = $("div." + this.measure.properties.overlayViewClassName);

			var overlayClassName = this.measure.properties.overlayClassName;

			if($measureOverlay.length != 0) {
				$measureOverlay.each(function(){
					if (!$(this).hasClass(overlayClassName)) {
						$(this).remove();
					}
				});
			}

		},
		_initMeasure : function() {
			var mapMaker = this;
			mapMaker.map.un("pointermove"); // 확인 필요
			$.each(mapMaker.control.measure, function(){
				this.setActive(false);
			});
			this.measure.properties.isMeasure = false;
		},
		offMeasure : function() {
			var mapMaker = this;

			this._initMeasure();
		},
		setMeasureEvt : function () {
			var mapMaker = this;
			//측정 시 마우스 무브 이벤트
			var map = mapMaker.map;
			var overlay = mapMaker.overlay;

			map.on("pointermove", function(evt){
				if (evt.dragging) {
					return;
				}

//				var helpMsg = '측정을 시작하십시오';
				var tooltipCoord = evt.coordinate;

				if (mapMaker.measure.feature) {
					var output;
					var geom = mapMaker.measure.feature.getGeometry();
					if (geom instanceof ol.geom.Polygon) {
						output = mapMaker.calculateArea(geom);
						tooltipCoord = geom.getInteriorPoint().getCoordinates();
					} else if (geom instanceof ol.geom.LineString) {
						output = mapMaker.calculateDistance(geom);
						tooltipCoord = geom.getLastCoordinate();
					}
//					helpMsg = mapMaker.measure.properties.continueMsg;

					overlay.overlayElement.innerHTML = output;
					overlay.overlayLayer.setPosition(tooltipCoord);
				}

//				overlay.overlayViewElement.innerHTML = helpMsg;
				overlay.overlayViewLayer.setPosition(evt.coordinate);

			});

		},
		calculateDistance : function(line) {
			var length;
			var sourceProj = this.map.getView().getProjection();

			if (sourceProj != "EPSG:4326") {
				var coordinates = line.getCoordinates();
				length = 0;
				for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
					var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
					var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
//					length += this.measure.properties.wgs84Sphere.haversineDistance(c1, c2);
					length += ol.sphere.getDistance(c1, c2, 6378137);
				}
			} else {
				length = Math.round(line.getLength() * 100) / 100;
			}
			var output = "총거리 : " + (Math.round(length * 100) / 100) + ' ' + 'm';
			return output;
		},

		calculateArea : function(polygon) {
			var area;
			var sourceProj = this.map.getView().getProjection();

			if (sourceProj != "EPSG:4326") {
				var geom = /** @type {ol.geom.Polygon} */
				(polygon.clone().transform(sourceProj, 'EPSG:4326'));
				var coordinates = geom.getLinearRing(0).getCoordinates();
//				area = Math.abs(this.measure.properties.wgs84Sphere.geodesicArea(coordinates));
				area = Math.abs(ol.sphere.getArea(geom, {projection:'EPSG:4326', radius:6378137}));
			} else {
				area = polygon.getArea();
			}
			var output = "총면적 : " +(Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
			return output;
		},
		setMapStyle : function() {
			var _self = this;

			var drawStyle = new ol.style.Style({
				fill : new ol.style.Fill({
					color : 'rgba(102,204,204, 0.3)'
				}),
				stroke : new ol.style.Stroke({
					color : 'rgba(102,204,204, 1)',
				}),
				image : new ol.style.Circle({
					radius : 6,
					fill : new ol.style.Fill({
						color : 'rgba(255,255,255, 0)'
					}),
					stroke : new ol.style.Stroke({
						color : 'rgba(102,204,204, 1)',
						width : 2
					})
				})
			}); //그릴때 스타일 정의

			var measureStyle = new ol.style.Style({
		        fill : new ol.style.Fill({
			        color : 'rgba(255, 35, 35, 0.25)'
		        }),
		        stroke : new ol.style.Stroke({
		            color : 'rgba(255, 35, 35, 0.6)',
		            width : 5
		        }),
		        image : new ol.style.Circle({
		            radius : 5,
		            stroke : new ol.style.Stroke({
			            color : 'rgba(0, 0, 0, 0.7)'
		            }),
		            fill : new ol.style.Fill({
			            color : 'rgba(255, 255, 255, 0.2)'
		            })
		        })
		    })


			$.each(_self.control, function(kind){

				$.each(this, function(name){
					var control;
					if (kind == "draw" || kind == "measure") {
						var typeNm = name.substring(0,1).toUpperCase() + name.substring(1);

						if (typeNm == "Polyline") {
							typeNm = "LineString";
						} else if (typeNm.indexOf("Draw") > -1) {
							typeNm = typeNm.replace("Draw", "");
						} else if (typeNm == "SearchPolygon" || typeNm == "SearchCircle") {
							typeNm = typeNm.replace("Search", "");
						}

						var source;
						var style;
						var opt = null;

						
							style = measureStyle;
							source = _self.layer[kind].getSource();
						

						var drawOpt = $.extend({}, {
							source : source,
							type : typeNm,
							style : style,
						}, opt);

						control = new ol.interaction.Draw(drawOpt);

						if (name != "draw" && name.indexOf("draw") > -1) {
							control.on("drawend", function(evt){

								var geom = evt.feature.getGeometry().transform( _self.crsCode, _self.config.facilityCrsCode);

								if (geom instanceof ol.geom.Circle) {
									geom = ol.geom.Polygon.fromCircle(geom);
								}

								var e = evt;

						 	});
						 }
					}

					control.setActive(false);
					_self.control[kind][name] = control;
					_self.map.addInteraction(_self.control[kind][name]);
				});
			});
		},
		allClear : function () {
			var mapMaker = this;
			mapMaker.layer.measure.getSource().clear();
			$("div." + this.measure.properties.overlayViewClassName).remove();
			$.each(mapMaker.overlay, function(key, val){
				if (this instanceof ol.Overlay && key.indexOf("Tooltip") < 0) {
					mapMaker.map.removeOverlay(this);
				}
			});
		},

        /**
         * 피처로 지도 이동
         * @param params(json)
         * key (lyrId : 레이어 명, filter : where 조건문)
         * By. 한봄
         */
        setMoveFromFeature: function (params) {
            var fts = this.getFeatureByKey(params.lyrId, params.filter);
            var extent = ol.proj.transformExtent(fts.features[0].getGeometry().getExtent(), this.config.facilityCrsCode, this.crsCode);
            var view = this.map.getView();
            view.fit(extent);
        },

        /**
         * wfs 레이어 Filter
         * @method
         * @param sql
         * @param keyword 키워드
         */
        getFeatureByKey: function (lyrId, filter) {
            var geojsonFormat = new ol.format.GeoJSON();
            var features = null;
            var mapMaker = this;
            $.ajax({
                url: mapMaker.config.noProxyWfs,
                dataType: 'json',
                async: false,
                data: {
                    srs: mapMaker.config.facilityCrsCode,
                    request: 'GetFeature',
                    version: '1.0.0',
                    typename: mapMaker.config.workspace + ':' + lyrId,
                    outputFormat: 'application/json',
                    CQL_FILTER: filter
                },
                success: function (response) {
                    features = {
                        count: response.totalFeatures,
                        features: geojsonFormat.readFeatures(response)
                    };
                },
                error: function (a, b, c) {
                    console.log("error");
                }
            });
            return features;
        },

        setCenter: function (coord, zoom, oldProj, newProj) {
            var center = null;
            if (oldProj != undefined) {
                center = ol.proj.transform(coord, oldProj, newProj);
            } else {
                center = ol.proj.transform(coord, this.config.facilityCrsCode, this.crsCode);
            }
            this.map.getView().setCenter(center);
            this.map.getView().setZoom(zoom);
        },

	}

	window.MapMaker = MapMaker;

})(window, jQuery);