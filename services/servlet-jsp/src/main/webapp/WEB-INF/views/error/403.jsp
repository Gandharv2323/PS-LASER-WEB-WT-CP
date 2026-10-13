<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Not allowed"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-5 text-center">
  <p class="display-3 text-ps font-weight-bold mb-0">403</p>
  <h1 class="h4">Not allowed</h1>
  <p class="text-muted"><c:out value="${requestScope['javax.servlet.error.message']}"/></p>
  <a class="btn btn-ps" href="<c:url value='/staff/orders'/>">Back to the staff desk</a>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
