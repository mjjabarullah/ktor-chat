package com.rainbowtechsolution.di

import com.rainbowtechsolution.controller.*
import com.rainbowtechsolution.data.repository.*
import org.koin.dsl.module

val mainModule = module {

    single<RankRepository> { RankController() }
    single<PermissionRepository> { PermissionController() }
    single<DomainRepository> { DomainController() }
    single<UserRepository> { UserController() }
    single<RoomRepository> { RoomController() }
    single<MessageRepository> { MessageController() }
    single<NotificationRepository> { NotificationController() }
    single<ReportRepository> { ReportController() }
    single<PostRepository> { PostController() }
    single<WsRepository> { WsController(get(), get(), get()) }
    single<StoryRepository> { StoryController() }
}