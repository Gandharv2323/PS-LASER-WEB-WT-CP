<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:set var="pageTitle" value="Staff login"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-sm-10 col-md-7 col-lg-5">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h1 class="h4 mb-1">Staff login</h1>
          <p class="text-muted small">Order Desk for PS Laser staff.</p>
          <c:if test="${param.bye eq '1'}"><div class="alert alert-success small">You have been logged out.</div></c:if>
          <c:if test="${param.denied eq '1'}"><div class="alert alert-warning small">Your account cannot open the staff desk.</div></c:if>
          <c:if test="${not empty param.next and empty error and param.bye ne '1'}">
            <div class="alert alert-info small">Please log in to continue.</div>
          </c:if>
          <c:if test="${not empty error}"><div class="alert alert-danger small" role="alert"><c:out value="${error}"/></div></c:if>
          <%-- c:url adds ;jsessionid=... to the action when the browser does not send cookies (URL rewriting) --%>
          <form method="post" action="<c:url value='/login'/>">
            <input type="hidden" name="next" value="<c:out value='${next}'/>">
            <div class="form-group">
              <label for="email">E-mail</label>
              <input class="form-control" type="email" id="email" name="email" required autocomplete="username"
                     value="<c:out value='${email}'/>" ${empty email ? 'autofocus' : ''}>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input class="form-control" type="password" id="password" name="password" required
                     autocomplete="current-password" ${not empty email ? 'autofocus' : ''}>
            </div>
            <div class="form-group form-check">
              <input class="form-check-input" type="checkbox" id="remember" name="remember" ${remember ? 'checked' : ''}>
              <label class="form-check-label" for="remember">Remember my e-mail on this computer (cookie, 30 days)</label>
            </div>
            <button class="btn btn-ps btn-block" type="submit">Log in</button>
          </form>
          <p class="small text-muted mt-3 mb-0">Uses the shared <code>users</code> table (bcrypt). Sessions expire after
            <fmt:formatNumber value="${pageContext.session.maxInactiveInterval / 60}" maxFractionDigits="0"/> idle minutes
            (<code>session-timeout</code> in web.xml).</p>
        </div>
      </div>
    </div>
  </div>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
