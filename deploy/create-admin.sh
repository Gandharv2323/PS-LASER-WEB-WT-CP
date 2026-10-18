#!/bin/sh
# Creates (or replaces) a real admin login on the running production stack.
#   cd deploy && ./create-admin.sh "Owner Name" owner@example.com
# The password is typed silently and never written to a file or a command line.
set -e
[ $# -eq 2 ] || { echo "usage: $0 \"Full Name\" email@example.com"; exit 1; }
NAME="$1"; EMAIL="$2"
case "$NAME$EMAIL" in *"'"*|*'\'*) echo "name/email must not contain ' or \\"; exit 1;; esac
printf 'New admin password (min 12 chars): '; stty -echo; read -r PW; stty echo; printf '\n'
[ ${#PW} -ge 12 ] || { echo "password too short"; exit 1; }
set -a; . ./.env; set +a
HASH=$(printf '%s' "$PW" | docker compose exec -T admin php -r 'echo password_hash(stream_get_contents(STDIN), PASSWORD_BCRYPT);')
docker compose exec -T -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql mariadb -uroot pslaser <<SQL
INSERT INTO users (name, email, password, role) VALUES ('$NAME', '$EMAIL', '$HASH', 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), role = 'admin';
SQL
echo "Admin '$EMAIL' saved. Log in at https://admin.$DOMAIN"
