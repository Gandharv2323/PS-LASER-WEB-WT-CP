<%-- Page footer, pulled in with the DYNAMIC include action  <jsp:include page="..."/>
     (a separate request-time call; it is compiled as its own servlet). --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<footer class="ps-footer mt-5">
  <div class="container py-4">
    <div class="row">
      <div class="col-md-6 mb-3">
        <img src="<c:url value='/img/ps-laser-logo.png'/>" alt="PS Laser" height="36" class="bg-white rounded p-1">
        <p class="small mt-2 mb-0">CNC laser cutting, bending, punching, welding &amp; powder coating &mdash; Pune.</p>
      </div>
      <div class="col-md-6 mb-3 text-md-right small">
        <a class="btn btn-sm btn-ps mb-2" target="_blank" rel="noopener"
           href="https://wa.me/${initParam.supportWhatsApp}?text=Hi%20PS%20Laser%2C%20I%20have%20a%20question%20about%20my%20order">Ask on WhatsApp</a>
        <div>Order Desk &middot; Java Servlets + JSP on Apache Tomcat</div>
      </div>
    </div>
  </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.slim.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
