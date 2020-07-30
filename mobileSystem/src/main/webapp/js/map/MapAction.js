(function(window, $) {
	"use strict";

	var MapAction = function(mapMaker) {
		this._mapMaker = mapMaker;
		this.properties.oldProj = this._mapMaker.config.facilityCrsCode
	};

	MapAction.prototype = {

		properties : {
			oldProj : ""
		},

		layer : {
			properties : {
				isFeatureSelect : false,		// 피처 선택 여부
				isSync : false,		// 시설물 선택 시 선택 제외 여부
			},
			select : { // 키값 가져오기 위한 변수 선언 - 한봄 -
				$input : null,
				id : null,
				target : null
			}
		},

		initAttr : null,

		mapRotationAngle : 0,

		initCenter : function(center) {
			this._mapMaker.map.getView().setCenter(center);
			this._mapMaker.map.getView().setZoom(this._mapMaker.zoomLvl);
		},

		setExtent : function() {
			var extent = ol.proj.transformExtent(this._mapMaker.baseMap.extent, this._mapMaker.baseMap.crsCode, this._mapMaker.crsCode);
			this._mapMaker.map.getView().fit(extent);
		},

		zoomExtent : function(extent) {
			if(extent == undefined){
				var baseMap  = null;
				if($("#baseMap").length > 0){
					baseMap = BaseMapConfig[$("#baseMap").val()];
				}else{
					baseMap = BaseMapConfig[this._mapMaker.initBaseMap];
				}
				this._mapMaker.map.getView().setCenter(baseMap.center);
				this._mapMaker.map.getView().setZoom(0);
			}else{
				this._mapMaker.map.getView().fit(extent);
			}

		},

		setCenter : function (coord, zoom, oldProj, newProj) {
			var center = null;
			if (oldProj != undefined){
				center = ol.proj.transform(coord, oldProj, newProj)
			}else{
				center = ol.proj.transform(coord, this._mapMaker.config.facilityCrsCode, this._mapMaker.crsCode)
			}
			this._mapMaker.map.getView().setCenter(center);
			this._mapMaker.map.getView().setZoom(zoom);
		},

		setPrintLayerVisible : function () {
			var _self = this;
			var layers = _self._mapMaker.map.getLayers().getArray();
			var layer = null;
			$.each(layers, function(idx, lyr){
				lyr.setVisible(opener.mapMaker.map.getLayers().getArray()[idx].getVisible());
			});
		},

		//디비 좌표값으로 센터에 마커 찍기
		setMakerCenter : function (coord, zoom,params) {
			this._mapMaker.layer.marker.getSource().clear();
			if(params != undefined) this.properties = $.extend({}, this.properties, params);
			var center = ol.proj.transform(coord,  this.properties.oldProj, this._mapMaker.crsCode);
			this._mapMaker.map.getView().setCenter(center);
			this._mapMaker.map.getView().setZoom(zoom);

			var pointFeat = new ol.Feature({//임시포인트 레이어 임
				geometry : new ol.geom.Point(center),
			});
			this._mapMaker.layer.marker.getSource().addFeature(pointFeat);

		},

		offBaseMapLayers : function() {
			$.each(this._mapMaker.baseMapLayers, function(){
				this.setVisible(false);
			});
		},

		onOffLayersByKind : function(visible, kind) {
			var _self = this;
			$.each(this._mapMaker.mapLayerMng.layers, function(parKey, parVal){
				$.each(parVal, function(layerName, layer){
					if (kind == layer.get("kind") || kind == layer.get("category")) {
						layer.setVisible(visible);
                        if(layer.get("id")=="A057_L"){
                            var temp = _self._mapMaker.mapLayerMng.getLayerById("sign");
                            temp.setVisible(visible);
                        }
					}
				});
			});
		},

		setVisibilityById : function(id){
			var lyr = this._mapMaker.mapLayerMng.getLayerById(id);
			if(lyr != null){
				if(id=="A057_L"){
					var temp = this._mapMaker.mapLayerMng.getLayerById("sign");
					temp.setVisible(!temp.getVisible());
				}
				lyr.setVisible(!lyr.getVisible());
				return true;
			}
		},

		setVisibilityByLayer : function(id,visible){
			var lyr = this._mapMaker.mapLayerMng.getLayerById(id);
			if(lyr != null){
				lyr.setVisible(visible);
				return true;
			}
		},

		transformFeature : function(oldCrsCode, newCrsCode) {
			this._mapMaker.map.getLayers().forEach(function(layer) {
				if(layer instanceof ol.layer.Vector) {
					layer.getSource().getFeatures().forEach(function(feature){
						feature.getGeometry().transform(oldCrsCode, newCrsCode);
					});
				}
			});
		},

		mapControlHandle : function(bDisabled) {
			var mapControl = this._mapMaker.config.mapControl;

			$(mapControl.elem).each(function(){
				var _this = $(this);

				$.each(mapControl.arrHandle, function(){
					var bCompare = mapControl.flag == "class" ? _this.hasClass(this) : _this.attr(mapControl.flag) == this;

					if (bCompare) {
						if (bDisabled) {
							_this.off("click");
							_this.on("click", function(){
								alert("시설물 편집 중에는 실행할 수 없습니다.");
							});
						} else {
							$(mapControl.elem).off("click");
							$.setMapControlEvt();
						}
					}
				});
			});
		},

		lyrClear : function () {
			$.each(this._mapMaker.mapLayerMng.layers.wfs, function(){
				if(this instanceof ol.layer.Vector) {
					this.getSource().clear();
				}
			});

			$.each(this._mapMaker.layer, function(){
				if(this instanceof ol.layer.Vector && this.get("title") != "sign") {
					this.getSource().clear();
				}
			});

		},

		offControl : function () {
			$.each(this._mapMaker.control, function(kind, control){
				$.each(control, function(name){
					this.setActive(false);
				});
			});

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

		allClear : function () {
			this.offMeasure();
			this.lyrClear();
			this.offControl();
			this.mapControlHandle(false);
		},

		onFeatureMove : function(x, y){
			this._mapMaker.mapAction.lyrClear();
			var pos = [y, x];
			var coord = ol.proj.transform(pos, "EPSG:4326", this._mapMaker.crsCode);
			var pointFt = new ol.Feature({
				geometry : new ol.geom.Point([coord[0], coord[1]])
			});
			pointFt.setStyle(new ol.style.Style({
				image: new ol.style.Icon({
					size: [128,128],
					anchor: [0.5, 1.0],
					opacity: 1,
					scale: 0.3,
					src: G.baseUrl + "images/main/pin_v1.png",
				})
			}));
			this._mapMaker.map.getView().setCenter(coord);
			this._mapMaker.layer.roadView.getSource().addFeature(pointFt);
		},

		getCenterAddr : function () {
			var _self = this;
			var coord = ol.proj.transform(_self._mapMaker.map.getView().getCenter(), _self._mapMaker.crsCode, "EPSG:5186");
			$.ajax({
				type : 'post',
				url : G.baseUrl + "map/getCenterAddr.json",
				dataType : "json",
				data : "coord="+coord,
				cache : false,
				success : function(response){
					$(_self._mapMaker.config.locationElem).html("서울특별시 " + response.addr);
				}
			});
		},

		sendWFS : function(params) {
			var _self = this;

			if(params.layer ==  ",cssNam"){
				params.layer ="a008_a,fac_no";
			}

			$.ajax({
				type : 'post',
				url : G.baseUrl + "map/GetFeatureInfo.json",
				dataType : "json",
				data :"type=literal"+"&layers="+params.layer+"&literals="+params.literal+"&srsName="+_self._mapMaker.config.facilityCrsCode,
				cache : false,
				success : function(response){
					params.response = response.jsonView;
					_self._setXml(params);

				}
			});
		},

		_setXml : function(params){
			var mapMaker = this._mapMaker;
			var map = mapMaker.map;
			var _self = this;
			var theParser = new ol.format.WFS();

			var features = theParser.readFeatures(params.response);

			if (features) {
				if (features.length > 0) {
					features.forEach(function(feature) {
						if(mapMaker.config.facilityCrsCode == "EPSG:4326"){
							feature.getGeometry().applyTransform(function (coords, coords2, stride) {
								for (var j = 0 ; j < coords.length ; j += stride) {
									var y = coords[j];
									var x = coords[j+1];
									coords[j] = x;
									coords[j + 1] = y;
								}
							});
						}

						feature.setGeometry(feature.getGeometry().transform(mapMaker.config.facilityCrsCode, mapMaker.crsCode));

						var view = map.getView();
						view.fit(feature.getGeometry().getExtent());

						_self._mapMaker.layer.marker.getSource().clear();

						var pt = ol.extent.getCenter(feature.getGeometry().getExtent());

						var pointFeat = new ol.Feature({//임시포인트 레이어 임
							geometry : new ol.geom.Point(pt),
						});

						mapMaker.layer.marker.getSource().addFeature(pointFeat);

						if (view.getZoom() > 9) {//최대레벨로 바꿈
							map.getView().setZoom(9);
						}

							mapMaker.baseMapLayers[0].setVisible(true);

						if (params.sectionFlag) {
							_self.Section(feature);
						}

					});
				} else {
					if(params.layer.indexOf("RF_PRIVATE_AREA")>-1){
						mapMaker.mapAction.sendWFS({
							layer : "RF_CONST_AREA,CST_NO,CST_STEP",
							literal : params.literal,

						});
					}else{
						if(params.layer.indexOf("RF")>-1){
							alert("현재 해당 공사의 지점설정이 되어있지않습니다.");
						}
						else
							alert("현재 시스템은 서울특별시에 대한 서비스만 제공하고 있으므로, 타 지역은 위치 이동이 되지 않습니다.");
					}
				}
			}

		},

		getControlName : function (type) {
			var controlName = "";

			if (type == "A") {
				controlName = "polygon";
			} else if (type == "L") {
				controlName = "polyline";
			} else if (type == "P") {
				controlName = "point";
			}

			return controlName;
		},

		_setOriginalAttr : function (feature) {
			if (this.initAttr == null) return;

			$.each(this.initAttr, function(key, val) {
				feature.set(key, val);
			});
		},

		getFeatureProp : function (params) {
			var _self = this;
			// if(params.reqData.facilityId != "a001_a"){
//				this._mapMaker.control.edit.modify.setActive(false);
				this.layer.properties.isFeatureSelect = true; // 시설물 선택 시 true

				if (params.reqData.method != "insert") {
					this.initAttr = null;
					this.editDrawFacility(params.feature, true);	// 차선 및 횡단보도 원복
					params.feature.set("geom", params.feature.getGeometry().getCoordinates()); //기존 좌표 저장
					this._mapMaker.stopAngle();
				} else {
					this.viewEditToolbar(true, params.reqData.method);

					if (this.isRotateFacility(params.reqData.facilityId)) {
						this._mapMaker.stopAngle();
						this._mapMaker.createAngle(params.feature);
					}
				}
				params = $.extend({}, {
					url : G.baseUrl + "fclts/modalInfoPop.do",
				}, params);

				if (this._mapMaker.config.drawingYn == "Y") {
					// 도면관리에 사용될 값 설정
					params.reqData = $.extend({}, {
						drawingYn : this._mapMaker.config.drawingYn,
						cstStatCd : this._mapMaker.config.cstStatCd,
						gbn : this._mapMaker.config.gbn,
					}, params.reqData);
				}
				//기존 코드
//				params.reqData.cstNo = this._mapMaker.config.cstNo;	// 공사번호 값 셋팅
//				params.reqData.cstCpyNam = this._mapMaker.config.cstCpyNam;	// 공사번호 값 셋팅

				params.reqData.cstNo = this._mapMaker.cstNo;	// 공사번호 값 셋팅
				params.reqData.cstStep = this._mapMaker.cstStep;	// 공사단계 값 셋팅
				params.reqData.cstStepDetail = this._mapMaker.cstStepDetail;	// 공사단계 값 셋팅
				// + 도로명 값 셋팅도 해줘야함. roadNam가지고 오는 부분 찾아야함
//				params.reqData.roadNam = ?

				facilityFt = params.source.getFeatures()[0] == null ? params.feature : params.source.getFeatures()[0];
//
				if(params.reqData.facilityId.indexOf("TMP")>-1){
					params.reqData.facilityId = params.reqData.facilityId.replace("_TMP","")
				}

				$(this._mapMaker.config.facilityModal).modalOpen(params.url, {
					width : params.reqData.facilityId == "a001_a" ? "150px" : "350px",
					reqData : params.reqData,
					closeFunc : function() {
						_self.stopDrawFacility({
							source : params.source,
							feature : params.feature,
							method : params.reqData.method
						});
					},
					setModeChange : function(mode) {

						if (mode == "viewMode") {
							_self.viewEditToolbar(false);

							params.feature.getGeometry().setCoordinates(params.feature.get("geom"));
							_self._mapMaker.control.edit.modify.setActive(false);
//							_self.layer.properties.isFeatureEdit = false;

							_self._mapMaker.stopAngle();

							if (_self.isRotateFacility(params.reqData.facilityId)) {
								params.feature.set("DRN", params.feature.get("oriAngle"));
							}

							_self._setOriginalAttr(params.feature);

							if (_self._mapMaker.drag.control) {
								_self._mapMaker.map.removeInteraction(_self._mapMaker.drag.control);
								_self._mapMaker.control.edit.select.getFeatures().clear();
								_self._mapMaker.control.edit.select.getFeatures().push(_self._mapMaker.drag.selectedFeature);
							}
						} else if(mode == "updateMode"){
							_self.viewEditToolbar(true);

							_self._mapMaker.control.edit.modify.setActive(true);
//							_self.layer.properties.isFeatureEdit = true;

							if (_self.isRotateFacility(params.reqData.facilityId)) {
								_self._mapMaker.createAngle(params.feature);

								_self._mapMaker.mapEvtMng.setFeatureChangeRotateEvt(params.feature);
							}
						}
					}
				});
//			 }else{
//			 	_self._mapMaker.control.edit.select.getFeatures().clear();
//			 }
		},

		getOnlyFeatureProp : function (params) {//feature값 만 가지고 시설물 모달창 띄우기

				var _self = this;
				// if(params.reqData.facilityId != "a001_a"){
//					this._mapMaker.control.edit.modify.setActive(false);
//					this.layer.properties.isFeatureSelect = true; // 시설물 선택 시 true

					if (params.reqData.method != "insert") {
						this.initAttr = null;
						this.editDrawFacility(params.feature, true);	// 차선 및 횡단보도 원복
						params.feature.set("geom", params.feature.getGeometry().getCoordinates()); //기존 좌표 저장
						this._mapMaker.stopAngle();
					} else {
						this.viewEditToolbar(true, params.reqData.method);

						if (this.isRotateFacility(params.reqData.facilityId)) {
							this._mapMaker.stopAngle();
							this._mapMaker.createAngle(params.feature);
						}
					}
					params = $.extend({}, {
						url : G.baseUrl + "fclts/modalInfoPop.do",
					}, params);

					if (this._mapMaker.config.drawingYn == "Y") {
						// 도면관리에 사용될 값 설정
						params.reqData = $.extend({}, {
							drawingYn : this._mapMaker.config.drawingYn,
							cstStatCd : this._mapMaker.config.cstStatCd,
							gbn : this._mapMaker.config.gbn,
						}, params.reqData);
					}
					//기존 코드
//					params.reqData.cstNo = this._mapMaker.config.cstNo;	// 공사번호 값 셋팅
//					params.reqData.cstCpyNam = this._mapMaker.config.cstCpyNam;	// 공사번호 값 셋팅

					params.reqData.cstNo = this._mapMaker.cstNo;	// 공사번호 값 셋팅
					params.reqData.cstStep = this._mapMaker.cstStep;	// 공사단계 값 셋팅
					params.reqData.cstStepDetail = this._mapMaker.cstStepDetail;	// 공사단계 값 셋팅
					// + 도로명 값 셋팅도 해줘야함. roadNam가지고 오는 부분 찾아야함
//					params.reqData.roadNam = ?

					if(params.reqData.facilityId.indexOf("TMP")>-1){
						params.reqData.facilityId = params.reqData.facilityId.replace("_TMP","")
					}

					$(this._mapMaker.config.facilityModal).modalOpen(params.url, {
						width : params.reqData.facilityId == "a001_a" ? "150px" : "350px",
						reqData : params.reqData,
						closeFunc : function() {
							_self.stopDrawFacility({
								source : params.source,
								feature : params.feature,
								method : params.reqData.method
							});
						},
						setModeChange : function(mode) {

							if (mode == "viewMode") {
								_self.viewEditToolbar(false);

								params.feature.getGeometry().setCoordinates(params.feature.get("geom"));
								_self._mapMaker.control.edit.modify.setActive(false);
//								_self.layer.properties.isFeatureEdit = false;

								_self._mapMaker.stopAngle();

								if (_self.isRotateFacility(params.reqData.facilityId)) {
									params.feature.set("DRN", params.feature.get("oriAngle"));
								}

								_self._setOriginalAttr(params.feature);

								if (_self._mapMaker.drag.control) {
									_self._mapMaker.map.removeInteraction(_self._mapMaker.drag.control);
									_self._mapMaker.control.edit.select.getFeatures().clear();
									_self._mapMaker.control.edit.select.getFeatures().push(_self._mapMaker.drag.selectedFeature);
								}
							} else if(mode == "updateMode"){
								_self.viewEditToolbar(true);

								_self._mapMaker.control.edit.modify.setActive(true);
//								_self.layer.properties.isFeatureEdit = true;

								if (_self.isRotateFacility(params.reqData.facilityId)) {
									_self._mapMaker.createAngle(params.feature);

									_self._mapMaker.mapEvtMng.setFeatureChangeRotateEvt(params.feature);
								}
							}
						}
					});
//				 }else{
//				 	_self._mapMaker.control.edit.select.getFeatures().clear();
//				 }
			},

		setFtFromAttr : function (feature, $parent) {
			var data = feature.getProperties();

			var drawingYn = this._mapMaker.config.drawingYn;

			var selectJson = {};

			$.each(data, function(key, val){
				if(drawingYn != "Y" && key == "cst_no") return true;
				var camelCaseKey = $.toCamelCase(key);
				var element = "#" + camelCaseKey;

				var $input = $parent.find(element);
				if ($input.length > 0) {
					if ($input.prop("type") == "select-one") {
						selectJson[camelCaseKey] = val;
					} else {
						$input.val(val);
					}
				}
			});

			return selectJson;
		},

		createHatchBrush : function(dAngle, rgbString, width) {
			var linewidth = width;

			if(width == undefined){
				linewidth = 1;
			}

			var cnv = document.createElement('canvas');
			var ctx = cnv.getContext('2d');
			cnv.width = 10;
			cnv.height = 10;
			ctx.lineWidth = 1;
			ctx.beginPath();

			//임의값
			if (dAngle <= 45) {
				ctx.moveTo(0, 0);
				ctx.lineTo(10, 10);
			} else if (dAngle > 45 && dAngle <= 90) {
				ctx.moveTo(5, 0);
				ctx.lineTo(5, 10);
			} else if (dAngle > 90 && dAngle <= 135) {
				ctx.moveTo(0, 10);
				ctx.lineTo(10, 0);
			} else {
				ctx.moveTo(10, 5);
				ctx.lineTo(0, 5);
			}

			ctx.strokeStyle = 'rgb(' + rgbString + ')';
			ctx.stroke();
			return ctx.createPattern(cnv, 'repeat');
		},

		setImgFromAttr : function (feature, params) {

			this.initAttr = {};

			var initAttr = this.initAttr;

			$.each(params, function(key, val){
				var underScoreKey = $.toUnderscore(key);

				initAttr[underScoreKey] = val;

				$("#" + key).on("change", function(){
					feature.set(underScoreKey, $(this).val());
				});
			});
		},

		/**
		 * feature를 포함하는 다른 feature의 정보를 가져옴.
		 * @param params(json)
		 * key (feature : 기준 feature, lyrId : 대상 레이어 ID, key : 대상 레이어의 가져올 속성 키 값)
		 *
		 * @returns {string}
		 */

		getInfoAtFeature : function (lyrId, point) {
			var _map = this._mapMaker.map;
			var _self = this;

			var info = "";
			$.ajax({
				url:  _self._mapMaker.config.noProxyWfs,
        		dataType: 'json',
        		async: false,
        		data:{
        			srs:"EPSG:5186",
        			request: 'GetFeature',
        			version: '1.0.0',
        			typename: 'seoul:'+lyrId,
        			outputFormat: 'application/json',
        			CQL_FILTER: "DWITHIN(XGEO, POINT("+point[0]+" "+point[1]+"),1,meters)"
        		},
        		success:function(response){
        			var geomJson = new ol.format.GeoJSON().readFeatures(response);
        			if(geomJson != null && geomJson != "") {
        				info =geomJson[0];
        			}
        		},
        		error:function(response){
        		}
        	});

			return info;
		},

		/**
		 * wfs 레이어 Filter
		 * @method
		 * @param sql
		 * @param keyword 키워드
		 */
		getFeatureByKey : function(lyrId, point){
			var geojsonFormat = new ol.format.GeoJSON();
			var features = null;
			$.ajax({
				url:  this._mapMaker.config.noProxyWfs,
				dataType: 'json',
				async: false,
				data:{
					srs:"EPSG:5186",
					equest: 'GetFeature',
					version: '1.0.0',
					typename: 'seoul:'+lyrId,
					outputFormat: 'application/json',
					CQL_FILTER: "DWITHIN(XGEO, POINT("+point[0]+" "+point[1]+"),100,meters)"
				},
				success:function(response){

					features = {
						count : response.totalFeatures,
						features :geojsonFormat.readFeatures(response)
					};

				},
				error : function(a, b, c){
					console.log("error");
				}
			});

			return features;
		},

	}

	window.MapAction = MapAction;

})(window, jQuery);