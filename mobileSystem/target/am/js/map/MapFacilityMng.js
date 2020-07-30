(function(window, $) {
	"use strict";
	var MapFacilityMng = function(mapMaker) {
	    this._mapMaker = mapMaker;
    };

	MapFacilityMng.style = {
	    wfs : function(feature) {
            var style;
            var id = feature.getId();

            style = new ol.style.Style({
                fill : new ol.style.Fill({
                    color : 'rgba(255, 0, 0, 0.2)'
                }),
                stroke : new ol.style.Stroke({
                    color : 'rgba(255, 0, 0, 0.5)',
                    lineDash : [ 10, 10 ],
                    width : 2
                }),
            });

            return style;
        }
	};

	MapFacilityMng.layer = {
        wms : {
//            shp_busu_pl : {
//                id : "shp_busu_pl",
//                layerKorName : "부수시설",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_chako_pl : {
//                id : "shp_chako_pl",
//                layerKorName : "착오",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_chulgeo_r_pl : {
//                id : "shp_chulgeo_r_pl",
//                layerKorName : "철거R",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_chulgeo_y_pl : {
//                id : "shp_chulgeo_y_pl",
//                layerKorName : "철거Y",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_chulye_r_pl : {
//                id : "shp_chulye_r_pl",
//                layerKorName : "철거예정R",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_chulye_y_pl : {
//                id : "shp_chulye_y_pl",
//                layerKorName : "철거예정Y",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_hangjung_pl : {
//                id : "shp_hangjung_pl",
//                layerKorName : "행정조치",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_jaebunyu_pl : {
//                id : "shp_jaebunyu_pl",
//                layerKorName : "재분류",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_jaepandok_pl : {
//                id : "shp_jaepandok_pl",
//                layerKorName : "재판독",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_jinhang_pl : {
//                id : "shp_jinhang_pl",
//                layerKorName : "진행",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            // shp_jungye_r_pl : {
//            //     id : "shp_jungye_r_pl",
//            //     layerKorName : "정예R",
//            //     kind : "interpretFacil",
//            //     visible : true,
//            // },
//            // shp_jungye_y_pl : {
//            //     id : "shp_jungye_y_pl",
//            //     layerKorName : "정예Y",
//            //     kind : "interpretFacil",
//            //     visible : true,
//            // },
//            shp_kibu_pl : {
//                id : "shp_kibu_pl",
//                layerKorName : "기존및부수시설",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_kihanbu_pl : {
//                id : "shp_kihanbu_pl",
//                layerKorName : "기한부신고",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_kijon_pl : {
//                id : "shp_kijon_pl",
//                layerKorName : "기존",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_kisin_pl : {
//                id : "shp_kisin_pl",
//                layerKorName : "기존및신고",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_kongik_pl : {
//                id : "shp_kongik_pl",
//                layerKorName : "공익",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_kongkong_pl : {
//                id : "shp_kongkong_pl",
//                layerKorName : "공공",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_somyeol_pl : {
//                id : "shp_somyeol_pl",
//                layerKorName : "소멸",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            shp_wiban_pl : {
//                id : "shp_wiban_pl",
//                layerKorName : "허가위반",
//                kind : "interpretFacil",
//                visible : false,
//            },
//            jungye_r_1000 : {
//                id : "tbl_interpretation",
//                layerKorName : "정예R(판독완료)",
//                kind : "interpretFacil",
//                visible : true,
//                CQL_FILTER : "layer_gbn='LYR15' and prg_cd='정비예정' and itpt_state='1000'"
//            },
//            jungye_r_2000 : {
//                id : "tbl_interpretation",
//                layerKorName : "정예R(조사진행)",
//                kind : "interpretFacil",
//                visible : false,
//                CQL_FILTER : "layer_gbn='LYR15' and prg_cd='정비예정' and itpt_state='2000'"
//            },
//            jungye_r_3000 : {
//                id : "tbl_interpretation",
//                layerKorName : "정예R(조사완료)",
//                kind : "interpretFacil",
//                visible : false,
//                CQL_FILTER : "layer_gbn='LYR15' and prg_cd='정비예정' and itpt_state='3000'"
//            },
//            jungye_r_4000 : {
//                id : "tbl_interpretation",
//                layerKorName : "정예R(조사제외)",
//                kind : "interpretFacil",
//                visible : false,
//                CQL_FILTER : "layer_gbn='LYR15' and prg_cd='정비예정' and itpt_state='4000'"
//            },
//            jungye_y_1000 : {
//                id : "tbl_interpretation",
//                layerKorName : "정예Y(판독완료)",
//                kind : "interpretFacil",
//                visible : true,
//                CQL_FILTER : "layer_gbn='LYR16' and prg_cd='정비예정' and itpt_state='1000'"
//            },
//            jungye_y_2000 : {
//                id : "tbl_interpretation",
//                layerKorName : "정예Y(조사진행)",
//                kind : "interpretFacil",
//                visible : false,
//                CQL_FILTER : "layer_gbn='LYR16' and prg_cd='정비예정' and itpt_state='2000'"
//            },
//            jungye_y_3000 : {
//                id : "tbl_interpretation",
//                layerKorName : "정예Y(조사완료)",
//                kind : "interpretFacil",
//                visible : false,
//                CQL_FILTER : "layer_gbn='LYR16' and prg_cd='정비예정' and itpt_state='3000'"
//            },
//            jungye_y_4000 : {
//                id : "tbl_interpretation",
//                layerKorName : "정예Y(조사제외)",
//                kind : "interpretFacil",
//                visible : false,
//                CQL_FILTER : "layer_gbn='LYR16' and prg_cd='정비예정' and itpt_state='4000'"
//            },
        	wtl_pipe_lm : {
              id : "wtl_pipe_lm",
              layerKorName : "상수파이프라인",
              kind : "interpretFacil",
              visible : true,
        	},
        },
	    wfs : {
//            shp_busu_pl : {
//                id : "shp_busu_pl",
//                layerKorName : "부수시설",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_chako_pl : {
//                id : "shp_chako_pl",
//                layerKorName : "착오",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_chulgeo_r_pl : {
//                id : "shp_chulgeo_r_pl",
//                layerKorName : "철거R",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_chulgeo_y_pl : {
//                id : "shp_chulgeo_y_pl",
//                layerKorName : "철거Y",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_chulye_r_pl : {
//                id : "shp_chulye_r_pl",
//                layerKorName : "철거예정R",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_chulye_y_pl : {
//                id : "shp_chulye_y_pl",
//                layerKorName : "철거예정Y",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_hangjung_pl : {
//                id : "shp_hangjung_pl",
//                layerKorName : "행정조치",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_jaebunyu_pl : {
//                id : "shp_jaebunyu_pl",
//                layerKorName : "재분류",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_jaepandok_pl : {
//                id : "shp_jaepandok_pl",
//                layerKorName : "재판독",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_jinhang_pl : {
//                id : "shp_jinhang_pl",
//                layerKorName : "진행",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_jungye_r_pl : {
//                id : "shp_jungye_r_pl",
//                layerKorName : "정예R",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_jungye_y_pl : {
//                id : "shp_jungye_y_pl",
//                layerKorName : "정예Y",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_kibu_pl : {
//                id : "shp_kibu_pl",
//                layerKorName : "기존및부수시설",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_kihanbu_pl : {
//                id : "shp_kihanbu_pl",
//                layerKorName : "기한부신고",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_kijon_pl : {
//                id : "shp_kijon_pl",
//                layerKorName : "기존",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_kisin_pl : {
//                id : "shp_kisin_pl",
//                layerKorName : "기존및신고",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_kongik_pl : {
//                id : "shp_kongik_pl",
//                layerKorName : "공익",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_kongkong_pl : {
//                id : "shp_kongkong_pl",
//                layerKorName : "공공",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_somyeol_pl : {
//                id : "shp_somyeol_pl",
//                layerKorName : "소멸",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
//            shp_wiban_pl : {
//                id : "shp_wiban_pl",
//                layerKorName : "허가위반",
//                kind : "interpretFacil",
//                maxResolution : 0.5,
//                visible : false,
//                style : MapFacilityMng.style.wfs
//            },
	    	wtl_pipe_lm : {
              id : "wtl_pipe_lm",
              layerKorName : "상수파이프라인",
              kind : "interpretFacil",
              maxResolution : 0.5,
              visible : true,
              style : MapFacilityMng.style.wfs
        	},
        },
	};

	window.MapFacilityMng = MapFacilityMng;

})(window, jQuery);