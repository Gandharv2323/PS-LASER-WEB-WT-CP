# Deploying PS Laser to pslaser.online

Status: **prepared, not yet built or run.** The compose file passes `docker compose config`, the shell scripts pass
a syntax check, and Laravel's 8 tests still pass after the one code change listed below. No image has been built
(the Docker engine was not running on the development PC), so expect to fix small problems on the first build.

## What gets deployed

| Address | Service | Public? |
|---|---|---|
| `https://pslaser.online` (and `www`) | Next.js website | yes |
| `https://admin.pslaser.online` | Laravel staff back office | yes (login only) |
| `https://api.pslaser.online` | Spring WebSocket path `/ws` only (live dashboard) | yes, nothing else |
| Spring REST API, Node API, MySQL (MariaDB 10.11), MongoDB | private compose network | **no** |

Not included (college demos, optional later): PHP estimator, Servlet/JSP on Tomcat, React portal.

## One-time setup

1. **Server.** Linux VPS, 2 vCPU / 4 GB RAM or more (estimate, not benchmarked), with Docker + Compose plugin installed, ports 80 and 443 open.
2. **DNS** (at the domain registrar): A records for `pslaser.online`, `www`, `admin` and `api`, all pointing to the server's IP. Wait until `nslookup pslaser.online` shows that IP; Caddy cannot get HTTPS certificates before that.
3. **Secrets.** `cd deploy && cp .env.example .env`, then generate and paste the values (commands are in the file). Never commit `.env`.
4. **Start.** `docker compose up -d --build` (first build takes several minutes). Watch with `docker compose logs -f`.
5. **Create the real admin.** `./create-admin.sh "Owner Name" owner@example.com` (types the password silently). The seeded local admin account is deleted automatically on first start, so until this step nobody can log in to the back office.
6. **Check:** open `https://pslaser.online`, `/quote` (should say live materials, not "Offline estimate"), `/track`, and `https://admin.pslaser.online`.

## Before customers use it (decisions for the owner)

- **Rates are SAMPLE data.** Log in to the admin panel, open the rate card, enter real prices and set `rates_are_sample` to 0 (settings table). Until then every estimate is only illustrative. Option: hide the price on the public site until real rates exist.
- **Backups.** Daily dump, for example from cron:
  `docker compose exec -T -e MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql mariadb-dump -uroot --default-character-set=utf8mb4 pslaser > backup-$(date +%F).sql` and copy it off the server.
- **Updates.** `git pull && docker compose up -d --build`. The database volume is kept.
- Consider restricting `admin.pslaser.online` to the shop's IP addresses in the Caddyfile.

## Changes made to the project for deployment

- `services/laravel-admin/bootstrap/app.php`: `trustProxies(at: '*')` so Laravel generates https URLs behind Caddy.
- New files: `deploy/` (compose, Caddyfile, env example, web Dockerfile, SQL cleanup, `create-admin.sh`), `services/node-api/Dockerfile`, `services/laravel-admin/Dockerfile` + entrypoint, two `.dockerignore` files. The root `.dockerignore` now also excludes `services` and `deploy`.

## Known risks and limits

- Images are unbuilt and untested; MariaDB 10.11 differs from the 10.4 used in development.
- The Spring dev default JWT secret exists in code; compose refuses to start unless `JWT_SECRET` is set in `.env`.
- MongoDB has no password but is reachable only inside the private network.
- Product and gallery pictures are representative renders, not photos of finished jobs (see handbook §16).
- No e-mail/SMS, no payment; an enquiry is a database row plus a WhatsApp link.
