#!/usr/bin/env bash
# Build (and optionally deploy) the PS Laser Order Desk WAR without Maven.
#   ./build.sh            -> compile + package target/pslaser.war
#   ./build.sh deploy     -> also copy it to $CATALINA_HOME/webapps/pslaser.war (default C:/xampp/tomcat)
# Needs a JDK (javac, jar) and Tomcat 8.5 (for servlet-api.jar, jsp-api.jar, tomcat-jdbc.jar).
set -euo pipefail
cd "$(dirname "$0")"
CATALINA_HOME="${CATALINA_HOME:-C:/xampp/tomcat}"
SEP=":"; case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) SEP=";";; esac

[ -f src/main/webapp/WEB-INF/lib/jbcrypt-0.4.jar ] || bash scripts/fetch-libs.sh

# web resources that come from the main PS Laser site
mkdir -p src/main/webapp/img
cp -u ../../public/sites/pslaser/logo/ps-laser-logo.png src/main/webapp/img/ 2>/dev/null || true
cp -u ../../public/sites/pslaser/logo/favicon.png src/main/webapp/img/ 2>/dev/null || true

rm -rf target && mkdir -p target/classes target/war
CP="$CATALINA_HOME/lib/servlet-api.jar${SEP}$CATALINA_HOME/lib/jsp-api.jar${SEP}$CATALINA_HOME/lib/tomcat-jdbc.jar${SEP}$CATALINA_HOME/bin/tomcat-juli.jar"
for j in src/main/webapp/WEB-INF/lib/*.jar; do CP="$CP${SEP}$j"; done

# --release 8: Tomcat 8.5's bundled JSP compiler (ECJ) reads our classes, keep them Java-8 format
javac --release 8 -nowarn -encoding UTF-8 -Xlint:-options -d target/classes -cp "$CP" $(find src/main/java -name '*.java')

cp -r src/main/webapp/. target/war/
mkdir -p target/war/WEB-INF/classes target/war/WEB-INF/logs
cp -r target/classes/. target/war/WEB-INF/classes/
(cd target/war && jar cf ../pslaser.war .)
echo "Built target/pslaser.war ($(du -k target/pslaser.war | cut -f1) KB)"

if [ "${1:-}" = "deploy" ]; then
  cp target/pslaser.war "$CATALINA_HOME/webapps/pslaser.war"
  echo "Copied to $CATALINA_HOME/webapps/pslaser.war - Tomcat auto-deploys it at http://localhost:8080/pslaser/"
fi
