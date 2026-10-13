<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Order Desk"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<section class="ps-hero">
  <div class="container py-5">
    <div class="row align-items-center">
      <div class="col-lg-7">
        <p class="text-uppercase small ps-kicker mb-2">PS Laser &middot; Pune</p>
        <h1 class="display-5 font-weight-bold">Where is my job?</h1>
        <p class="lead">Track your laser-cutting, bending or powder-coating order stage by stage, get an
          indicative price for a part, or log in to the staff desk to move jobs through the shop.</p>
        <a class="btn btn-ps btn-lg mr-2 mb-2" href="<c:url value='/track'/>">Track my order</a>
        <a class="btn btn-outline-ps btn-lg mb-2" href="<c:url value='/estimate'/>">Get an estimate</a>
      </div>
      <div class="col-lg-5 mt-4 mt-lg-0">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="h6 text-muted text-uppercase">Production stages</h2>
            <ol class="ps-steps mb-0">
              <c:forEach var="s" items="${applicationScope.statuses}">
                <li><c:out value="${s}"/></li>
              </c:forEach>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="container">
  <h2 class="h4 mt-4 mb-3">Servlet &amp; JSP features in this app</h2>
  <div class="row">
    <c:forEach var="d" items="${['/hello~Hello World servlet~Classic first servlet: dynamic HTML + request info',
                                 '/lifecycle~Servlet life cycle~constructor, init(), service(), destroy(), init-params, load-on-startup',
                                 '/concurrency~Servlet concurrency~AtomicLong vs unsafe field, async servlet',
                                 '/session-demo~Sessions & URL rewriting~HttpSession, encodeURL, ;jsessionid',
                                 '/dispatch~Request dispatching~forward, include, sendRedirect, error pages',
                                 '/basics.jsp~Basic JSP~directives, declarations, scriptlets, expressions, implicit objects',
                                 '/about~Data storage~DB, ServletContext, session, cookies and a file log']}">
      <c:set var="parts" value="${d.split('~')}"/>
      <div class="col-sm-6 col-lg-4 mb-3">
        <a class="card h-100 ps-card-link" href="<c:url value='${parts[0]}'/>">
          <div class="card-body">
            <h3 class="h6 text-ps mb-1"><c:out value="${parts[1]}"/></h3>
            <p class="small text-muted mb-0"><c:out value="${parts[2]}"/></p>
          </div>
        </a>
      </div>
    </c:forEach>
  </div>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
