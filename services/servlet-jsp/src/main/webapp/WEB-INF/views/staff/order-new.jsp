<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="New work order"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<div class="container py-4">
  <p class="mb-2"><a href="<c:url value='/staff/orders'/>">&larr; All work orders</a></p>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="card shadow-sm">
        <div class="card-body">
          <h1 class="h4">New work order</h1>
          <c:if test="${not empty errors}">
            <div class="alert alert-danger small">Please fix the ${errors.size()} highlighted field(s).</div>
          </c:if>
          <form method="post" action="<c:url value='/staff/orders/new'/>" novalidate>
            <input type="hidden" name="csrf" value="${sessionScope.csrf}">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="orderNo">Order number</label>
                <input class="form-control ${not empty errors.orderNo ? 'is-invalid' : ''}" id="orderNo" name="orderNo"
                       value="<c:out value='${form.orderNo}'/>" required maxlength="30">
                <div class="invalid-feedback"><c:out value="${errors.orderNo}"/></div>
              </div>
              <div class="form-group col-md-6">
                <label for="quantity">Quantity (pcs)</label>
                <input class="form-control ${not empty errors.quantity ? 'is-invalid' : ''}" id="quantity" name="quantity"
                       type="number" min="1" value="${form.quantity}" required>
                <div class="invalid-feedback"><c:out value="${errors.quantity}"/></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="customerName">Customer name</label>
                <input class="form-control ${not empty errors.customerName ? 'is-invalid' : ''}" id="customerName" name="customerName"
                       value="<c:out value='${form.customerName}'/>" required maxlength="120">
                <div class="invalid-feedback"><c:out value="${errors.customerName}"/></div>
              </div>
              <div class="form-group col-md-6">
                <label for="customerPhone">Customer mobile</label>
                <input class="form-control ${not empty errors.customerPhone ? 'is-invalid' : ''}" id="customerPhone" name="customerPhone"
                       type="tel" value="<c:out value='${form.customerPhone}'/>" required maxlength="14">
                <div class="invalid-feedback"><c:out value="${errors.customerPhone}"/></div>
              </div>
            </div>
            <div class="form-group">
              <label for="description">Job description</label>
              <input class="form-control ${not empty errors.description ? 'is-invalid' : ''}" id="description" name="description"
                     value="<c:out value='${form.description}'/>" required maxlength="255" placeholder="e.g. MS 3 mm base plates, laser cut + bent">
              <div class="invalid-feedback"><c:out value="${errors.description}"/></div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-7">
                <label for="machineSlug">Main machine</label>
                <select class="form-control ${not empty errors.machineSlug ? 'is-invalid' : ''}" id="machineSlug" name="machineSlug">
                  <option value="">(not decided)</option>
                  <c:forEach var="m" items="${machines}">
                    <option value="${m}" ${m eq form.machineSlug ? 'selected' : ''}>${m}</option>
                  </c:forEach>
                </select>
                <div class="invalid-feedback"><c:out value="${errors.machineSlug}"/></div>
              </div>
              <div class="form-group col-md-5">
                <label for="dueDate">Due date</label>
                <input class="form-control ${not empty errors.dueDate ? 'is-invalid' : ''}" id="dueDate" name="dueDate"
                       type="date" value="<c:out value='${dueDate}'/>">
                <div class="invalid-feedback"><c:out value="${errors.dueDate}"/></div>
              </div>
            </div>
            <button class="btn btn-ps" type="submit">Create work order</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
