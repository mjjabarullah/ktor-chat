package com.rainbowtechsolution

import com.rainbowtechsolution.data.database.configureDatabase
import com.rainbowtechsolution.plugins.*
import io.ktor.server.application.*

fun main(args: Array<String>): Unit =
    io.ktor.server.netty.EngineMain.main(args)

@Suppress("unused") // application.conf references the main function. This annotation prevents the IDE from marking it as unused.
fun Application.module() {

    configureDatabase()
    configureKoinDi()
    configureSockets()
    configureTemplating()
    configureMonitoring()
    configureCompression()
    configureSerialization()
    configureSecurity()
    configureRouting()
    configureStatusPages()
    configureCachingHeaders()
}

