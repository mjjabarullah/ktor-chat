package com.rainbowtechsolution.plugins

import com.rainbowtechsolution.di.mainModule
import io.ktor.http.*
import io.ktor.server.plugins.callloging.*
import org.slf4j.event.*
import io.ktor.server.request.*
import io.ktor.server.application.*
import io.ktor.server.plugins.compression.*
import io.ktor.server.response.*
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

fun Application.configureKoinDi() {

    install(Koin) {
        slf4jLogger()
        modules(mainModule)
        properties(mapOf("application" to this))
    }

}
