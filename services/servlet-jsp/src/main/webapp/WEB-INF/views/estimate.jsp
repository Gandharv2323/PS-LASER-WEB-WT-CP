<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:set var="pageTitle" value="Laser cutting estimate"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<fmt:setLocale value="en_IN"/>
<div class="container py-4">
  <div class="row">
    <div class="col-lg-6 mb-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <h1 class="h4">Laser cutting estimate</h1>
          <p class="small text-muted">Indicative price for one flat part design. Same formula and rate card as the PS Laser website.</p>
          <form method="post" action="<c:url value='/estimate'/>" novalidate>
            <div class="form-row">
              <div class="form-group col-7">
                <label for="materialCode">Material</label>
                <select class="form-control ${not empty errors.materialCode ? 'is-invalid' : ''}" id="materialCode" name="materialCode">
                  <c:forEach var="m" items="${materials}">
                    <option value="${m.code}" ${m.code eq input.materialCode ? 'selected' : ''}>
                      <c:out value="${m.name}"/> (max ${m.maxThicknessMm.stripTrailingZeros().toPlainString()} mm)
                    </option>
                  </c:forEach>
                </select>
                <div class="invalid-feedback">${errors.materialCode}</div>
              </div>
              <div class="form-group col-5">
                <label for="thicknessMm">Thickness (mm)</label>
                <input class="form-control ${not empty errors.thicknessMm ? 'is-invalid' : ''}" id="thicknessMm" name="thicknessMm"
                       type="number" step="any" min="0.1" value="${input.thicknessMm}">
                <div class="invalid-feedback"><c:out value="${errors.thicknessMm}"/></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-6">
                <label for="lengthMm">Length (mm)</label>
                <input class="form-control ${not empty errors.lengthMm ? 'is-invalid' : ''}" id="lengthMm" name="lengthMm" type="number" step="0.1" value="${input.lengthMm}">
                <div class="invalid-feedback"><c:out value="${errors.lengthMm}"/></div>
              </div>
              <div class="form-group col-6">
                <label for="widthMm">Width (mm)</label>
                <input class="form-control ${not empty errors.widthMm ? 'is-invalid' : ''}" id="widthMm" name="widthMm" type="number" step="0.1" value="${input.widthMm}">
                <div class="invalid-feedback"><c:out value="${errors.widthMm}"/></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-6">
                <label for="cutLengthMm">Total cut length (mm)</label>
                <input class="form-control ${not empty errors.cutLengthMm ? 'is-invalid' : ''}" id="cutLengthMm" name="cutLengthMm" type="number" step="1" value="${input.cutLengthMm}">
                <div class="invalid-feedback"><c:out value="${errors.cutLengthMm}"/></div>
              </div>
              <div class="form-group col-6">
                <label for="pierces">Pierces (holes/starts)</label>
                <input class="form-control ${not empty errors.pierces ? 'is-invalid' : ''}" id="pierces" name="pierces" type="number" min="0" value="${input.pierces}">
                <div class="invalid-feedback"><c:out value="${errors.pierces}"/></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-6">
                <label for="bends">Bends per part</label>
                <input class="form-control ${not empty errors.bends ? 'is-invalid' : ''}" id="bends" name="bends" type="number" min="0" value="${input.bends}">
                <div class="invalid-feedback"><c:out value="${errors.bends}"/></div>
              </div>
              <div class="form-group col-6">
                <label for="quantity">Quantity</label>
                <input class="form-control ${not empty errors.quantity ? 'is-invalid' : ''}" id="quantity" name="quantity" type="number" min="1" value="${input.quantity}">
                <div class="invalid-feedback"><c:out value="${errors.quantity}"/></div>
              </div>
            </div>
            <div class="form-group form-check">
              <input class="form-check-input" type="checkbox" id="powderCoat" name="powderCoat" ${input.powderCoat ? 'checked' : ''}>
              <label class="form-check-label" for="powderCoat">Powder coat both sides</label>
            </div>
            <button class="btn btn-ps btn-block" type="submit">Calculate</button>
          </form>
        </div>
      </div>
    </div>

    <div class="col-lg-6">
      <c:choose>
        <c:when test="${not empty result}">
          <div class="card shadow-sm border-ps">
            <div class="card-body">
              <p class="text-muted small mb-1">${result.materialCode} &middot; ${result.thicknessMm} mm &middot; ${result.quantity} pcs</p>
              <h2 class="display-5 text-ps mb-0">&#8377;&nbsp;<fmt:formatNumber value="${result.total}" minFractionDigits="2" maxFractionDigits="2"/></h2>
              <p class="small text-muted">incl. GST ${result.gstPercent}% &middot; ${result.currency}</p>
              <table class="table table-sm mb-2">
                <tr><td>Material (${result.weightKg} kg, ${result.areaM2} m&sup2;)</td><td class="text-right">${result.material}</td></tr>
                <tr><td>Cutting</td><td class="text-right">${result.cutting}</td></tr>
                <tr><td>Piercing</td><td class="text-right">${result.piercing}</td></tr>
                <tr><td>Bending</td><td class="text-right">${result.bending}</td></tr>
                <tr><td>Powder coating</td><td class="text-right">${result.coating}</td></tr>
                <tr class="font-weight-bold"><td>Per part</td><td class="text-right">${result.perPart}</td></tr>
                <tr><td>Subtotal &times; ${result.quantity}</td><td class="text-right">${result.subtotal}</td></tr>
                <tr><td>GST</td><td class="text-right">${result.gst}</td></tr>
                <tr class="font-weight-bold"><td>Total</td><td class="text-right">${result.total}</td></tr>
              </table>
              <div class="alert alert-warning small mb-2">Indicative estimate &mdash; final quote on WhatsApp.
                <c:if test="${result.sample}"> (Sample rate card.)</c:if></div>
              <a class="btn btn-ps btn-block" target="_blank" rel="noopener"
                 href="https://wa.me/${initParam.supportWhatsApp}?text=Hi%20PS%20Laser%2C%20estimate%20${result.materialCode}%20${result.thicknessMm}mm%20x${result.quantity}%3A%20Rs%20${result.total}">Get final quote on WhatsApp</a>
            </div>
          </div>
        </c:when>
        <c:otherwise>
          <div class="ps-empty p-4 text-muted small">
            <h2 class="h6 text-dark">How it is calculated</h2>
            <ol class="pl-3 mb-0">
              <li>Area = length &times; width; weight = area &times; thickness &times; density</li>
              <li>Material = weight &times; rate/kg; cutting = metres of cut &times; rate/m</li>
              <li>Piercing = pierces &times; rate; bending = bends &times; bend rate</li>
              <li>Powder coat = area &times; 2 sides &times; rate/m&sup2;</li>
              <li>Per part &times; quantity + GST</li>
            </ol>
          </div>
        </c:otherwise>
      </c:choose>
    </div>
  </div>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
