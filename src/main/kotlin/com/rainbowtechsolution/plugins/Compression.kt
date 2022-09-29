package com.rainbowtechsolution.plugins

import io.ktor.server.application.*
import io.ktor.server.plugins.compression.*

fun Application.configureCompression() {

    install(Compression) {
        gzip()
        deflate()
    }

}
