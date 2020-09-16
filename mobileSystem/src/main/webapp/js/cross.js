/*
 * 김호철
 * 
 */
var CHART = undefined;
(function(window, $, am4core) {
	'use strict';
	
	var TOASTID = 'crossToast',
		CANCELID = 'crossCancel',
		MESSAGEID = 'crossMessage',
		FIRSTMESSAGE = '첫번째 지점을 선택해주세요',
		SECONDMESSAGE = '두번째 지점을 선택해주세요',
		LABELKO = {
			name: '관리번호',
			type: '관용도',
			label: '관정보',
			r: '관경',
			x: '거리',
			y: '심도'
		};
	
	var crossSection = function(options){
		var that = this;
		var opt = options || {};
		var canvasId = opt.id || 'crossSectionCanvas';
		var tableId = opt.tableId || 'crossSectionTable';
		
		this.map_ = opt.map;
		if(!(this.map_ instanceof ol.Map)){
			console.error("gb.interaction.MeasureTip: 'map' is a required field.");
			return;
		}
		
		// 횡단면도 모달창 생성
		createCrossModal(canvasId, tableId);
		
		// 횡단면도 그래프 영역
		this.target_ = $('#' + canvasId);
		
		// 횡단면도 목록 테이블 영역
		this.targetTable_ = $('#' + tableId);
		
		if(!this.target_.length){
			console.error('"' + canvasId + '" element is not exist!');
			return;
		}
		
		// Draw end event instance
		this.endEvent_ = undefined;
		
		// Draw start event instance
		this.startEvent_ = undefined;
		
		// Draw interaction instance
		this.interaction_ = undefined;
		
		/**
		 * 임시 vector source
		 * @type {ol.source.Vector}
		 * @private
		 */
		this.source_ = new ol.source.Vector({wrapX: false});
		
		/**
		 * 임시 vector layer
		 * @type {ol.layer.Vector}
		 * @private
		 */
		this.vector_ = new ol.layer.Vector({
			source : this.source_,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0.2)'
				}),
				stroke: new ol.style.Stroke({
					color: '#ffcc33',
					width: 2
				}),
				image: new ol.style.Circle({
					radius: 7,
					fill: new ol.style.Fill({
						color: '#ffcc33'
					})
				})
			})
		});
		
		this.vector_.setMap(this.map_);
		
		createToast();
		
		$(document).on('click', '#' + CANCELID, function(){
			that.clear();
		})
	}
	
	crossSection.prototype.drawFeature = function(type) {
		var that = this;
		
		this.clear();
		
		this.interaction_ = new ol.interaction.Draw({
			type: type,
			source: this.source_
		});
		
		document.querySelector('#' + TOASTID).toggle();
		
		var listener;
		this.startEvent_ = this.interaction_.on('drawstart', function(evt){
			listener = evt.feature.getGeometry().on('change', function(evt){
				var geom = evt.target;
				var coords = geom.getCoordinates();
				var length = coords.length;
				
				if(length === 2){
					$('#' + MESSAGEID).html(SECONDMESSAGE);
				}
				
				if(length === 3){
					that.interaction_.finishDrawing();
				}
			});
		});
		
		this.endEvent_ = this.interaction_.on('drawend', function(evt){
			var geom = evt.feature.clone().getGeometry().transform('EPSG:3857', 'EPSG:5187');
			var format = new ol.format.WKT();

			var firstCoord, lastCoord, wkt, transGeom;
			if (geom instanceof ol.geom.LineString) {
				
				firstCoord = geom.getFirstCoordinate();
				lastCoord = geom.getLastCoordinate();
				wkt = format.writeGeometry(geom);
				
				$.ajax({
					url: gp.ctxPath + '/layer/getHcsList.json',
					type: "POST",
					data: {
						pointGeom: 'POINT(' + firstCoord[0] + ' ' + firstCoord[1] + ')',
						lastGeom: 'POINT(' + lastCoord[0] + ' ' + lastCoord[1] + ')',
						geom: wkt
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
						
						var pipeList = resData.pipeList;
						var roadList = resData.roadList;
						var centerRoads = roadList.centerRoad;
						var paveRoads = roadList.paveRoad;
						var fields = resData.fields;
						
						var name, width, depth, radius, type;
						var minX = Infinity;
						var data = [];
						var roadData = [];
						var tableList = [];
						
						var offset = 1;
						
						for(var i in paveRoads){
							if(paveRoads[i].start < minX){
								minX = paveRoads[i].start;
							}
						}
						
						for(var i in pipeList){
							name = pipeList[i].ftr_idn;
							if(pipeList[i].x < minX){
								minX = pipeList[i].x;
							}
							
							width = pipeList[i].x - minX + offset;
							depth = pipeList[i].pip_lbl.substring(pipeList[i].pip_lbl.length - 3, pipeList[i].pip_lbl.length);
							radius = pipeList[i].y;
							
							if(pipeList[i].type === 'WTL'){
								type = '상수관';
							} else if(pipeList[i].type === 'SWL'){
								if(pipeList[i].saa_cde === 'SBA003'){
									type = '우수관';
								} else if(pipeList[i].saa_cde === 'SBA004'){
									type = '오수관';
								} else {
									type = '하수관';
								}
							} else {
								type = '';
							}
							
							data.push({
								name: name.toString(),
								type: type,
								label: pipeList[i].pip_lbl,
								r: radius,
								x: width,
								y: parseFloat(depth) ?  parseFloat(depth).toFixed(1) : '0.0'
							});
							
							tableList.push({
								ftr_idn: pipeList[i].ftr_idn,
//								ftr_cde: pipeList[i].ftr_cde,
								pip_lbl: pipeList[i].pip_lbl
							})
						}
						
//						for(var i in centerRoads){
//							roadData.push({
//								ftrCde: centerRoads[i].ftrCde,
//								name: centerRoads[i].name,
//								rdlWid: centerRoads[i].rdlWid,
//								type: centerRoads[i].type,
//								x: centerRoads[i].x - minX + offset
//							})
//						}
						
						for(var i in paveRoads){
							roadData.push({
								name: paveRoads[i].name,
								width: paveRoads[i].pavWid,
								type: paveRoads[i].ftrCde,
								start: paveRoads[i].start - minX + offset,
								end: paveRoads[i].end - minX + offset
							});
						}
						
						var modal = document.getElementById('cross-modal');
						if(modal){
							modal.show();
							
							// 횡단면도 그래프 생성
							createAmchart(data, roadData);
							
							// 횡단면도 테이블 생성
							that.updateTable({
								list: tableList,
								fields: fields
							});
						}
						that.clear();
					}
				});
			}
			
			document.querySelector('#' + TOASTID).hide();
			ol.Observable.unByKey(listener);
			that.clear();
		});
		
		this.map_.addInteraction(this.interaction_);
	}
	
	crossSection.prototype.clear = function(){
		if(this.interaction_ instanceof ol.interaction.Interaction){
			this.map_.removeInteraction(this.interaction_);
		}
		
		$('#' + MESSAGEID).html(FIRSTMESSAGE);
		this.source_.clear();
	}
	
	crossSection.prototype.updateTable = function(obj){
		this.targetTable_.empty();
		var html = '';
		var theader = '';
		var tbody = '<tbody>';
		var list = obj.list;
		var fields = obj.fields;
		
		for(var i in list){
			if(theader === ''){
				theader += '<thead>';
				for(var j in list[i]){
					theader += '<th>' + fields[j] + '</th>';
				}
				theader += '</thead>';
			}
			
			tbody += '<tr class="disable-tr">';
			for(var j in list[i]){
				tbody += '<td>' + list[i][j] + '</td>';
			}
			tbody += '</tr>';
		}
		tbody += '</tbody>';
		
		html = theader + tbody;
		this.targetTable_.append(html);
	}
	
	function createToast(){
		if(!document.querySelector('ons-toast#' + TOASTID)){
			var target = $('body');
			var html = '';
			html += '<ons-toast id="' + TOASTID + '" animation="fall">';
			html += '<div id="' + MESSAGEID + '">' + FIRSTMESSAGE + '</div>';
			html += '<button id="' + CANCELID + '" onclick="crossToast.hide()">취소</button>';
			html += '</ons-toast>';
			target.append(html);
		}
	}
	
	function deepClone(obj){
		if(obj === null || typeof obj !== 'object'){
			return obj;
		}
		
		var result = Array.isArray(obj) ? [] : {};
		for(var i in obj){
			result[i] = deepClone(obj[i]);
		}
		
		return result;
	}
	
	function createAmchart(data, road){
		document.querySelectorAll('#labelSelector option').forEach(function(item){
			item.remove();
		})
		
		var exceptLabel = ['x']; // 제외시킬 라벨 목록
		var offset = 1;
		var maxY = 1.0;
		var maxX = 0;
		var distanceList = [];
		
		for(var i in road){
			if(road[i].end > maxX){
				maxX = road[i].end;
			}
			
			distanceList.push(road[i].start);
			distanceList.push(road[i].end);
		}
		
		for(var i in data){
			if(data[i].y > maxY){
				maxY = data[i].y;
			}
			
			if(data[i].x > maxX){
				maxX = data[i].x;
			}
			
			if(i == 0){
				var option = ons.createElement('<option value="none">없음</option>');
				document.querySelector('#labelSelector').appendChild(option);
				
				for(var j in data[i]){
					if(exceptLabel.includes(j)){
						continue;
					}
					option = ons.createElement('<option value="' + j + '">' + LABELKO[j] + '</option>');
					document.querySelector('#labelSelector').appendChild(option);
				}
			}
			
			distanceList.push(data[i].x);
		}
		
		// 도로, 관 거리 정렬
		distanceList.sort(function(a,b){return a-b;});
		
		// amchart 테마 선택
		am4core.useTheme(am4themes_animated);
		
		// 이전 amchart 삭제
		if(CHART instanceof am4charts.XYChart){
			CHART.dispose();
		}
		
		// amchart 생성
		var chart = CHART = am4core.create('crossSectionCanvas', am4charts.XYChart);
		
		// 그래프 x축 생성
		var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
//		valueAxisX.renderer.ticks.template.disabled = true;
//		valueAxisX.renderer.axisFills.template.disabled = true;
//		valueAxisX.renderer.grid.template.location = 0.5;
//		valueAxisX.renderer.minGridDistance = 40;
		valueAxisX.renderer.labels.template.disabled = true;
		valueAxisX.min = 0;
		valueAxisX.max = maxX + offset;
		valueAxisX.strictMinMax = true;
		valueAxisX.tooltip.disabled = true;
//		valueAxisX.end = 0.5; // 초기 scrollX의 end 위치(%) - 그래프가 50% 확대됨
//		valueAxisX.keepSelection = true; // amchart 생성 후 scrollX 위치가 초기화되는 것을 방지
		valueAxisX.title.text = '간격(m)';
		
		// 그래프 y축 생성
		var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxisY.renderer.ticks.template.disabled = true;
		valueAxisY.renderer.axisFills.template.disabled = true;
		valueAxisY.renderer.inversed = true;
		valueAxisY.numberFormatter.numberFormat = "#.0";
		valueAxisY.min = -0.5;
		valueAxisY.max = Math.floor(maxY) + 1.0;
		valueAxisY.strictMinMax = true;
		valueAxisY.title.text = '심도(m)';
		
		// 횡단면도 그래프 생성
		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.valueX = 'x';
		series.dataFields.valueY = 'y';
		series.dataFields.value = 'r';
		series.strokeOpacity = 0;
//		series.sequencedInterpolation = true;
		series.tooltip.pointerOrientation = 'vertical';
		
		// 횡단면도 그래프 심볼
		var bullet = series.bullets.push(new am4core.Circle());
		bullet.fill = am4core.color('#ff0000');
		bullet.propertyFields.fill = 'color';
		bullet.strokeOpacity = 0;
		bullet.strokeWidth = 2;
		bullet.fillOpacity = 0.5;
		bullet.stroke = am4core.color('#ffffff');
		bullet.hiddenState.properties.opacity = 0;
		bullet.tooltipText = '[bold]관리번호: {name}[/]\n관경: {r.formatNumber("#")}\n심도: {y}';
		
		// 그래프 마우스 오버 이벤트 함수 생성
		bullet.events.on('over', function(event) {
			// bullet 그래프에 outline 생성
			var target = event.target;
			outline.radius = target.pixelRadius + 2;
			outline.x = target.pixelX;
			outline.y = target.pixelY;
			outline.show();
		})

		// 그래프 마우스 out 이벤트 함수 생성
		bullet.events.on('out', function(event) {
			outline.hide();
		})

		// 마우스 hover 가이드 라인 생성
		var hoverState = bullet.states.create('hover');
		hoverState.properties.fillOpacity = 1;
		hoverState.properties.strokeOpacity = 1;

		// 그래프에 규칙 추가
		series.heatRules.push({ target: bullet, min: 10, max: 50, property: 'radius', /*logarithmic: true*/ });

		bullet.adapter.add('tooltipY', function (tooltipY, target) {
			return -target.radius;
		})

		// 횡단면도 라벨 심볼
		var mainLabelBullet = series.bullets.push(new am4charts.LabelBullet());
		mainLabelBullet.label.fill = am4core.color('#000');
		
		// 관 심볼 라벨 생성
		document.querySelector('#labelSelector').onchange = function(e){
			console.log(e);
			
			mainLabelBullet.label.text = '{' + this.value + '}';
			
			CHART.validateData();
			var seriesList = CHART.series;
			for(var i = 0; i < seriesList.length; i++){
				seriesList.getIndex(i).invalidateData();
			}
		};
		
		for(var i in data){
			// 도로 시작점 거리 가이드 라인
			var guideSeries = chart.series.push(new am4charts.LineSeries());
			guideSeries.dataFields.valueX = 'gx';
			guideSeries.dataFields.valueY = 'gy';
			guideSeries.ignoreMinMax = true;
			guideSeries.stroke = am4core.color('#000000');
			guideSeries.strokeWidth = 1;
			guideSeries.strokeDasharray = 2;
			guideSeries.strokeOpacity = 0.3;
			guideSeries.data = [{
				'gx': data[i].x,
				'gy': 0.0
			},{
				'gx': data[i].x,
				'gy': Math.floor(maxY) + 1.0
			}];
		}
		
		for(var i in road){
			// 도로 시작점 거리 가이드 라인
			var guideSeries = chart.series.push(new am4charts.LineSeries());
			guideSeries.dataFields.valueX = 'gx';
			guideSeries.dataFields.valueY = 'gy';
			guideSeries.ignoreMinMax = true;
			guideSeries.stroke = am4core.color('#000000');
			guideSeries.strokeWidth = 1;
			guideSeries.strokeDasharray = 2;
			guideSeries.strokeOpacity = 0.6;
			guideSeries.data = [{
				'gx': road[i].start,
				'gy': 0.0
			},{
				'gx': road[i].start,
				'gy': Math.floor(maxY) + 1.0
			}];
			
			// 도로 끝점 거리 가이드 라인
			var guideSeries2 = chart.series.push(new am4charts.LineSeries());
			guideSeries2.dataFields.valueX = 'gx';
			guideSeries2.dataFields.valueY = 'gy';
			guideSeries2.ignoreMinMax = true;
			guideSeries2.stroke = am4core.color('#000000');
			guideSeries2.strokeWidth = 1;
			guideSeries2.strokeDasharray = 2;
			guideSeries2.strokeOpacity = 0.6;
			guideSeries2.data = [{
				'gx': road[i].end,
				'gy': 0.0
			},{
				'gx': road[i].end,
				'gy': Math.floor(maxY) + 1.0
			}];
			
			// 도로면 그래프 생성
			var barSeries = chart.series.push(new am4charts.LineSeries());
			barSeries.dataFields.valueX = 'ax';
			barSeries.dataFields.valueY = 'ay';
			barSeries.strokeOpacity = 0;
			barSeries.fill = road[i].type === 'AZ922' ? am4core.color('#7f7f7f') : am4core.color('#000000');
			barSeries.ignoreMinMax = true;
			barSeries.fillOpacity = 0.9;
			barSeries.data = [{
				'ax': road[i].end,
				'ay': 0
			},{
				'ax': road[i].start,
				'ay': 0
			},{
				'ax': road[i].start,
				'ay': -0.5
			},{
				'ax': road[i].end,
				'ay': -0.5
			}];
			
			// 도로면 라벨 생성
			var labelSeries = chart.series.push(new am4charts.LineSeries());
			labelSeries.dataFields.valueX = 'ax';
			labelSeries.dataFields.valueY = 'ay';
			labelSeries.strokeOpacity = 0;
			labelSeries.fillOpacity = 0;
			labelSeries.data = [{
				'ax': (road[i].start + road[i].end)/2,
				'ay': -0.25
			}];
			
			var labelBullet = labelSeries.bullets.push(new am4charts.LabelBullet());
			labelBullet.label.fill = am4core.color("#fff");
			labelBullet.label.text = road[i].type === 'AZ922' ? '보도면' : '차도면';
		}
		
		var arrowWidth = 5;
		// 간격 가이드라인 생성
		for(var i = 0; i < distanceList.length - 1; i++){
			var interval = distanceList[i+1] - distanceList[i];
			if(interval <= 0){
				continue;
			}
			
			// 간격 그래프 생성
			var barSeries = chart.series.push(new am4charts.LineSeries());
			barSeries.dataFields.valueX = 'ax';
			barSeries.dataFields.valueY = 'ay';
			barSeries.stroke = am4core.color('#000000');
			barSeries.strokeWidth = 2;
			barSeries.strokeDasharray = 2;
			barSeries.strokeOpacity = 0.8;
			barSeries.ignoreMinMax = true;
			barSeries.data = [{
				'ax': distanceList[i+1],
				'ay': Math.floor(maxY) + 1.0
			},{
				'ax': distanceList[i],
				'ay': Math.floor(maxY) + 1.0
			}];
			
			var openBullet = barSeries.bullets.create(am4charts.Bullet);
			var arrow = openBullet.createChild(am4core.Triangle);
			arrow.horizontalCenter = "middle";
			arrow.verticalCenter = "middle";
			arrow.fill = am4core.color("#000");
			arrow.stroke = am4core.color("#000");
			arrow.direction = "right";
			arrow.paddingRight = arrowWidth;
			arrow.width = arrowWidth;
			arrow.height = arrowWidth;

			var closeBullet = barSeries.bullets.create(am4charts.Bullet);
			var arrow = closeBullet.createChild(am4core.Triangle);
			arrow.horizontalCenter = "middle";
			arrow.verticalCenter = "middle";
			arrow.fill = am4core.color("#000");
			arrow.stroke = am4core.color("#000");
			arrow.direction = "left";
			arrow.paddingLeft = arrowWidth;
			arrow.width = arrowWidth;
			arrow.height = arrowWidth;
			
			// 간격 라벨 생성
			var labelSeries = chart.series.push(new am4charts.LineSeries());
			labelSeries.dataFields.valueX = 'ax';
			labelSeries.dataFields.valueY = 'ay';
			labelSeries.strokeOpacity = 0;
			labelSeries.fillOpacity = 0;
			labelSeries.data = [{
				'ax': (distanceList[i] + distanceList[i+1])/2,
				'ay': Math.floor(maxY) + 0.9
			}];
			
			var labelBullet = labelSeries.bullets.push(new am4charts.LabelBullet());
			labelBullet.label.fill = am4core.color("#000000");
			labelBullet.label.fillOpacity = 0.7;
			labelBullet.label.text = Math.round(interval*100)/100;
		}
		
		// 심볼 outline 스타일 생성
		var outline = chart.plotContainer.createChild(am4core.Circle);
		outline.fillOpacity = 0;
		outline.strokeOpacity = 0.8;
		outline.stroke = am4core.color('#ff0000');
		outline.strokeWidth = 2;
		outline.hide(0);
		
		var blurFilter = new am4core.BlurFilter();
		outline.filters.push(blurFilter);
		
		// 횡단면도 타입별 스타일 적용 이벤트 함수 생성
		bullet.adapter.add('fill', function(fill, target){
			if(!target.dataItem){
				return fill;
			}
			
			var values = target.dataItem.dataContext;
			var type = values.type;
			var color;
			
			switch(type){
			case '상수관':
				color = am4core.color('#0000ff');
				break;
			case '우수관', '하수관':
				color = am4core.color('#ff00ff');
				break;
			case '오수관':
				color = am4core.color('#7f4f3f');
				break;
			default:
				color = am4core.color('#0000ff');
			}
			
			return color;
		});
		
//		mainLabelBullet.label.adapter.add('text', function(label, target, key){
//			console.log(label);
//			console.log(target);
//			console.log(key);
//		});
		
//		bullet.adapter.add('pixelHeight', function (pixelHeight, target) {
//			var dataItem = target.dataItem;
//
//			if (dataItem) {
//				var value = dataItem.valueY;
//
//				return Math.abs(value);
//			}
//			return pixelHeight;
//		});
//		
//		bullet.adapter.add('ay', function (dy, target) {
//			var dataItem = target.dataItem;
//			if(dataItem){
//				var value = dataItem.valueY;
//
//				return value;
//			 }
//			 return dy;
//		});
		
		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = 'panX';
		chart.cursor.snapToSeries = series;

		chart.scrollbarX = new am4core.Scrollbar();
//		chart.scrollbarY = new am4core.Scrollbar();
		
		chart.data = data; // amchart data binding
	}
	
	function createCrossModal(canvasId, tableId){
		if(document.querySelector('#crossModalPage')){
			return;
		}
		
		var target = $('body');
		var html = '';
		html += '<ons-modal id="cross-modal" direction="up">';
		html += '<ons-page id="crossModalPage">';
		html += '<ons-toolbar>';
		html += '<div class="center">횡단면도</div>';
		html += '<div class="right">';
		html += '<ons-toolbar-button onclick="document.getElementById(' + "'cross-modal'" + ').hide();">닫기</ons-toolbar-button>';
		html += '</div>';
		html += '</ons-toolbar>';
		html += '<ons-list>';
		html += '<ons-list-item>';
		html += '<div class="left">그래프 라벨</div>';
		html += '<div class="center">';
		html += '<ons-select modifier="underbar"><select id="labelSelector">';
		html += '<option value="basic">Basic</option>';
		html += '</select></ons-select>';
		html += '</div>';
		html += '</ons-list-item>';
		html += '</ons-list>';
		html += '<div class="ui horizontal">';
		html += '<div class="item">';
		html += '<div class="ui avatar image" style="background-color: #0000ff"></div>';
		html += '<div class="content"><div class="header">상수관</div></div>';
		html += '</div>';
		html += '<div class="item">';
		html += '<div class="ui avatar image" style="background-color: #ff00ff"></div>';
		html += '<div class="content"><div class="header">우수관</div></div>';
		html += '</div>';
		html += '<div class="item">';
		html += '<div class="ui avatar image" style="background-color: #7f4f3f"></div>';
		html += '<div class="content"><div class="header">오수관</div></div>';
		html += '</div>';
		html += '</div>';
		html += '<div id="' + canvasId + '" style="height:25rem;"></div>';
		html += '<table id="' + tableId + '" class="table semantic" style="margin: 0;"></table>';
		html += '</ons-page>';
		html += '</ons-modal>';
		
		target.append(html);
		
		document.querySelector('#crossModalPage').setAttribute('animation', 'lift');
	}
	
	window.am = window.am || {};
	window.am.crossSection = crossSection;
})(window, jQuery, am4core);