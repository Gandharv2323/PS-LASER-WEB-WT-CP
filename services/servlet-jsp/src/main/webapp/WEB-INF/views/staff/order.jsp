<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="ps" uri="/WEB-INF/ps.tld" %>
<c:set var="pageTitle" value="${order.orderNo}"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-4">
  <p class="mb-2"><a href="<c:url value='/staff/orders'/>">&larr; All work orders</a></p>
  <c:if test="${not empty flash}">
    <div class="alert alert-${flashType}" role="alert"><c:out value="${flash}"/></div>
  </c:if>
  <div class="row">
    <div class="col-lg-7 mb-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex flex-wrap justify-content-between align-items-start">
            <h1 class="h4 mb-2"><c:out value="${order.orderNo}"/></h1>
            <ps:statusBadge status="${order.status}" size="lg"/>
          </div>
          <p><c:out value="${order.description}"/></p>
          <dl class="row small mb-0">
            <dt class="col-5 col-sm-4">Customer</dt><dd class="col-7 col-sm-8"><c:out value="${order.customerName}"/></dd>
            <dt class="col-5 col-sm-4">Mobile</dt><dd class="col-7 col-sm-8"><c:out value="${order.customerPhone}"/></dd>
            <dt class="col-5 col-sm-4">Machine</dt><dd class="col-7 col-sm-8"><c:out value="${empty order.machineSlug ? '-' : order.machineSlug}"/></dd>
            <dt class="col-5 col-sm-4">Quantity</dt><dd class="col-7 col-sm-8">${order.quantity}</dd>
            <dt class="col-5 col-sm-4">Due</dt><dd class="col-7 col-sm-8"><fmt:formatDate value="${order.dueDate}" pattern="dd MMM yyyy"/></dd>
            <dt class="col-5 col-sm-4">Last update</dt><dd class="col-7 col-sm-8"><fmt:formatDate value="${order.updatedAt}" pattern="dd MMM yyyy, hh:mm a"/></dd>
          </dl>
          <h2 class="h6 mt-4">Timeline</h2>
          <ul class="ps-timeline list-unstyled mb-0">
            <c:forEach var="e" items="${order.events}" varStatus="st">
              <li class="${st.last ? 'latest' : ''}">
                <ps:statusBadge status="${e.status}"/>
                <span class="small text-muted ml-2"><fmt:formatDate value="${e.createdAt}" pattern="dd MMM yyyy, hh:mm a"/></span>
                <c:if test="${not empty e.note}"><div class="small mt-1"><c:out value="${e.note}"/></div></c:if>
              </li>
            </c:forEach>
          </ul>
        </div>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="card shadow-sm border-ps">
        <div class="card-body">
          <h2 class="h5">Move to stage</h2>
          <p class="small text-muted">Updates <code>work_orders.status</code> and adds a <code>work_order_events</code> row in one transaction.</p>
          <form method="post" action="<c:url value='/staff/order'/>">
            <input type="hidden" name="csrf" value="${sessionScope.csrf}">
            <input type="hidden" name="no" value="<c:out value='${order.orderNo}'/>">
            <div class="form-group">
              <label for="status">Stage</label>
              <select class="form-control" id="status" name="status">
                <c:forEach var="s" items="${allStatuses}">
                  <option value="${s}" ${s eq order.status ? 'selected' : ''}>${s}</option>
                </c:forEach>
              </select>
            </div>
            <div class="form-group">
              <label for="note">Note for the customer (optional)</label>
              <input class="form-control" id="note" name="note" maxlength="200" placeholder="e.g. Bent on 175 T press brake">
            </div>
            <button class="btn btn-ps btn-block" type="submit">Update status</button>
          </form>
          <p class="small text-muted mt-3 mb-0">Customer view: <a href="<c:url value='/track'/>">/track</a> with this order no + mobile.</p>
        </div>
      </div>
    </div>
  </div>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
