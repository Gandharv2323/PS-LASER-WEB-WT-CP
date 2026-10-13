<%-- Stand-alone header used by servlets that build their page with RequestDispatcher.include()
     (DispatchDemoServlet). It reuses the same markup through a static include. --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="${requestScope.pageTitle}"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
