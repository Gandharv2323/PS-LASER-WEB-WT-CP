<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:set var="pageTitle" value="Servlet life cycle"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-4">
  <h1 class="h4">Servlet life cycle</h1>
  <div class="row">
    <div class="col-md-5 mb-3">
      <div class="card shadow-sm"><div class="card-body">
        <ol class="ps-steps small mb-3">
          <li><strong>Load &amp; instantiate</strong> &mdash; Tomcat loads <code>LifecycleServlet</code> and calls its constructor (once).</li>
          <li><strong>init(ServletConfig)</strong> &mdash; once; reads init-params. <code>load-on-startup=1</code> makes this happen at deploy.</li>
          <li><strong>service(req, res)</strong> &mdash; every request, on a pool thread; dispatches to <code>doGet</code>/<code>doPost</code>.</li>
          <li><strong>destroy()</strong> &mdash; once, when the app is stopped/redeployed.</li>
        </ol>
        <dl class="row small mb-0">
          <dt class="col-6">init-param shopName</dt><dd class="col-6"><c:out value="${shopName}"/></dd>
          <dt class="col-6">init() ran at</dt><dd class="col-6"><fmt:formatDate value="${initAt}" pattern="dd MMM HH:mm:ss"/></dd>
          <dt class="col-6">service() calls</dt><dd class="col-6">${serviceCalls}</dd>
        </dl>
      </div></div>
    </div>
    <div class="col-md-7">
      <div class="card shadow-sm"><div class="card-body">
        <h2 class="h6">Recorded events (newest first) <a class="small ml-2" href="<c:url value='/lifecycle'/>">reload</a></h2>
        <pre class="ps-pre mb-0"><c:forEach var="e" items="${events}"><c:out value="${e}"/>
</c:forEach></pre>
        <p class="small text-muted mt-2 mb-0">destroy() is also written to Tomcat's <code>logs/localhost.*.log</code> (redeploying replaces the
          exploded WAR, including WEB-INF/logs). App log:
          <a href="<c:url value='/about'/>">/about</a>.</p>
      </div></div>
    </div>
  </div>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
