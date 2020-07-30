// 통합검색 좌측 조회결과 리스트 ON/OFF 이벤트
function fn_visualization() {
    $("#result_list > ul > li").click(function() {
        var idx = $(this).index();
        var element = $("#result_list > ul > li");
        element.removeClass("on");
        element.eq(idx).addClass("on");
    });
}

// 지번검색 좌측 조회결과 리스트 ON/OFF 이벤트
function fn_visualization2() {
    $("#result_list2 > ul > li").click(function() {
        var idx = $(this).index();
        var element = $("#result_list2 > ul > li");
        element.removeClass("on");
        element.eq(idx).addClass("on");
    });
}

// 도로명검색 좌측 조회결과 리스트 ON/OFF 이벤트
function fn_visualization3() {
    $("#result_list3 > ul > li").click(function() {
        var idx = $(this).index();
        var element = $("#result_list3 > ul > li");
        element.removeClass("on");
        element.eq(idx).addClass("on");
    });
}
// 시군구 선택시
function fn_sggCdChg(paramCd){
	$.ajax({
		url : gp.ctxPath + "/integration/selectEmdList.do",
		method : "post",
		data: {sggCd:paramCd},
		dataType : "json",
		beforeSend : function(xhs, status) {
		},
		error : function(xhs, status, error) {
			if(xhs.status == 600){
				alert("세션이 만료되었습니다.");
				location.href = gp.ctxPath + "/mainPage.do";
			}else{
				alert('서버와의 통신에 실패했습니다.');
			}
		},
		success : function(resData, textStatus) {
			
			var sb = new StringBuilder();
			$.each(resData.sggList, function(idx,val){
                sb.Append('<option value=' + val.emdCd + '>' + val.emdKorNm + '</option>');
            });
			$("#emdCd").html(sb.ToString());
			
			fn_emdCdtChg(resData.sggList[0].emdCd);
		}
	});
}
// 읍면동 선택시
function fn_emdCdtChg(paramCd){
	
//	$.ajax({
//		url : gp.ctxPath + "/integration/selectRiList.do",
//		method : "post",
//		data: {emdCd:paramCd},
//		dataType : "json",
//		beforeSend : function(xhs, status) {
//		},
//		error : function(xhs, status, error) {
//			if(xhs.status == 600){
//				alert("세션이 만료되었습니다.");
//				location.href = gp.ctxPath + "/mainPage.do";
//			}else{
//				alert('서버와의 통신에 실패했습니다.');
//			}
//		},
//		success : function(resData, textStatus) {
//			var sb = new StringBuilder();
//			if(resData.riList == null || resData.riList == "" || resData.riList == "undefined"){
//				$("#riCd").html("");
//				sb.Append('<option value=""></option>');
//				$("#riCd").html(sb.ToString());
//				
//			}else{
//				var sb = new StringBuilder();
////				sb.Append('<option value="">선택하세요.</option>');
//				$.each(resData.riList, function(idx,val){
//	                sb.Append('<option value=' + val.riCd + '>' + val.riNm + '</option>');
//	            });
//				$("#riCd").html(sb.ToString());
//			}
//		}
//	});
}

// 도로명주소의 시군구 선택시
function fn_sigCdChg(sigCd, consonant){
	
	$.ajax({
		url : gp.ctxPath + "/integration/selectRnList.do",
		method : "post",
		data: {sigCd:sigCd, consonant: consonant},
		dataType : "json",
		beforeSend : function(xhs, status) {
		},
		error : function(xhs, status, error) {
			if(xhs.status == 600){
				alert("세션이 만료되었습니다.");
				location.href = gp.ctxPath + "/mainPage.do";
			}else{
				alert('서버와의 통신에 실패했습니다.');
			}
		},
		success : function(resData, textStatus) {
			
			var sb = new StringBuilder();
			$.each(resData.rnList, function(idx,val){
                sb.Append('<option value=' + val.rnCd + '>' + val.rnNm + '</option>');
            });
			$("#rnCd").html(sb.ToString());
			
		}
	});
}
// 지번검색
function fn_jusoSearch2(pageNo){
	
	if(pageNo == null || pageNo == ""){
		pageNo = 1;
	}
	
	var mtYn = "1";
	if($("#mtYn").is(":checked")){
		mtYn = "2";
	}
	var queryData = {
		sggCd: $("#sggCd").val(),
		sggNm: $("#sggCd").text(),
		emdCd: $("#emdCd").val(),
		emdNm: $("#emdCd").text(),
		riCd: $("#riCd").val(),
		riNm: $("#riCd").text(),
		mtYn: mtYn,
		lnbrMnnm: $("#lnbrMnnm").val(),
		lnbrSlno: $("#lnbrSlno").val(),
		pageIndex: pageNo
	}
	
	$.ajax({
		url : gp.ctxPath + "/integration/selectAddressInfoList2.do",
		type : "post",
		data: queryData,
		dataType : "html",
		beforeSend : function(xhs, status) {
			$('.loadingWrap').show();
		},
		error : function(xhs, status, error) {
			$('.loadingWrap').hide();
			if(xhs.status == 600){
				alert("세션이 만료되었습니다.");
				location.href = gp.ctxPath + "/mainPage.do";
			}else{
				alert('서버와의 통신에 실패했습니다.');
			}
		},
		success : function(resData, textStatus) {

			$("#juso_result_list2").html(resData);
            fn_visualization2();
            $('.loadingWrap').hide();
		}
	});
}

// 통합검색
function fn_jusoSearch(pageNo){
	
	if($("#searchKeyword").val() == ""){
		alert("검색어를 입력하세요");
		$("#searchKeyword").focus();
		return;
	}
	
	if(pageNo == null || pageNo == ""){
		pageNo = 1;
	}
	
	var queryData = {
		searchKeyword: $("#searchKeyword").val(),
		pageIndex: pageNo,
	}
	
	$.ajax({
		url : gp.ctxPath + "/integration/selectAddressInfoList.do",
		type : "post",
		data: queryData,
		dataType : "html",
		beforeSend : function(xhs, status) {
			$('.loadingWrap').show();
		},
		error : function(xhs, status, error) {
			$('.loadingWrap').hide();
			if(xhs.status == 600){
				alert("세션이 만료되었습니다.");
				location.href = gp.ctxPath + "/mainPage.do";
			}else{
				alert('서버와의 통신에 실패했습니다.');
			}
		},
		success : function(resData, textStatus) {

			$("#juso_result_list").html(resData);
            fn_visualization();
            $('.loadingWrap').hide();
		}
	});
}
// 도로명 검색
function fn_jusoSearch3(pageNo){
	
	if(pageNo == null || pageNo == ""){
		pageNo = 1;
	}
	
	if($("#rnCd").val() == '' || $("#rnCd").val() == null) {
		alert("도로명은 필수입니다.");
		return;
	}
		
	var queryData = {
		sigCd: $("#sigCd").val(),
		rnCd: $("#rnCd").val(),
		buldMnnm: $("#buldMnnm").val(),
		buldSlno: $("#buldSlno").val(),
		pageIndex: pageNo
	}
	
	$.ajax({
		url : gp.ctxPath + "/integration/selectAddressInfoList3.do",
		type : "post",
		data: queryData,
		dataType : "html",
		beforeSend : function(xhs, status) {
			$('.loadingWrap').show();
		},
		error : function(xhs, status, error) {
			$('.loadingWrap').hide();
			if(xhs.status == 600){
				alert("세션이 만료되었습니다.");
				location.href = gp.ctxPath + "/mainPage.do";
			}else{
				alert('서버와의 통신에 실패했습니다.');
			}
		},
		success : function(resData, textStatus) {

			$("#juso_result_list3").html(resData);
            fn_visualization3();
            $('.loadingWrap').hide();
		}
	});
}

// 주소 텍스트 클릭시
function fn_moveAddrFeature (pnu){
    var map = $("#map").data('map');
    var map1 = $("#map1").data('map');
    var map2 = $("#map2").data('map');
    var format = new ol.format.WKT();
    var features = [];

    $.ajax({
        url : gp.ctxPath+'/aeroGis/selectJusoLocation.do',
        type : "POST",
        data: {pnu:pnu},
        dataType : "json",
        beforeSend : function(xhs, status) {
        },
        error : function(xhs, status, error) {
        	
			if(xhs.status == 600){
				alert("세션이 만료되었습니다.");
				location.href = gp.ctxPath + "/mainPage.do";
			}else{
				alert('서버와의 통신에 실패했습니다.');
	            console.log(xhs);
	            console.log(status);
	            console.log(error);
			}
        },
        success : function(resData, textStatus) {
            var result = resData.rList;
            var extent;
            var zoomVal = $(".m_01").attr('data-value');

            polygonVectorSource.clear();
            map.removeLayer(polygonVectorLayer);
            if(map1 != undefined && map2 != undefined){
                map1.removeLayer(polygonVectorLayer);
                map2.removeLayer(polygonVectorLayer);
            }


            $.each(result,function(idx,val){
                var geom = val.geom;
                polygonFeatures = format.readFeature(geom);
                polygonFeatures.getGeometry().transform('EPSG:5186',currentCRS);
                polygonFeatures.setId(pnu);
                polygonFeatures.setStyle(addrStyle[addrStyleKeys[0]]);
                extent = polygonFeatures.getGeometry();
                features.push(polygonFeatures);
            })

            polygonVectorSource.addFeatures(features);
			polygonVectorLayer.setSource(polygonVectorSource);

            map.getLayers().insertAt(101,polygonVectorLayer);
            map.getView().fit(extent, map.getSize());
            map.getView().setZoom(zoomVal);

            if(map1 != undefined && map2 != undefined) {
                map1.getLayers().insertAt(101, polygonVectorLayer);
                map1.getView().fit(extent, map1.getSize());
                map1.getView().setZoom(zoomVal);

                map2.getLayers().insertAt(101, polygonVectorLayer);
                map2.getView().fit(extent, map2.getSize());
                map2.getView().setZoom(zoomVal);
            }
            mainPointFeatures = features;
        }
    });
}

//도로명주소 텍스트 클릭시
function fn_moveRoadAddrFeature (gid){
    var map = $("#map").data('map');
    var map1 = $("#map1").data('map');
    var map2 = $("#map2").data('map');
    var format = new ol.format.WKT();
    var features = [];

    $.ajax({
        url : gp.ctxPath+'/aeroGis/selectRoadJusoLocation.do',
        type : "POST",
        data: {gid:gid},
        dataType : "json",
        beforeSend : function(xhs, status) {
        },
        error : function(xhs, status, error) {
        	
			if(xhs.status == 600){
				alert("세션이 만료되었습니다.");
				location.href = gp.ctxPath + "/mainPage.do";
			}else{
				alert('서버와의 통신에 실패했습니다.');
	            console.log(xhs);
	            console.log(status);
	            console.log(error);
			}
        },
        success : function(resData, textStatus) {
            var result = resData.rList;
            var extent;
            var zoomVal = $(".m_01").attr('data-value');

            polygonVectorSource.clear();
            map.removeLayer(polygonVectorLayer);
            if(map1 != undefined && map2 != undefined){
                map1.removeLayer(polygonVectorLayer);
                map2.removeLayer(polygonVectorLayer);
            }


            $.each(result,function(idx,val){
                var geom = val.geom;
                polygonFeatures = format.readFeature(geom);
//                polygonFeatures.getGeometry().transform('EPSG:5187',currentCRS);
                polygonFeatures.setId(gid);
                polygonFeatures.setStyle(addrStyle[addrStyleKeys[0]]);
                extent = polygonFeatures.getGeometry();
                features.push(polygonFeatures);
            })

            polygonVectorSource.addFeatures(features);
			polygonVectorLayer.setSource(polygonVectorSource);

            map.getLayers().insertAt(101,polygonVectorLayer);
            map.getView().fit(extent, map.getSize());
            map.getView().setZoom(zoomVal);

            if(map1 != undefined && map2 != undefined) {
                map1.getLayers().insertAt(101, polygonVectorLayer);
                map1.getView().fit(extent, map1.getSize());
                map1.getView().setZoom(zoomVal);

                map2.getLayers().insertAt(101, polygonVectorLayer);
                map2.getView().fit(extent, map2.getSize());
                map2.getView().setZoom(zoomVal);
            }
            mainPointFeatures = features;
        }
    });
}

// 대장 버튼 클릭
function fn_openLandInfo(pnu){
    fn_moveAddrFeature (pnu);
    fn_showJusoDejangPopArea(pnu);
}

// 도로명검색 대장 버튼 클릭 따로 분리
function fn_openRoadLandInfo(pid, pnu){
    fn_moveRoadAddrFeature (pid);
    fn_showJusoDejangPopArea(pnu);
}

// 대장검색 공통 사용
function fn_showJusoDejangPopArea(pnu) {
	$.ajax({
        url : gp.ctxPath + "/integration/selectAddressInfoDetail.do",
        type : "post",
        data: {pnu:pnu},
        dataType : "html",
        beforeSend : function(xhs, status) {
        },
        error : function(xhs, status, error) {
        	
			if(xhs.status == 600){
				alert("세션이 만료되었습니다.");
				location.href = gp.ctxPath + "/mainPage.do";
			}else{
				alert('서버와의 통신에 실패했습니다.');
	            console.log(xhs);
	            console.log(status);
	            console.log(error);
			}
        },
        success : function(resData, textStatus) {

            $("#jusoDejangPopArea").html(resData);
            $("#jusoDejangPopArea").show();
        }
    });
}

function removeAddrFeature(){
    var mapInteractions = map.getInteractions().getArray();

    for(var i=0; i<mapInteractions.length; i++){
        if(mapInteractions[i] instanceof ol.interaction.Select){
            // 해당 interactions 관련환 모든 features 삭제
            mapInteractions[i].getFeatures().clear();
        }
    }
}
