package com.rainbowtechsolution.plugins

import com.rainbowtechsolution.data.repository.*
import com.rainbowtechsolution.routes.*
import io.ktor.server.application.*
import io.ktor.server.resources.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import org.koin.ktor.ext.inject

fun Application.configureRouting() {

    val userRepository by inject<UserRepository>()
    val messageRepository by inject<MessageRepository>()
    val domainRepository by inject<DomainRepository>()
    val rankRepository by inject<RankRepository>()
    val permissionRepository by inject<PermissionRepository>()
    val roomRepository by inject<RoomRepository>()
    val wsRepository by inject<WsRepository>()
    val reportRepository by inject<ReportRepository>()
    val postRepository by inject<PostRepository>()
    val notificationRepository by inject<NotificationRepository>()
    val storyRepository by inject<StoryRepository>()

    install(Resources)

    val host = environment.config.host
    var domains = emptyList<String>()
    runBlocking(Dispatchers.Default) {
        domains = domainRepository.getAllDomain().map { "${it.slug}.$host" }
    }

    routing {

        wsRoutes(wsRepository, userRepository, roomRepository, permissionRepository)

        domainRoutes(
            domains, roomRepository, userRepository, messageRepository, domainRepository, rankRepository,
            permissionRepository, reportRepository, postRepository, notificationRepository, storyRepository
        )

        mainRoutes(roomRepository, userRepository)

        adminRotes(
            domains, domainRepository, userRepository, rankRepository, permissionRepository, roomRepository,
            messageRepository, reportRepository, postRepository, notificationRepository
        )

        chatRoutes(messageRepository, roomRepository, userRepository, domainRepository)

        staticRoutes()
    }
}
