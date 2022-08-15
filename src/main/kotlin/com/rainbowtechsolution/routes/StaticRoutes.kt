package com.rainbowtechsolution.routes

import io.ktor.server.http.content.*
import io.ktor.server.routing.*

fun Route.staticRoutes() {

    static("/") {
        preCompressed(CompressedFileType.BROTLI, CompressedFileType.GZIP) {
            staticBasePackage = "static"
            resources(".")

            static("/uploads") {
                files("uploads")
            }
        }
    }
}

