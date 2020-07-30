<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page trimDirectiveWhitespaces="true"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui" %>

<spring:eval expression="@sysProps['geoserver.url']" var="geoUrl"/>
<spring:eval expression="@sysProps['base.map.url']" var="basemapUrl"/>
<spring:eval expression="@sysProps['aero.data.img']" var="aeroDataImg"/>
<spring:eval expression="@sysProps['aero.data.tiles']" var="aeroDataTiles"/>
<spring:eval expression="@sysProps['aero.archive.url']" var="aeroArchiveUrl"/>

<spring:eval expression="@sysProps['aero.data.imgTest']" var="aeroDataImgTest"/>


<script type="text/javascript">
	
	var gp = {
		ctxPath : "${pageContext.request.contextPath}",
        proxyPath : "${pageContext.request.contextPath}/proxy/proxy.jsp?url=",
		geoUrl :  "${pageContext.request.contextPath}/proxy/proxy.jsp?url=${geoUrl}",
		baseUrl : "${basemapUrl}",
		aeroDataImg : "${aeroDataImg}",
		aeroDataTiles : "${aeroDataTiles}",
		aeroArchiveUrl : "${aeroArchiveUrl}",
        aeroDataImgTest : "${aeroDataImgTest}"
	}
</script>

