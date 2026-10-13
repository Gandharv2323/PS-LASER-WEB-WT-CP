<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Servlet concurrency"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-4">
  <h1 class="h4">Servlet concurrency</h1>
  <p class="text-muted">One servlet instance, many threads. This request ran on <code><c:out value="${thread}"/></code>.</p>
  <c:if test="${not empty asyncInfo}"><div class="alert alert-info small">Async servlet: <c:out value="${asyncInfo}"/></div></c:if>
  <div class="row">
    <div class="col-sm-4 mb-3"><div class="card card-body text-center shadow-sm">
      <div class="small text-muted">Unsafe <code>long</code> field</div><div class="h3 mb-0">${unsafeHits}</div></div></div>
    <div class="col-sm-4 mb-3"><div class="card card-body text-center shadow-sm">
      <div class="small text-muted"><code>AtomicLong</code> in this servlet</div><div class="h3 mb-0">${safeHits}</div></div></div>
    <div class="col-sm-4 mb-3"><div class="card card-body text-center shadow-sm">
      <div class="small text-muted">All requests (filter, application scope)</div><div class="h3 mb-0">${totalHits}</div></div></div>
  </div>
  <c:if test="${not empty burstExpected}">
    <div class="card shadow-sm border-ps mb-3"><div class="card-body">
      <h2 class="h6">Race test: 32 threads &times; 2000 increments</h2>
      <p class="mb-1">Expected <strong>${burstExpected}</strong> &middot; AtomicLong <strong class="text-success">${burstAtomic}</strong>
        &middot; plain field <strong class="text-danger">${burstUnsafe}</strong></p>
      <p class="small text-muted mb-0">${burstLost} updates were lost by the unsynchronised field
        (the number changes from run to run; it can occasionally be 0 on a lightly loaded machine).</p>
    </div></div>
  </c:if>
  <a class="btn btn-ps mr-2 mb-2" href="<c:url value='/concurrency?burst=1'/>">Run race test</a>
  <a class="btn btn-outline-ps mb-2" href="<c:url value='/concurrency?async=1'/>">Async request (startAsync)</a>
  <ul class="small text-muted mt-3">
    <li><code>count++</code> on a shared field is read &rarr; add &rarr; write: two threads can overwrite each other.</li>
    <li>Fix with <code>AtomicLong</code>, <code>synchronized</code>, or by keeping per-request data in local variables / request attributes.</li>
    <li><code>SingleThreadModel</code> is deprecated (Servlet 2.4) and not used: it does not protect shared resources and slows the server.</li>
  </ul>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
