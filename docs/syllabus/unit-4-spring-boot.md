# Unit IV — Spring Boot → `services/spring-api/`

PS Laser feature: the **main REST API** (port 8081) used by the React portal (Unit II) and the
Next.js site (Unit V): machine catalogue, laser-cutting estimates, saved quotes, work-order
tracking, staff work-order desk, JWT login, MySQL (JPA) + MongoDB (activity log), live
work-order updates over WebSocket.

Paths below are relative to `services/spring-api/`; `…/api/` = `src/main/java/in/pslaser/api/`.

## Topic map

| # | Syllabus topic | Where (file:line) | What it shows |
|---|---|---|---|
| 1 | **Spring Framework — IoC container** | `…/api/SpringApiApplication.java:16-17` | `@SpringBootApplication` component-scans `@Service`/`@Repository`/`@RestController` classes and registers them as beans in the IoC container. |
| 1 | Dependency Injection (constructor) | `…/api/service/EstimateService.java:39-46`, `…/api/web/QuoteController.java:24-27` | Beans receive collaborators through constructors; no `new` for services. |
| 1 | `@Bean` factory methods / Java config | `…/api/security/SecurityConfig.java:43-102`, `…/api/config/AsyncConfig.java:17-27`, `…/api/config/MongoConfig.java:15-20` | Security chain, `PasswordEncoder`, CORS source, thread pool, Mongo settings defined as beans. |
| 1 | AOP-based features (proxies) | `…/api/service/WorkOrderService.java:57,76,93` (`@Transactional`), `…/api/web/AdminWorkOrderController.java:26` (`@PreAuthorize`), `…/api/event/ActivityEventListener.java:40` (`@Async`) | Cross-cutting concerns applied by Spring proxies. |
| 2 | **Spring Boot framework** — auto-configuration, starters, embedded Tomcat | `pom.xml:12-17` (parent 3.5.16), `pom.xml:31-111` (starters) | Starters pull in MVC + Tomcat, JPA, Mongo, Security, Actuator; auto-config wires DataSource, EntityManager, MongoTemplate, Jackson. |
| 3 | **Installing Spring Boot** | `README.md` "Run (dev)"; project generated from start.spring.io (`mvnw`, `mvnw.cmd`, `.mvn/wrapper/`) | Only Java 21 is needed; the Maven Wrapper downloads Maven itself. |
| 4 | **Build tool — Maven** | `pom.xml` (whole file), `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties` | Dependencies, `spring-boot-maven-plugin` (`pom.xml:128-145`) for the fat jar + `build-info`; lifecycle `compile → test → package`. |
| 5 | **Core features** — externalised config & profiles | `src/main/resources/application.yml:13-14` (default profile `dev`), `application-dev.yml`, `application-mongo-embedded.yml`, `application-prod.yml`, `src/test/resources/application-test.yml` | `${ENV:default}` placeholders (`application.yml:17,48,52`) for DB, Mongo, JWT secret, CORS. |
| 5 | Type-safe `@ConfigurationProperties` | `…/api/config/PsLaserProperties.java:18-31`, bound from `application.yml:46-53` | `pslaser.jwt.*`, `pslaser.cors.allowed-origins`, validated with `@Validated` (secret ≥ 32 chars). |
| 5 | `CommandLineRunner` | `…/api/config/StartupLogger.java:14-41` | Logs port, profiles, machine/rate counts and CORS origins at startup. |
| 5 | Logging | `application.yml:85-94`, `application-dev.yml:12-16`; SLF4J loggers e.g. `…/api/activity/ActivityService.java:32-34` | Console + rolling file `logs/spring-api.log`, per-package levels per profile. |
| 6 | **Spring Security** — stateless JWT | `…/api/security/JwtService.java:36-56` (issue/verify HS256, claims `sub,email,role,exp`), `…/api/security/JwtAuthFilter.java:31-43`, `SecurityConfig.java:48,69` | `SessionCreationPolicy.STATELESS`; filter turns the Bearer token into `ROLE_ADMIN/STAFF/CUSTOMER`. |
| 6 | Password hashing (bcrypt `$2y$`) | `SecurityConfig.java:85-88` | `BCryptPasswordEncoder(BCryptVersion.$2Y)` verifies the Laravel-style seed hash and writes PHP-compatible hashes. |
| 6 | Role-based authorization | `SecurityConfig.java:51-63` (URL rules), `…/api/web/AdminController.java:16`, `AdminWorkOrderController.java:26` (`@PreAuthorize`) | Public catalogue/estimate/track; `/api/me/**` any JWT; `/api/admin/**` admin/staff; `/actuator/metrics` admin. |
| 6 | CSRF / CORS / JSON 401-403 | `SecurityConfig.java:28-38` (why CSRF is disabled), `:46`, `:90-102` (CORS for the 5 CONTRACT origins), `:64-68` | CSRF off because auth never uses cookies; CORS rejects other origins; errors in CONTRACT format. Password never returned (DTOs, `…/api/dto/AuthDtos.java`). |
| 7 | **Web applications** — REST controllers | `…/api/web/*Controller.java` (e.g. `QuoteController.java:29-40`, `AdminWorkOrderController.java:36-63`) | `@RestController`, `@GetMapping/@PostMapping/@PutMapping`, `@PathVariable`, `@RequestParam`, `@ResponseStatus(CREATED)`. |
| 7 | Layered architecture | controller → service → repository: `QuoteController` → `QuoteService`/`EstimateService` → `QuoteRepository`/`RateRepository` | Controllers hold no business logic; services own transactions. |
| 7 | DTOs (records) + Bean Validation | `…/api/dto/EstimateRequest.java:16-25`, `QuoteDtos.java:24-41`, `WorkOrderDtos.java:56-74`; `@Valid @RequestBody` at `QuoteController.java:31,38` | `@NotBlank`, `@Positive`, `@DecimalMax(3000)` (laser bed), `@Pattern` for phone/status. |
| 7 | Global error handling | `…/api/web/GlobalExceptionHandler.java:26-86` | `@RestControllerAdvice` → `{status,error,message,fieldErrors}`. |
| 8 | **JPA for database connectivity** — entities over existing tables | `…/api/domain/*.java` (`@Entity @Table`, e.g. `WorkOrder.java:20-21`), relationships `WorkOrder.java:50` (`@OneToMany`) ↔ `WorkOrderEvent.java:24` (`@ManyToOne`) | `ddl-auto: validate` (`application.yml:26`): Hibernate checks the mapping, never creates/alters shared tables. |
| 8 | Spring Data repositories — derived queries | `…/api/repository/MachineRepository.java:11-13`, `UserRepository.java`, `WorkOrderRepository.java:14-24` | `findAllByOrderBySortOrderAsc`, `findByOrderNoIgnoreCase` (+ `@EntityGraph`), `existsByEmailIgnoreCase`. |
| 8 | Custom `@Query` (JPQL) | `…/api/repository/RateRepository.java:16-21` (rate band `BETWEEN`), `QuoteRepository.java:15-16` | Rate lookup for the estimate formula; next quote number `PSL-Q-YYYYMMDD-####` (`QuoteService.java:68-74`). |
| 8 | `@Transactional` | `…/api/service/WorkOrderService.java:93-107` | Status update + `work_order_events` insert commit together; read-only transactions on query services. |
| 9 | **Working with SQL and NoSQL** | SQL: MariaDB via JPA (`application.yml:16-31`). NoSQL: `…/api/activity/ActivityLog.java:14` (`@Document`), `ActivityLogRepository.java:8` (`MongoRepository`), `ActivityService.java` | Relational shop data in MySQL; schema-less audit events (`details` map differs per type) in MongoDB `activity_log`; `GET /api/admin/activity`. |
| 9 | Resilience when NoSQL is down | `ActivityService.java:28-49`, `…/api/config/MongoConfig.java:15-20`, `application-mongo-embedded.yml` | 2 s server-selection timeout; writes skipped with a warning; activity endpoint answers 503; optional embedded mongod (flapdoodle) when Docker is unavailable. |
| 10 | **Messaging** — application events | `…/api/event/DomainEvents.java`, publishers `WorkOrderService.java:70,104`, `AuthService.java:40-44`, `EstimateService.java:50` | `ApplicationEventPublisher` decouples features from the audit log. |
| 10 | Async listeners + STOMP/WebSocket | `…/api/event/ActivityEventListener.java:40-89` (`@Async @EventListener`, `@TransactionalEventListener(AFTER_COMMIT)`, `convertAndSend("/topic/work-orders")`), `…/api/config/WebSocketConfig.java:18-38` | Staff dashboards subscribe to `/topic/work-orders` on `ws://localhost:8081/ws` and update live. |
| 11 | **Testing** — unit (JUnit 5 + Mockito) | `src/test/java/in/pslaser/api/service/EstimateServiceTest.java:39-150` | Mocked repositories; reference case `:77-88` (total 2933.83), hand calculation `:107-123`, band-gap 400 `:91-97`. |
| 11 | Web slice test | `src/test/java/in/pslaser/api/web/QuoteControllerWebMvcTest.java:28-82` | `@WebMvcTest` + `@MockitoBean`; JSON shape and 400 `fieldErrors`. |
| 11 | Integration test | `src/test/java/in/pslaser/api/integration/AuthFlowIntegrationTest.java:39-192` | `@SpringBootTest` + MockMvc on H2 (MySQL mode, `src/test/resources/schema-h2.sql`): 401 → login → 200, 403 for customers, transactional event row, CORS, `$2y$` hashes. |
| 12 | **Deploying** | `pom.xml:124-145` (`target/spring-api.jar`), `Dockerfile:7-27` (multi-stage JDK→JRE, non-root), `application-prod.yml`, `README.md` "Deploy" | `java -jar`, Docker image, all settings via env vars. |
| 13 | **Monitoring** (and testing in production) | `application.yml:55-77` (exposure, probes), `…/api/monitoring/RateCardHealthIndicator.java:16-44`, `pom.xml:141` (build-info) | `/actuator/health` (db, mongo, diskSpace, custom `rateCard`, liveness/readiness), `/actuator/info`, `/actuator/metrics` (admin). |
| 14 | **Postman for API testing** | `postman/PSLaser.postman_collection.json`, `postman/PSLaser-localhost.postman_environment.json` | 32 requests in 7 folders with `pm.test` scripts (status codes, totals, quote-number regex); login saves `adminToken` to the environment. |

## How to run and test

```bash
# 1. database (once)
mysql -uroot < services/db/schema.sql && mysql -uroot pslaser < services/db/seed.sql
# 2. MongoDB: Docker ...
docker run -d --name pslaser-mongo -p 27017:27017 mongo:7
cd services/spring-api
mvnw.cmd spring-boot:run
#    ... or without Docker (embedded mongod, downloaded once):
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev,mongo-embedded
# 3. tests (H2, no MySQL/Mongo needed)
mvnw.cmd test
# 4. jar / Docker
mvnw.cmd package && java -jar target/spring-api.jar
docker build -t pslaser/spring-api .
```

Quick checks:

```bash
curl http://localhost:8081/api/machines
curl -X POST http://localhost:8081/api/quotes/estimate -H "Content-Type: application/json" \
  -d '{"materialCode":"MS","thicknessMm":2,"lengthMm":500,"widthMm":300,"cutLengthMm":1600,"pierces":4,"bends":2,"powderCoat":true,"quantity":10}'
#   -> perPart 248.63, subtotal 2486.30, gst 447.53, total 2933.83, isSample true
curl "http://localhost:8081/api/work-orders/track?orderNo=PSL-DEMO-001&phone=9000000001"
curl -i http://localhost:8081/api/admin/work-orders          # 401
curl -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@pslaser.local","password":"<see services/db/SEED_CREDENTIALS.md>"}'
curl http://localhost:8081/api/admin/activity -H "Authorization: Bearer <token>"
curl http://localhost:8081/actuator/health
```

Postman: import both files from `postman/`, fill `adminPassword` in the environment, run the
collection top to bottom.
