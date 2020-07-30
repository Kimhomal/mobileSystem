<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<c:if test="${empty sessionScope.authInfo}">
<!-- <ons-toolbar-button style="font-size: 14px;" onclick="am.load('login.jsp')">로그인</ons-toolbar-button> -->
</c:if>
<c:if test="${!empty sessionScope.authInfo}">
<%-- <ons-toolbar-button icon="fa-user" style="font-size: 14px;" onclick="am.createUserMenu()"><span class="notosanskr">${sessionScope.authInfo.userNm}</span></ons-toolbar-button> --%>
</c:if>