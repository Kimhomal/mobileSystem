/*
 * 김호철
 * 
 */
(function(window, $) {
	'use strict';
	
	var camera = function(options){
		var that = this;
		var opt = options || {};
		var inputId = opt.inputId || 'cameraInput'
		
		this.map_ = opt.map;
		if(!(this.map_ instanceof ol.Map)){
			console.error("gb.interaction.MeasureTip: 'map' is a required field.");
		}
		
		// 현재 위치 아이콘
		this.iconFeature_ = new ol.Feature(new ol.geom.Point([0, 0]));
		
		// 현재 위치
		this.position_ = undefined;
		
		var iconStyle = new ol.style.Style({
			image: new ol.style.Icon({
				anchor: [0.5, 46],
				anchorXUnits: 'fraction',
				anchorYUnits: 'pixels',
				src: gp.ctxPath + '/images/pin.png'
			})
		});
		
		this.iconFeature_.set('style', iconStyle);
		
		/**
		 * 임시 vector source
		 * @type {ol.source.Vector}
		 * @private
		 */
		this.cameraSource_ = new ol.source.Vector({
			features: [this.iconFeature_]
		});
		
		/**
		 * 임시 vector layer
		 * @type {ol.layer.Vector}
		 * @private
		 */
		this.cameraVector_ = new ol.layer.Vector({
			source : this.cameraSource_,
			style: function(feature){
				return feature.get('style');
			}
		});
		
		/**
		 * feature 목록
		 * @type {ol.Feature[]}
		 * @private
		 */
		this.features_ = [];
		
		// feature 군집 거리
		this.clusterDistance_ = 40;
		
		// feature styles
		this.styleCache = {};
		
		this.clickEvent_ = undefined;
		
		/**
		 * 임시 vector source
		 * @type {ol.source.Vector}
		 * @private
		 */
		this.imageSource_ = new ol.source.Vector();
		
		/**
		 * 임시 cluster source
		 * @type {ol.source.Cluster}
		 * @private
		 */
		this.clusterSource_ = new ol.source.Cluster({
			distance: parseInt(this.clusterDistance_, 10),
			source: this.imageSource_
		});
		
		/**
		 * 임시 vector layer
		 * @type {ol.layer.Vector}
		 * @private
		 */
		this.imageVector_ = new ol.layer.Vector({
			source : this.clusterSource_,
			style: function(feature){
				var size = feature.get('features').length;
				var style = that.styleCache[size];
				
				if(!style){
					style = new ol.style.Style({
						image: new ol.style.Circle({
							radius: 10,
							stroke: new ol.style.Stroke({
								color: '#fff'
							}),
							fill: new ol.style.Fill({
								color: '#3399CC'
							})
						}),
						text: new ol.style.Text({
							text: size.toString(),
							fill: new ol.style.Fill({
								color: '#fff'
							})
						})
					});
					
					that.styleCache[size] = style;
				}
				
				return style;
			}
		});
		
		if(!document.querySelector('#' + inputId)){
			createFormTag(this, inputId);
		}
		
		this.input_ = $('#' + inputId);
		this.form_ = $('#uploadImage');
		
		createDialog();
		createImageInfoModal();
		this.updateFeatures();
		this.activeClickEvent();
		this.showFeatures();
		
		$(document).on('click', '#imageUploadSubmit', function(){
			that.submit();
		});
		
		$(document).on('click', '#imageUploadCancel', function(){
			that.reset();
		});
	}
	
	camera.prototype.reset = function(){
		this.cameraVector_.setMap(null); // 현재 위치 아이콘 레이어 비활성화
		this.removePositionButton_();
		this.input_.val("");
		
		var dialog = document.querySelector('#my-dialog');
		if(dialog){
			dialog.hide();
		}
	}
	
	camera.prototype.action = function(){
		this.input_.click();
	}
	
	camera.prototype.submit = function(){
		var that = this;
		
		var options = {
            url				: gp.ctxPath + '/layer/uploadImage.json',
            type			: 'post',
            dataType		: 'json',
            success			:  function(json) {
                if(json.respFlag == 'Y'){
                    alert('정상적으로 수정되었습니다.');
                    that.updateFeatures();
                } else {
                    alert("오류발생, 다시 시도하여 주십시오");
                }
            },
            error : function(response) {
                alert("오류발생, 다시 시도하여 주십시오");
            },
            beforeSend	: function(){
				var modal = document.querySelector('#loadingModal');
				if(modal){
					modal.show();
				}
			},
			complete		: function(){
				that.reset();
				var modal = document.querySelector('#loadingModal');
				if(modal){
					modal.hide();
				}
			}
        };

		$('#fileTitle').val($('#imageTitleInput').val());
		$('#fileDesc').val($('#iamgeDescInput').val());
		var wkt = 'POINT(' + this.position_[0] + ' ' + this.position_[1] + ')';
		$('#geom').val(wkt);
		
		this.form_.ajaxSubmit( options );
	}
	
	// 기기 위치 감지 허용 여부 확인
	camera.prototype.requestPositionPermission_ = function(){
		var that = this;
		
		this.cameraVector_.setMap(this.map_); // 현재 위치 아이콘 활성화
		
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position, e) {
				var center = ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', that.map_.getView().getProjection().getCode());
				
				that.setPositionMarker_(center);
				
			}, onErrorGeolocation);
		} else {
			ons.notification.alert('현재 위치가 제공되지않는 기기(또는 브라우저)입니다.');
		}
		
		ons.openActionSheet({
			title: '현재 위치로 이미지를 저장하시겠습니까?',
			cancelable: false,
			callback: function(index){
				switch(index){
					case 0:
						that.showInfoDialog();
						break;
					case 1:
						that.activePositionSelect();
						break;
					default:
				}
			},
			buttons: [
				{icon: 'md-square-o', label: '현재 위치로 저장'},
				{icon: 'md-square-o', label: '직접 위치 설정', modifier: 'destructive'}
			]
		});
	}
	
	camera.prototype.setPositionMarker_ = function(position){
		if(!(position instanceof Array)){
			return;
		}
		
		if(position.length != 2){
			return;
		}
		
		this.position_ = position;
		this.map_.getView().setCenter(position);
		
		var features = this.cameraSource_.getFeatures();
		for(var i in features){
			features[i].getGeometry().setCoordinates(position);
		}
	}
	
	camera.prototype.activePositionSelect = function(){
		var that = this;
		
		this.createPositionButton_();
		
		this.map_.on('pointerdrag', function(evt){
			console.log(evt);
			var center = that.map_.getView().getCenter();
			
			that.setPositionMarker_(center);
		});
	}
	
	camera.prototype.createPositionButton_ = function(){
		var that = this;
		var el = document.querySelector('#positionButton');
		var html = '';
		
		if(!el){
			html += '<ons-button id="positionButton" modifier="large" style="position: absolute; bottom: 0;">현재 위치로 저장</ons-button>';
			$('body').append(html);
			
			$('#positionButton').on('click', function(){
				that.showInfoDialog();
			})
		}
	}
	
	camera.prototype.removePositionButton_ = function(){
		var that = this;
		var el = document.querySelector('#positionButton');
		
		if(el){
			el.remove();
		}
	}
	
	camera.prototype.showInfoDialog = function(){
		var dialog = document.querySelector('#my-dialog');
		
		if(dialog){
			dialog.show();
		} else {
			ons.createElement('dialog.html', {append: true}).then(function(dialog){
				dialog.show();
			});
		}
	}
	
	camera.prototype.updateFeatures = function(){
		var that = this;
		
		$.ajax({
			url: gp.ctxPath + '/layer/getImages.json',
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
				var images = responseData.images;
				var id, feature;
				for(var i in images){
					id = images[i].svFileNm + images[i].fileNo;
					
					if(!that.imageSource_.getFeatureById(id)){
						feature = that.addFeaturefromGeometryText(images[i].geometry);
						feature.setId(images[i].svFileNm + images[i].fileNo);
						feature.setProperties({
							desc: images[i].fileDesc,
							no: images[i].fileNo,
							title: images[i].fileTitle,
							name: images[i].fileNm,
							svName: images[i].svFileNm,
							path: images[i].filePath,
							user: images[i].userId,
							reg: images[i].regYmd,
							upt: images[i].uptYmd,
							base64: images[i].base64
						});
					}
				}
			}
		});
	}
	
	camera.prototype.activeClickEvent = function(){
		var that = this;
		
		this.clickEvent_ = function(e){
			console.log(e);
			e.map.forEachFeatureAtPixel(e.pixel, function(f, l){
				var fs = f.get('features');
				
				if(!(fs instanceof Array)){
					return;
				}
				
				document.querySelector('#imageInfoModal').show();
				
				var target = $('#imageInfoPage .page__content');
				target.find('ons-card').remove();
				
				var card;
				for(var i in fs){
					card = createImageCard(fs[i].get('base64'), fs[i].get('title'), fs[i].get('desc'));
					target.append(card)
				}
			});
		}
		
		this.map_.on('singleclick', this.clickEvent_);
	}
	
	camera.prototype.addFeaturefromGeometryText = function(geometry){
		var a = new ol.format.WKT();
		var geom = a.readGeometryFromText(geometry);
		
		var feature;
		if(geom instanceof ol.geom.Point){
			feature = new ol.Feature({
				geometry: geom
			});
			
			this.imageSource_.addFeature(feature);
			this.features_.push(feature);
			
			return feature;
		}
		
		return null;
	}
	
	camera.prototype.showFeatures = function(){
		this.imageVector_.setMap(this.map_);
//		this.map_.getView().fit(this.imageSource_.getExtent());
	}
	
	camera.prototype.hideFeatures = function(){
		this.imageVector_.setMap(null);
	}
	
	function createDialog(){
		if(document.querySelector('#my-dialog')){
			return;
		}
		
		var target = $('body');
		var html = '';
		html += '<template id="dialog.html">';
		html += '<ons-dialog id="my-dialog">';
		html += '<ons-page>';
		html += '<div style="padding: 0 10px;">';
		html += '<p>';
		html += '<label for="imageTitleInput">제목</label>';
		html += '<ons-input id="imageTitleInput" modifier="material" placeholder="title"></ons-input>'
		html += '</p>';
		html += '<p>';
		html += '<label for="iamgeDescInput">내용</label>';
		html += '<textarea id="iamgeDescInput" class="textarea" rows="3" placeholder="Textarea"></textarea>'
		html += '</p>';
		html += '</div>';
		html += '<div style="text-align: center;">';
		html += '<p>';
		html += '<ons-button id="imageUploadSubmit">저장</ons-button>';
		html += '<ons-button id="imageUploadCancel">취소</ons-button>';
		html += '</p>';
		html += '</div>';
		html += '</ons-page>';
		html += '</ons-dialog>';
		html += '</template>';
		
		target.append(html);
	}
	
	function createFormTag(inst, inputId){
		var target = $('body');
		var html = '';
		html += '<form id="uploadImage" name="uploadImage" method="POST" enctype="multipart/form-data">';
		html += '<input type="hidden" id="userId" name="userId"/>';
		html += '<input type="hidden" id="fileTitle" name="fileTitle" value=""/>';
		html += '<input type="hidden" id="fileDesc" name="fileDesc" value=""/>';
		html += '<input type="hidden" id="geom" name="geom"/>';
		html += '<input id="' + inputId + '" name="' + inputId + '" type="file" accept="image/*" style="display: none;"></input>';
		html += '</form>';
		target.append(html);
		
		$(document).on('change', 'input#' + inputId + '[type=file]', function(e){
			inst.requestPositionPermission_();
		});
	}
	
	function createImageCard(src, title, desc){
		var html = '';
		
		html += '<ons-card>';
		html += '<img src="' + src + '" style="width: 100%;">';
		html += '<div class="title">';
		html += title;
		html += '</div>';
		html += '<div class="content">';
		html += desc;
		html += '</div>';
		html += '</ons-card>';
		
		return html;
	}
	
	function createImageInfoModal(){
		if(document.querySelector('#imageInfoModal')){
			return;
		}
		
		var target = $('body');
		var html = '';
		html += '<ons-modal id="imageInfoModal" direction="up">';
		html += '<ons-page id="imageInfoPage">';
		html += '<ons-toolbar>';
		html += '<div class="center">사진 정보</div>';
		html += '<div class="right">';
		html += '<ons-toolbar-button onclick="document.getElementById(' + "'imageInfoModal'" + ').hide();">닫기</ons-toolbar-button>';
		html += '</div>';
		html += '</ons-toolbar>';
		html += '</ons-page>';
		html += '</ons-modal>';
		
		target.append(html);
		
		document.querySelector('#imageInfoModal').setAttribute('animation', 'lift');
	}
	
	// 기기 위치 감지 에러 발생 시 실행되는 함수
	function onErrorGeolocation(e) {
		alert(`ERROR(${e.code}): ${e.message}`);
	}
	
	window.am = window.am || {};
	window.am.Camera = camera;
})(window, jQuery);