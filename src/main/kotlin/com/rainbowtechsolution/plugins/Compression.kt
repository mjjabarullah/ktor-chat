package com.rainbowtechsolution.plugins

import io.ktor.http.*
import io.ktor.server.plugins.callloging.*
import org.slf4j.event.*
import io.ktor.server.request.*
import io.ktor.server.application.*
import io.ktor.server.plugins.compression.*
import io.ktor.server.response.*

fun Application.configureCompression() {

    install(Compression) {
        gzip()
        deflate()
    }

}
