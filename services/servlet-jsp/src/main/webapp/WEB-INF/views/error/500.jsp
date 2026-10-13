<%-- 500 / uncaught exception page (web.xml error-code 500 and exception-type Throwable).
     isErrorPage="true" gives this page the implicit "exception" object; the details go to the
     log, never to the customer. --%>
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%
    // the only scriptlet outside basics.jsp: write the real cause to Tomcat's log
    Throwable t = exception != null ? exception : (Throwable) request.getAttribute("javax.servlet.error.exception");
    if (t != null) application.log("Order Desk error on " + request.getAttribute("javax.servlet.error.request_uri"), t);
%>
<c:set var="pageTitle" value="Something went wrong"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-5 text-center">
  <p class="display-3 text-ps font-weight-bold mb-0">500</p>
  <h1 class="h4">Our machine hit a snag</h1>
  <p class="text-muted">The error has been logged. Please try again, or message us on WhatsApp.</p>
  <a class="btn btn-ps mr-2" href="<c:url value='/'/>">Order Desk home</a>
  <a class="btn btn-outline-ps" target="_blank" rel="noopener" href="https://wa.me/${initParam.supportWhatsApp}">WhatsApp us</a>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
