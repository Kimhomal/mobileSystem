/*
 * 김호철
 * 
 */
(function(window, $, d3) {
	'use strict';
	
	var TOASTID = 'crossToast',
		MESSAGEID = 'crossMessage',
		FIRSTMESSAGE = '첫번째 지점을 선택해주세요',
		SECONDMESSAGE = '두번째 지점을 선택해주세요',
		HEIGHT = 368,
		WIDTH = 414,
		MARGIN = {
			top: 25,
			right: 25,
			bottom: 35,
			left: 40
		},
		x = null,
		y = null;
	
	var crossSection = function(options){
		var opt = options || {};
		var canvasId = opt.id || 'crossSectionCanvas';
		var tableId = opt.tableId || 'crossSectionTable';
		
		this.map_ = opt.map;
		if(!(this.map_ instanceof ol.Map)){
			console.error("gb.interaction.MeasureTip: 'map' is a required field.");
			return;
		}
		
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
						var fields = resData.fields;
						
						var name, width, depth, radius, minX = Infinity;
						var data = [];
						var tableList = [];
						for(var i in pipeList){
							name = pipeList[i].ftr_idn;
							if(pipeList[i].x < minX){
								minX = pipeList[i].x;
							}
							width = pipeList[i].x - minX;
							depth = pipeList[i].pip_lbl.substring(pipeList[i].pip_lbl.length - 3, pipeList[i].pip_lbl.length);
							radius = pipeList[i].y;
							
							data.push({
								name: name,
								type: pipeList[i].type,
								r: radius/50,
								x: width,
								y: parseFloat(depth) || 0
							});
							
							tableList.push({
								ftr_idn: pipeList[i].ftr_idn,
								ftr_cde: pipeList[i].ftr_cde,
								pip_lbl: pipeList[i].pip_lbl
							})
						}
						
						
						
						var modal = document.getElementById('cross-modal');
						if(modal){
							modal.show();
							
							// 횡단면도 그래프 생성
							HEIGHT = document.querySelector('body').clientHeight/2;
							WIDTH = document.querySelector('body').clientWidth;
							x = d3.scaleLinear().domain(d3.extent(data, d => d.x)).nice().range([MARGIN.left, WIDTH - MARGIN.right]);
							y = d3.scaleLinear().domain(d3.extent(data, d => d.y).sort((a,b) => (b-a))).nice().range([HEIGHT - MARGIN.bottom, MARGIN.top]);
							that.node_ = createGraph(data);
							that.target_.empty();
							that.target_.append(that.node_);
							
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
	
	function createGraph(data){
		var svg = d3.create('svg').attr('viewBox', [0, 0, WIDTH, HEIGHT]);
		
		svg.append('g').call(xAxis);
		
		svg.append('g').call(yAxis);
		
		svg.append('g').call(grid);
		
		svg.append('g')
			.attr('stroke-width', 3.0)
			.attr('fill', 'none')
			.selectAll('circle')
			.data(data)
			.join('circle')
			.attr('stroke', function(d){
				return d3.scaleOrdinal(data.map(d => d.type), d3.schemeDark2)(d.type);
			})
			.attr('cx', function(d){
				return x(d.x);
			})
			.attr('cy', function(d){
				return y(d.y);
			})
			.attr('r', function(d){
				return d.r;
			});
		
		svg.append('g')
			.attr('font-family', 'sans-serif')
			.attr('font-size', 12)
			.selectAll('text')
			.data(data)
			.join('text')
			.attr('dy', '0.4rem')
			.attr('x', function(d){
				return x(d.x);
			})
			.attr('y', function(d){
				return y(d.y);
			})
			.text(function(d){
				return d.name
			});
			
		return svg.node();
	}
	
	function xAxis(g){
		g.attr('transform', `translate(0,${HEIGHT - MARGIN.bottom})`)
			.call(d3.axisBottom(x).ticks(WIDTH / 80))
			.call(function(g){
				g.select('.domain').remove();
			})
			.call(function(g){
				g.append('text')
					.attr('x', WIDTH)
					.attr('y', MARGIN.bottom - 4)
					.attr('fill', 'currentColor')
					.attr('text-anchor', 'end')
					.text('거리(m)');
			});
			
	}
	
	function yAxis(g){
		g.attr('transform', `translate(${MARGIN.left},0)`)
			.call(d3.axisLeft(y))
			.call(function(g){
				g.select('.domain').remove();
			})
			.call(function(g){
				g.append('text')
					.attr('x', -40)
					.attr('y', 10)
					.attr('fill', 'currentColor')
					.attr('text-anchor', 'start')
					.text('심도(m)');
			})
	}
	
	function grid(g){
		g.attr('stroke', 'currentColor')
			.attr('stroke-opacity', 0.1)
			.call(function(g){
				g.append('g')
					.selectAll('line')
					.data(x.ticks())
					.join('line')
					.attr('x1', function(d){
						return 0.5 + x(d);
					})
					.attr('x2', function(d){
						return 0.5 + x(d);
					})
					.attr('y1', MARGIN.top)
					.attr('y2', HEIGHT - MARGIN.bottom);
			})
			.call(function(g){
				g.append('g')
					.selectAll('line')
					.data(y.ticks())
					.join('line')
					.attr('y1', d => 0.5 + y(d))
					.attr('y2', d => 0.5 + y(d))
					.attr('x1', MARGIN.left)
					.attr('x2', WIDTH - MARGIN.right);
			})
	}
	
	window.am = window.am || {};
	window.am.crossSection = crossSection;
})(window, jQuery, d3);