package com.rainbowtechsolution.routes


import com.rainbowtechsolution.common.Auth
import com.rainbowtechsolution.common.ChatDefaults
import com.rainbowtechsolution.controller.WsController
import com.rainbowtechsolution.data.entity.MessageType
import com.rainbowtechsolution.data.entity.ReportType
import com.rainbowtechsolution.data.repository.*
import com.rainbowtechsolution.domain.model.*
import com.rainbowtechsolution.exceptions.UserAlreadyFoundException
import com.rainbowtechsolution.exceptions.ValidationException
import com.rainbowtechsolution.utils.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import kotlinx.coroutines.async
import java.io.File
import java.io.IOException


fun Route.adminRotes(
    domains: List<String>, domainRepository: DomainRepository, userRepository: UserRepository,
    rankRepository: RankRepository, permissionRepository: PermissionRepository, roomRepository: RoomRepository,
    messageRepository: MessageRepository, reportRepository: ReportRepository, newsRepository: NewsRepository
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
            route("/reports") {
                delete("/{id}/delete") {
                    try {
                        val id = call.parameters["id"]!!.toInt()
                        val domainId = call.receiveParameters()["domainId"]!!.toInt()
                        val staffIds = userRepository.getStaffIdsByDomainId(domainId)
                        reportRepository.deleteReportById(id)
                        val message = PvtMessage(content = "", type = MessageType.ActionTaken)
                        WsController.broadCastToStaff(staffIds, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                    }
                }

                post("/{id}/take-action") {
                    try {
                        val id = call.parameters["id"]!!.toInt()
                        val params = call.receiveParameters()
                        val targetId = params["targetId"]!!.toLong()
                        val domainId = params["domainId"]!!.toInt()
                        val roomId = params["roomId"]!!.toInt()
                        val staffIds = userRepository.getStaffIdsByDomainId(domainId)
                        when (ReportType.valueOf(params["type"].toString())) {
                            ReportType.Chat -> {
                                messageRepository.deleteMessage(targetId)
                                reportRepository.deleteReportById(id)
                                val message = Message(id = targetId, content = "", type = MessageType.Delete)
                                WsController.broadcastToRoom(roomId, message.encodeToString())
                            }
                            ReportType.PvtChat -> {
                                /*TODO*/
                            }
                            ReportType.NewsFeed -> {
                                /*TODO*/
                            }
                        }
                        val message = PvtMessage(content = "", type = MessageType.ActionTaken)
                        WsController.broadCastToStaff(staffIds, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                    }
                }

                post("/{id}/no-action") {
                    try {
                        val id = call.parameters["id"]!!.toInt()
                        val params = call.receiveParameters()
                        val domainId = params["domainId"]!!.toInt()
                        val staffIds = userRepository.getStaffIdsByDomainId(domainId)
                        when (ReportType.valueOf(params["type"].toString())) {
                            ReportType.Chat -> reportRepository.deleteReportById(id)
                            ReportType.PvtChat -> Unit/*TODO*/
                            ReportType.NewsFeed -> Unit/*TODO*/
                        }
                        val message = PvtMessage(content = "", type = MessageType.ActionTaken)
                        WsController.broadCastToStaff(staffIds, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                    }
                }
            }

            route("/user") {
                post("/{id}/update-name") {
                    try {
                        val params = call.receiveParameters()
                        val id = call.parameters["id"]!!.toLong()
                        val name = params["name"].toString()
                        val domainId = params["domainId"]!!.toInt()
                        if (!name.isNameValid()) throw ValidationException("Name should not contain special characters.")
                        val isUserExists = userRepository.isUserExists(name, domainId)
                        if (isUserExists) throw UserAlreadyFoundException("Username already taken.")
                        userRepository.updateName(id, name)
                        val message = PvtMessage(content = "", type = MessageType.DataChanges)
                        WsController.broadCastToMember(id, message.encodeToString())
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

                post("/{id}/update-avatar") {
                    val parts = call.receiveMultipart()
                    val id = call.parameters["id"]!!.toLong()
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
                        userRepository.updateAvatar(id, filePath)
                        val message = PvtMessage(content = "", type = MessageType.DataChanges)
                        WsController.broadCastToMember(id, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: IOException) {
                        call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest, e.message.toString())
                    } finally {
                        File(filePath).delete()
                    }
                }

                post("/{id}/update-default-avatar") {
                    try {
                        val id = call.parameters["id"]!!.toLong()
                        val avatar = call.receiveParameters()["avatar"].toString()
                        userRepository.updateAvatar(id, avatar)
                        val message = PvtMessage(content = "", type = MessageType.DataChanges)
                        WsController.broadCastToMember(id, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest, e.message.toString())
                    }
                }

                post("/{id}/mute") {
                    try {
                        val id = call.parameters["id"]!!.toLong()
                        val user = userRepository.findUserById(id)
                        val roomId = user?.roomId!!
                        userRepository.mute(id)
                        val message = Message(user = User(id = id), content = "", type = MessageType.Mute)
                        WsController.broadcastToRoom(roomId, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest)
                    }
                }

                post("/{id}/unmute") {
                    try {
                        val id = call.parameters["id"]!!.toLong()
                        val user = userRepository.findUserById(id)
                        val roomId = user?.roomId!!
                        userRepository.unMute(id)
                        val message = Message(user = User(id = id), content = "", type = MessageType.UnMute)
                        WsController.broadcastToRoom(roomId, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest)
                    }
                }

                post("/{id}/kick") {
                    try {
                        val id = call.parameters["id"]!!.toLong()
                        userRepository.kick(id, 0)
                        val message = PvtMessage(content = "", type = MessageType.Kick)
                        WsController.broadCastToMember(id, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest)
                    }
                }

                post("/{id}/ban") {
                    try {
                        val id = call.parameters["id"]!!.toLong()
                        userRepository.ban(id)
                        val message = PvtMessage(content = "", type = MessageType.Ban)
                        WsController.broadCastToMember(id, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest)
                    }
                }
            }

            route("/{domainId}/news") {

                post("/create") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val userId = chatSession?.id!!
                        val domainId = call.parameters["domainId"]!!.toInt()
                        val parts = call.receiveMultipart()
                        var content = ""
                        var filePath: String?
                        val renderFormat = "webp"
                        val imageName = "${getUUID()}.$renderFormat"
                        filePath = ChatDefaults.NEWS_IMAGE_UPLOAD_FOLDER
                        val uploadDir = File(filePath)
                        if (!uploadDir.mkdirs() && !uploadDir.exists()) {
                            throw IOException("Failed to create directory ${uploadDir.absolutePath}")
                        }
                        filePath += imageName
                        var hasImage = false
                        parts.forEachPart { part ->
                            when (part) {
                                is PartData.FormItem -> content = part.value
                                is PartData.FileItem -> {
                                    hasImage = true
                                    part.saveImage(filePath, renderFormat)
                                }
                                else -> Unit
                            }
                        }
                        val image = if (hasImage) filePath else null
                        val announcement = Announcement(
                            content = content, image = image, user = User(userId), domainId = domainId
                        )
                        newsRepository.createNews(announcement)

                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError)
                    }
                }

                delete("/{id}/delete") {
                    try {
                        val id = call.parameters["id"]!!.toInt()
                        newsRepository.deleteNews(id)
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                    }
                }
            }
        }
    }
}

