#!/bin/sh
# Runs Laravel's own framework migrations (sessions, cache, jobs, admin_audit_logs) then starts Apache.
# The shared business tables are owned by services/db/schema.sql and are never touched by these migrations.
set -e
chown -R www-data:www-data storage bootstrap/cache
php artisan migrate --force
php artisan config:cache
php artisan route:cache
exec "$@"
