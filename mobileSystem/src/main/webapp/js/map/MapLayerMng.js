(function(window, $) {
	"use strict";

	// BASIC FUNCTIONS ===================================================START
	function replacer(match, letter, value) {
		  var str = Number(value).toString(letter == 'L' ? 10 : 16);
		  var len = letter == 'L' ? 2 : 8;
		  while (str.length < len) {
		    str = '0' + str;
		  }
		  return letter + str;
		}
	var MapLayerMng = function(mapMaker) {
		this._mapMaker = mapMaker;
	};

	MapLayerMng.prototype = {
		boundary : {
			lp_aa_sido : "시도",
			lp_aa_sgg : "시군구",
			lp_aa_emd : "읍면동",
			lp_pa_bbnd : "지번 올드",
			lp_pa_cbnd : "지번"
		},

		layers : {
			wms : {},
			wfs : {},
		},

		_addWfsLayer : function(lyrName, params){
			var _self = this;
			var geomJsonFormat = new ol.format.GeoJSON();

			_self.layers.wfs[lyrName] = new ol.layer.Vector({
				name : lyrName,
				id : lyrName,
				title : params.layerNm,
				kind : "interpretFacil",
				source : new ol.source.Vector({
					loader : function(extent, resoultion, projection) {
						_self.layers.wfs[lyrName].getSource().clear(true);

						$.ajax({
							url : _self._mapMaker.config.proxyWfs,
							dataType : "json",
							cache : false,
							data : {
								request : "GetFeature",
								version : "1.1.1",
								typename : "gb:" + lyrName,
								outputFormat : "application/json",
//								CQL_FILTER : "key=" + "'" + _self._mapMaker.keyVal + "'"
							},
							beforeSend : function() {
							},
							success : function(response) {
								var dataProjection = "EPSG:5187";
                                console.log(_self._mapMaker.crsCode);
								var fs = geomJsonFormat.readFeatures(response, {

                                	dataProjection : dataProjection,
									featureProjection : _self._mapMaker.crsCode
								});

								// var scale = 0.8;
								_self.layers.wfs[lyrName].getSource().addFeatures(fs);
								// mapMaker1.map.getView().fit(_self.layers.wfs[lyrName].getSource().getExtent());
							},
							complete : function() {
							},
							error : function(a, b, c) {
								console.log("error : " + lyrName);
							}
						});
					},
					strategy : ol.loadingstrategy.bbox
				}),
				visible : params.visible,
				style : MapFacilityMng.style.wfs
			});

			_self._mapMaker.map.addLayer(_self.layers.wfs[lyrName]);
			// _self._mapMaker.map.getLayers().insertAt(990, _self.layers.wfs[lyrName]);
		},

		_addWmsLayer : function(lyrName, params){
			var reqParams = {
				LAYERS : lyrName,
				VERSION : '1.1.0',
//				QUERY_LAYERS: lyrName,
				FORMAT : "image/png"
			};
			if(params.kind == "allBasic") {
				reqParams =  $.extend({},reqParams, {LAYERS : lyrName, QUERY_LAYERS : lyrName});
			} else {
				if(params.hasOwnProperty("CQL_FILTER")) {
					reqParams =  $.extend({},reqParams, {CQL_FILTER : params.CQL_FILTER, CQL_FILTER_ORI : params.CQL_FILTER});
				}
			}
			
			this.layers.wms[lyrName] = new ol.layer.Tile({
				kind : "interpretFacil",
				title : params.layerNm,
				id : lyrName,
				visible : params.visible === 'true' ? true : false,
				maxZoom: 14,
//				minResolution : 1.5,
				source : new ol.source.TileWMS({
//					projection: this._mapMaker.config.facilityCrsCode,
					projection: this._mapMaker.map.getView().getProjection(),
					url : this._mapMaker.config.proxyWms,
					params : reqParams,
//					cacheSize: 256,
					serverType : "geoserver"
				})
			});

			this._mapMaker.map.addLayer(this.layers.wms[lyrName]);
		},

		_setBaseMapLayer : function(params){
			var baseMapLyr = new ol.layer.Tile({
				kind : params.kind,
				title : params.layerKorName,
				id : params.layerName,
				visible : params.visible,
				source : new ol.source.XYZ({
					url : params.url,
					projection : params.crsCode,
					tileGrid : params.tileGrid
				})
			});

			return baseMapLyr;
		},

		addBaseMapLayers : function(){

			var _self = this;

			$.each(_self._mapMaker.baseMapLayers, function(idx, lyr){
				_self._mapMaker.map.removeLayer(lyr);
			});

			_self._mapMaker.baseMapLayers = [];

			var proxyBackground = _self._mapMaker.config.proxyBackground;

			$.each(_self._mapMaker.baseMap.layers, function(lyrName, lyr){

				var baseMapName = _self._mapMaker.baseMap.name;
				var baseMapKorName = _self._mapMaker.baseMap.korName;
				var tileGrid;
				var layer;

				if (baseMapName == "Daum") {
					tileGrid = new ol.tilegrid.TileGrid({
						extent : [ (-30000 - 524288), (-60000 - 524288), (494288 + 524288), (988576 + 524288) ],
						origin : [ -30000, -60000 ],
						tileSize : 256,
						resolutions : [ 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25 ],
						minZoom : 1
					});
				}

				layer = _self._setBaseMapLayer({
					layerName : baseMapName + "_" + lyrName,
					layerKorName : lyr.name,
					url : proxyBackground + lyr.url,
					visible : lyr.visible,
					crsCode : _self._mapMaker.baseMap.crsCode,
					kind : "base",
					tileGrid : tileGrid
				});

				var tileUrlFunction;
				var zRegEx = /\{z\}/g;
				var xRegEx = /\{x\}/g;
				var yRegEx = /\{y\}/g;
				var jRegEx = /\{j\}/g;
				var kRegEx = /\{k\}/g;

				if (baseMapName == "Daum") {
					tileUrlFunction = function(tileCoord, pixelRatio, projection) {
						if (tileCoord == null) return undefined;

						var s = Math.floor(Math.random() * 4); // 0 ~ 3
						var z = this.tileGrid.getResolutions().length - tileCoord[0];
						var x = tileCoord[1].toString();
						var y = tileCoord[2].toString();

						return proxyBackground + lyr.url.replace(xRegEx, x).replace(yRegEx, y).replace(zRegEx, z).replace("{0-3}", s);
					};

					layer.getSource().setTileUrlFunction(tileUrlFunction);

				}

				_self._mapMaker.baseMapLayers.push(layer);
			});

			$.each(_self._mapMaker.baseMapLayers, function(idx, lyr){
				_self._mapMaker.map.getLayers().insertAt(idx, lyr);
			});
		},
		/**
		 * 행정경계 레이어 추가
		 * @date
		 * @method
		 * @name addBoundaryLayers
		 * @param visible(bool type) -> true : 행정경계 레이어 visible true 및 투명처리 / false : 행정경계 레이어 visible false 및 파란색경계
		 */
		addBoundaryLayers : function(){
			var _self = this;

			$.each(this.boundary, function(lyrNm, korLyrNm){
				_self._addWmsLayer(lyrNm, {
					layerKorName : korLyrNm,
					kind : "allBasic",
					visible : false
				});
			});
		},
		//도곽레이어 추가 임시
//		addDogwakLayers : function(){
//			var _self = this;
//
//			$.each(this.boundary, function(lyrNm, korLyrNm){
//				_self._addWmsLayer(lyrNm, {
//					layerKorName : korLyrNm,
//					kind : "boundary",
//					visible : false
//				});
//			});
//		},

		addFacilityLayers : function(){
			var _self = this;

			//WMS
//			$.each(MapFacilityMng.layer.wms, function(k, v){
//				_self._addWmsLayer(k, v);
//			});

			//WFS
//			$.each(MapFacilityMng.layer.wfs, function(k, v){
//				_self._addWfsLayer(k, v);
//			});

			$.ajax({
				url: gp.ctxPath + '/layer/getLayerList.json',
				type: "POST",
				dataType: "json", // 응답받을 타입
				error: function (xhs, status, error) {
					if (xhs.status == 600) {
						alert("세션이 만료되었습니다.");
						location.href = gp.ctxPath + "/mainPage.do";
					} else {
						alert('서버와의 통신에 실패했습니다.');
					}
				},
				success: function (responseData, textStatus) {
					console.log(responseData);
//					var tileLayers = [];
					var active = 0;
					$.each(responseData.layers, function (key, val) {
						if(active > 10){
							return;
						}
						_self._addWmsLayer(val.tableNm.toLowerCase(), val);
//						active++;
						
//						_self._addWfsLayer(val.tableNm.toLowerCase(), val);
//						var lyrName = val.tableNm.toLowerCase();
//						var params = val;
//						
//						var reqParams = {
//							LAYERS : lyrName,
//							VERSION : '1.1.0',
//							QUERY_LAYERS: lyrName,
//							FORMAT : "image/png",
//						};
//						
//						var visible = true;
//						
////						if(lyrName.includes('swl_')){
////							visible = true;
////						}
//						_self.layers.wms[lyrName] = new ol.layer.Tile({
//							kind : "interpretFacil",
//							title : params.layerNm,
//							id : lyrName,
//							visible : visible,
////							minResolution : 1.5,
//							source : new ol.source.TileWMS({
////								projection: this._mapMaker.config.facilityCrsCode,
//								projection: _self._mapMaker.map.getView().getProjection(),
//								url : _self._mapMaker.config.proxyWms,
//								params : reqParams,
//								serverType : "geoserver"
//							})
//						});
//						
//						tileLayers.push(_self.layers.wms[lyrName]);
					});
					
//					var layerGroup = new ol.layer.Group({
//						layers: tileLayers
//					});
//					
//					_self._mapMaker.map.addLayer(layerGroup);
//					setEventTree();
				}
			});
		},

		// 판독 결과 레이어
		addInterpretLayers : function(gbn, lyrGbn, prgCd, key) {
			var _self = this;
            _self._mapMaker.keyVal = key;

			if(gbn == "select") {
                var lyrName = "";
                var lyrName2 = "";

				if(prgCd == "허가·신고") {
                    lyrName = "shp_huga_pl";
				} else if(prgCd == "기존") {
                    lyrName = "shp_kijon_pl";
				} else if(prgCd == "기존 및 신고") {
                    lyrName = "shp_kisin_pl";
				} else if(prgCd == "기존 및 부수시설") {
                    lyrName = "shp_kibu_pl";
				} else if(prgCd == "부수시설") {
                    lyrName = "shp_busu_pl";
				} else if(prgCd == "공공") {
                    lyrName = "shp_kongkong_pl";
				} else if(prgCd == "공익") {
                    lyrName = "shp_kongik_pl";
                } else if(prgCd == "행정조치") {
                    lyrName = "shp_hangjung_pl";
                } else if(prgCd == "소멸") {
                    lyrName = "shp_somyeol_pl";
                } else if(prgCd == "철거") {
                    lyrName = "shp_chulgeo_r_pl";
                    lyrName2 = "shp_chulgeo_y_pl";
                } else if(prgCd == "철거예정") {
                    lyrName = "shp_chulye_r_pl";
                    lyrName2 = "shp_chulye_y_pl";
                } else if(prgCd == "허가위반") {
                    lyrName = "shp_wiban_pl";
                } else if(prgCd == "정비예정") {
                    lyrName = "shp_jungye_r_pl";
                    lyrName2 = "shp_jungye_y_pl";
                } else if(prgCd == "기한부신고") {
                    lyrName = "shp_kihanbu_pl";
                } else if(prgCd == "재판독") {
                    lyrName = "shp_jaepandok_pl";
                } else if(prgCd == "진행") {
                    lyrName = "shp_jinhang_pl";
                } else if (prgCd == "") {
					if(lyrGbn == "LYR15" || lyrGbn == "LYR16") {
						lyrName = "shp_jungye_r_pl";
						lyrName2 = "shp_jungye_y_pl";
					}
				}

                $("#lyrName").val(lyrName);
				$("#lyrName2").val(lyrName2);

                //WFS
                $.each(MapFacilityMng.layer.wfs, function(k, v) {
                	if(k == $("#lyrName").val()) {
                		v.visible = true;
                        _self._addWfsLayer(k, v);
					} else {
                		if(k == $("#lyrName2").val()) {
                            v.visible = true;
                            _self._addWfsLayer(k, v);
                        }
                    }
                });
			} else {
                //WMS
                $.each(MapFacilityMng.layer.wms, function(k, v) {
                    _self._addWmsLayer(k, v);
                });
			}
		},

		getLayerById : function(id){
			var layers = this._mapMaker.map.getLayers().getArray();
			var layer = null;
			$.each(layers, function(idx, lyr){
				if(lyr.get("id") == id.toLowerCase()) {
					layer = lyr;
					return false;
				}
			});

			return layer;
		},
		
		addAirPhotoLayers : function(year){
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

		    
		    //yull pc
//		    var urlTemplate = "file:///C:/Users/yull/Desktop/" + year + "_1/" + year + "_1/{z}/{y}/{x}.png";
		    
		    //TMS 경로
		    //var urlTemplate = "file:///E:/aeroData/tiles/" + year + "/{z}/{y}/{x}.png";
//		    var urlTemplate = G.aeroDataTiles + '/' + year + '/{z}/{y}/{x}.png';
		    var urlTemplate = "file:///D:/ftp/cache/"+year+"/Layers/_alllayers/L{z}/R{y}/C{x}.png";
	    
		    
		    //200번 server 
//		    var urlTemplate = "file:///C:/Users/lee/Desktop/test2/{z}/{y}/{x}.png";
//		    var urlTemplate = "../images/airPhoto/"+year+"/L{z}/R{y}/C{x}.png"
		    
		    var test =new ol.layer.Tile({
		    		kind : "bs_"+year+"_1",
					title : "bs_"+year+"_1",
					name: "bs_"+year+"_1",
					id :  "bs_"+year+"_1",
		            source: new ol.source.XYZ({
		            	tileLoadFunction : function(imageTile, src) {
//							alert(src);
							$.ajax({
							type : "post",
							url : G.baseUrl+"map/TileImageConvert.json",
							data : "url="+src,
							dataType : "json",
							cache: false,
//							async : false,
							success : function(value) {
								imageTile.getImage().src = value.src || "";
							}
						});
						},
		              maxZoom: 16,
		              projection: projection,
		              tileSize: tileSize,
		              tileGrid :new ol.tilegrid.TileGrid({

	                	  extent : [ 165727.00000019523, 169818.29999650625, 204613.14999997505, 197718.89999695309 ],
//	                      extent: [13756219.106426602, 3860987.1727408236, 14666125.491133342, 4863840.983842337],
	                      origin: origin,
	                      tileSize: 256,
	                      resolutions : [ 79.37515875031751, 52.916772500211671, 26.458386250105836, 13.229193125052918, 5.2916772500211673, 2.6458386250105836, 1.3229193125052918, 0.52916772500211673, 0.26458386250105836],
							 minZoom: 1
	                  }),

	                  tileUrlFunction: function(tileCoord) {
	                  	var z = (tileCoord[0]).toString();
	      				var x = (tileCoord[1]).toString();
	      				var y = (tileCoord[2]).toString();
						var url= urlTemplate.replace(xRegEx, x).replace(yRegEx, y).replace(zRegEx, z);
						console.log(url);
//						return url;
		      			return url.replace(/(L)([0-9]+)/, replacer).replace(/(R)([0-9]+)/, replacer).replace(/(C)([0-9]+)/, replacer);

		              },
		              wrapX: true
		            }),
		        view: new ol.View({
		        	center: [14368861.888132, 4190430.764650],
		          projection: projection,
		          zoom: 9,
//		          minZoom: 9
	                maxZoom: 20,
	                minZoom: 11,
		        }),
				visible : true
		      });

//			_self._mapMaker.map.addLayer(test);
		    //mapMaker2.map.getLayers().getArray().length-1 값으로 쓰는게 더 좋긴할듯
			_self._mapMaker.map.getLayers().insertAt(1,test);
		},
		
		setTempLayer : function() {
			var _self = this;

			$.each(_self._mapMaker.layer, function(layerId){
					var layer = new ol.layer.Vector({
						title : layerId,
						source: new ol.source.Vector(),
					});
					layer.setStyle(new ol.style.Style({
						fill : new ol.style.Fill({
							color : 'rgba(255, 255, 255, 0.1)'
						}),
						stroke : new ol.style.Stroke({
							color : 'blue',
							width : 5
						}),
					}));

				_self._mapMaker.layer[layerId] = layer;
				_self._mapMaker.map.addLayer(_self._mapMaker.layer[layerId]);
			});
		},
		
	}

	window.MapLayerMng = MapLayerMng;

})(window, jQuery);