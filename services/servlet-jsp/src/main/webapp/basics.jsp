<%--
  BASIC JSP demo - the ONE page that deliberately uses scriptlets, to show classic JSP syntax.
  Every other page is scriptlet-free (EL + JSTL + custom tags), which is the recommended style.

  JSP elements shown here:
    <%@ page ... %>, <%@ include %>, <%@ taglib %>   directives  (translation-time instructions)
    <%! ... %>                                          declaration (fields/methods of the generated servlet)
    <% ... %>                                           scriptlet   (Java code inside _jspService)
    <%= ... %>                                          expression  (value printed into the page)
    JSP comment  (this block itself; never sent to the browser, unlike an HTML comment)
    jsp:useBean / jsp:setProperty / jsp:getProperty     standard actions + JavaBeans
  A JSP is translated by Jasper into a servlet (work/Catalina/localhost/pslaser/org/apache/jsp/basics_jsp.java),
  compiled, and then follows the normal servlet life cycle (jspInit / _jspService / jspDestroy).
--%>
<%@ page contentType="text/html;charset=UTF-8" import="java.util.Date, java.text.SimpleDateFormat, com.pslaser.desk.model.WorkOrder" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%!
    // DECLARATION: becomes an instance field + method of the generated servlet class.
    // Shared by every request (like any servlet field) -> AtomicInteger, not int.
    private final java.util.concurrent.atomic.AtomicInteger pageViews = new java.util.concurrent.atomic.AtomicInteger();

    private String rupees(double amount) {
        return String.format("Rs %,.2f", amount);
    }

    public void jspInit() {               // JSP life cycle hook = servlet init()
        getServletContext().log("basics.jsp jspInit()");
    }
%>
<c:set var="pageTitle" value="Basic JSP"/>
<%@ include file="/WEB-INF/views/fragments/header.jspf" %>
<%
    // SCRIPTLET: plain Java inside _jspService(request, response)
    int views = pageViews.incrementAndGet();
    String hour = new SimpleDateFormat("HH").format(new Date());
    int h = Integer.parseInt(hour);
    String greeting = h < 12 ? "Good morning" : (h < 17 ? "Good afternoon" : "Good evening");
%>
<div class="container py-4">
  <h1 class="h4">Basic JSP: directives, declarations, scriptlets, expressions</h1>
  <p class="lead"><%= greeting %>! This page has been viewed <strong><%= views %></strong> time(s) since deploy.</p>

  <div class="row">
    <div class="col-lg-6 mb-3">
      <div class="card shadow-sm"><div class="card-body">
        <h2 class="h6">Implicit objects</h2>
        <table class="table table-sm small mb-0 ps-break">
          <tr><th>request</th><td><%= request.getMethod() %> <%= request.getRequestURI() %></td></tr>
          <tr><th>response</th><td>content type <%= response.getContentType() %></td></tr>
          <tr><th>session</th><td>id <%= session.getId().substring(0, 8) %>..., new = <%= session.isNew() %></td></tr>
          <tr><th>application</th><td><%= application.getServerInfo() %></td></tr>
          <tr><th>config</th><td>servlet name <%= config.getServletName() %></td></tr>
          <tr><th>pageContext</th><td>page-scope attr pageTitle = <%= pageContext.getAttribute("pageTitle") %></td></tr>
          <tr><th>out</th><td><% out.print("written with out.print()"); %></td></tr>
          <tr><th>page</th><td><%= page.getClass().getName() %></td></tr>
          <tr><th>exception</th><td>only in pages with isErrorPage="true" (see error/500.jsp)</td></tr>
        </table>
      </div></div>
    </div>

    <div class="col-lg-6 mb-3">
      <div class="card shadow-sm"><div class="card-body">
        <h2 class="h6">Loop in a scriptlet: production stages</h2>
        <ol class="small">
        <% for (String s : WorkOrder.STATUSES) { %>
          <li><%= s %><% if ("dispatched".equals(s)) { %> <span class="badge badge-success">last</span><% } %></li>
        <% } %>
        </ol>
        <p class="small mb-0">Declared method: 1250 &times; 18% GST = <%= rupees(1250 * 1.18) %></p>
      </div></div>
    </div>
  </div>

  <%-- JavaBeans + JSP: jsp:setProperty property="*" copies every matching request parameter
       into the bean's setters (with type conversion String -> int/double/boolean). --%>
  <jsp:useBean id="probe" class="com.pslaser.desk.model.EstimateRequest" scope="page"/>
  <jsp:setProperty name="probe" property="*"/>
  <div class="card shadow-sm"><div class="card-body">
    <h2 class="h6">JavaBean auto-binding (<code>jsp:setProperty property="*"</code>)</h2>
    <form class="form-inline mb-2" method="get">
      <input class="form-control form-control-sm mr-2 mb-2" name="materialCode" maxlength="10" value="<c:out value='${probe.materialCode}'/>" style="width:6rem">
      <input class="form-control form-control-sm mr-2 mb-2" name="thicknessMm" type="number" step="0.1" value="<jsp:getProperty name="probe" property="thicknessMm"/>" style="width:6rem">
      <input class="form-control form-control-sm mr-2 mb-2" name="quantity" type="number" value="<jsp:getProperty name="probe" property="quantity"/>" style="width:6rem">
      <button class="btn btn-sm btn-ps mb-2">Bind</button>
    </form>
    <p class="small mb-0">Bean now holds: material <strong><c:out value="${probe.materialCode}"/></strong>,
      thickness <strong>${probe.thicknessMm}</strong> mm, quantity <strong>${probe.quantity}</strong>
      (EL reads the same bean: <code>&#36;{probe.quantity}</code>).</p>
  </div></div>
</div>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
