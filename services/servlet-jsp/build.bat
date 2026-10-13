@echo off
rem Build (and optionally deploy) the PS Laser Order Desk WAR without Maven (Windows cmd).
rem   build.bat           -> target\pslaser.war
rem   build.bat deploy    -> also copies it to %CATALINA_HOME%\webapps (default C:\xampp\tomcat)
setlocal EnableDelayedExpansion
cd /d "%~dp0"
if "%CATALINA_HOME%"=="" set "CATALINA_HOME=C:\xampp\tomcat"

if not exist src\main\webapp\WEB-INF\lib\jbcrypt-0.4.jar (
  echo Missing jars - run: bash scripts/fetch-libs.sh   ^(downloads + verifies SHA-1 from Maven Central^)
  exit /b 1
)
if not exist src\main\webapp\img mkdir src\main\webapp\img
copy /y ..\..\public\sites\pslaser\logo\ps-laser-logo.png src\main\webapp\img\ >nul 2>nul
copy /y ..\..\public\sites\pslaser\logo\favicon.png src\main\webapp\img\ >nul 2>nul

if exist target rmdir /s /q target
mkdir target\classes target\war

set "CP=%CATALINA_HOME%\lib\servlet-api.jar;%CATALINA_HOME%\lib\jsp-api.jar;%CATALINA_HOME%\lib\tomcat-jdbc.jar;%CATALINA_HOME%\bin\tomcat-juli.jar"
for %%j in (src\main\webapp\WEB-INF\lib\*.jar) do set "CP=!CP!;%%j"

dir /s /b src\main\java\*.java > target\sources.txt
javac --release 8 -nowarn -encoding UTF-8 -Xlint:-options -d target\classes -cp "%CP%" @target\sources.txt || exit /b 1

xcopy /e /q /y src\main\webapp target\war\ >nul
mkdir target\war\WEB-INF\classes 2>nul
mkdir target\war\WEB-INF\logs 2>nul
xcopy /e /q /y target\classes target\war\WEB-INF\classes\ >nul
pushd target\war
jar cf ..\pslaser.war .
popd
echo Built target\pslaser.war

if /i "%1"=="deploy" (
  copy /y target\pslaser.war "%CATALINA_HOME%\webapps\pslaser.war" >nul
  echo Copied to %CATALINA_HOME%\webapps\pslaser.war - open http://localhost:8080/pslaser/
)
endlocal
