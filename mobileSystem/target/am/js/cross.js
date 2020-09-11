/*
 * 김호철
 * 
 */
var CHART = undefined;
(function(window, $, am4core) {
	'use strict';
	
	var TOASTID = 'crossToast',
		MESSAGEID = 'crossMessage',
		FIRSTMESSAGE = '첫번째 지점을 선택해주세요',
		SECONDMESSAGE = '두번째 지점을 선택해주세요',
		LABELKO = {
			name: '관리번호',
			type: '타입',
			label: '관정보',
			r: '관경',
			x: '거리',
			y: '심도'
		};
	
	var crossSection = function(options){
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
								type = '하수관';
							} else {
								type = '';
							}
							
							data.push({
								name: name.toString(),
								type: type,
								label: pipeList[i].pip_lbl,
								r: radius,
								x: width,
								y: parseFloat(depth) || 0
							});
							
							tableList.push({
								ftr_idn: pipeList[i].ftr_idn,
								ftr_cde: pipeList[i].ftr_cde,
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
//							HEIGHT = document.querySelector('body').clientHeight/2;
//							WIDTH = document.querySelector('body').clientWidth;
//							x = d3.scaleLinear().domain(d3.extent(data, d => d.x)).nice().range([MARGIN.left, WIDTH - MARGIN.right]);
//							y = d3.scaleLinear().domain(d3.extent(data, d => d.y) .sort((a,b) => (b-a))).nice().range([HEIGHT - MARGIN.bottom, MARGIN.top]);
//							that.node_ = createGraph(data);
							createAmchart(data, roadData);
//							that.target_.empty();
//							that.target_.append(that.node_);
							
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
			html += '<button onclick="crossToast.hide()">취소</button>';
			html += '</ons-toast>';
			target.append(html);
		}
	}
	
	function createAmchart(data, road){
		document.querySelectorAll('#labelSelector option').forEach(function(item){
			item.remove();
		})
		
		var offset = 5;
		var maxY = 1.0;
		var maxX = 0;
		
		for(var i in road){
			if(road[i].end > maxX){
				maxX = road[i].end;
			}
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
					option = ons.createElement('<option value="' + j + '">' + LABELKO[j] + '</option>');
					document.querySelector('#labelSelector').appendChild(option);
				}
			}
		}
		
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
		valueAxisX.renderer.ticks.template.disabled = true;
		valueAxisX.renderer.axisFills.template.disabled = true;
		valueAxisX.min = 0;
		valueAxisX.max = maxX + offset;
		valueAxisX.strictMinMax = true;
//		valueAxisX.renderer.grid.template.location = 0.5;
//		valueAxisX.renderer.minGridDistance = 40;
		valueAxisX.end = 0.5; // 초기 scrollX의 end 위치(%)
		valueAxisX.keepSelection = true; // amchart 생성 후 scrollX 위치가 초기화되는 것을 방지
		valueAxisX.title.text = '거리(m)';
		
		// 그래프 y축 생성
		var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxisY.renderer.ticks.template.disabled = true;
		valueAxisY.renderer.axisFills.template.disabled = true;
		valueAxisY.renderer.inversed = true;
		valueAxisY.min = -0.5;
		valueAxisY.max = Math.floor(maxY) + 1.0;
		valueAxisY.strictMinMax = true;
		valueAxisY.title.text = '심도(m)';
		
		// 횡단면도 그래프 생성
		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.valueX = 'x';
		series.dataFields.valueY = 'y';
		series.dataFields.value = 'r';
		series.dataFields.type = 'type';
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
		bullet.tooltipText = '[bold]관리번호: {name}[/]\n관경: {value.value}\n심도: {valueY.value}';
		
		// 횡단면도 라벨 심볼
		var mainLabelBullet = series.bullets.push(new am4charts.LabelBullet());
		mainLabelBullet.label.fill = am4core.color('#000');
		
		for(var i in road){
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
			
			var values = target.dataItem;
			return values.type === '상수관' ? am4core.color('#0000ff') : am4core.color('#ff00ff');
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
		
		// 그래프 마우스 오버 이벤트 함수 생성
		bullet.events.on('over', function(event) {
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

		var hoverState = bullet.states.create('hover');
		hoverState.properties.fillOpacity = 1;
		hoverState.properties.strokeOpacity = 1;

		// 그래프에 규칙 추가
		series.heatRules.push({ target: bullet, min: 10, max: 50, property: 'radius', /*logarithmic: true*/ });

		bullet.adapter.add('tooltipY', function (tooltipY, target) {
			return -target.radius;
		})

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
		
		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = 'panX';
		chart.cursor.snapToSeries = series;

		chart.scrollbarX = new am4core.Scrollbar();
//		chart.scrollbarY = new am4core.Scrollbar();
		
		chart.data = data; // amchart data binding
	}
	
//	function createGraph(data){
//		var svg = d3.create('svg').attr('viewBox', [0, 0, WIDTH, HEIGHT]);
//		
//		svg.append('g').call(xAxis);
//		
//		svg.append('g').call(yAxis);
//		
//		svg.append('g').call(grid);
//		
//		svg.append('g')
//			.attr('stroke-width', 3.0)
//			.attr('fill', 'none')
//			.selectAll('circle')
//			.data(data)
//			.join('circle')
//			.attr('stroke', function(d){
//				return d3.scaleOrdinal(data.map(d => d.type), d3.schemeDark2)(d.type);
//			})
//			.attr('cx', function(d){
//				return x(d.x);
//			})
//			.attr('cy', function(d){
//				return y(d.y);
//			})
//			.attr('r', function(d){
//				return d.r;
//			});
//		
//		svg.append('g')
//			.attr('font-family', 'sans-serif')
//			.attr('font-size', 12)
//			.selectAll('text')
//			.data(data)
//			.join('text')
//			.attr('dy', '0.4rem')
//			.attr('x', function(d){
//				return x(d.x);
//			})
//			.attr('y', function(d){
//				return y(d.y);
//			})
//			.text(function(d){
//				return d.name
//			});
//			
//		return svg.node();
//	}
//	
//	function xAxis(g){
//		g.attr('transform', `translate(0,${HEIGHT - MARGIN.bottom})`)
//			.call(d3.axisBottom(x).ticks(WIDTH / 80))
//			.call(function(g){
//				g.select('.domain').remove();
//			})
//			.call(function(g){
//				g.append('text')
//					.attr('x', WIDTH)
//					.attr('y', MARGIN.bottom - 4)
//					.attr('fill', 'currentColor')
//					.attr('text-anchor', 'end')
//					.text('거리(m)');
//			});
//			
//	}
//	
//	function yAxis(g){
//		g.attr('transform', `translate(${MARGIN.left},0)`)
//			.call(d3.axisLeft(y))
//			.call(function(g){
//				g.select('.domain').remove();
//			})
//			.call(function(g){
//				g.append('text')
//					.attr('x', -40)
//					.attr('y', 10)
//					.attr('fill', 'currentColor')
//					.attr('text-anchor', 'start')
//					.text('심도(m)');
//			})
//	}
//	
//	function grid(g){
//		g.attr('stroke', 'currentColor')
//			.attr('stroke-opacity', 0.1)
//			.call(function(g){
//				g.append('g')
//					.selectAll('line')
//					.data(x.ticks())
//					.join('line')
//					.attr('x1', function(d){
//						return 0.5 + x(d);
//					})
//					.attr('x2', function(d){
//						return 0.5 + x(d);
//					})
//					.attr('y1', MARGIN.top)
//					.attr('y2', HEIGHT - MARGIN.bottom);
//			})
//			.call(function(g){
//				g.append('g')
//					.selectAll('line')
//					.data(y.ticks())
//					.join('line')
//					.attr('y1', d => 0.5 + y(d))
//					.attr('y2', d => 0.5 + y(d))
//					.attr('x1', MARGIN.left)
//					.attr('x2', WIDTH - MARGIN.right);
//			})
//	}
	
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
		html += '<div class="content"><div class="header">하수관</div></div>';
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