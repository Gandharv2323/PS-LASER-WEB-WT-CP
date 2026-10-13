#!/usr/bin/env bash
# Downloads the three runtime jars from Maven Central into WEB-INF/lib and
# verifies each one against the .sha1 published next to it on Maven Central.
set -euo pipefail
cd "$(dirname "$0")/.."
LIB=src/main/webapp/WEB-INF/lib
mkdir -p "$LIB"
REPO=https://repo1.maven.org/maven2
ARTIFACTS=(
  "com/mysql/mysql-connector-j/8.4.0/mysql-connector-j-8.4.0.jar"
  "javax/servlet/jstl/1.2/jstl-1.2.jar"
  "org/mindrot/jbcrypt/0.4/jbcrypt-0.4.jar"
)
for path in "${ARTIFACTS[@]}"; do
  name=$(basename "$path")
  if [ ! -f "$LIB/$name" ]; then
    echo "Downloading $name"
    curl -fsSL "$REPO/$path" -o "$LIB/$name"
  fi
  expected=$(curl -fsSL "$REPO/$path.sha1" | cut -c1-40)
  actual=$(sha1sum "$LIB/$name" | cut -c1-40)
  if [ "$expected" != "$actual" ]; then
    echo "SHA-1 MISMATCH for $name (expected $expected, got $actual)"; rm -f "$LIB/$name"; exit 1
  fi
  echo "OK  $name  sha1=$actual"
done
