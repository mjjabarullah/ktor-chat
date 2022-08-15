package com.rainbowtechsolution.routes

import com.rainbowtechsolution.data.repository.RoomRepository
import com.rainbowtechsolution.data.repository.UserRepository
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.thymeleaf.*

fun Route.mainRoutes(
    roomRepository: RoomRepository,
    userRepository: UserRepository
) {

    route("/") {
        get() {

            call.respondTemplate("index")
        }
    }

}

