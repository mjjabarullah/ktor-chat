package com.rainbowtechsolution.routes


import com.rainbowtechsolution.common.Auth
import com.rainbowtechsolution.common.ChatDefaults
import com.rainbowtechsolution.common.Errors
import com.rainbowtechsolution.common.RankNames
import com.rainbowtechsolution.controller.WsController
import com.rainbowtechsolution.data.entity.MessageType
import com.rainbowtechsolution.data.entity.PostType
import com.rainbowtechsolution.data.entity.ReportType
import com.rainbowtechsolution.data.model.*
import com.rainbowtechsolution.data.repository.*
import com.rainbowtechsolution.exceptions.PermissionDeniedException
import com.rainbowtechsolution.exceptions.UserAlreadyFoundException
import com.rainbowtechsolution.exceptions.UserNotFoundException
import com.rainbowtechsolution.exceptions.ValidationException
import com.rainbowtechsolution.utils.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.http.content.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import kotlinx.coroutines.async
import java.io.File
import java.io.IOException
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId


fun Route.adminRotes(
    domains: List<String>, domainRepository: DomainRepository, userRepository: UserRepository,
    rankRepository: RankRepository, permissionRepository: PermissionRepository, roomRepository: RoomRepository,
    messageRepository: MessageRepository, reportRepository: ReportRepository, postRepository: PostRepository,
    notificationRepository: NotificationRepository
) {


    route("/domain") {
        get("/create") {
            var domainId: Int? = null
            try {
                val domain =
                    Domain(name = "Tamil", slug = "tamil", description = "desc", theme = "theme-sky", radioUrl = "")
                domainId = domainRepository.createDomain(domain) ?: throw Exception()
                ChatDefaults.RANKS.forEach {
                    val rankDef = async { rankRepository.createRank(it.copy(domainId = domainId)) }
                    permissionRepository.createPermission(it.permission?.copy(rankId = rankDef.await())!!)
                }
                val room = Room(
                    name = "Main", description = "Room description", topic = "Room topic", showJoin = true,
                    showGreet = true, domainId = domainId
                )
                roomRepository.createRoom(room)
                call.respond(HttpStatusCode.OK, domainId)
            } catch (e: Exception) {
                domainId?.let {
                    domainRepository.deleteDomain(it)
                }
                call.respond(HttpStatusCode.InternalServerError)
                e.printStackTrace()
                println()
            }
        }
    }

    if (domains.isEmpty()) return

    host(domains) {
        authenticate(Auth.AUTH_SESSION) {
            route("/{domainId}") {

                route("/rooms") {

                    route("/{roomId}") {

                        route("/messages") {

                            delete("/{msgId}/delete") {
                                try {
                                    val msgId = call.parameters["msgId"]!!.toLong()
                                    val userId = call.sessions.get<ChatSession>()?.id!!
                                    val domainId = call.parameters["domainId"]!!.toInt()
                                    val roomId = call.parameters["roomId"]!!.toInt()
                                    val user = userRepository.findUserById(userId) ?: throw UserNotFoundException()
                                    val rankId = user.rank?.id!!
                                    val permission =
                                        permissionRepository.findPermissionByRank(rankId) ?: throw Exception()
                                    if (!permission.delMsg) throw PermissionDeniedException()
                                    messageRepository.deleteMessage(msgId)
                                    val message = Message(id = msgId, content = "", type = MessageType.DelChat)
                                    WsController.broadcastToRoom(domainId, roomId, message.encodeToString())
                                    call.respond(HttpStatusCode.OK)
                                } catch (e: PermissionDeniedException) {
                                    call.respond(HttpStatusCode.Forbidden, e.message.toString())
                                } catch (e: UserNotFoundException) {
                                    call.respond(HttpStatusCode.NotFound, e.message.toString())
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                                }
                            }
                        }
                    }
                }

                route("/reports") {

                    route("/{reportId}") {

                        post("/take-action") {
                            try {
                                val reportId = call.parameters["reportId"]!!.toInt()
                                val params = call.receiveParameters()
                                val targetId = params["targetId"]!!.toLong()
                                val domainId = call.parameters["domainId"]!!.toInt()
                                val roomId = params["roomId"]!!.toInt()
                                when (ReportType.valueOf(params["type"].toString())) {
                                    ReportType.Chat -> {
                                        messageRepository.deleteMessage(targetId)
                                        reportRepository.deleteReportById(reportId)
                                        val message = Message(id = targetId, content = "", type = MessageType.DelChat)
                                        WsController.broadcastToRoom(domainId, roomId, message.encodeToString())
                                    }
                                    ReportType.PvtChat -> {
                                        /*TODO*/
                                    }
                                    ReportType.NewsFeed -> {
                                        /*TODO*/
                                    }
                                }
                                val message = Message(content = "", type = MessageType.ActionTaken)
                                WsController.broadcastToDomain(domainId, message.encodeToString())
                                call.respond(HttpStatusCode.OK)
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                            }
                        }

                        post("/no-action") {
                            try {
                                val reportId = call.parameters["reportId"]!!.toInt()
                                val params = call.receiveParameters()
                                val domainId = call.parameters["domainId"]!!.toInt()
                                when (ReportType.valueOf(params["type"].toString())) {
                                    ReportType.Chat -> reportRepository.deleteReportById(reportId)
                                    ReportType.PvtChat -> Unit/*TODO*/
                                    ReportType.NewsFeed -> Unit/*TODO*/
                                }
                                val message = Message(content = "", type = MessageType.ActionTaken)
                                WsController.broadcastToDomain(domainId, message.encodeToString())
                                call.respond(HttpStatusCode.OK)
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                            }
                        }

                        delete("/delete") {
                            try {
                                val reportId = call.parameters["reportId"]!!.toInt()
                                val domainId = call.parameters["domainId"]!!.toInt()
                                reportRepository.deleteReportById(reportId)
                                val message = Message(content = "", type = MessageType.ActionTaken)
                                WsController.broadcastToDomain(domainId, message.encodeToString())
                                call.respond(HttpStatusCode.OK)
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                            }
                        }
                    }
                }

                route("/users") {

                    route("/{userId}") {

                        put("/update-name") {
                            try {
                                val params = call.receiveParameters()
                                val userId = call.parameters["userId"]!!.toLong()
                                val domainId = call.parameters["domainId"]!!.toInt()
                                val name = params["name"].toString()
                                if (!name.isNameValid()) throw ValidationException("Name should not contain special characters.")
                                val isUserExists = userRepository.isUserExists(name, domainId)
                                if (isUserExists) throw UserAlreadyFoundException("Username already taken.")
                                userRepository.updateName(userId, name)
                                val message = PvtMessage(content = "", type = MessageType.DataChanges)
                                WsController.broadCastToMember(userId, message.encodeToString())
                                call.respond(HttpStatusCode.OK)
                            } catch (e: ValidationException) {
                                call.respond(HttpStatusCode.BadRequest, e.message ?: "Something went wrong.")
                            } catch (e: UserAlreadyFoundException) {
                                call.respond(HttpStatusCode.BadRequest, e.message ?: "Something went wrong.")
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                            }
                        }

                        put("/update-avatar") {
                            val parts = call.receiveMultipart()
                            val userId = call.parameters["userId"]!!.toLong()
                            val renderFormat = "webp"
                            val imageName = "${getUUID()}.$renderFormat"
                            var filePath = ChatDefaults.AVATAR_FOLDER
                            try {
                                val uploadDir = File(filePath)
                                if (!uploadDir.mkdirs() && !uploadDir.exists()) {
                                    throw IOException("Failed to create directory ${uploadDir.absolutePath}")
                                }
                                filePath += imageName
                                parts.forEachPart { part ->
                                    when (part) {
                                        is PartData.FileItem -> {
                                            part.saveImage(filePath, renderFormat)
                                        }
                                        else -> Unit
                                    }
                                }
                                userRepository.updateAvatar(userId, filePath)
                                val message = PvtMessage(content = "", type = MessageType.DataChanges)
                                WsController.broadCastToMember(userId, message.encodeToString())
                                call.respond(HttpStatusCode.OK)
                            } catch (e: IOException) {
                                call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                            } catch (e: Exception) {
                                call.respond(HttpStatusCode.BadRequest, e.message.toString())
                            }
                        }

                        put("/update-default-avatar") {
                            try {
                                val userId = call.parameters["userId"]!!.toLong()
                                val avatar = call.receiveParameters()["avatar"].toString()
                                userRepository.updateAvatar(userId, avatar)
                                val message = PvtMessage(content = "", type = MessageType.DataChanges)
                                WsController.broadCastToMember(userId, message.encodeToString())
                                call.respond(HttpStatusCode.OK)
                            } catch (e: Exception) {
                                call.respond(HttpStatusCode.BadRequest, e.message.toString())
                            }
                        }

                        put("/update-rank") {
                            try {
                                val currentUserId = call.sessions.get<ChatSession>()?.id!!
                                val userId = call.parameters["userId"]!!.toLong()
                                val domainId = call.parameters["domainId"]!!.toInt()
                                val currentUser =
                                    userRepository.findUserById(currentUserId) ?: throw UserNotFoundException()
                                val user = userRepository.findUserById(userId) ?: throw UserNotFoundException()
                                if (user.rank?.code === RankNames.GUEST) throw PermissionDeniedException()
                                val permission =
                                    permissionRepository.findPermissionByRank(currentUser.rank?.id!!)
                                        ?: throw Exception()
                                if (!permission.changeRank) throw PermissionDeniedException()
                                if (currentUser.rank?.order!! > user.rank?.order!!) throw PermissionDeniedException()
                                val rankId = call.receiveParameters()["rankId"]!!.toInt()
                                val rank = rankRepository.findRankById(rankId, domainId) ?: throw Exception()
                                userRepository.updateRank(userId, rankId)
                                val notification = Notification(
                                    receiver = User(userId), content = "Your rank changed to ${rank.name}"
                                )
                                notificationRepository.createNotification(notification)
                                val nMessage = Message(content = "", type = MessageType.Notification)
                                WsController.broadCastToMember(userId, nMessage.encodeToString())
                                val message = PvtMessage(content = "", type = MessageType.DataChanges)
                                WsController.broadCastToMember(userId, message.encodeToString())
                                call.respond(HttpStatusCode.OK, rank)
                            } catch (e: PermissionDeniedException) {
                                call.respond(HttpStatusCode.Forbidden, e.message.toString())
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.InternalServerError, Errors.SOMETHING_WENT_WRONG)
                            }
                        }

                        put("/mute") {
                            try {
                                val params = call.receiveParameters()
                                val timeParam = params["time"]!!.toLong()
                                val time = LocalDateTime.now().plusMinutes(timeParam).atZone(ZoneId.systemDefault())
                                    .toInstant()
                                    .toEpochMilli()
                                val reason = params["reason"]
                                val userId = call.parameters["userId"]!!.toLong()
                                val user = userRepository.findUserById(userId)
                                val domainId = call.parameters["domainId"]!!.toInt()
                                val roomId = user?.roomId!!
                                userRepository.mute(userId, time, reason)
                                val message = Message(user = User(id = userId), content = "", type = MessageType.Mute)
                                WsController.broadcastToRoom(domainId, roomId, message.encodeToString())
                                WsController.broadCastToMember(userId, message.encodeToString())
                                val notification = Notification(
                                    receiver = User(userId), content = "You have been muted for ${timeParam.getTime()}"
                                )
                                notificationRepository.createNotification(notification)
                                val nMessage = Message(content = "", type = MessageType.Notification)
                                WsController.broadCastToMember(userId, nMessage.encodeToString())
                                call.respond(HttpStatusCode.OK, time)
                            } catch (e: Exception) {
                                call.respond(HttpStatusCode.BadRequest)
                            }
                        }

                        put("/unmute") {
                            try {
                                val userId = call.parameters["userId"]!!.toLong()
                                val domainId = call.parameters["domainId"]!!.toInt()
                                val user = userRepository.findUserById(userId)
                                val roomId = user?.roomId!!
                                userRepository.unMute(userId)
                                val message = Message(user = User(id = userId), content = "", type = MessageType.UnMute)
                                WsController.broadcastToRoom(domainId, roomId, message.encodeToString())
                                WsController.broadCastToMember(userId, message.encodeToString())
                                val notification = Notification(
                                    receiver = User(userId), content = "You have been unmuted"
                                )
                                notificationRepository.createNotification(notification)
                                val nMessage = Message(content = "", type = MessageType.Notification)
                                WsController.broadCastToMember(userId, nMessage.encodeToString())
                                call.respond(HttpStatusCode.OK)
                            } catch (e: Exception) {
                                call.respond(HttpStatusCode.BadRequest)
                            }
                        }

                        put("/kick") {
                            try {
                                val params = call.receiveParameters()
                                val timeParam = params["time"]!!.toLong()
                                val time = LocalDateTime.now().plusMinutes(timeParam).atZone(ZoneId.systemDefault())
                                    .toInstant()
                                    .toEpochMilli()
                                val reason = params["reason"]
                                val userId = call.parameters["userId"]!!.toLong()
                                val domainId = call.parameters["domainId"]!!.toInt()
                                val user = userRepository.findUserById(userId)
                                val roomId = user?.roomId!!
                                userRepository.kick(userId, time, reason)
                                val message = Message(content = "", type = MessageType.Kick)
                                WsController.broadCastToMember(userId, message.encodeToString())
                                userRepository.unMute(userId)
                                val unMuteMessage =
                                    Message(user = User(id = userId), content = "", type = MessageType.UnMute)
                                WsController.broadcastToRoom(domainId, roomId, unMuteMessage.encodeToString())
                                val notification = Notification(
                                    receiver = User(userId), content = "You have been unmuted"
                                )
                                notificationRepository.createNotification(notification)
                                call.respond(HttpStatusCode.OK, time)
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.BadRequest)
                            }
                        }

                        put("/unkick") {
                            try {
                                val userId = call.parameters["userId"]!!.toLong()
                                userRepository.unKick(userId)
                                val message = Message(content = "", type = MessageType.UnKick)
                                WsController.broadCastToMember(userId, message.encodeToString())
                                call.respond(HttpStatusCode.OK)
                            } catch (e: Exception) {
                                call.respond(HttpStatusCode.BadRequest)
                            }
                        }

                        put("/ban") {
                            try {
                                val params = call.receiveParameters()
                                val time = LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                                val reason = params["reason"]
                                val userId = call.parameters["userId"]!!.toLong()
                                userRepository.ban(userId, time, reason)
                                val message = Message(content = "", type = MessageType.Ban)
                                WsController.broadCastToMember(userId, message.encodeToString())
                                call.respond(HttpStatusCode.OK, time)
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.BadRequest)
                            }
                        }

                        put("/unban") {
                            try {
                                val userId = call.parameters["userId"]!!.toLong()
                                userRepository.unBan(userId)
                                val message = Message(content = "", type = MessageType.UnBan)
                                WsController.broadCastToMember(userId, message.encodeToString())
                                call.respond(HttpStatusCode.OK)
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.BadRequest)
                            }
                        }
                    }
                }

                route("/news") { delPost(postRepository, MessageType.DelNews) }

                route("/adminship") { delPost(postRepository, MessageType.DelAdminship) }

                route("/global-feed") { delPost(postRepository, MessageType.DelGlobalFeed) }
            }
        }
    }
}


fun Route.delPost(postRepository: PostRepository, messageType: MessageType) {
    delete("/{postId}/delete") {
        try {
            val userId = call.sessions.get<ChatSession>()?.id!!
            val newsId = call.parameters["postId"]!!.toInt()
            val domainId = call.parameters["domainId"]!!.toInt()
            postRepository.deletePost(newsId)
            val message = Message(
                content = "", user = User(id = userId), type = messageType
            ).encodeToString()
            WsController.broadcastToDomain(domainId, message)
            call.respond(HttpStatusCode.OK)
        } catch (e: Exception) {
            e.printStackTrace()
            call.respond(HttpStatusCode.InternalServerError, e.message.toString())
        }
    }
}

