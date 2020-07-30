<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!-- 사이드 메뉴 -->
<ons-splitter-side id="splitter-menu" side="left" width="220px" collapse>
	<ons-page>
		<ons-list>
			<ons-list-item onclick="location.href='<c:url value='/mainPage.do'/>'" tappable>
				<img src="<c:url value='/images/logo/logo.png'/>" alt="gwangju icon">
			</ons-list-item>
			<ons-list-item onclick="location.href='<c:url value='/layer/map.do'/>'" tappable>지도</ons-list-item>
		</ons-list>
	</ons-page>
</ons-splitter-side>
