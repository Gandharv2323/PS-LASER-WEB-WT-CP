# PS Laser Order Desk (Java Servlets + JSP)

Unit III of the CS3111 project. Customer order tracking, a laser-cutting estimate, and a staff
desk for moving work orders through the shop. It runs on XAMPP's Apache Tomcat 8.5
(`javax.servlet` 3.1 / JSP 2.3) against the shared MySQL database `pslaser`.

**URL:** http://localhost:8080/pslaser/

| Path | What it is |
|---|---|
| `/` | Home page with links to every feature |
| `/track` | Customer tracking: order number + mobile, then a status timeline (try `PSL-DEMO-001` / `9000000001`) |
| `/estimate` | Price estimate using the CONTRACT formula and the shared `rates` table (`POST /estimate?format=json` returns the CONTRACT JSON) |
| `/login`, `/logout` | Staff login (shared `users` table, bcrypt), HttpSession, "remember my e-mail" cookie |
| `/staff/orders` | Work-order list with a status filter (multi-value parameter) and search; protected by `AuthFilter` |
| `/staff/order?no=...` | Order detail; status change runs as one JDBC transaction, followed by Post/Redirect/Get |
| `/staff/orders/new` | Create a work order (server-side validation, PRG) |
| `/hello` | Hello World servlet that prints request info |
| `/lifecycle` | Servlet life cycle (constructor, init, service, destroy), init-params, load-on-startup |
| `/concurrency` | Unsafe field vs `AtomicLong`, a live race test (`?burst=1`), async servlet (`?async=1`) |
| `/session-demo` | Session visit counter and URL rewriting (`;jsessionid=`) |
| `/dispatch` | `include` / `forward` / `sendRedirect`, plus the 404 and 500 error pages |
| `/basics.jsp` | Classic JSP: directives, declarations, scriptlets, expressions, implicit objects, `jsp:setProperty property="*"` |
| `/about` | Data storage: ServletContext, session, cookies, DB and the file log |

## Structure (MVC)

```
src/main/java/com/pslaser/desk/
  model/      JavaBeans: WorkOrder, WorkOrderEvent, User, Material, Rate, EstimateRequest, EstimateResult
  dao/        Db (JDBC pool), WorkOrderDAO, UserDAO, RateDAO   (PreparedStatement only)
  service/    EstimateService (CONTRACT price formula)
  web/        Servlets = controllers
  filter/     EncodingFilter, RequestLogFilter, AuthFilter
  listener/   AppContextListener (ServletContextListener), SessionCounterListener (HttpSessionListener)
  tags/       StatusBadgeTag (SimpleTagSupport), declared in WEB-INF/ps.tld
  util/       AppLog (file store)
src/main/webapp/
  WEB-INF/web.xml         servlets, filters, listener, context/init params, session config, error pages
  WEB-INF/views/**.jsp    views (not reachable directly, only through a controller forward)
  index.jsp, basics.jsp   public JSPs
  META-INF/context.xml    optional JNDI DataSource (commented out)
```

## Prerequisites

- JDK 17+ on PATH (built and tested with Temurin 21). Classes are compiled with `--release 8`
  because Tomcat 8.5's bundled JSP compiler (ECJ 4.6) has to read them.
- XAMPP with Tomcat 8.5 at `C:\xampp\tomcat` (or set `CATALINA_HOME`).
- MySQL/MariaDB on `localhost:3306` with the shared schema:
  `mysql -uroot < services/db/schema.sql && mysql -uroot pslaser < services/db/seed.sql`
- DB settings come from env vars `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`, then from
  the web.xml context-params, then from the XAMPP defaults (root, no password).

## Build and deploy (no Maven needed)

```bash
# 1. dependencies: MySQL Connector/J 8.4.0, JSTL 1.2, jBCrypt 0.4, downloaded from Maven Central
#    with SHA-1 verification (already present in WEB-INF/lib)
bash scripts/fetch-libs.sh

# 2. compile and package target/pslaser.war, then copy it to Tomcat's webapps/
bash build.sh deploy          # Git Bash / Linux / macOS
build.bat deploy              # Windows cmd
```

Start Tomcat (it auto-deploys `webapps/pslaser.war`, and redeploys it when the file changes):

```powershell
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot'   # your JDK
C:\xampp\tomcat\bin\startup.bat        # or C:\xampp\catalina_start.bat, or the XAMPP control panel
```

Stop it with `C:\xampp\tomcat\bin\shutdown.bat`. Logs: `C:\xampp\tomcat\logs\catalina.*.log`
and `localhost.*.log`. The app log is at `webapps\pslaser\WEB-INF\logs\order-desk.log`
(shown on `/about`).

## Staff login

Use the seed admin from `services/db/SEED_CREDENTIALS.md` (test values only). Passwords are
Laravel `$2y$` bcrypt hashes; `UserDAO` swaps the prefix to `$2a$` for jBCrypt.

## Quick checks with curl

```bash
B=http://localhost:8080/pslaser
curl -i $B/hello
curl -s -X POST -d "orderNo=PSL-DEMO-001&phone=9000000001" $B/track | grep -i "cut on"
curl -i $B/staff/orders                         # 302 to /login (AuthFilter)
curl -s -X POST "$B/estimate?format=json" \
  -d "materialCode=MS&thicknessMm=2&lengthMm=500&widthMm=300&cutLengthMm=1600&pierces=4&bends=2&powderCoat=on&quantity=10"
# -> perPart 248.63, subtotal 2486.30, gst 447.53, total 2933.83
```

The syllabus mapping is in `docs/syllabus/unit-3-servlet-jsp.md`.
