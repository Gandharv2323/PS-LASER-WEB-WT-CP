# PS Laser Web Platform

Web platform for **PS Laser**, a sheet-metal and CNC laser-cutting job shop (Velu, Bhor, Pune), built as the CS3111 *Web Technologies* project at Vishwakarma Institute of Technology, Pune.

One business, seven cooperating services over one shared MySQL schema. Each service covers a unit of the syllabus.

| Unit | Service | Folder | Port |
|---|---|---|---|
| I | PHP Estimator Application | `services/php-estimator` | 8000 |
| I | Laravel Admin Application | `services/laravel-admin` | 8001 |
| II | React Portal Application (Redux Toolkit) | `services/react-portal` | 5173 |
| III | Servlet/JSP Desk Application | `services/servlet-jsp` | 8080 |
| IV | Spring Boot Core API | `services/spring-api` | 8081 |
| V | Next.js Web Application (TypeScript) | `src/` | 3001 |
| VI | Node.js Enquiry API | `services/node-api` | 4000 |

Data stores: MySQL/MariaDB database `pslaser` and a MongoDB activity log.

## Features

- Indicative cost estimate (one formula, identical in PHP, Java, TypeScript)
- Enquiry capture with drawing upload
- Order tracking through seven stages and live status push (STOMP)
- Role-based administration of rates, catalogue, enquiries and work orders

Estimator rates are **sample data** (`rates.is_sample = 1`).

## Run locally (Windows)

Start order: MySQL, Spring Boot, Node.js, Next.js, then the others. Full commands are in [docs/handbook/WEBSITE_USER_HANDBOOK.md](docs/handbook/WEBSITE_USER_HANDBOOK.md) (sections 4, 5 and 11).

```
C:\xampp\mysql_start.bat
cd services/spring-api && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev,mongo-embedded
cd services/node-api && npm start
npm install && npm run dev -- -p 3001
```

## Documentation

- [docs/SYLLABUS-MAPPING.md](docs/SYLLABUS-MAPPING.md): every syllabus topic mapped to code
- [services/CONTRACT.md](services/CONTRACT.md): shared schema, JWT, price formula, API shapes
- [docs/submission/](docs/submission/): IEEE paper and system requirements document
- [docs/ppt/](docs/ppt/): presentation content, DFDs and screenshots
- [deploy/DEPLOY.md](deploy/DEPLOY.md): Docker and Caddy kit (prepared, not deployed)
- `legacy-vite-react/`: earlier Vite + React version of the site

## License

MIT (see `LICENSE`).
