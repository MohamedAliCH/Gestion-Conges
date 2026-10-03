# Stage 1: Build with Maven & JDK 23
FROM maven:3-eclipse-temurin-23 AS build
WORKDIR /app

# Copy pom.xml, wrapper and source code
COPY back/pom.xml .
COPY back/.mvn .mvn
COPY back/mvnw .
COPY back/src src

# Package application
RUN mvn clean package -DskipTests

# Stage 2: Lightweight Runtime with JRE 23
FROM eclipse-temurin:23-jre
WORKDIR /app

# Copy compiled JAR
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render sets PORT env variable)
EXPOSE 8080

# Keep JVM memory within Render free 512MB limits
ENV JAVA_OPTS="-Xmx350m -Xms128m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
