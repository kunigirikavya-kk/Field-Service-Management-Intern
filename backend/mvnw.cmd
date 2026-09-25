@echo off
setlocal
set "MAVEN_PROJECTBASEDIR=%~dp0"
set "WRAPPER_DIR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper"
set "WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar"
set "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.4/maven-wrapper-3.3.4.jar"

if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"

rem Always refresh a missing/invalid wrapper jar from Maven Central.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$u='%WRAPPER_URL%'; $o='%WRAPPER_JAR%'; Invoke-WebRequest -UseBasicParsing -Uri $u -OutFile $o"

if errorlevel 1 (
  echo Failed to download the Maven Wrapper. Check your internet connection.
  exit /b 1
)

java -jar "%WRAPPER_JAR%" %*
endlocal
