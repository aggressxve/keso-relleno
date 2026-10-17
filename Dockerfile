# ---------- Etapa 1: compilar con Gradle ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copiamos todo el proyecto (lo que no queremos va en .dockerignore)
COPY . .

# En Windows, "gradlew" puede traer finales de línea CRLF; los pasamos a LF.
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Construimos solo el jar ejecutable (bootJar) y quitamos el -plain.jar si existe
RUN ./gradlew bootJar --no-daemon \
    && rm -f build/libs/*-plain.jar

# ---------- Etapa 2: ejecutar (imagen ligera, solo JRE) ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
