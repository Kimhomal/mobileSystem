<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page trimDirectiveWhitespaces="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>광주광역시 항공사진통합관리시스템</title>

    <link rel="stylesheet" type="text/css" href="<c:url value='/css/gis.css'/>">


</head>
<body>

<div class="er_wrap">

    <div class="error-text">
        <p class="title">STATUS</p>
        <p class="text-large-x"><c:out value="${statusText}"/></p>
        <a href="/">홈으로가기</a>
    </div>

</div>



</div>
</body>
</html>