<%-- Fragment used by DispatchDemoServlet via RequestDispatcher.include(). --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<jsp:useBean id="now" class="java.util.Date"/>
<div class="card border-ps">
  <div class="card-body">
    <h2 class="h6 text-ps mb-1">Included fragment: shop-clock.jsp</h2>
    <p class="mb-1">Pune time: <strong><fmt:formatDate value="${now}" pattern="EEE dd MMM yyyy, hh:mm a"/></strong></p>
    <p class="mb-0 small text-muted">Shop hours Mon&ndash;Sat 9:30&ndash;19:00. An included page can read the same
      request attributes as its caller: pageTitle = <c:out value="${requestScope.pageTitle}"/>.</p>
  </div>
</div>
