package com.rainbowtechsolution.plugins

import com.rainbowtechsolution.di.mainModule
import io.ktor.server.application.*
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

fun Application.configureKoinDi() {

    install(Koin) {
        slf4jLogger()
        modules(mainModule)
        properties(mapOf("application" to this))
    }

}
