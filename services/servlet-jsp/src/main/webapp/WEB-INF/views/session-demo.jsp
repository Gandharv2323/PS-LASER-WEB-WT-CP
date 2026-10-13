<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Sessions and URL rewriting"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-4">
  <h1 class="h4">Sessions, cookies &amp; URL rewriting</h1>
  <div class="row">
    <div class="col-md-6 mb-3">
      <div class="card shadow-sm"><div class="card-body">
        <p class="display-4 text-ps mb-0">${visits}</p>
        <p class="text-muted">visit(s) counted in this <code>HttpSession</code></p>
        <table class="table table-sm small mb-3">
          <tr><th>Session id</th><td><code>${shortId}</code></td></tr>
          <tr><th>New session?</th><td>${isNew}</td></tr>
          <tr><th>Id came from cookie</th><td>${fromCookie}</td></tr>
          <tr><th>Id came from URL (;jsessionid)</th><td>${fromUrl}</td></tr>
          <tr><th>Idle timeout</th><td>${timeout} s</td></tr>
          <tr><th>Active sessions (listener)</th><td>${applicationScope.activeSessions}</td></tr>
        </table>
        <a class="btn btn-ps mb-2" href="${nextLink}">Count again (encodeURL link)</a>
        <a class="btn btn-light mb-2" href="<c:url value='/session-demo?reset=1'/>">Reset</a>
      </div></div>
    </div>
    <div class="col-md-6">
      <div class="card shadow-sm"><div class="card-body small">
        <h2 class="h6">What is happening</h2>
        <p>The link above is built with <code>response.encodeURL()</code>:</p>
        <pre class="ps-pre"><c:out value="${nextLink}"/></pre>
        <p>If your browser returned the <code>JSESSIONID</code> cookie, the URL is plain. If it did not (first visit,
          cookies blocked, or <code>curl</code> without a cookie jar) Tomcat appends <code>;jsessionid=&hellip;</code>,
          so the session still survives &mdash; that is <strong>URL rewriting</strong>.</p>
        <p class="mb-0">Try: <code>curl -i http://localhost:8080/pslaser/session-demo</code>, copy the
          <code>;jsessionid=</code> link from the HTML and request it &mdash; the count goes to 2 with no cookie.</p>
      </div></div>
    </div>
  </div>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
