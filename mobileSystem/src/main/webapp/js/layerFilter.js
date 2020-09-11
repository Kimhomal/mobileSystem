(function(window, $) {
	'use strict';
	
	var DATABASE = 'gb';
	var GEOSERVERURL = gp.proxyPath + 'http://1.234.21.200:8062/geoserver';
//	var WFSURL = GEOSERVERURL + '/' + DATABASE + '/wfs';
	var WFSURL = "http://1.234.21.200:8062/geoserver/gb/wfs";
	var GETLEGENDGRAPHIC = '/wms?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=';
	
	var layerFilter = function(options){
		var that = this;
		var opt = options || {};
		var btnId = opt.btnId || 'layerFilterBtn';
		
		this.map_ = opt.map;
		if(!(this.map_ instanceof ol.Map)){
			console.error("gb.interaction.MeasureTip: 'map' is a required field.");
			return;
		}
		
		createModal();
		setTree().then(function(result){
			$.each(result.layers, function (key, val) {
				var id = val.tableNm ? val.tableNm.toLowerCase() : '';
				
				setLabelList(id).then(function(result){
					var select = $('#' + result.id + '-select');
					var features = result.features;
					var props;
					for(var i in features){
						props = features[i].properties;
						for(var j in props){
							select.append(new Option(j, j));
						}
					}
				});
			});
		});
//		setEventTree(this.map_);

		document.querySelector('#' + btnId).onclick = function(){
			that.show();
		};
		
		document.querySelector('#layerFilterCancel').onclick = function(){
			that.hide();
		};
		
		document.querySelector('#layerFilterApply').onclick = function(){
			that.apply();
		};
		
		document.querySelectorAll('ons-modal').forEach(function(item){
			item.setAttribute('animation', 'lift'); // modal show&hide animation
		});
		
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
	
	layerFilter.prototype.show = function(){
		var modal = document.getElementById('search-modal');
		modal.show();
	}
	
	layerFilter.prototype.hide = function(){
		var modal = document.getElementById('search-modal');
		modal.hide();
	}
	
	layerFilter.prototype.apply = function(){
		var that = this;
		
		$('#searchModalPage input:not(:checked)').each(function(index, element){
			var lyrId = element.id;
			var temp = mapMaker1.mapLayerMng.getLayerById(lyrId);
			
			if(temp){
				temp.setVisible(false);
			}
		});
		
		$('#searchModalPage input:checked').each(function(index, element){
			var lyrId = element.id;
			var temp = mapMaker1.mapLayerMng.getLayerById(lyrId);
			
			if(temp){
				temp.setVisible(true);
			}
		});
		
		$('#searchModalPage select').each(function(index, item){
			console.log(item.value);
			var id = item.id.replace(/\-select/g,'');
			var val = item.value;
			
			if(val === 'none'){
				return;
			}
			
			var sld = createSLD({
				label: val,
				type: 'point'
			});
			var layers = that.map_.getLayers().getArray();
			var source;
			for(var i in layers){
				if(layers[i].get('id') === id){
					debugger;
					source = layers[i].getSource();
					source.updateParams({
						VERSION : '1.3.0',
//						QUERY_LAYERS: lyrName,
						FORMAT : "image/png",
						STYLES:'',
						SLD_BODY: sld});
//					break;
					source.clear();
				}
			}
		});
		
//		this.map_.render();
		
		var modal = document.getElementById('search-modal');
		modal.hide();
	}
	
	function createSLD(options){
		var type = options.type || 'point';
		var stroke = options.stroke || '#ff00ff';
		var strokeWidth = options.strokeWidth || '1';
		var fill = options.fill || '#FF00FF';
		var fillOpacity = options.fillOpacity || '0.2';
		var label = options.label || '';
		
		var sld = "";
		sld += "<StyledLayerDescriptor version='1.0.0' xsi:schemaLocation='http://www.opengis.net/sld StyledLayerDescriptor.xsd' xmlns='http://www.opengis.net/sld' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>";
		sld += "<NamedLayer>";
//		sld += "<Name>wtl_pipe_ps</Name>";
		sld += "<UserStyle>";
		sld += "<Title>Default Point</Title>";
		sld += "<Abstract>A sample style that draws a point</Abstract>";
		sld += "<FeatureTypeStyle>";
		sld += "<Rule>";
		sld += "<Name>wtl_pipe_ps</Name>";
		sld += "<Title>wtl_pipe_ps</Title>";
		
		if(type === "point"){
			sld += "<PointSymbolizer>";
			sld += "<Graphic>";
			sld += "<ExternalGraphic>";
			sld += "<OnlineResource xlink:type='simple' xlink:href='swl_manh_ps.png' />";
			sld += "<Format>image/png</Format>";
			sld += "</ExternalGraphic>";
			sld += "<Size>15</Size>";
			sld += "</Graphic>";
			sld += "</PointSymbolizer>";
		} else if(type === "line"){
			sld += "<LineSymbolizer>";
			sld += "<Stroke>";
			sld += "<CssParameter name='stroke'>#ff00ff</CssParameter>";
			sld += "<CssParameter name='stroke-width'>2</CssParameter>";
			sld += "</Stroke>";
			sld += "</LineSymbolizer>";
		} else if(type === "polygon"){
			sld += "<PolygonSymbolizer>";
			sld += "<Fill>";
			sld += "<CssParameter name='fill'>#FF00FF</CssParameter>";
			sld += "<CssParameter name='fill-opacity'>0.2</CssParameter>";
			sld += "</Fill>";
			sld += "<Stroke>";
			sld += "<CssParameter name='stroke'>#FF00FF</CssParameter>";
			sld += "<CssParameter name='stroke-width'>1</CssParameter>";
			sld += "</Stroke>";
			sld += "</PolygonSymbolizer>";
		}
		
		if(label){
			sld += "<TextSymbolizer>";
			sld += "<Label>";
			sld += "<ogc:PropertyName>" + label + "</ogc:PropertyName>";
			sld += "</Label>";
			sld += "<Font>";
			sld += "<CssParameter name='font-family'>Arial</CssParameter>";
			sld += "<CssParameter name='font-size'>12</CssParameter>";
			sld += "<CssParameter name='font-style'>normal</CssParameter>";
			sld += "<CssParameter name='font-weight'>bold</CssParameter>";
			sld += "</Font>";
			sld += "<LabelPlacement>";
			sld += "<PointPlacement>";
			sld += "<AnchorPoint>";
			sld += "<AnchorPointX>0.5</AnchorPointX>";
			sld += "<AnchorPointY>0.0</AnchorPointY>";
			sld += "</AnchorPoint>";
			sld += "<Displacement>";
			sld += "<DisplacementX>0</DisplacementX>";
			sld += "<DisplacementY>25</DisplacementY>";
			sld += "</Displacement>";
			sld += "<Rotation>-45</Rotation>";
			sld += "</PointPlacement>";
			sld += "</LabelPlacement>";
			sld += "</TextSymbolizer>";
		}
		
		sld += "</Rule>";
		sld += "</FeatureTypeStyle>";
		sld += "</UserStyle>";
		sld += "</NamedLayer>";
		sld += "</StyledLayerDescriptor>";
		
		return sld;
	}
	
	function setLabelList(layerId) {
		var id = layerId;
		
		return new Promise(function(resolve, reject){
			$.ajax({
	            url: WFSURL,
	            dataType: 'json',
	            data: {
	                srs: 'EPSG:5187',
	                request: 'GetFeature',
	                version: '1.0.0',
	                typename: DATABASE + ':' + id,
	                outputFormat: 'application/json',
	                maxFeatures: 1
	            },
	            success: function (response) {
	            	resolve(Object.assign(response, {id: id}));
	            },
	            error: function (a, b, c) {
	                console.log("error");
	            }
	        });
		});
	}
	
	function setTree() {
		return new Promise(function(resolve, reject){
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
					reject(error);
				},
				success: function (responseData, textStatus) {
					
					$.each(responseData.layers, function (key, val) {
						
						var id = val.tableNm ? val.tableNm.toLowerCase() : '';
						var name = val.layerNm;
						var visible = val.visible;
						var layerId = val.layerId;
						
						var html = '';
						var target = undefined;
						var className = undefined;
						
						if(layerId.includes('WTL')){
							// 상수시설물
							target = $('#searchModalPage .layer-wtl');
							className = 'wtl-checkbox';
						} else if(layerId.includes('SWL')){
							// 하수시설물
							target = $('#searchModalPage .layer-swl');
							className = 'swl-checkbox';
						} else if(layerId.includes('RDL')){
							// 도로시설물
							target = $('#searchModalPage .layer-rdl');
							className = 'rdl-checkbox';
						} else {
							// 기타시설물
							target = $('#searchModalPage .layer-etc');
							className = 'etc-checkbox';
						}
						
						if(target){
							html += '<ons-list-item tappable>';
							html += '<label class="left">';
							html += '<ons-checkbox class="' + className + '" input-id="' + id + '" ' + (visible === 'true' ? 'checked' : '') + '></ons-checkbox>';
							html += '</label>';
							html += '<label for="' + id + '" class="center">';
							html += name;
							html += '</label>';
							html += '<label class="right">';
							html += '<ons-select select-id="' + id + '-select">';
							html += '<option value="none">라벨선택</option>';
							html += '</ons-select>';
							html += '<img class="list-item__thumbnail" src="' + GEOSERVERURL + GETLEGENDGRAPHIC + DATABASE + ':' +id.toLowerCase() + '">';
							html += '</label>';
							html += '</ons-list-item>';
							
							target.append(html);
						}
					});
					
					resolve(responseData);
				}
			});
		});
	}
	
	function setEventTree(map) {
		var map = map;
		var wmsLayerGroup = map.getLayerGroup();
		var wmsLayerArray = wmsLayerGroup.getLayers().getArray();

		// set default checked for 정예R, 정예Y (판독완료) layers
		$(document).on("change", "input[type=checkbox]", function () {
			var lyrId = $(this).attr("id");
			var layers = map.getLayers().getArray();
			var layer = null;
			$.each(layers, function(idx, lyr){
				if(lyr.get("id") == lyrId.toLowerCase()) {
					layer = lyr;
					return false;
				}
			});
			
			if(layer){
				layer.setVisible($(this).is(":checked"));
			}
			
			map.render();
		});
	}
	
	function createModal(){
		if(document.querySelector('#searchModalPage')){
			return;
		}
		
		var target = $('body');
		
		var html = '';
		html += '<ons-modal id="search-modal" direction="up">';
		html += '<ons-page id="searchModalPage">';
		html += '<ons-toolbar>';
		html += '<div class="left">';
		html += '<ons-toolbar-button id="layerFilterCancel">취소</ons-toolbar-button>';
		html += '</div>';
		html += '<div class="center">레이어 필터</div>';
		html += '<div class="right">';
		html += '<ons-toolbar-button id="layerFilterApply">적용</ons-toolbar-button>';
		html += '</div>';
		html += '</ons-toolbar>';
		html += '<ons-list>';
		
		html += '<ons-list-item expandable>';
		html += '<div class="left">상수</div>';
		html += '<div class="center">';
		html += '<ons-switch class="layer-wtl-switch" checked></ons-switch>';
		html += '</div>';
		html += '<div class="expandable-content layer-wtl">';
		html += '</div>';
		html += '</ons-list-item>';
		
		html += '<ons-list-item expandable>';
		html += '<div class="left">하수</div>';
		html += '<div class="center">';
		html += '<ons-switch class="layer-swl-switch"></ons-switch>';
		html += '</div>';
		html += '<div class="expandable-content layer-swl">';
		html += '</div>';
		html += '</ons-list-item>';
			
		html += '<ons-list-item expandable>';
		html += '<div class="left">도로</div>';
		html += '<div class="center">';
		html += '<ons-switch class="layer-rdl-switch"></ons-switch>';
		html += '</div>';
		html += '<div class="expandable-content layer-rdl">';
		html += '</div>';
		html += '</ons-list-item>';
			
		html += '<ons-list-item expandable>';
		html += '<div class="left">기타</div>';
		html += '<div class="center">';
		html += '<ons-switch class="layer-etc-switch"></ons-switch>';
		html += '</div>';
		html += '<div class="expandable-content layer-etc">';
		html += '</div>';
		html += '</ons-list-item>';
		html += '</ons-list>';
		html += '</ons-page>';
		html += '</ons-modal>';
		
		target.append(html);
	}
	
	window.am = window.am || {};
	window.am.LayerFilter = layerFilter;
})(window, jQuery);