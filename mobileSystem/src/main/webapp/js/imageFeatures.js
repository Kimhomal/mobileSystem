/*
 * 김호철
 * 
 */
(function(window, $) {
	'use strict';
	
	var imageFeatures = function(options){
		var that = this;
		var opt = options || {};
		var inputId = opt.inputId || 'cameraInput'
		
		this.map_ = opt.map;
		if(!(this.map_ instanceof ol.Map)){
			console.error("gb.interaction.MeasureTip: 'map' is a required field.");
		}
		
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
				var feature;
				for(var i in images){
					feature = that.addFeaturefromGeometryText(images[i].geometry);
					feature.setId(images[i].svFileNm + images[i].fileNm);
					feature.setProperties({
						desc: images[i].fileDesc,
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
				
				that.showFeatures();
				that.activeClickEvent();
			}
		});
		
		createImageInfoModal();
	}
	
	window.am = window.am || {};
	window.am.ImageFeatures = imageFeatures;
})(window, jQuery);