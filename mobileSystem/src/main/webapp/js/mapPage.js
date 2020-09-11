(function(){
	function ready(am) {
		if (document.readyState != 'loading'){
			am();
		} else {
			document.addEventListener('DOMContentLoaded', am);
		}
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
	
	var url = gp.geoUrl + '/wfs';

	function setCenter(map, code, gbn) {
		var cql = "";
		var typename = "";

		if (gbn == "sgg") {
			cql = "sig_cd LIKE '" + code + "%'";
			typename = "gj_sgg";
		} else {
			cql = "bjd_cde LIKE '" + code + "%'";
			typename = "gj_emd1";
		}

		var param = {
			SERVICE: 'WFS',
			VERSION: '1.1.0',
			REQUEST: 'GETFEATURE',
			TYPENAME: typename,
			PROPERTYNAME: 'geom',
			OUTPUTFORMAT: 'application/json',
			CQL_FILTER: cql
		};

		requestData(url, param, 'GET', 'json', "", true).done(function (result) {
			var features = result.features[0];
			var format = new ol.format.GeoJSON();
			var feature = format.readFeature(features);
			feature.getGeometry().transform("EPSG:5187", "EPSG:3857");
			// feature.getGeometry().transform("EPSG:5185", "EPSG:3857");
			var extent = feature.getGeometry();
			map.getView().fit(extent, map.getSize());
		})
	}
	
	// Degree를 radian 값으로 변환(기기 방향 alpha값을 openlayers에 사용하기 위함)
	function degToRad(deg) {
		var result = (deg * Math.PI / 180);
		return result;
	}
	
	// 기기 방향 감지 이벤트 발생 시 실행되는 함수
	function orientationHandler(event){
		var absolute = event.absolute;
		var alpha = event.alpha;
		var beta = event.beta;
		var gamma = event.gamma;
		
		var rad;
		if(absolute){
			// 기기 방향 이벤트 반환값에 따라 지도를 회전시킴
//			rad = degToRad(alpha);
//			mapMaker1.map.getView().setRotation(rad);
			
			// 기기 방향 이벤트 함수가 반환하는 각도값은 시게방향 기준으로 각도가 증가하며 openlayers는 반시계 방향 기준이므로
			// 360 값에서 이벤트 값을 빼서 방향을 맞춤
			am.statics.arrowRotate = 360 - alpha;
			
			am.drawMbr();
			
			mapMaker1.map.render();
		}
	}
	
	function iOSorientationHandler(event){
		var alpha		= 360 - event.webkitCompassHeading;
		var beta		 = event.beta;
		var gamma		= event.gamma;
		
//		var rad = degToRad(alpha);
//		mapMaker1.map.getView().setRotation(rad);
		
		am.statics.arrowRotate = 360 - alpha;
		
		am.drawMbr();
		
		mapMaker1.map.render();
	}
	
	// 기기 위치 감지 시 실행되는 함수
	function onSuccessGeolocation(position) {
		mapMaker1.setCenter([position.coords.longitude, position.coords.latitude], mapMaker1.map.getView().getZoom(), "EPSG:4326", mapMaker1.map.getView().getProjection().getCode());
		am.statics.position = position;
		
		if(am.statics.orientation){
			am.drawMbr();
		}
	}
	
	// 기기 위치 감지 에러 발생 시 실행되는 함수
	function onErrorGeolocation(e) {
		alert(`ERROR(${e.code}): ${e.message}`);
	}
	
	window.am = window.am || {};

	// 전역변수
	window.am.statics = {
		vectorLayer: undefined, // 기기 방향 감지 아이콘 레이어
		orientation: false, // 기기 방향 감지 기능 활성화 여부
		arrowRotate: 0, // 기기 방향 각도
		geolocation: undefined, // geolocation watchPosition event 반환 id
		position: undefined, // 현재 위치 좌표
		crossSection: undefined // 횡단면도
	}
	
	window.am.createMapToolbar = function(options){
		var opt = options || {};
		var mapId = opt.id || '';
		
		var html = '';
		var overlay = $('#' + mapId + ' .ol-overlaycontainer-stopevent');
		
		if(overlay.length){
			html += '<ons-speed-dial position="bottom right" direction="up">';
			html += '<ons-fab>';
			html += '<ons-icon icon="fa-ellipsis-v"></ons-icon>';
			html += '</ons-fab>';
			html += '<ons-speed-dial-item>';
			html += '<ons-icon icon="fa-compass" onclick="am.toggleOrientation(this)"></ons-icon>';
			html += '</ons-speed-dial-item>';
			html += '<ons-speed-dial-item>';
			html += '<ons-icon icon="fa-crosshairs" onclick="am.requestPositionPermission()"></ons-icon>';
			html += '</ons-speed-dial-item>';
			html += '<ons-speed-dial-item>';
			html += '<ons-icon icon="fa-filter" id="layerFilterBtn"></ons-icon>';
			html += '</ons-speed-dial-item>';
			html += '<ons-speed-dial-item>';
			html += '<ons-icon icon="fa-layer-group" onclick="am.crossPrompt()"></ons-icon>';
			html += '</ons-speed-dial-item>';
			html += '<ons-speed-dial-item>';
			html += '<ons-icon icon="fa-camera" onclick="am.cameraPrompt()"></ons-icon>';
			html += '</ons-speed-dial-item>';
			html += '</ons-speed-dial>';
			
			overlay.append(html);
		}
	}
	
	// 현재 위치, 방향 아이콘 생성 함수
	window.am.drawMbr = function(){
		var mapObj = mapMaker1.map;
		var view = mapObj.getView();
		var center = ol.proj.transform([am.statics.position.coords.longitude, am.statics.position.coords.latitude], 'EPSG:4326', mapMaker1.map.getView().getProjection().getCode());
		var pixel = mapObj.getPixelFromCoordinate(center);
		var distance = 14;
		
		var rotate = am.statics.arrowRotate - 90;
		
		var triangleX = pixel[0] + distance * Math.cos(rotate*Math.PI/180);
		var triangleY = pixel[1] + distance * Math.sin(rotate*Math.PI/180);
		var trianglePixel = [triangleX, triangleY];
		var triangleCoord = mapObj.getCoordinateFromPixel(trianglePixel);
		
		var features;
		if(am.statics.vectorLayer instanceof ol.layer.Vector){
			features = am.statics.vectorLayer.getSource().getFeatures();
			for(var i in features){
				if(i == 0){
					features[i].getGeometry().setCoordinates(center);
					if(features[i].get('style') instanceof ol.style.Style){
						features[i].get('style').getImage().setRotation(am.statics.arrowRotate*Math.PI/180);
					}
				} else if(i == 1){
					features[i].getGeometry().setCoordinates(triangleCoord);
					if(features[i].get('style') instanceof ol.style.Style){
						features[i].get('style').getImage().setRotation(am.statics.arrowRotate*Math.PI/180);
					}
				}
			}
		}
	}
	
	window.am.cameraPrompt = function(){
		am.statics.camera.action();
	}
	
	window.am.crossPrompt = function(){
		am.statics.crossSection.drawFeature('LineString');
	}
	
	// 기기 위치,방향 추적 기능 toggle 함수
	window.am.toggleOrientation = function(evt){
		var bool = am.statics.orientation;
		
		if(!bool){
			window.am.requestOrientationPermission(); // 기기 방향 감지 이벤트 생성
			evt.parentElement.className = evt.parentElement.className + ' active'; // 버튼 스타일 변경(활성화)
		} else {
			// iOS 외 기기들 orientation event 해제
			window.removeEventListener('deviceorientationabsolute', orientationHandler, true);
			
			// iOS 기기 orientation event 해제
			window.removeEventListener('deviceorientation', iOSorientationHandler, true);
			
			am.statics.vectorLayer.setVisible(false);
			mapMaker1.map.render(); // 렌더링 초기화 - 맵 중앙 기기 방향 아이콘 제거 목적
			
			am.statics.orientation = false;
			
			evt.parentElement.className = evt.parentElement.className.replace(/\s*active/g, ''); // 버튼 스타일 변경(비활성화)
			
			if(navigator.geolocation){
				// watchPosition event 비활성
				navigator.geolocation.clearWatch(am.statics.geolocation);
			}
		}
	}
	
	window.am.requestOrientationPermission = function(){
		if(!window.DeviceOrientationEvent){
			ons.notification.alert('기기 방향 감지 기능이 제공되지않는 기기(또는 브라우저)입니다.');
			return;
		}
		
		if (typeof DeviceOrientationEvent.requestPermission === 'function') {
			DeviceOrientationEvent.requestPermission()
				.then(permissionState => {
					if (permissionState === 'granted') {
						var orientationEvent = window.addEventListener("deviceorientation", iOSorientationHandler, true);
						am.statics.vectorLayer.setVisible(true);
					}
				})
				.catch(console.error);
		} else {
			// handle regular non iOS 13+ devices
			var orientationEvent = window.addEventListener("deviceorientationabsolute", orientationHandler, true);
			window.addEventListener('MozOrientation', orientationHandler, true);
			am.statics.vectorLayer.setVisible(true);
		}
		
		if(navigator.geolocation){
			// 사용자 기기 위치 추적 시작
			am.statics.geolocation = navigator.geolocation.watchPosition(onSuccessGeolocation, onErrorGeolocation);
		}
		
		am.statics.orientation = true;
	}
	
	window.am.requestPositionPermission = function(){
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation);
		} else {
			ons.notification.alert('현재 위치가 제공되지않는 기기(또는 브라우저)입니다.');
		}
	}
	
	window.selectInfo = function selectInfo(feature) {
		if(!(feature instanceof ol.Feature)){
			return;
		}
		
		var keys = feature.getKeys();
		var html = '';
		var target = $('#detailModalPage table.semantic tbody');
		target.empty();
		
		var featureId = feature.getId();
		var layerName = featureId.split('.')[0];
		var gid = featureId.split('.')[1];
		
		$.ajax({
			url: gp.ctxPath + '/layer/getFeatureInfo.json',
			type: "POST",
			data: {
				layerNm: layerName,
				id: parseInt(gid)
			},
			dataType: "json",
			beforeSend: function (xhs, status) {
			},
			error: function (xhs, status, error) {
				if (xhs.status == 600) {
					ons.notification.alert("세션이 만료되었습니다.");
					location.href = gp.ctxPath + "/mainPage.do";
				} else {
					ons.notification.alert('서버와의 통신에 실패했습니다.');
					console.log(xhs);
					console.log(status);
					console.log(error);
				}
			},
			success: function (resData) {
				console.log(resData);
				var result = resData.result;
				var fields = resData.fields;
				
				for(var i in result){
					if(i === 'geom' || i === 'gid'){
						continue;
					}
					
					html = '';
					html += '<tr class="disable-tr">';
					html += '<td class="collapsing">' + fields[i] + '</td>';
					html += '<td>';
					html += result[i];
					html += '</td>';
					html += '</tr>';
					
					target.append(html);
				}
			}
		});
		
		
		
		var modal = document.getElementById('detail-modal');
		modal.show();
	}
	
	// onsen ui page element ready event
	document.addEventListener('init', function(event) {
		var page = event.target;
		
		if (page.id === 'mapPage') {
			mapMaker1 = new MapMaker("map", {}); // 기본셋팅 및 맵 객체, 배경지도 추가

			mapMaker1.mapLayerMng.addFacilityLayers(); // 판독 레이어 추가
//			mapMaker1.mapLayerMng.setTempLayer();		 // 임시 레이어 추가(중복레이어 마우스 오버 시)

			mapMaker1.map.getView().setZoom(5);
			
			mapMaker1.setOverlayLayerTooltip({
				overlayTooltipElement: document.getElementsByClassName("layer_mapInfo")[0],
				overlayTooltipAppend: "<li>",
				overlayTooltipAppendElem: "ul"
			});
			
			mapMaker1.mapEvtMng.onMapEvt();
			
//			loadSggList();
//			loadEmdList("29140"); // 초기 화면에서 읍면동 selectbox 선택되도록 고정
			
			mapMaker1.map.once('postcompose', function(event){
				if ($("#itptCenterX").val() != "") {
					mapMaker1.setCenter([$("#itptCenterX").val(), $("#itptCenterY").val()], "7", "EPSG:5187", mapMaker1.map.getView().getProjection().getCode());
					$("#itptCenterX").val("");
					$("#itptCenterY").val("");
				}
			});
			
			// Map 이동 시 watchPosition event 해제
			mapMaker1.map.on('pointerdrag', function(event){
//				if(am.statics.orientation){
//					am.toggleOrientation();
//				}
				
				if(navigator.geolocation){
					navigator.geolocation.clearWatch(am.statics.geolocation);
				}
			});
			
			am.createMapToolbar({
				id: 'map'
			});
			
			var strokes = {
					'line' : new ol.style.Stroke({
						color : 'rgba(152,152,152,0.6)',
						width : 3,
						lineDash : [ 1, 4 ]
					}),
					'default' : new ol.style.Stroke({
						color : 'rgba(152,152,152,1.0)',
						width : 2
					})
				};

				var fill = new ol.style.Fill({
					color : 'rgba(255,0,0,1.0)'
				});

				var styles = {
					'circle' : new ol.style.Style({
						// stroke: strokes['circle'],
						image : new ol.style.Circle({
							fill : fill,
							radius : 10,
							stroke : strokes['default']
						})
					}),
					'triangle' : new ol.style.Style({
						image : new ol.style.RegularShape({
							stroke : strokes['default'],
							points : 3,
							radius : 8,
							rotation: am.statics.arrowRotate*Math.PI/180
						})
					}),
					'icon': new ol.style.Style({
						image: new ol.style.Icon({
//							anchor: [0.5, 0.96],
//							crossOrigin: 'anonymous',
							src: gp.ctxPath + '/images/position_icon30p.png',
//							image: undefined,
//							imgSize: undefined
						})
					})
				};
				
			var locationFeature = new ol.Feature(new ol.geom.Point(mapMaker1.map.getView().getCenter()));
			locationFeature.set('style', styles.icon);
			var orientationFeature = new ol.Feature(new ol.geom.Point(mapMaker1.map.getView().getCenter()));
			orientationFeature.set('style', styles.icon);
			
			am.statics.vectorLayer = new ol.layer.Vector({
				style: function(feature){
					return feature.get('style');
				},
				source: new ol.source.Vector({features: [locationFeature]}),
				visible: false
			});
			
			mapMaker1.map.addLayer(am.statics.vectorLayer);
			
			am.statics.layerSection = new am.LayerFilter({
				map: mapMaker1.map
			});
			
			am.statics.crossSection = new am.crossSection({
				map: mapMaker1.map
			});
			
			am.statics.camera = new am.Camera({
				map: mapMaker1.map,
			});
			
		} else if (page.id === 'searchModalPage') {
			document.querySelectorAll('#searchModalPage ons-switch').forEach(function(item){
				item.addEventListener('change', function(e){
					console.log(e);
					e.stopImmediatePropagation();
					e.stopPropagation();
					e.preventDefault();
					var checked = this.checked;
					
					var boxes;
					if(this.className.includes('layer-swl')){
						boxes = document.querySelectorAll('.swl-checkbox');
					} else if(this.className.includes('layer-wtl')){
						boxes = document.querySelectorAll('.wtl-checkbox');
					} else if(this.className.includes('layer-rdl')){
						boxes = document.querySelectorAll('.rdl-checkbox');
					} else if(this.className.includes('layer-etc')){
						boxes = document.querySelectorAll('.etc-checkbox');
					} else {
						boxes = document.querySelectorAll('.swl-checkbox');
					}
					
					boxes.forEach(function(i){
						i.checked = checked;
					});
				});
			});
		}
	});
	
	ready(function(){
		// document load가 완료되었을 때 실행되는 영역

		$(document).on("change", "#sgg", function () {
			var sggVal = $(this).val();
			var sggText = $("#sgg option:selected").text();
			var sggValSub = sggVal.substr(0, 5);
			var map = mapMaker1.map;

			$("#sgg").siblings("label").text(sggText);
			loadEmdList(sggValSub);
			setCenter(map, sggValSub, "sgg");
		});

		$(document).on("change", "#emd", function () {
			var emdVal = $(this).val();
			var emdText = $("#emd option:selected").text();
			var map = mapMaker1.map;

			$("#emd").siblings("label").text(emdText);
			setCenter(map, emdVal, "emd");
		});
		
		document.querySelectorAll('ons-modal').forEach(function(item){
			item.setAttribute('animation', 'lift'); // modal show&hide animation
		});
	});
}());