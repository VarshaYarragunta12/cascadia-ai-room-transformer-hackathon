FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /build/target/roomgen.jar roomgen.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/roomgen.jar"]
