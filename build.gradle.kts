import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val ktor_version: String by project
val kotlin: String by project
val logback: String by project
val msql: String by project
val msqlCon: String by project
val koin: String by project
val bcrypt: String by project
val jackson: String by project
val valiktor: String by project
val apache: String by project
val imageIo: String by project
val caffine: String by project

plugins {
    application
    kotlin("jvm") version "1.7.10"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.7.10"
}

group = "com.rainbowtechsolution"
version = "0.0.1"
application {
    mainClass.set("io.ktor.server.netty.EngineMain")

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
    maven { url = uri("https://maven.pkg.jetbrains.space/public/p/ktor/eap") }
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    implementation("io.ktor:ktor-server-core-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-websockets-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-auth:$ktor_version")
    implementation("io.ktor:ktor-server-double-receive:$ktor_version")
    implementation("io.ktor:ktor-server-caching-headers:$ktor_version")
    implementation("io.ktor:ktor-server-thymeleaf-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-resources:$ktor_version")
    implementation("io.ktor:ktor-server-content-negotiation-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-call-logging-jvm:$ktor_version")
    implementation("io.ktor:ktor-serialization-jackson:$ktor_version")
    implementation("io.ktor:ktor-server-compression:$ktor_version")
    implementation("io.ktor:ktor-server-status-pages:$ktor_version")
    implementation("io.ktor:ktor-server-netty-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-sessions-jvm:$ktor_version")
    implementation("io.ktor:ktor-network-tls-certificates-jvm:$ktor_version")
    implementation("ch.qos.logback:logback-classic:$logback")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:$jackson")
    testImplementation("io.ktor:ktor-server-tests-jvm:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlin")
    //mysql
    implementation("org.jetbrains.exposed:exposed-core:$msql")
    implementation("org.jetbrains.exposed:exposed-jdbc:$msql")
    implementation("org.jetbrains.exposed:exposed-java-time:$msql")
    implementation("mysql:mysql-connector-java:$msqlCon")
    // Koin core features
    implementation("io.insert-koin:koin-core:$koin")
    implementation("io.insert-koin:koin-ktor:$koin")
    implementation("io.insert-koin:koin-logger-slf4j:$koin")
    //jackson kotlin module
    implementation ("com.fasterxml.jackson.module:jackson-module-kotlin:$jackson")
    // Bcrypt password encoder
    implementation("org.mindrot:jbcrypt:$bcrypt")
    // kotlin validation
    implementation("org.valiktor:valiktor-core:$valiktor")
    //apache common
    implementation("commons-io:commons-io:$apache")
    //ImageIo Webp support
    implementation("org.sejda.imageio:webp-imageio:$imageIo")
    //kotlin cache
    implementation ("com.github.ben-manes.caffeine:caffeine:$caffine")

}

val compileKotlin: KotlinCompile by tasks
compileKotlin.kotlinOptions {
    jvmTarget = "1.8"
}
val compileTestKotlin: KotlinCompile by tasks
compileTestKotlin.kotlinOptions {
    jvmTarget = "1.8"
}