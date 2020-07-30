/**
 * 지도 이벤트 관리
 */
(function(window, $){
	var MapEvtMng = function(mapMaker){
		this._mapMaker = mapMaker;
		this._init();
	};

	MapEvtMng.prototype = {
		properties : {
            // boundaryFlag 		: false,
            facilitySelectFlag 	: false,
            xElem					: "xce",	// 지도 좌표 넣어주는 input 기본 id
            yElem					: "yce",	// 지도 좌표 넣어주는 input 기본 id
            keyElem				: "key",		// 판독물 key 값 넣어주는 input 기본 id
            highlightOverlay : undefined
		},

        _selectFeatureProperties : {},	 // 선택 피처 임시 저장 json 변수

		mapEvt : {
			click : null,
		},

		_init : function() {
			var _self = this;
			var clickFunc = function(evt) {
				evt = evt.originalEvent;

				var $layerTooltip;

				if(_self._mapMaker.overlay.overlayTooltipElement != null) {
					$layerTooltip = $(_self._mapMaker.overlay.overlayTooltipElement).find(_self._mapMaker.overlay.overlayTooltipAppendElem);
					$layerTooltip.empty();
					$(_self._mapMaker.overlay.overlayTooltipElement).hide();
				}

				var map = _self._mapMaker.map;
				var view = map.getView();

				var format = new ol.format.GeoJSON();

				var isSelectChange = true;

				var key = "";

				var lyrId = "";
				var nLyrCnt = 0;	// 지도 클릭 시 레이어 갯수

				// WFS 레이어일 때
				map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
					if (!layer) return;
                    if (layer.get("title") == null || layer.get("id") == undefined) return;
                    lyrId = layer.get("id");
                    var passKind = "interpretFacil";

                    if (layer.get("kind") == passKind) {
                        var features = _self._mapMaker.control.edit.select.getFeatures();

                        if (isSelectChange && features.getLength() > 0) features.clear();
                        isSelectChange = false;

                        feature.set("layerTitle", layer.get("title"));
                        features.push(feature);

                        var title = layer.get("title");
                        title += "(" + feature.get("ITPT_ID") + ")";

                        var controlName = _self._mapMaker.mapAction.getControlName(lyrId.split("_")[1]);
                        if (controlName == "") return;

                        var $row = $(_self._mapMaker.overlay.overlayTooltipAppend);
                        $row.append(title);

                        $row.on({
                            click: function () {
                                $(_self._mapMaker.overlay.overlayTooltipElement).hide();

                                if (_self.propreties.facilitySelectFlag) {
                                    _self._mapMaker.mapAction.layer.properties.isFeatureSelect = false;
                                } else {
                                    var source = _self._mapMaker.layer[controlName].getSource();

                                    _self._selectFeatureProperties = {
                                        source: source,
                                        feature: feature,
                                        method: "select",
                                        isSelectMode: true
                                    };
                                    _self._mapMaker.mapAction.getFeatureProp({
                                        reqData: {
                                            facilityId: layer.get("id"),
                                            title: title,
                                            method: "select"
                                        },
                                        source: source,
                                        feature: feature
                                    });
                                }
                            },
                            mouseenter: function () {
                                features.clear();
                                features.push(feature);
                            },
                            mouseleave: function () {

                            }
                        });

                        $layerTooltip.append($row);
                        nLyrCnt++;
                    }
				}, {
					hitTolerance : 10
				});

				// WMS 레이어일 때
				map.getLayers().forEach(function(lyr, index) {
					if(lyr.get("kind") != "interpretFacil") return;
					if(!lyr.getVisible()) return;

					var $row = $(_self._mapMaker.overlay.overlayTooltipAppend);
					lyrId = lyr.get("id");
					var crsCode = lyr.getSource().getProjection().getCode();
//					var crsCode = _self._mapMaker.map.getView().getProjection().getCode();
					var url = lyr.getSource().getFeatureInfoUrl(ol.proj.transform(evt.coordinate, _self._mapMaker.crsCode, _self._mapMaker.map.getView().getProjection().getCode()), view.getResolution(), crsCode, {
						'INFO_FORMAT' : 'application/json'
					});

					var title = lyr.get("title");

					$.ajax({
						url : url,
						// async : false,
						success : function(response) {
							var features = format.readFeatures(response, {
								dataProjection : "EPSG:5187",
								featureProjection : "EPSG:3857"
							});

							if(features.length > 0) {
								var feature = features[0];

								if(feature.get("prg_cd") == "정비예정") {
									key = feature.get("itpt_id");
								} else {
									key = feature.get("ftr_cde");
								}

								if(key != "") {
									title += "(" + key+ ")";
									$row.append(title);

									$row.on({
										click : function() {
											$(_self._mapMaker.overlay.overlayTooltipElement).hide();

											// 상세조회 이동
											selectInfo(feature);
										},
										mouseenter : function() {
//                                            _self._mapMaker.layer["select"].getSource().clear();
//                                            _self._mapMaker.layer["select"].getSource().addFeature(feature);
											_self.properties.highlightOverlay.getSource().clear();
											_self.properties.highlightOverlay.getSource().addFeature(feature);
										},
										mouseleave : function() {
//                                            _self._mapMaker.layer["select"].getSource().clear();
											_self.properties.highlightOverlay.getSource().clear();
										}
									});

									$layerTooltip.append($row);

									$(_self._mapMaker.overlay.overlayTooltipElement).show();
									_self._mapMaker.overlay.overlayTooltipLayer.setPosition(evt.coordinate);
								} else {
									alert("판독물이 존재하지 않습니다. 다시 선택하여 주십시오.");
								}
							}
						}
					});
				});
			};

			_self.mapEvt.click = clickFunc;

            _self._mapMaker.map.getViewport().addEventListener('contextmenu', function (evt) {
                evt.preventDefault();
            });
            
            _self.properties.highlightOverlay = new ol.layer.Vector({
            	source: new ol.source.Vector(),
            	map: _self._mapMaker.map,
            	style: new ol.style.Style({
            		stroke: new ol.style.Stroke({
            			color:'rgba(200,20,20,0.8)',
            			width: 2
            		}),
            		fill: new ol.style.Fill({
            			color: 'rgba(200,20,20,0.4)'
            		})
            	})
            });
		},

		onMapEvt : function() {
			var $map = $(this._mapMaker.map);

			$.each(this.mapEvt, function(key, val) {
				$map.on(key, val);
			});
		},

		offMapEvt : function() {
			var $map = $(this._mapMaker.map);

			$.each(this.mapEvt, function(key, val) {
				$.map.off(key);
			});
		},

		setCoordByMapEvt : function(params) {
			var _self = this;
			_self.propreties = $.extend({}, _self.propreties, params);
			_self._mapMaker.map.on("click", function(evt) {
				var coord = ol.proj.transform(evt.coordinate, _self._mapMaker.crsCode, _self._mapMaker.config.facilityCrsCode);
				$("#"+_self.properties.xElem).val(coord[0]);
				$("#"+_self.properties.yElem).val(coord[1]);

				var pointFeat = new ol.Feature({
					geometry : new ol.geom.Point(evt.coordinate)
				});
			});
		},

		setProperties : function(params) {
			var _self = this;
			_self.propreties = $.extend({}, _self.propreties, params);
		}

	};

	window.MapEvtMng = MapEvtMng;
})(window, jQuery);