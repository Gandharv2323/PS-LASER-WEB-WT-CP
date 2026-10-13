<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:set var="pageTitle" value="Data storage"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-4">
  <h1 class="h4">Where this app keeps data</h1>
  <c:if test="${not empty from}"><div class="alert alert-info small">You arrived here via <strong><c:out value="${from}"/></strong>.</div></c:if>
  <div class="row">
    <div class="col-lg-6 mb-3">
      <div class="card shadow-sm h-100"><div class="card-body">
        <h2 class="h6">1. Application scope &mdash; <code>ServletContext</code> attributes</h2>
        <table class="table table-sm small mb-0">
          <c:forEach var="a" items="${appAttrs}">
            <tr><th class="text-nowrap">${a.key}</th><td class="text-break"><c:out value="${a.value}"/></td></tr>
          </c:forEach>
        </table>
      </div></div>
    </div>
    <div class="col-lg-6 mb-3">
      <div class="card shadow-sm h-100"><div class="card-body">
        <h2 class="h6">2. Session scope &mdash; <code>HttpSession</code> attributes</h2>
        <c:choose>
          <c:when test="${empty sessionId}"><p class="small text-muted">No session yet.</p></c:when>
          <c:otherwise>
            <p class="small">Session <code>${sessionId}</code></p>
            <table class="table table-sm small mb-0">
              <c:forEach var="a" items="${sessionAttrs}">
                <tr><th>${a.key}</th><td><c:out value="${a.value}"/></td></tr>
              </c:forEach>
            </table>
            <c:if test="${empty sessionAttrs}"><p class="small text-muted">Session is empty &mdash; log in or open the session demo.</p></c:if>
          </c:otherwise>
        </c:choose>
        <h2 class="h6 mt-3">3. Cookies sent by your browser</h2>
        <ul class="small mb-0">
          <c:forEach var="ck" items="${cookie}">
            <li><code>${ck.key}</code> = <c:out value="${ck.key eq 'JSESSIONID' ? '(session id)' : ck.value.value}"/></li>
          </c:forEach>
          <c:if test="${empty cookie}"><li class="text-muted">none</li></c:if>
        </ul>
      </div></div>
    </div>
    <div class="col-lg-6 mb-3">
      <div class="card shadow-sm h-100"><div class="card-body">
        <h2 class="h6">4. Database (MySQL <code>pslaser</code> via JDBC pool)</h2>
        <p class="small mb-2">Work orders, events, users and the rate card live in the shared database used by every PS Laser backend.</p>
        <h2 class="h6">web.xml context-params</h2>
        <table class="table table-sm small mb-0">
          <c:forEach var="p" items="${contextParams}">
            <tr><th>${p.key}</th><td><c:out value="${p.value}"/></td></tr>
          </c:forEach>
        </table>
      </div></div>
    </div>
    <div class="col-lg-6 mb-3">
      <div class="card shadow-sm h-100"><div class="card-body">
        <h2 class="h6">5. File store &mdash; application log</h2>
        <p class="small text-break text-muted"><c:out value="${logFile}"/></p>
        <pre class="ps-pre ps-pre-scroll mb-0"><c:forEach var="l" items="${logTail}"><c:out value="${l}"/>
</c:forEach></pre>
      </div></div>
    </div>
  </div>
  <p class="small text-muted">Deployed <fmt:formatDate value="${applicationScope.startedAt}" pattern="dd MMM yyyy, HH:mm:ss"/>
    &middot; ${pageContext.servletContext.serverInfo}</p>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
