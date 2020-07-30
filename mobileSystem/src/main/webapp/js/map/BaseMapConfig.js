(function(window, $) {
	"use strict";

	var BaseMapConfig = {
//			Daum : {
//				name : "Daum",
//				korName : "다음지도",
//				crsCode : "EPSG:5181",
//				extent : [-30000, -60000, 494288, 988576],
//				resolutions : [38.218514142588134, 19.109257071294067, 9.554628535647034, 4.777314267823517, 2.3886571339117584, 1.1943285669558792, 0.5971642834779396, 0.2985821417389698,0.1492910708694849,0.0746455354347425],
//				center : [389026.155602, 189012.234733],
//				layers : {
//					base : {
//						name : "기본지도",
//						url : gp.proxyPath + "http://map{0-3}.daumcdn.net/map_2d/1806shn/L{z}/{y}/{x}.png",
//						visible : true
//					},
//				}
//			},
			VWorld : {
				name : "VWorld",
//				korName : "브이월드",
				crsCode : "EPSG:3857",
				extent : [13756219.106426602, 3860987.1727408236, 14666125.491133342, 4863840.983842337],
				resolutions : [38.218514142588134,19.109257071294067,9.554628535647034, 4.777314267823517,2.3886571339117584,1.1943285669558792,0.5971642834779396, 0.2985821417389698,0.1492910708694849,0.0746455354347425],
				center: [14305170.066429734, 4380161.220043706],
//				center: [14121148.59, 4185663.00],

				layers: {
					base : {
						name : "기본지도",
						url : gp.proxyPath + "http://xdworld.vworld.kr:8080/2d/Base/201802/{z}/{x}/{y}.png",
						visible : true
					},
				}
			},

	}
	
	// baseMap selectBox settings and evt settings
	$.setBaseMapEvt = function(params, baseMapName) {
		var $baseMap = $("#baseMap");
		var $baseMapLayer = $("#baseMapLayer");

		$baseMap.empty();
		
		$.each(BaseMapConfig, function(idx, lyr){
			$baseMap.append(new Option(lyr.korName, lyr.name));
		});
		
		if (baseMapName) $baseMap.val(params.baseMap.name);

		$baseMap.off();
		$baseMap.on("change", function(){
			baseMapName = $(this).val();
			
			$baseMapLayer.show();
			$('#baseMapLayer').val("base");
			mapMaker.changeBaseMapWithName($(this).val());
			mapMaker.config.initBaseMap = $(this).val();
			$.setBaseMapEvt(mapMaker, params, $(this).val());
		});
		$baseMapLayer.empty();
			$.each(mapMaker.baseMap.layers, function(lyrName, lyr){
				$baseMapLayer.append(new Option(lyr.name, lyrName));
			});
			$baseMapLayer.off();
			$baseMapLayer.on("change", function(){
				var baseMapLayerName = $(this).val();
				mapMaker.mapAction.offBaseMapLayers();
				mapMaker.mapAction.setVisibilityById($baseMap.val() + "_" + baseMapLayerName);
				
			});
	}




	window.BaseMapConfig = BaseMapConfig;

})(window, jQuery);
