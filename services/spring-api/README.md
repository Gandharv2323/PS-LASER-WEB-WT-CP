# PS Laser — Spring Boot API (CS3111 Unit IV)

Main REST API of the PS Laser project (sheet-metal / CNC laser job shop, Pune): machine
catalogue, laser-cutting estimates, saved quotes, work-order tracking, JWT auth, MySQL via JPA
and a MongoDB activity log. Implements `services/CONTRACT.md` exactly. Port **8081**.

Stack: Spring Boot 3.5.16 (latest 3.x line), Java 21, Maven Wrapper, Spring MVC, Spring Data JPA
(Hibernate, MariaDB driver), Spring Data MongoDB, Spring Security + jjwt (HS256), Bean Validation,
STOMP WebSocket, Actuator, JUnit 5 / Mockito / MockMvc / H2.

> `start.spring.io` now only generates Spring Boot 4.x projects. The Maven wrapper and the
> dependency list came from it; `pom.xml` was then pinned to the 3.x parent `3.5.16` because the
> CONTRACT specifies Spring Boot 3.

## Run (dev)

Prerequisites: Java 21, MySQL/MariaDB with the `pslaser` database (`services/db/schema.sql` + `seed.sql`).

```bash
cd services/spring-api
# MongoDB, option A - Docker:
docker run -d --name pslaser-mongo -p 27017:27017 mongo:7
mvnw.cmd spring-boot:run                                          # Windows (./mvnw on Linux/macOS)

# MongoDB, option B - no Docker: embedded mongod (downloaded once to ~/.embedmongo, ~100 MB)
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev,mongo-embedded
```

If MongoDB is not reachable at all, the API still works: activity-log writes are skipped with a
warning in the log, `GET /api/admin/activity` answers `503`, and `/actuator/health` reports
`mongo: DOWN` (set `MONGO_HEALTH_ENABLED=false` to leave it out of the aggregate).
The embedded MongoDB keeps its data only while the app runs.

Seed admin: see `services/db/SEED_CREDENTIALS.md`.

## Endpoints (base `http://localhost:8081`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/login` | public | `{email,password}` → `{token, user:{id,name,email,role}}` |
| POST | `/api/auth/register` | public | `{name,email,phone,password}` → 201 customer + token |
| GET | `/api/machines`, `/api/machines/{slug}` | public | `specs` is split into a string array |
| GET | `/api/services`, `/api/materials` | public | |
| POST | `/api/quotes/estimate` | public | CONTRACT estimate JSON, not saved |
| POST | `/api/quotes` | public | + `customerName`, `customerPhone` → 201 with `quoteNo` `PSL-Q-YYYYMMDD-####` |
| GET | `/api/work-orders/track?orderNo=&phone=` | public | phone must match (last 10 digits), phone masked in reply |
| GET | `/api/me`, `/api/me/quotes` | JWT | quotes matched by the account's phone |
| GET/POST | `/api/admin/work-orders` | JWT admin/staff | `?status=` filter; POST creates (order no `PSL-WO-YYYYMMDD-###` if omitted) |
| GET/PUT | `/api/admin/work-orders/{id}` | JWT admin/staff | PUT with a new `status` adds a history row |
| POST | `/api/admin/work-orders/{id}/events` | JWT admin/staff | `{status,note}` — @Transactional update + `work_order_events` insert |
| GET | `/api/admin/enquiries` | JWT admin/staff | `?status=` |
| GET | `/api/admin/activity` | JWT admin/staff | MongoDB, `?type=LOGIN&limit=50` |
| GET | `/actuator/health`, `/actuator/info` | public | health includes custom `rateCard` |
| GET | `/actuator/metrics`, `/actuator/env`, `/actuator/loggers` | JWT admin | |
| WS | `/ws` (STOMP), `/ws-sockjs` (SockJS) | public | subscribe `/topic/work-orders` |

Errors: `{ "status", "error", "message", "fieldErrors"? }`. JWT: HS256, claims `sub` (user id),
`email`, `role`, `exp` (8 h), secret `JWT_SECRET` — the Node API verifies the same tokens.

Estimate rounding (shared by all estimators): each breakdown line rounded to 2 dp HALF_UP,
`perPart` = sum of rounded lines, `subtotal` and `gst` rounded, `total = subtotal + gst`.
Reference: MS 2 mm, 500×300, cut 1600 mm, 4 pierces, 2 bends, powder coat, qty 10 → 248.63 /
2486.30 / 447.53 / **2933.83**. A thickness between rate bands (e.g. 3.005 mm) → 400 "No rate band".

## Live work-order updates (messaging)

`WorkOrderService` publishes a `WorkOrderStatusChanged` application event inside the
transaction; `ActivityEventListener` (`@Async` + `@TransactionalEventListener(AFTER_COMMIT)`)
writes a MongoDB `activity_log` document and pushes the change to STOMP topic
`/topic/work-orders`. Browser example (`@stomp/stompjs`):

```js
const client = new Client({ brokerURL: "ws://localhost:8081/ws" });
client.onConnect = () => client.subscribe("/topic/work-orders", m => console.log(JSON.parse(m.body)));
client.activate();
```

## Configuration (environment variables)

| Variable | Default | Purpose |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` | `dev`, `dev,mongo-embedded`, `prod` |
| `PORT` | `8081` | HTTP port |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | `localhost` `3306` `pslaser` `root` *(empty)* | MySQL/MariaDB |
| `MONGO_HOST` `MONGO_PORT` `MONGO_DB` | `localhost` `27017` `pslaser` | MongoDB |
| `JWT_SECRET` | CONTRACT dev secret | HS256 key, ≥ 32 bytes — **change in production** |
| `JWT_EXPIRY_HOURS` | `8` | token lifetime |
| `CORS_ORIGINS` | the 5 CONTRACT origins | comma-separated |
| `LOG_FILE` | `logs/spring-api.log` | rolling log file |
| `MONGO_HEALTH_ENABLED` | `true` | include Mongo in `/actuator/health` |

Hibernate runs with `ddl-auto: validate`: it checks the entities against the shared tables and
never creates, alters or drops them.

## Test

```bash
mvnw.cmd test
```

15 tests: `EstimateServiceTest` (JUnit 5 + Mockito, hand-calculated cases), `QuoteControllerWebMvcTest`
(`@WebMvcTest` slice), `AuthFlowIntegrationTest` (`@SpringBootTest` + MockMvc: login → protected
endpoints, 401/403, transactional status change, CORS, `$2y$` bcrypt). The integration test uses
an in-memory **H2 database in MySQL mode** (`src/test/resources/schema-h2.sql`, adapted from
`services/db/schema.sql`) — chosen over Testcontainers (needs Docker, slow) and over the local
MySQL (tests would modify shared data). The MongoDB repository is mocked there.

Postman: import `postman/PSLaser.postman_collection.json` + `postman/PSLaser-localhost.postman_environment.json`,
set `adminPassword` in the environment, run the collection (32 requests with test scripts; the login
request stores `adminToken`). CLI: `npx newman run postman/PSLaser.postman_collection.json -e postman/PSLaser-localhost.postman_environment.json --env-var adminPassword=...`.
The register / save-quote / create-work-order requests add test rows — delete them afterwards.

## Deploy

**Executable jar**

```bash
mvnw.cmd package                 # runs the tests, writes target/spring-api.jar (Tomcat embedded)
java -jar target/spring-api.jar --spring.profiles.active=prod
```

**Docker** (multi-stage `Dockerfile`: JDK build stage → JRE runtime, non-root user)

```bash
docker build -t pslaser/spring-api services/spring-api
docker run -d -p 8081:8081 -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=host.docker.internal -e MONGO_HOST=host.docker.internal \
  -e JWT_SECRET=change-me-to-a-long-random-secret-0123456789 pslaser/spring-api
```

## Monitoring

- `GET /actuator/health` — `db`, `mongo`, `diskSpace`, custom `rateCard` (DOWN if the MySQL rate card is empty), `livenessState`/`readinessState` (`/actuator/health/liveness`, `/readiness` for container probes).
- `GET /actuator/info` — app info + build info (`build-info` goal) + Java/OS.
- `GET /actuator/metrics/http.server.requests`, `jvm.memory.used`, `hikaricp.connections.active`, … (admin JWT).
- Logs: console + rolling `logs/spring-api.log`; `in.pslaser` at DEBUG in `dev`, INFO in `prod`; change at runtime via `POST /actuator/loggers/in.pslaser` (admin).
