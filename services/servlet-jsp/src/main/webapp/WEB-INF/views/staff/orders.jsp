<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="ps" uri="/WEB-INF/ps.tld" %>
<c:set var="pageTitle" value="Work orders"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-4">
  <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
    <h1 class="h4 mb-2">Work orders <small class="text-muted">(${fn:length(orders)})</small></h1>
    <a class="btn btn-ps mb-2" href="<c:url value='/staff/orders/new'/>">+ New work order</a>
  </div>
  <c:if test="${not empty flash}">
    <div class="alert alert-${flashType} alert-dismissible fade show" role="alert">
      <c:out value="${flash}"/>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    </div>
  </c:if>

  <%-- GET form: several checkboxes share the name "status" -> request.getParameterValues("status") --%>
  <form method="get" action="<c:url value='/staff/orders'/>" class="card card-body mb-3 shadow-sm">
    <div class="d-flex flex-wrap ps-chips">
      <c:forEach var="s" items="${allStatuses}">
        <c:set var="isOn" value="${selected.contains(s)}"/>
        <label class="ps-chip ${isOn ? 'on' : ''}">
          <input type="checkbox" name="status" value="${s}" ${isOn ? 'checked' : ''}> ${s}
          <span class="badge badge-light">${counts[s]}</span>
        </label>
      </c:forEach>
    </div>
    <div class="form-row mt-2">
      <div class="col-sm-8 mb-2">
        <input class="form-control" name="q" placeholder="Search order no, customer or job" value="<c:out value='${q}'/>">
      </div>
      <div class="col-sm-4 mb-2 d-flex">
        <button class="btn btn-ps flex-fill mr-2" type="submit">Filter</button>
        <a class="btn btn-light flex-fill" href="<c:url value='/staff/orders'/>">Clear</a>
      </div>
    </div>
  </form>

  <c:choose>
    <c:when test="${empty orders}">
      <p class="text-muted">No work orders match this filter.</p>
    </c:when>
    <c:otherwise>
      <div class="table-responsive bg-white shadow-sm rounded">
        <table class="table table-hover mb-0 ps-table">
          <thead class="thead-light">
            <tr><th>Order</th><th>Customer</th><th class="d-none d-md-table-cell">Job</th><th>Qty</th><th>Status</th><th class="d-none d-sm-table-cell">Due</th><th></th></tr>
          </thead>
          <tbody>
            <c:forEach var="o" items="${orders}">
              <c:url var="detail" value="/staff/order"><c:param name="no" value="${o.orderNo}"/></c:url>
              <tr>
                <td class="text-nowrap"><a href="${detail}"><strong><c:out value="${o.orderNo}"/></strong></a></td>
                <td><c:out value="${o.customerName}"/></td>
                <td class="d-none d-md-table-cell small"><c:out value="${o.description}"/></td>
                <td>${o.quantity}</td>
                <td><ps:statusBadge status="${o.status}"/></td>
                <td class="d-none d-sm-table-cell text-nowrap small"><fmt:formatDate value="${o.dueDate}" pattern="dd MMM"/></td>
                <td><a class="btn btn-sm btn-outline-ps" href="${detail}">Open</a></td>
              </tr>
            </c:forEach>
          </tbody>
        </table>
      </div>
    </c:otherwise>
  </c:choose>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
