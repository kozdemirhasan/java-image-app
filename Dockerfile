FROM ubuntu:latest AS build

# 1. Base image olarak OpenJDK kullanıyoruz
FROM openjdk:17-jdk-slim

# 2. Uygulama içinde oluşan JAR dosyasını container'a kopyalıyoruz
ARG JAR_FILE=target/demo-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

# 3. Render'ın otomatik olarak tanıması için uygulama portunu ayarlıyoruz
ENV PORT 8080

# 4. JVM opsiyonlarını (opsiyonel olarak) ayarlamak için bir ENV ekliyoruz
ENV JAVA_OPTS=""

# 5. Uygulamayı başlatıyoruz
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=$PORT -jar app.jar"]

# 6. Render'ın dinlemesi için 8080 portunu expose ediyoruz
EXPOSE 8080
