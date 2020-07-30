<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page trimDirectiveWhitespaces="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui" %>
<%@ taglib prefix="profiletag" uri="/WEB-INF/taglib/profile.tld" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>공간정보기술(주) 모바일통합관리시스템</title>
	<%@ include file="/WEB-INF/jsp/common/shareProperties.jsp" %>
	<link rel="stylesheet" type="text/css" href="<c:url value="/plugins/onsenui/css/onsenui.css"/>">
	<link rel="stylesheet" type="text/css" href="<c:url value="/plugins/onsenui/css/onsen-css-components.css"/>">
	<link rel="stylesheet" type="text/css" href="<c:url value="/plugins/onsenui/css/font_awesome/css/fontawesome.css"/>">
	<link rel="stylesheet" type="text/css" href="<c:url value="/css/main.css"/>">
	
	<script src="<c:url value="/plugins/jquery/jquery-1.12.3.min.js"/>"></script>
	<script src="<c:url value="/plugins/onsenui/js/onsenui.min.js"/>"></script>
	<script src="<c:url value="/js/common.js"/>"></script>
</head>
<body>
	<!-- 사이드 메뉴 -->
	<ons-splitter>
		<%@ include file="/WEB-INF/jsp/common/side.jsp" %>
		<ons-splitter-content id="splitter-content" page="mainPage.jsp"></ons-splitter-content>
	</ons-splitter>

	<!-- 페이지2 -->
	<template id="map.jsp">
		<ons-page>
			<ons-toolbar>
				<div class="left">
					<ons-toolbar-button onclick="am.sideOpen()">
						<ons-icon icon="md-menu"></ons-icon>
					</ons-toolbar-button>
				</div>

				<div class="center notosanskr">지도</div>

				<div class="right">
					<%@ include file="/WEB-INF/jsp/common/user.jsp" %>
				</div>
			</ons-toolbar>
		</ons-page>
	</template>

	<!-- 로그인 페이지 -->
	<template id="mainPage.jsp">
		<ons-page id="mainPage" modifier="full_bg">
			<ons-toolbar>
				<div class="left">
					<ons-toolbar-button onclick="am.sideOpen()">
						<ons-icon icon="md-menu"></ons-icon>
					</ons-toolbar-button>
				</div>

				<div class="center">
					<img onclick="am.load('mainPage.jsp')" src="<c:url value='/images/logo/kb_logo.png'/>" alt="gwangju icon" style="width: 8em;">
				</div>
				
				<div class="right">
					<%@ include file="/WEB-INF/jsp/common/user.jsp" %>
				</div>
			</ons-toolbar>
			
			<div style="text-align: center;">
				<div style="margin-top: 40px;">
					<span class="notosanskr-m">지하시설물</span>
					<span class="notosanskr-b">위치 확인시스템</span>
				</div>
				<c:if test="${empty sessionScope.authInfo }">
				<div style="background-color: white;">
					<form id="loginForm" name="loginForm" method="post">
						<p>
							<ons-input id="ons-searchUserId" input-id="searchUserId" name="searchUserId" modifier="material" placeholder="Username"></ons-input>
						</p>
						<p>
							<ons-input id="ons-searchUserPwd" input-id="searchUserPwd" name="searchUserPwd" modifier="material" type="password" placeholder="Password"></ons-input>
						</p>
						<p style="margin-top: 30px;">
							<ons-button onclick="am.fn_login()">로그인하기</ons-button>
						</p>
					</form>
				</div>
				</c:if>
				<c:if test="${!empty sessionScope.authInfo }">
				<div style="padding: 1px 0 0 0;">
					<div class="card">
						<!-- <h2 class="card__title">관로 지도</h2> -->
						<!-- <div class="card__content">관로 현황을 지도 형태로 확인합니다. 레이어 클릭 시 해당 관로에 대한 상세내용 페이지로 이동합니다.</div> -->
						<ons-button class="notosanskr" icon="fa-arrow-circle-right" modifier="large--quiet" onclick="location.href='<c:url value='/layer/map.do'/>'">바로가기</ons-button>
					</div>
				</div>
				</c:if>
			</div>
		</ons-page>
	</template>
</body>
</html>