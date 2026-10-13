<%--
  VIEW (MVC) for TrackServlet. Scriptlet-free: uses
    * jsp:useBean / jsp:getProperty  -> the WorkOrder JavaBean placed in request scope by the controller
    * EL  ${...}                     -> bean properties, scopes, operators
    * JSTL c:if / c:choose / c:forEach / c:out / fmt:formatDate
    * custom tag ps:statusBadge (SimpleTagSupport, WEB-INF/ps.tld)
--%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="ps" uri="/WEB-INF/ps.tld" %>
<c:set var="pageTitle" value="Track your order"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-4">
  <div class="row">
    <div class="col-lg-4 mb-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <h1 class="h4">Track your order</h1>
          <p class="text-muted small">Use the order number on your job card and the mobile number you gave us.</p>
          <c:if test="${not empty error}">
            <div class="alert alert-danger small" role="alert"><c:out value="${error}"/></div>
          </c:if>
          <form method="post" action="<c:url value='/track'/>" novalidate>
            <div class="form-group">
              <label for="orderNo">Order number</label>
              <input class="form-control text-uppercase" id="orderNo" name="orderNo" required maxlength="30"
                     placeholder="PSL-DEMO-001" value="<c:out value='${orderNo}'/>">
            </div>
            <div class="form-group">
              <label for="phone">Mobile number</label>
              <input class="form-control" id="phone" name="phone" type="tel" inputmode="numeric" required
                     maxlength="14" placeholder="10-digit mobile" value="<c:out value='${phone}'/>" autocomplete="tel">
            </div>
            <button class="btn btn-ps btn-block" type="submit">Show status</button>
          </form>
          <p class="small text-muted mt-3 mb-0">Demo: <code>PSL-DEMO-001</code> with <code>9000000001</code>.</p>
        </div>
      </div>
    </div>

    <div class="col-lg-8">
      <c:choose>
        <c:when test="${not empty requestScope.order}">
          <%-- jsp:useBean finds the existing "order" attribute in request scope (it does not create a new one) --%>
          <jsp:useBean id="order" class="com.pslaser.desk.model.WorkOrder" scope="request"/>
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex flex-wrap justify-content-between align-items-start">
                <div>
                  <p class="text-muted small mb-1">Order</p>
                  <h2 class="h4 mb-1"><jsp:getProperty name="order" property="orderNo"/></h2>
                  <p class="mb-2"><c:out value="${order.description}"/></p>
                </div>
                <ps:statusBadge status="${order.status}" size="lg"/>
              </div>
              <div class="row small text-muted">
                <div class="col-6 col-md-3">Customer<br><strong class="text-dark"><c:out value="${order.customerName}"/></strong></div>
                <div class="col-6 col-md-3">Mobile<br><strong class="text-dark">${order.maskedPhone}</strong></div>
                <div class="col-6 col-md-3 mt-2 mt-md-0">Quantity<br><strong class="text-dark"><jsp:getProperty name="order" property="quantity"/> pcs</strong></div>
                <div class="col-6 col-md-3 mt-2 mt-md-0">Due<br><strong class="text-dark">
                  <c:choose>
                    <c:when test="${not empty order.dueDate}"><fmt:formatDate value="${order.dueDate}" pattern="dd MMM yyyy"/></c:when>
                    <c:otherwise>To be confirmed</c:otherwise>
                  </c:choose></strong></div>
              </div>

              <h3 class="h6 mt-4">Production stages</h3>
              <ol class="ps-progress">
                <c:forEach var="s" items="${applicationScope.statuses}" varStatus="st">
                  <li class="${st.index lt order.stageIndex ? 'done' : (st.index eq order.stageIndex ? 'current' : '')}">
                    <span class="ps-progress-dot"></span><span class="ps-progress-label">${s}</span>
                  </li>
                </c:forEach>
              </ol>

              <h3 class="h6 mt-4">Timeline</h3>
              <c:if test="${empty order.events}"><p class="text-muted">No updates yet.</p></c:if>
              <ul class="ps-timeline list-unstyled mb-0">
                <c:forEach var="e" items="${order.events}" varStatus="st">
                  <li class="${st.last ? 'latest' : ''}">
                    <div class="d-flex flex-wrap align-items-center">
                      <ps:statusBadge status="${e.status}"/>
                      <span class="small text-muted ml-2"><fmt:formatDate value="${e.createdAt}" pattern="dd MMM yyyy, hh:mm a"/></span>
                    </div>
                    <c:if test="${not empty e.note}"><div class="small mt-1"><c:out value="${e.note}"/></div></c:if>
                  </li>
                </c:forEach>
              </ul>
            </div>
          </div>
          <p class="small text-muted mt-3">Questions about this job?
            <a href="https://wa.me/${initParam.supportWhatsApp}?text=Order%20${order.orderNo}" target="_blank" rel="noopener">Message us on WhatsApp</a>.</p>
        </c:when>
        <c:otherwise>
          <div class="ps-empty text-center text-muted p-5">
            <img src="<c:url value='/img/ps-laser-logo.png'/>" alt="" height="56" class="mb-3 ps-faded">
            <p class="mb-0">Your order's stage-by-stage status appears here.</p>
          </div>
        </c:otherwise>
      </c:choose>
    </div>
  </div>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
