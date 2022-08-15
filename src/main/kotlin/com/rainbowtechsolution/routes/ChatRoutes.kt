package com.rainbowtechsolution.routes


import com.rainbowtechsolution.common.Auth
import com.rainbowtechsolution.data.repository.DomainRepository
import com.rainbowtechsolution.data.repository.MessageRepository
import com.rainbowtechsolution.data.repository.RoomRepository
import com.rainbowtechsolution.data.repository.UserRepository
import io.ktor.server.auth.*
import io.ktor.server.routing.*

fun Route.chatRoutes(
    messageRepository: MessageRepository,
    roomRepository: RoomRepository,
    userRepository: UserRepository,
    domainRepository: DomainRepository
) {

    route("/") {
        authenticate(Auth.AUTH_SESSION) {

        }

    }
}


