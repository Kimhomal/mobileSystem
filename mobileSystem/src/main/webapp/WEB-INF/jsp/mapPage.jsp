<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ page trimDirectiveWhitespaces="true"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui"%>
<%@ taglib prefix="profiletag" uri="/WEB-INF/taglib/profile.tld"%>

<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<%@ include file="/WEB-INF/jsp/common/shareProperties.jsp" %>
	<title>공간정보기술(주) 모바일통합관리시스템</title>
	<link rel="stylesheet" type="text/css" href="<c:url value="/plugins/onsenui/css/onsenui.css"/>">
	<link rel="stylesheet" type="text/css" href="<c:url value="/plugins/onsenui/css/onsen-css-components.css"/>">
	<link rel="stylesheet" type="text/css" href="<c:url value="/plugins/onsenui/css/font_awesome/css/fontawesome.css"/>">
	<link rel="stylesheet" type="text/css" href="<c:url value="/plugins/fontawesome/css/font-awesome.min.css"/>">
	<link rel="stylesheet" type="text/css" href="<c:url value='/css/main.css'/>">
	<link rel="stylesheet" type="text/css" href="<c:url value='/css/map/facilMap.css'/>">
	<link rel="stylesheet" type="text/css" href="<c:url value='/css/map/ol-new.css'/>">
	<link rel="stylesheet" type="text/css" href="<c:url value='/css/semantic.css'/>">
	<%-- <link rel="stylesheet" type="text/css" href="<c:url value='/plugins/d3/d3.css'/>"> --%>
	
	<script type="text/javascript">
		var G = {};
		G.baseUrl = "${pageContext.request.contextPath}/";
		G.userNm = "${sessionScope.authInfo.userNm}";
		G.dptNm = "${sessionScope.authInfo.dptNm}";
		G.pri = "${sessionScope.authInfo.userPrivil}";
		G.organCd = "${sessionScope.authInfo.organCd}";
		
		var CONTEXT = "${context}";
	</script>
	
	<script src="<c:url value="/plugins/jquery/jquery-1.12.3.min.js"/>"></script>
	<script src="<c:url value="/plugins/jquery/jquery.form.min.js"/>"></script>
	<script src="<c:url value="/plugins/onsenui/js/onsenui.min.js"/>"></script>
	<%-- <script src="<c:url value="/plugins/d3/d3.js"/>"></script> --%>
	<script src="<c:url value="/plugins/amcharts4/core.js"/>"></script>
	<script src="<c:url value="/plugins/amcharts4/charts.js"/>"></script>
	<script src="<c:url value="/plugins/amcharts4/themes/animated.js"/>"></script>
	<script src="<c:url value="/js/layerFilter.js"/>"></script>
	<script src="<c:url value="/js/cross.js"/>"></script>
	<script src="<c:url value="/js/camera.js"/>"></script>
	<script src="<c:url value="/js/imageFeatures.js"/>"></script>
	<script src="<c:url value="/js/common.js"/>"></script>
	<script src="<c:url value="/js/mapPage.js"/>"></script>
	
	<!-- map 관련 script -->
	<script src="<c:url value='/js/map/ol6/ol-6_3.js'/>"></script>
	<script src="<c:url value="/js/map/proj/proj4.js"/>"></script>
	<script src="<c:url value="/js/map/proj/projection.js"/>"></script>
	<script src="<c:url value="/js/map/BaseMapConfig.js"/>"></script>
	<script src="<c:url value="/js/map/MapFacilityMng.js"/>"></script>
	<script src="<c:url value="/js/map/MapMaker.js"/>"></script>
	<script src="<c:url value="/js/map/MapLayerMng.js"/>"></script>
	<script src="<c:url value="/js/map/MapAction.js"/>"></script>
	<script src="<c:url value="/js/map/MapEvtMng.js"/>"></script>
	<script src="<c:url value='/js/map/ol-layerswitcher.js'/>"></script>
</head>
<body>
	<!-- 사이드 메뉴 -->
	<ons-splitter>
		<%@ include file="/WEB-INF/jsp/common/side.jsp" %>
		<ons-splitter-content id="splitter-content" page="map.html"></ons-splitter-content>
	</ons-splitter>
	
	<template id="map.html">
		<ons-page id="mapPage">
			<ons-toolbar>
				<div class="left">
					<ons-toolbar-button onclick="am.sideOpen()">
						<ons-icon icon="md-menu"></ons-icon>
					</ons-toolbar-button>
				</div>
				
				<div class="center notosanskr">관로 지도</div>
				
				<div class="right">
					<%@ include file="/WEB-INF/jsp/common/user.jsp" %>
				</div>
			</ons-toolbar>
			
			<!--지도 원본 화면-->
			<!-- <div class="semantic steps absolute">
				<div class="step">
					<div class="content">
						<ons-select class="select">
							<select id="sido" title="시/도" name="link" disabled>
								<option>광주광역시</option>
							</select>
						</ons-select>
					</div>
				</div>
				<div class="step">
					<div class="content">
						<ons-select class="select">
							<select id="sgg" title="시군구" name="link"></select>
						</ons-select>
					</div>
				</div>
				<div class="step">
					<div class="content">
						<ons-select class="select">
							<select id="emd" title="읍면동" name="link"></select>
						</ons-select>
					</div>
				</div>
			</div> -->
			<div id="map" style="width: 100%; height: 100%;"></div>
			<!-- <div style="position:absolute; bottom:0; left:0;">
				<div>rotate:<span id="rotate"></span></div>
			</div> -->
		</ons-page>
	</template>
	
	<!-- 레이어 선택 팝업 -->
	<div class="layer_wrap layer_mapInfo" style="display: none;">
		<!-- layer_inner -->
		<div class="layer_inner">
			<div class="layer_header">
				<h3>레이어 정보</h3>
			</div>
			<!-- layer_body -->
			<div class="layer_body">
				<div class="layer_box">
					<ul class="mapInfo_list">
					</ul>
				</div>
			</div>
			<!-- //layer_body -->
		</div>
		<!-- //layer_inner -->
	</div>
	
	<form:form commandname="searchOpt" id="searchFrm" name="searchFrm" method="POST">
		<input type="hidden" id="method" name="method" value="select">
		<input type="hidden" id="itptId" name="itptId" value="">
		<input type="hidden" id="idx1No" name="idx1No" value="">
		<input type="hidden" id="flag" name="flag" value="">
		<input type="hidden" id="itptCenterX" name="itptCenterX" value="${itptCenterX}">
		<input type="hidden" id="itptCenterY" name="itptCenterY" value="${itptCenterY}">
	</form:form>

	<ons-modal id="detail-modal" direction="up">
		<ons-page id="detailModalPage">
			<ons-toolbar>
				<div class="center">상세내용</div>
				<div class="right">
					<ons-toolbar-button onclick="document.getElementById('detail-modal').hide();">닫기</ons-toolbar-button>
				</div>
			</ons-toolbar>
			<table class="table semantic" style="margin: 0;">
				<tbody>
					<tr class="disable-tr">
						<td class="collapsing">소유자</td>
						<td>
							<ons-input input-id="ownerNm" name="ownerNm" modifier="underbar" type="text" value="${result.ownerNm}" float></ons-input>
						</td>
					</tr>
				</tbody>
			</table>
		</ons-page>
	</ons-modal>
	
	<ons-modal id="loadingModal" direction="up">
		<div style="text-align: center">
			<p>
				<ons-icon icon="md-spinner" size="28px" spin></ons-icon> Loading...
			</p>
		</div>
	</ons-modal>
	
	<script type="text/javascript">
		var proj = new Proj();
	</script>
</body>