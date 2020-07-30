$(function() {
	"use strict";
	var mapControl = function(options) {
		var _self = this;

        var _map = $("#map").data('map');

		var sketch;
		var helpTooltipElement;
		var helpTooltip;
		var measureTooltipElement;
		var measureTooltip;
		var continuePolygonMsg = '다음 폴리곤 지점 클릭';
		var continueLineMsg = '다음 라인 지점 클릭';

		var geodesic;
		var wgs84Sphere = new ol.Sphere(6378137);

		var draw;
		var measureStartLsnr;
		var measureEndLsnr;

		var sid_code;
		var sgg_code;
		var emd_code;

		// 측정레이어 소스
		this.measureSource;

		// 측정벡터 레이어
		this.measureLayer;

		this.indexMapView = null;

		this.overviewMapControl = null;

		this.initialize = function(options) {
			_self.createIndexMap(_map.crscode, _map._basemap.basemapCode);
			_self.initBaseMapEvt();
			initZoomBar();
			initLeftToolBarEvt();
			_map.addControl(new ol.control.ScaleLine());

			measureVector();
			loadCTP();
			_map.on('moveend', function() {
				// 툴바 현재 주소 변경
				_self.setSidoByCenter();
				_self.setSggByCenter();
				_self.setEmdByCenter();

			});

			$('#top_sid').change(function() {
				setCenterBySido($(this).val());
			});
			$('#top_sgg').change(function() {
				setCenterBySgg($(this).val());
			});
			$('#top_emd').change(function() {
				setCenterByEmd($(this).val());
			});

			// initMPosition();

			// $(".ol-zoom.ol-unselectable.ol-control").css("display", "none");
		}

		function initMPosition() {
			$("#" + _map.getTarget()).off();
			$("#" + _map.getTarget()).mousemove(function(e) {

				var coord = _map.getEventCoordinate(e);
				var mapPrj = _map.getView().getProjection().getCode();
				// var targetPrj = _map.mPositionCrsCode;
				//
				// var transCoord = ol.proj.transform(coord, mapPrj, targetPrj);

				var lon = coord[0].toFixed(2);
				var lat = coord[1].toFixed(2);

				$("#posCRS").text(mapPrj);
				$("#posX").text("X : " + lon);
				$("#posY").text("Y : " + lat);
			});

		}

        this.createIndexMap = function (crscode, basemapCode) {
            MapPlatform.Manager.map.removeControl(_self.overviewMapControl);
            _self.overviewMapControl = null;
            _self.indexMapView = null;

            var baseMapInfo = MapPlatform.BaseMap[basemapCode];

            var spanEl = document.createElement("div");
            $(spanEl).css("width", "25px");
            $(spanEl).css("height", "25px");
            $(spanEl).css("border-right", "3px solid white");
            $(spanEl).css("border-bottom", "3px solid white");
            $(spanEl).css("background-color", "rgb(245, 245, 245)");
            $(spanEl).css("color", "gray");
            $(spanEl).append("<span class='fa fa-angle-right' style='transform: rotate(45deg); font-size: 20px; margin: 2px 0px 0px 2px;'></span>");

            var colSpanEl = document.createElement("div");
            $(colSpanEl).css("width", "25px");
            $(colSpanEl).css("height", "25px");
            $(colSpanEl).css("border-right", "3px solid white");
            $(colSpanEl).css("border-bottom", "3px solid white");
            $(colSpanEl).css("background-color", "rgb(245, 245, 245)");
            $(colSpanEl).css("color", "gray");
            $(colSpanEl).append("<span class='fa fa-angle-left' style='transform: rotate(45deg); font-size: 20px; margin: 2px 0px 0px 2px;'></span>");

            var targetMap = MapPlatform.Manager.map;
            var prop = targetMap._basemap.layers.base;

            var basemapName = baseMapInfo.name;
            var layers;
            var layer;
            var extent = targetMap._basemap.extent;
            var initZoom = (targetMap._basemap.initZoom != null && targetMap._basemap.initZoom != undefined) ? targetMap._basemap.initZoom : 1;
            var maxResolution = (targetMap._basemap.maxResolution != null && targetMap._basemap.maxResolution != undefined) ? targetMap._basemap.maxResolution : 2048;
            var numZoomLevels = (targetMap._basemap.numZoomLevels != null && targetMap._basemap.numZoomLevels != undefined) ? targetMap._basemap.numZoomLevels : 14;
            var resolutions = [];

            if (targetMap._basemap.resolutions) {
                numZoomLevels = targetMap._basemap.resolutions.length;
                for (var i = 0; i < numZoomLevels; i++) {
                    resolutions[i] = targetMap._basemap.resolutions[i];
                }
            } else {
                if (maxResolution && numZoomLevels) {
                    resolutions[0] = maxResolution;
                    for (var i = 1; i < numZoomLevels; i++) {
                        resolutions[i] = resolutions[i - 1] / 2;
                    }
                }
            }

            var maxZoom = (targetMap._basemap.maxZoom != null && targetMap._basemap.maxZoom != undefined) ? targetMap._basemap.maxZoom : 14;
            var minZoom = (targetMap._basemap.minZoom != null && targetMap._basemap.minZoom != undefined) ? targetMap._basemap.minZoom : 0;

            var url = prop.url;
            var urls = [];
            var match = /\{(\d)-(\d)\}/.exec(url) || /\{([a-z])-([a-z])\}/.exec(url);
            if (match) {
                var startCharCode = match[1].charCodeAt(0);
                var stopCharCode = match[2].charCodeAt(0);
                var charCode;
                for (charCode = startCharCode; charCode <= stopCharCode; ++charCode) {
                    urls.push(url.replace(match[0], String.fromCharCode(charCode)));
                }
            } else {
                urls.push(url);
            }

            var tileGrid = new ol.tilegrid.TileGrid({
                extent: extent,
                tileSize: targetMap._basemap.tileSize ? targetMap._basemap.tileSize : 256,
                resolutions: resolutions,
                origin: [
                    extent[0], extent[1]
                ],
                minZoom: minZoom
            });

            layer = new ol.layer.Tile({
                extent: extent,
                source: new ol.source.XYZ({
                    projection: targetMap._basemap.crscode,
                    url: MapPlatform.Config.getProxy() + prop.url,

                    tileGrid: tileGrid
                }),
                name: 'overviewMap',
                visible: true
            });

            var tileUrlFunction;
            tileUrlFunction = function (tileCoord, pixelRatio, projection) {
                var zRegEx = /\{z\}/g;
                var incZRegEx = /\{z1\}/g;
                var dashZRegEx = /\{-z\}/g;
                var dashIncZRegEx = /\{-z1\}/g;
                var xRegEx = /\{x\}/g;
                var yRegEx = /\{y\}/g;
                var dashYRegEx = /\{-y\}/g;
                var dashYNoZRegEx = /\{-y0\}/g;
                var z = tileCoord[0];
                var x = tileCoord[1];
                var y = tileCoord[2];

                var h = (x << z) + y;
                var url;
                if (urls.length > 0) {
                    var index = Math.abs(h) % urls.length;
                    url = urls[index];
                } else {
                    url = urls[0];
                }

                y = y;

                url = url.replace(zRegEx, z.toString())
                    .replace(yRegEx, y.toString())
                    .replace(xRegEx, x.toString())
                    .replace(dashZRegEx, function () {
                        var dashZ = resolutions.length - z;
                        return dashZ.toString();
                    })
                    .replace(dashIncZRegEx, function () {
                        var dashZ = resolutions.length - (z + 1);
                        return dashZ.toString();
                    })
                    .replace(incZRegEx, function () {
                        var incZ = z + 1;
                        return incZ.toString();
                    })
                    .replace(dashYRegEx, function () {
                        var dashY = (1 << z) - y - 1;
                        return dashY.toString();
                    })
                    .replace(dashYNoZRegEx, function () {
                        var dashY = -y - 1;
                        return dashY.toString();
                    });
                return MapPlatform.Config.getProxy() + url;
            };
            layer.getSource().setTileUrlFunction(tileUrlFunction);
            layers = [ new ol.layer.Tile({
                source : new ol.source.XYZ({
                    projection : "EPSG:3857",
//			        url : MapPlatform.Config.getProxy() +"http://xdworld.vworld.kr:8080/2d/Base/201512/{z}/{x}/{y}.png"
                    url : MapPlatform.Config.getProxy() +"http://xdworld.vworld.kr:8080/2d/Base/201411/{z}/{x}/{y}.png"
                }),
                name : 'overviewMap',
                visible : true,
                opacity : 1

            }), layer ];
            _self.indexMapView = new ol.View({
                projection : crscode,
                minZoom : minZoom,
                // zoom: 3,
                resolution : resolutions
                // ,
                // maxZoom: 16
            });
            _self.overviewMapControl = new ol.control.OverviewMap({
                view: _self.indexMapView,
                className: 'ol-overviewmap ol-custom-overviewmap',
                layers: layers,
                collapseLabel: spanEl,
                label: colSpanEl,
                collapsed: false
            });

            targetMap.addControl(_self.overviewMapControl);
        }

		this.initBaseMapEvt = function() {

            // basemap 버튼 초기화
            $("#s_basemap").empty();

            for (var int = 0; int < _map.basemapList.length; int++) {
                $('#s_basemap').append(new Option(_map.basemapList[int].korName, _map.basemapList[int].korName));
            }
            $("#s_basemap").off();
            $("#s_basemap").on("change", function() {
                var basemap = $(this).val();
                _map.changeBasemapByName(basemap);
                $("#s_basemap").siblings("label").text($(this).val());
            });

            $("#s_basemap").val(_map._basemap.korName);
            $("#s_basemap").siblings("label").text(_map._basemap.korName);

            // basemap 버튼 초기화
            $("#t_basemap").empty();
            for (var int = 0; int < _map.baseLayers.length; int++) {
                $('#t_basemap').append(new Option(_map.baseLayers[int].get("name"), _map.baseLayers[int].get("name")));
                if(int == 0){
                    $("#t_basemap").siblings("label").text(_map.baseLayers[int].get("name"));
                }
            }

            $("#baseMapNameOVL"+MapPlatform.Manager.map.mapIndex).text(_map._basemap.korName);

            $("#t_basemap").on("change", function() {
                var basemap = $(this).val();
                offBaseLayers();
                var layer = MapPlatform.Manager.map.getLayerByName(basemap);
                layer.setVisible(true);
                if (basemap == "하이브리드") {
                    var satelayer = MapPlatform.Manager.map.getLayerByName("위성지도");
                    satelayer.setVisible(true);
                }
                $("#t_basemap").siblings("label").text($(this).val());
            });
		}

		function offBaseLayers() {
			for (var int = 0; int < _map.baseLayers.length; int++) {
				_map.baseLayers[int].setVisible(false);
			}
		}

		function initZoomBar() {
			var zoomslider = new ol.control.ZoomSlider();
			_map.addControl(zoomslider);
		}

		function animateZoom() {
			var zoom = ol.animation.zoom({
			    resolution : _map.getView().getResolution(),
			    duration : 150
			});

			_map.beforeRender(zoom);
		}

		function initLeftToolBarEvt() {
			$("#measureDist").on("click", function(e) {

				// measureSelect("LineString");
				turnMeasure(true, "dist");
				$("#t_measure_drop").css("display", "none");
			});

			$("#measureArea").on("click", function(e) {
				// measureSelect("Polygon");
				turnMeasure(true, "area");
				$("#t_measure_drop").css("display", "none");
			});

			$("#menu_left_measure").on("click", function(e) {
				var id = this.id;
				if (getBtnActive(id)) {
					// 소스 클리어
					leftBtnChange(id, false);
					console.log("측정 끄기");
					_self.offMeasure();

				} else {
					$("#t_measure_drop").css("display", "block");
				}
			});

			$("#measureRefresh").on("click", function(e) {
				turnMeasure(false);
				//turnInfo(false);
			});
		}

		function turnMeasure(turn, type) {
			// _self.offInfo();

			var id = "menu_left_measure";

			if (turn) {
				MapPlatform.BufferSearch.deactive();
				MapPlatform.Interaction.pause();
			    MapPlatform.FeatureInfo.pause();
                MapPlatform.AnalysisInfo.pause();
				leftBtnChange(id, turn);
				leftBtnChange("menu_left_info", !turn);
				if (type == "dist") {
					measureSelect("LineString");
				} else if (type == "area") {
					measureSelect("Polygon");

				}

			} else {
				_self.offMeasure();
				MapPlatform.Interaction.resume();
			    MapPlatform.FeatureInfo.resume();
                MapPlatform.AnalysisInfo.resume();
			}

		}
		function turnInfo(turn, type) {
			_self.offMeasure();

			var id = "menu_left_info";

			if (turn) {
				leftBtnChange(id, turn);
				leftBtnChange("menu_left_measure", !turn);
				$("#map").css("cursor", "pointer");
				if (type == "obj") {
					if (MapPlatform.Manager.getPanel("Layer").selectedLayer != null) {
						MapPlatform.form.FeatureInfo.active(); // 객체정보보기 활성화

					} else {
						alert("선택된 레이어가 없습니다.");
						MapPlatform.form.FeatureInfo.disable();
						MapPlatform.Manager._panels.Radius.disable();
						// _self.offInfo();
						leftBtnChange(id, !turn);
						return;
					}
				} else if (type == "area") {
					infoSelect(type);
				}
				// else if(type == "radius"){
				// if(MapPlatform.Manager._panels.Radius.calc == null){
				// alert("반경분석 설정정보가 없습니다. 설정 창으로 이동합니다.");
				// MapPlatform.Manager._panels.MenuSpanal.radius();
				// _self.offInfo();
				// return;
				// }
				// MapPlatform.Manager._panels.Radius.active();
				//
				// }
			} else {
				MapPlatform.form.FeatureInfo.disable();
				MapPlatform.Manager._panels.Radius.disable();
				// _self.offInfo();
			}

			// 소스 클리어

		}

		this.offMeasure = function() {
			leftBtnChange("menu_left_measure", false);
			$("#t_measure_drop").css("display", "none");
			$("#menu_left_measure").attr("expanded", "false");
			measureClear();
		}
		/*
		 * this.offInfo = function() { leftBtnChange("menu_left_info", false); $("#t_info_drop").css("display", "none"); $("#menu_left_info").attr("expanded", "false"); $("#map").css("cursor", "default"); MapPlatform.Manager._panels.Frame.closeBottom(); infoClear(); }
		 */

		function leftBtnChange(id, boolean) {
			if (boolean) {
				$("#" + id).css("border", "1px solid #C5C5C5");
				$("#" + id).css("background-color", "#DEDEDE");
				$("#" + id).parent().attr("class", "open");
			} else {
				$("#" + id).css("border", "1px solid #FFFFFF");
				$("#" + id).css("background-color", "#FFFFFF");
				$("#" + id).parent().attr("class", "");
			}
		}

		function getBtnActive(id) {
			var active = false;
			if ($("#" + id).css("background-color") == "rgb(222, 222, 222)") {
				active = true;
			}
			return active;
		}

		function measureSelect(type) {
			geodesic = true;

			if (_map.getLayers()) {
				if (type == "LineString" || type == "Polygon") {
					addInteraction(type);
				}
			}
		}
		function infoSelect(type) {
			MapPlatform.Manager._panels.SummaryInfo.areaInfo();
			MapPlatform.Manager._panels.Frame.closeBottom();
			$("#summ_graphDiv").css("display", "inline");
			$("#summ_tableDiv").css("display", "none");
			MapPlatform.Manager._panels.Frame.openBottom();

			$("#summ_graph_bndInfo_table_wrapper").remove();

			$("#summ_graph_bndChart iframe").remove();
			$("#summ_graph_bndChart canvas").remove();
			$("#summ_graph_bndChart").append('<canvas id="canvas" height="230" width="230"></canvas>');

			_self.offMeasure();

		}

		function measureClear() {
			_self.measureSource.clear();
			_map.removeInteraction(draw);
			_map.getOverlays().clear();
			draw = null;
		}

		function infoClear() {
			MapPlatform.Manager._panels.SummaryInfo.areaSummSource.clear();
			MapPlatform.Manager._panels.SummaryInfo.offAreaLayer();
			$("#summ_graphDiv").remove();
			_map.un('singleclick', MapPlatform.Manager._panels.SummaryInfo.areaInfoClickEvt);
			// _map.un('singleclick', MapPlatform.Manager._panels.Radius._clickEvent);
			if (MapPlatform.Manager.map.getLayerByName("VT_DEFAULT") != null) {
				MapPlatform.form.FeatureInfo.disable(); // 객체정보보기 비활성화
				// MapPlatform.Manager._panels.Radius.disable(); // 반경분석 비활성화

			}
		}

		function pointerMoveHandler(evt) {
			if (evt.dragging) {
				return;
			}
			/** @type {string} */
			var helpMsg = '클릭하여 측정 시작';

			if (sketch) {
				var geom = (sketch.getGeometry());
				if (geom instanceof ol.geom.Polygon) {
					helpMsg = continuePolygonMsg;
				} else if (geom instanceof ol.geom.LineString) {
					helpMsg = continueLineMsg;
				}
			}

			helpTooltipElement.innerHTML = helpMsg;
			helpTooltip.setPosition(evt.coordinate);

			$(helpTooltipElement).removeClass('hidden');
		}
		;

		function addInteraction(type) {
			_map.removeInteraction(draw);

			draw = new ol.interaction.Draw({
			    source : _self.measureSource,
			    type : /** @type {ol.geom.GeometryType} */
			    (type),
			    style : new ol.style.Style({
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
			});

			_map.addInteraction(draw);

			createMeasureTooltip();
			createHelpTooltip();

			var listener;
			measureStartLsnr = draw.on('drawstart', function(evt) {
				// set sketch
				sketch = evt.feature;

				/** @type {ol.Coordinate|undefined} */
				var tooltipCoord = evt.coordinate;

				listener = sketch.getGeometry().on('change', function(evt) {
					var geom = evt.target;
					var output;
					if (geom instanceof ol.geom.Polygon) {
						output = "총면적 : " + formatArea(/** @type {ol.geom.Polygon} */
						(geom));
						tooltipCoord = geom.getInteriorPoint().getCoordinates();
					} else if (geom instanceof ol.geom.LineString) {
						output = "총거리 : " + formatLength( /** @type {ol.geom.LineString} */
						(geom));
						tooltipCoord = geom.getLastCoordinate();
					}
					measureTooltipElement.innerHTML = output;
					measureTooltip.setPosition(tooltipCoord);
				});
			}, this);

			measureEndLsnr = draw.on('drawend', function(evt) {
				measureTooltipElement.className = 'tip tipStatic';
				measureTooltip.setOffset([ 0, -7 ]);
				// unset sketch
				sketch = null;
				// unset tooltip so that a new one can be created
				measureTooltipElement = null;
				createMeasureTooltip();
				ol.Observable.unByKey(listener);
			}, this);
		}

		function createHelpTooltip() {
			if (helpTooltipElement) {
				helpTooltipElement.parentNode.removeChild(helpTooltipElement);
			}
			helpTooltipElement = document.createElement('div');
			helpTooltipElement.className = 'tip hidden';
			helpTooltip = new ol.Overlay({
			    element : helpTooltipElement,
			    offset : [ 15, 0 ],
			    positioning : 'center-left'
			});
			_map.addOverlay(helpTooltip);
		}

		function createMeasureTooltip() {
			if (measureTooltipElement) {
				measureTooltipElement.parentNode.removeChild(measureTooltipElement);
			}
			measureTooltipElement = document.createElement('div');
			measureTooltipElement.className = 'tip tipMeasure';
			measureTooltip = new ol.Overlay({
			    element : measureTooltipElement,
			    offset : [ 0, -15 ],
			    positioning : 'bottom-center'
			});
			_map.addOverlay(measureTooltip);
		}

		function formatLength(line) {
			var length;
			if (geodesic) {
				var coordinates = line.getCoordinates();
				length = 0;
				var sourceProj = _map.getView().getProjection();
				for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
					var c1 = MapPlatform.Crs.transformCoordinate(coordinates[i], sourceProj, 'EPSG:4326');
					var c2 = MapPlatform.Crs.transformCoordinate(coordinates[i + 1], sourceProj, 'EPSG:4326');
					length += wgs84Sphere.haversineDistance(c1, c2);
				}
			} else {
				length = Math.round(line.getLength() * 100) / 100;
			}
			var output;
			if (length > 100) {
				output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
			} else {
				output = (Math.round(length * 100) / 100) + ' ' + 'm';
			}
			return output;
		}
		;

		function formatArea(polygon) {
			var area;
			if (geodesic) {
				var sourceProj = _map.getView().getProjection();
				var geom = /** @type {ol.geom.Polygon} */
				(polygon.clone().transform(sourceProj, 'EPSG:4326'));
				var coordinates = geom.getLinearRing(0).getCoordinates();
				area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
			} else {
				area = polygon.getArea();
			}
			var output;
			if (area > 1000000) {
				output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
			} else {
				output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
			}
			return output;
		}
		;

		var measureVector = function() {

			_self.measureSource = new ol.source.Vector();

			_self.measureLayer = new ol.layer.Vector({
			    source : _self.measureSource,
			    style : new ol.style.Style({
			        fill : new ol.style.Fill({
				        color : 'rgba(255, 35, 35, 0.25)'
			        }),
			        stroke : new ol.style.Stroke({
			            color : 'rgba(255, 35, 35, 0.6)',
			            width : 5
			        }),
			        image : new ol.style.Circle({
			            radius : 7,
			            fill : new ol.style.Fill({
				            color : '#ffcc33'
			            })
			        })
			    })
			});

			_map.addLayer(_self.measureLayer);
		}

		this.setSidoByCenter = function() {
			var center = _map.getView().getCenter();
			var transProjCenter = MapPlatform.Crs.transformCoordinate(center, _map.crscode, 'EPSG:4326');

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
			xml += '<wfs:Query typeName="URCB:TL_SCCO_CTPRVN">';
			xml += '<wfs:PropertyName>CTP_KOR_NM</wfs:PropertyName>';
			xml += '<wfs:PropertyName>CTPRVN_CD</wfs:PropertyName>';
			xml += '<ogc:Filter><ogc:Contains>';
			xml += '<ogc:PropertyName>THE_GEOM</ogc:PropertyName>';
			xml += '<gml:Point><gml:pos>' + transProjCenter[1] + " " + transProjCenter[0] + '</gml:pos></gml:Point>';
			xml += '</ogc:Contains></ogc:Filter></wfs:Query></wfs:GetFeature>';

			MapPlatform.Http.requestData(MapPlatform.Config.getHostWFS(), xml, "POST", "json", "text/xml", false).done(function(result) {
				if (result.features.length == 0) {
					return;
				}
				var response = result.features[0].properties;

				var address = response.CTP_KOR_NM;
				var pnu_no = response.CTPRVN_CD;
				$("#top_sid").siblings("label").text(address);
				$("#top_sid").val(pnu_no);
				sid_code = pnu_no;
				loadSGG(response.CTPRVN_CD);
			});
		}

		this.setSggByCenter = function() {
			var center = _map.getView().getCenter();
			var transProjCenter = MapPlatform.Crs.transformCoordinate(center, _map.crscode, 'EPSG:4326');

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
			xml += '<wfs:Query typeName="URCB:TL_SCCO_SIG">';
			xml += '<wfs:PropertyName>SIG_KOR_NM</wfs:PropertyName>';
			xml += '<wfs:PropertyName>SIG_CD</wfs:PropertyName>';
			xml += '<ogc:Filter><ogc:Contains>';
			xml += '<ogc:PropertyName>THE_GEOM</ogc:PropertyName>';
			xml += '<gml:Point><gml:pos>' + transProjCenter[1] + " " + transProjCenter[0] + '</gml:pos></gml:Point>';
			xml += '</ogc:Contains></ogc:Filter></wfs:Query></wfs:GetFeature>';

			MapPlatform.Http.requestData(MapPlatform.Config.getHostWFS(), xml, "POST", "json", "text/xml", false).done(function(result) {
				if (result.features.length == 0) {
					return;
				}
				var response = result.features[0].properties;

				var address = response.SIG_KOR_NM;
				var pnu_no = response.SIG_CD;
				$("#top_sgg").siblings("label").text(address);
				$("#top_sgg").val(pnu_no);
				sgg_code = pnu_no;
				loadEMD(response.SIG_CD);
			});
		}

		this.setEmdByCenter = function() {
			var center = _map.getView().getCenter();
			var transProjCenter = MapPlatform.Crs.transformCoordinate(center, _map.crscode, 'EPSG:4326');

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
			xml += '<wfs:Query typeName="URCB:TL_SCCO_EMD">';
			xml += '<wfs:PropertyName>EMD_KOR_NM</wfs:PropertyName>';
			xml += '<wfs:PropertyName>EMD_CD</wfs:PropertyName>';
			xml += '<ogc:Filter><ogc:Contains>';
			xml += '<ogc:PropertyName>THE_GEOM</ogc:PropertyName>';
			xml += '<gml:Point><gml:pos>' + transProjCenter[1] + " " + transProjCenter[0] + '</gml:pos></gml:Point>';
			xml += '</ogc:Contains></ogc:Filter></wfs:Query></wfs:GetFeature>';

			MapPlatform.Http.requestData(MapPlatform.Config.getHostWFS(), xml, "POST", "json", "text/xml", false).done(function(result) {
				if (result.features.length == 0) {
					return;
				}
				var response = result.features[0].properties;

				var address = response.EMD_KOR_NM;
				var pnu_no = response.EMD_CD;
				$("#top_emd").siblings("label").text(address);
				$("#top_emd").val(pnu_no);
				emd_code = pnu_no;
			});
		}

		function setCenterBySido(code) {
			var cql = "CTPRVN_CD LIKE '" + code + "%'";

			var param = {
			    SERVICE : 'WFS',
			    VERSION : '1.1.0',
			    REQUEST : 'GETFEATURE',
			    TYPENAME : 'TL_SCCO_CTPRVN',
			    PROPERTYNAME : 'THE_GEOM',
			    OUTPUTFORMAT : 'application/json',
			    CQL_FILTER : cql
			}

			var select = $('#top_sgg');

			MapPlatform.Http.requestData(MapPlatform.Config.getHostWFS(), param, 'GET', 'json', "", true).done(function(result) {

				var features = result.features[0];

				var format = new ol.format.GeoJSON();
				var feature = format.readFeature(features);
				feature.getGeometry().transform(MapPlatform.Config.BASE_EPSG, MapPlatform.Manager.map.crscode);
				var extent = feature.getGeometry();
				MapPlatform.Manager.map.getView().fit(extent, MapPlatform.Manager.map.getSize());
				MapPlatform.Manager.map.addUserFeature("ADDR_LOC", feature);
				setTimeout(function() {
					MapPlatform.Manager.map.removeUserFeatures("ADDR_LOC");
				}, 1000);

			});
		}

		function setCenterBySgg(code) {
			var cql = "SIG_CD LIKE '" + code + "%'";

			var param = {
			    SERVICE : 'WFS',
			    VERSION : '1.1.0',
			    REQUEST : 'GETFEATURE',
			    TYPENAME : 'TL_SCCO_SIG',
			    PROPERTYNAME : 'THE_GEOM',
			    OUTPUTFORMAT : 'application/json',
			    CQL_FILTER : cql
			}

			var select = $('#top_sgg');

			MapPlatform.Http.requestData(MapPlatform.Config.getHostWFS(), param, 'GET', 'json', "", true).done(function(result) {

				var features = result.features[0];

				var format = new ol.format.GeoJSON();
				var feature = format.readFeature(features);
				feature.getGeometry().transform(MapPlatform.Config.BASE_EPSG, MapPlatform.Manager.map.crscode);
				var extent = feature.getGeometry();
				MapPlatform.Manager.map.getView().fit(extent, MapPlatform.Manager.map.getSize());
				MapPlatform.Manager.map.addUserFeature("ADDR_LOC", feature);
				setTimeout(function() {
					MapPlatform.Manager.map.removeUserFeatures("ADDR_LOC");
				}, 1000);
			});
		}

		function setCenterByEmd(code) {
			var cql = "EMD_CD LIKE '" + code + "%'";

			var param = {
			    SERVICE : 'WFS',
			    VERSION : '1.1.0',
			    REQUEST : 'GETFEATURE',
			    TYPENAME : 'TL_SCCO_EMD',
			    PROPERTYNAME : 'THE_GEOM',
			    OUTPUTFORMAT : 'application/json',
			    CQL_FILTER : cql
			}

			var select = $('#top_sgg');

			MapPlatform.Http.requestData(MapPlatform.Config.getHostWFS(), param, 'GET', 'json', "", true).done(function(result) {

				var features = result.features[0];

				var format = new ol.format.GeoJSON();
				var feature = format.readFeature(features);
				feature.getGeometry().transform(MapPlatform.Config.BASE_EPSG, MapPlatform.Manager.map.crscode);
				var extent = feature.getGeometry();
				MapPlatform.Manager.map.getView().fit(extent, MapPlatform.Manager.map.getSize());
				MapPlatform.Manager.map.addUserFeature("ADDR_LOC", feature);
				setTimeout(function() {
					MapPlatform.Manager.map.removeUserFeatures("ADDR_LOC");
				}, 1000);
			});
		}

		function loadCTP() {

			var param = {
			    SERVICE : 'WFS',
			    VERSION : '1.1.0',
			    REQUEST : 'GETFEATURE',
			    TYPENAME : 'TL_SCCO_CTPRVN',
			    PROPERTYNAME : 'CTP_KOR_NM,CTPRVN_CD',
			    OUTPUTFORMAT : 'application/json'
			}

			var select = $('#top_sid');

			MapPlatform.Http.requestData(MapPlatform.Config.getHostWFS(), param, 'GET', 'json', "", false).done(function(result) {

				var features = result.features;
				var list = [];
				for (var i = 0; i < features.length; i++) {
					var address = features[i].properties['CTP_KOR_NM'];
					var pnu_no = features[i].properties['CTPRVN_CD'];
					list.push({
					    address : address,
					    pnu_no : pnu_no
					});
				}
				list = list.sort(function(a, b) {
					return a.address.localeCompare(b.address);
				});
				$(select).empty();
				for (var i = 0; i < list.length; i++) {
					$(select).append(new Option(list[i].address, list[i].pnu_no));
				}
				$(select).val(sid_code);

			});

		}

		function loadSGG(code) {

			var cql = "SIG_CD LIKE '" + code + "%'";

			var param = {
			    SERVICE : 'WFS',
			    VERSION : '1.1.0',
			    REQUEST : 'GETFEATURE',
			    TYPENAME : 'TL_SCCO_SIG',
			    PROPERTYNAME : 'SIG_KOR_NM,SIG_CD',
			    OUTPUTFORMAT : 'application/json',
			    CQL_FILTER : cql
			}

			var select = $('#top_sgg');

			MapPlatform.Http.requestData(MapPlatform.Config.getHostWFS(), param, 'GET', 'json', "", false).done(function(result) {

				var features = result.features;
				var list = [];
				for (var i = 0; i < features.length; i++) {
					var address = features[i].properties['SIG_KOR_NM'];
					var pnu_no = features[i].properties['SIG_CD'];
					list.push({
					    address : address,
					    pnu_no : pnu_no
					});
				}
				list = list.sort(function(a, b) {
					return a.address.localeCompare(b.address);
				});
				$(select).empty();
				for (var i = 0; i < list.length; i++) {
					$(select).append(new Option(list[i].address, list[i].pnu_no));
				}
				$(select).val(sgg_code);
			});

		}
		function loadEMD(code) {
			var cql = "EMD_CD LIKE '" + code + "%'";

			var param = {
			    SERVICE : 'WFS',
			    VERSION : '1.1.0',
			    REQUEST : 'GETFEATURE',
			    TYPENAME : 'TL_SCCO_EMD',
			    PROPERTYNAME : 'EMD_KOR_NM,EMD_CD',
			    OUTPUTFORMAT : 'application/json',
			    CQL_FILTER : cql
			}

			var select = $('#top_emd');

			MapPlatform.Http.requestData(MapPlatform.Config.getHostWFS(), param, 'GET', 'json', "", false).done(function(result) {

				var features = result.features;
				var list = [];
				for (var i = 0; i < features.length; i++) {
					var address = features[i].properties['EMD_KOR_NM'];
					var pnu_no = features[i].properties['EMD_CD'];
					list.push({
					    address : address,
					    pnu_no : pnu_no
					});
				}
				list = list.sort(function(a, b) {
					return a.address.localeCompare(b.address);
				});
				$(select).empty();
				for (var i = 0; i < list.length; i++) {
					$(select).append(new Option(list[i].address, list[i].pnu_no));
				}
				$(select).val(emd_code);
			});

		}

		function initEventCTP() {
			$('#analysisArea_select_ctp').off();
			$('#analysisArea_select_ctp').change(function() {
				$('#analysisArea_select_sig').empty();
				$('#analysisArea_select_emd').empty();

				var sig = $(this).children(':selected').val();
				loadSIG(sig);
			});
		}

		function initEventSIG() {
			$('#analysisArea_select_sig').off();
			$('#analysisArea_select_sig').change(function() {
				$('#analysisArea_select_emd').empty();

				var sig = $('#analysisArea_select_ctp').children(':selected').val();
				var emd = $(this).children(':selected').val();
				loadEMD(sig, emd);
			});
		}



		this.initialize(options);
	};



});


var captureMap = function(){
    var deferred = $.Deferred();
    $(".ol-zoom.ol-unselectable.ol-control").css("display", "none");
    $(".ol-zoomslider.ol-unselectable.ol-control").css("display", "none");
    $(".ol-overviewmap.ol-custom-overviewmap.ol-unselectable.ol-control").css("display", "none");
    $(".ol-scale-line.ol-unselectable").css("display", "none");

    html2canvas($("#map").eq(0), {
        logging: true,
        proxy: "/proxy/proxy.jsp",
        // width : canvasWidth,
        // height : canvasHeight,
        onrendered: function (canvas) {
            var imageData = canvas.toDataURL("image/png");
            deferred.resolve(imageData);

        }
    });
    $("#map").css("height", "100%");
    $(".ol-zoom.ol-unselectable.ol-control").css("display", "block");
    $(".ol-zoomslider.ol-unselectable.ol-control").css("display", "block");
    $(".ol-overviewmap.ol-custom-overviewmap.ol-unselectable.ol-control").css("display", "block");
    $(".ol-scale-line.ol-unselectable").css("display", "block");
    return deferred.promise();
}


/*
 * 함수명 : saveImg
 * 작업자 : 이동욱
 * 완료일 : 2016/12
 * 인자 :
 * 기능설명 : 지도 이미지저장
 */
function saveImg() {
    captureMap().done(function(imageData) {
        download(imageData, "map.png", "image/png");

    });
}

/*
 * 함수명 : printImg
 * 작업자 : 이동욱
 * 완료일 : 2016/12
 * 인자 :
 * 기능설명 : 지도 이미지출력
 */
function printImg() {

    captureMap().done(function(imageData) {
        var windowContent = '<!DOCTYPE html>';
        windowContent += '<html>';
        windowContent += '<head><title>Print Map</title></head>';
        windowContent += '<body>';
        windowContent += '<img src="' + imageData + '">';
        windowContent += '</body>';
        windowContent += '</html>';

        var printWin = window.open('', '');
        printWin.document.open();
        printWin.document.write(windowContent);
        printWin.document.close();
        printWin.focus();
        setTimeout(function() {
            printWin.print();
            //printWin.close();
        }, 3000);
    });

}
