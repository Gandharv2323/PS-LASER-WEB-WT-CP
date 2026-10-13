# Multi-stage build for the PS Laser Spring Boot API.
#   docker build -t pslaser/spring-api services/spring-api
#   docker run -p 8081:8081 -e DB_HOST=host.docker.internal -e MONGO_HOST=host.docker.internal \
#              -e JWT_SECRET=<32+ byte secret> -e SPRING_PROFILES_ACTIVE=prod pslaser/spring-api

# ---- stage 1: build the executable jar with the Maven wrapper ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src/ src/
RUN ./mvnw -B -q package -DskipTests

# ---- stage 2: small runtime image (JRE only, non-root user) ----
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 10001 pslaser
COPY --from=build /src/target/spring-api.jar app.jar
USER pslaser
ENV SPRING_PROFILES_ACTIVE=prod \
    PORT=8081 \
    LOG_FILE=/tmp/spring-api.log \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
EXPOSE 8081
# Orchestrators (Compose/Kubernetes) should probe /actuator/health/liveness and /actuator/health/readiness.
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
