package com.rainbowtechsolution.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*

fun Application.configureStatusPages() {

    /*install(StatusPages) {
        statusFile(HttpStatusCode.NotFound, filePattern = "templates/status/error#.html")
    }*/

}
