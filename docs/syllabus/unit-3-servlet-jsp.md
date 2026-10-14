# Unit III: Server-side technologies (Java Servlets and JSP)

**Feature:** PS Laser Order Desk. Customers track a job, get an estimate, and staff move work
orders through the shop.
**Code:** `services/servlet-jsp/` (Tomcat 8.5, `javax.servlet` 3.1, JSP 2.3, JSTL 1.2, MySQL `pslaser`).
**URL:** http://localhost:8080/pslaser/

Path prefixes used below:
- `J/` = `services/servlet-jsp/src/main/java/com/pslaser/desk/`
- `W/` = `services/servlet-jsp/src/main/webapp/`

## How to run

1. Start MySQL and load the shared DB if it is not loaded yet: `mysql -uroot < services/db/schema.sql && mysql -uroot pslaser < services/db/seed.sql`
2. `cd services/servlet-jsp && bash build.sh deploy` (or `build.bat deploy`). This compiles against Tomcat's jars, packages `target/pslaser.war` and copies it to `C:\xampp\tomcat\webapps\`.
3. Start Tomcat: set `JAVA_HOME` to the JDK, then run `C:\xampp\tomcat\bin\startup.bat` (or use the XAMPP panel). Open http://localhost:8080/pslaser/
4. Staff login: the seed admin in `services/db/SEED_CREDENTIALS.md`. Tracking demo: `PSL-DEMO-001` with `9000000001`.

## Servlet topics

| Syllabus topic | Where | What it shows |
|---|---|---|
| Servlet architecture overview | `J/web/HelloServlet.java:15-27` (comment diagram), `W/WEB-INF/web.xml:72-79`, `README.md` | Request path: Connector, Engine/Host, Context, filter chain, `service()`, `doGet()`. One servlet instance serves many threads. Servlets are registered both in web.xml and with `@WebServlet`. |
| A "Hello World" servlet | `J/web/HelloServlet.java:28-105`; mapped at `W/WEB-INF/web.xml:72-79` | `/hello` greets "Hello, World!" (or `?name=Shinde&lang=mr`) |
| Servlets generating dynamic content | `J/web/HelloServlet.java:32-87` | HTML written through `response.getWriter()`, including the current time, request info, headers and parameters, with HTML escaping (`esc()`, line 90) |
| Servlet life cycle | `J/web/LifecycleServlet.java:38-89`; `W/WEB-INF/web.xml:81-93` | Constructor (38), `init(ServletConfig)` (43), overridden `service()` (57), `doGet` (64), `destroy()` (77). `load-on-startup` (web.xml:88) runs `init()` at deploy time. Page: `/lifecycle` |
| Parameter data | `J/web/TrackServlet.java:43-77`, `J/web/StaffOrdersServlet.java:35`, `J/web/StaffNewOrderServlet.java:55-95`, `J/web/EstimateServlet.java:43-56` | `getParameter`; `getParameterValues("status")` for the multi-checkbox filter (`W/WEB-INF/views/staff/orders.jsp:26`); type conversion; regex and range validation; errors shown per field; 422 on invalid input |
| Sessions | `J/web/LoginServlet.java:52-98`, `J/web/LogoutServlet.java:21-35`, `J/filter/AuthFilter.java:32-54`, `W/WEB-INF/web.xml:96-103` | `getSession(true)`, `changeSessionId()` (82, guards against session fixation), user bean and CSRF token in the session, `invalidate()` on logout, `getSession(false)` in the filter, `session-timeout` of 30 minutes |
| Cookies | `J/web/LoginServlet.java:89-93`, `J/web/TrackServlet.java:65-69,81-86`, `W/WEB-INF/views/about.jsp:37` | "Remember my e-mail" cookie (30 days, or `maxAge 0` to delete it), last tracked order cookie, reading `request.getCookies()`, and EL `${cookie}` |
| URL rewriting | `J/web/SessionDemoServlet.java:28-49`, `J/filter/AuthFilter.java:53-54`, `J/web/LoginServlet.java:97`, `W/WEB-INF/web.xml:101-102` | `response.encodeURL` / `encodeRedirectURL` and `<c:url>` add `;jsessionid=` for clients that send no cookies. `/session-demo` shows `isRequestedSessionIdFromURL()`, verified with curl without a cookie jar |
| Other servlet capabilities | `J/web/DispatchDemoServlet.java:27-63`, `W/WEB-INF/web.xml:15-34,41-68,119-134`, `J/web/StaffOrderServlet.java:54-83`, `J/web/Flash.java` | `RequestDispatcher.forward` (31) and `.include` (49, 54); `sendRedirect` (35); `sendError(404)` (40); a thrown exception goes to the 500 page; context-params and init-params; filters; error pages; Post/Redirect/Get with a session flash message; JSON output (`EstimateServlet ?format=json`) |
| Data storage | `J/listener/AppContextListener.java:29-41`, `J/web/AboutServlet.java:30-57`, `J/util/AppLog.java:33-58`, `J/dao/*` | Database (MySQL), ServletContext attributes (pool, counters, start time), session attributes, request attributes, cookies, and a file store (`getRealPath("/WEB-INF/logs")`, falling back to `ServletContext.TEMPDIR`). Page: `/about` |
| Servlet concurrency | `J/web/ConcurrencyServlet.java:16-110`, `J/filter/RequestLogFilter.java:32`, `J/listener/SessionCounterListener.java:20-31`, `J/util/AppLog.java:49` | A deliberately unsafe `long` field (42) next to an `AtomicLong` (43). A race test (`runBurst`, 80) runs 32 threads x 2000 increments; in a verified run 64000 were expected, the AtomicLong reached 64000 and the plain field only 3504. Also covers why `SingleThreadModel` is deprecated, an async servlet (`startAsync`, 53, `asyncSupported=true`), and `synchronized` file writes |
| Databases (MySQL) and Java servlets | `J/dao/Db.java:31-98`, `J/dao/WorkOrderDAO.java:30-160`, `J/dao/UserDAO.java:22-55`, `J/dao/RateDAO.java:44-66` | Optional JNDI lookup (33), otherwise a Tomcat JDBC pool (48) stored in the ServletContext. Only `PreparedStatement`. A transaction with `setAutoCommit(false)`, `commit` and `rollback` for status changes (89-122) and creates (`RETURN_GENERATED_KEYS`, 134). `$2y$` to `$2a$` bcrypt conversion (UserDAO:36). Rate band lookup with `BETWEEN` (RateDAO:50). The driver is unregistered on undeploy (Db:70-85) |

## JSP topics

| Syllabus topic | Where | What it shows |
|---|---|---|
| Introduction to Java Server Pages | `W/basics.jsp:1-14`, `W/index.jsp` | A JSP is HTML plus JSP elements. Jasper translates it into a servlet (`work/Catalina/localhost/pslaser/org/apache/jsp/*_jsp.java`) and compiles it |
| JSP and servlets | `J/web/TrackServlet.java:64,76`, `W/WEB-INF/views/track.jsp`, `W/basics.jsp:26` (`jspInit`) | Servlets prepare data and forward to JSPs. A JSP is itself a servlet with its own life cycle (`jspInit`, `_jspService`, `jspDestroy`) |
| Running JSP applications | `services/servlet-jsp/build.sh`, `build.bat`, `README.md`, `W/WEB-INF/web.xml:106-117` | WAR layout (`WEB-INF/classes`, `lib`, `web.xml`), deployment to Tomcat `webapps/`, `jsp-config` (UTF-8, trimmed whitespace), welcome file |
| Basic JSP | `W/basics.jsp` | Directives (`page` with `import` (15), `taglib` (16), `include` (31)); declaration `<%! %>` (17-29); scriptlet `<% %>` (32-38); expressions `<%= %>` (41, 48-55); a loop in a scriptlet (65-67); all implicit objects (`request`, `response`, `session`, `application`, `config`, `pageContext`, `out`, `page`, lines 46-56; `exception` in `W/WEB-INF/views/error/500.jsp:4-10`); JSP comments |
| JavaBeans classes and JSP | `J/model/WorkOrder.java`, `J/model/EstimateRequest.java`, `W/WEB-INF/views/track.jsp:46-60`, `W/basics.jsp:76-88`, `W/WEB-INF/views/fragments/shop-clock.jsp:5` | Beans with a no-arg constructor, getters and setters, and `Serializable`. `<jsp:useBean scope="request">` finds the bean the controller stored; `<jsp:getProperty>`; `<jsp:setProperty property="*">` binds request parameters automatically; EL reads computed properties (`stageIndex`, `maskedPhone`) |
| Support for the Model-View-Controller paradigm | `J/web/*Servlet.java` (controllers), `W/WEB-INF/views/**` (views), `J/model`, `J/service/EstimateService.java`, `J/dao` (model) | Views live under `WEB-INF`, so they are reachable only through a controller forward. Requests flow controller, then service/DAO, then bean in request scope, then a scriptlet-free JSP |
| JSP-related technologies: JSTL and EL | `W/WEB-INF/views/track.jsp:43-101`, `W/WEB-INF/views/staff/orders.jsp`, `W/WEB-INF/views/estimate.jsp`, `W/index.jsp:35` | `c:if`, `c:choose`, `c:forEach` with `varStatus`, `c:out` (escaping), `c:url` with `c:param`, `c:set`, `fmt:formatDate`, `fmt:formatNumber`, `fmt:setLocale`, `fn:length`. EL implicit objects `param`, `sessionScope`, `applicationScope`, `initParam`, `cookie`, `pageContext`, `requestScope['javax.servlet.error.*']`; EL 3.0 list literals and method calls |
| Custom tags | `J/tags/StatusBadgeTag.java:14-40`, `W/WEB-INF/ps.tld:12-27`, used in `track.jsp:55,83`, `staff/orders.jsp:60`, `staff/order.jsp:18,33` | `<ps:statusBadge status="..." size="lg"/>` is a `SimpleTagSupport` with attribute setters and `doTag()`, described in the TLD |
| Filters | `J/filter/EncodingFilter.java`, `J/filter/RequestLogFilter.java`, `J/filter/AuthFilter.java`; mappings at `W/WEB-INF/web.xml:41-68` | A UTF-8 filter with an init-param, a request counter and logger (code before and after `chain.doFilter`), and a login and CSRF guard on `/staff/*`. Order follows the `filter-mapping` order. All are async-supported |
| Listeners | `J/listener/AppContextListener.java` (web.xml:36-38), `J/listener/SessionCounterListener.java` (`@WebListener`) | `ServletContextListener` sets up and tears down the pool, log and counters. `HttpSessionListener` keeps the active-session count shown in the navbar and on `/session-demo` |
| Static vs dynamic include | `W/WEB-INF/views/fragments/header.jspf` (`<%@ include %>`), `W/WEB-INF/views/fragments/footer.jsp` (`<jsp:include>`) | Translation-time include for the header; request-time include for the footer |
| Error pages | `W/WEB-INF/web.xml:119-134`, `W/WEB-INF/views/error/404.jsp`, `403.jsp`, `500.jsp` | `isErrorPage="true"`, the `exception` object, and logging with `application.log` |

## Estimate (shared CONTRACT formula)

`J/service/EstimateService.java` implements `services/CONTRACT.md`: validation (33-53, including
the laser bed limits and "No rate band for this thickness", e.g. for 3.005 mm), then steps 2-12
(56-107). Each breakdown line is rounded to 2 dp (HALF_UP), `perPart` is the sum of the rounded
lines, `subtotal` and `gst` are rounded to 2 dp, and `total = subtotal + gst`.
Reference case: MS 2 mm, 500 x 300, cut length 1600, 4 pierces, 2 bends, powder coat, qty 10.
That gives material 176.63 + cutting 16.00 + piercing 4.00 + bending 16.00 + coating 36.00 =
**perPart 248.63**, **subtotal 2486.30**, **GST 447.53**, **total 2933.83**. This matches the
calculation by hand and the PHP unit.

## Verification (curl, run on 14 Oct 2026)

| Check | Result |
|---|---|
| `GET /pslaser/hello` | 200 |
| Track `PSL-DEMO-001` / `9000000001` | Timeline with 3 events, current stage "bending" |
| Same order, wrong phone | "We could not find an order..." (no data leaked) |
| `GET /staff/orders` without a session | 302 to `/login?next=%2Fstaff%2Forders` |
| Login with a wrong password | 401 |
| Login with the seed admin (cookie jar) | 303 to `/staff/orders`, with `JSESSIONID` (HttpOnly) and the `ps_staff_email` cookie set |
| Staff POST without the CSRF token | 403 |
| `PSL-DEMO-002`: inspection to dispatched, then back to inspection | Both 302 (PRG). DB status is back to `inspection`; the test event rows were removed afterwards |
| Create work order: invalid, then valid | 422 with field errors, then 302. Trackable by the customer; the test row was deleted afterwards |
| Logout, then `/staff/orders` | 302 to login; the e-mail cookie is kept |
| `GET /pslaser/nope` | 404, custom page |
| `/dispatch?mode=error` | 500, custom page, cause logged |
| `/session-demo` without cookies, following the `;jsessionid=` link | count = 2, `fromUrl = true` |
| `/concurrency?burst=1` | Expected 64000; AtomicLong 64000; plain field 3504 |
| Estimate reference case (JSON + HTML) | 2933.83 |
| Pages at 375 px and 1440 px | No horizontal overflow; standards mode |
| Tomcat logs after redeploy | No SEVERE or leak warnings (only the deliberate `/dispatch?mode=error` exception) |
