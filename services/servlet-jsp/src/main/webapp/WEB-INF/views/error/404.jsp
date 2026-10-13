<%-- 404 error page, mapped in web.xml <error-page><error-code>404</error-code>. --%>
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Page not found"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-5 text-center">
  <p class="display-3 text-ps font-weight-bold mb-0">404</p>
  <h1 class="h4">This page is not on our cutting table</h1>
  <p class="text-muted">We could not find <code><c:out value="${requestScope['javax.servlet.error.request_uri']}"/></code>.
    <c:if test="${not empty requestScope['javax.servlet.error.message']}"><br><c:out value="${requestScope['javax.servlet.error.message']}"/></c:if></p>
  <a class="btn btn-ps mr-2" href="<c:url value='/'/>">Order Desk home</a>
  <a class="btn btn-outline-ps" href="<c:url value='/track'/>">Track an order</a>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
