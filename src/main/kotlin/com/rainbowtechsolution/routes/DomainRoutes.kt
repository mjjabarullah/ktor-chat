package com.rainbowtechsolution.routes

import com.rainbowtechsolution.common.Auth
import com.rainbowtechsolution.common.ChatDefaults
import com.rainbowtechsolution.common.RankNames
import com.rainbowtechsolution.controller.WsController
import com.rainbowtechsolution.data.entity.Gender
import com.rainbowtechsolution.data.entity.MessageType
import com.rainbowtechsolution.data.entity.ReportType
import com.rainbowtechsolution.data.entity.Status
import com.rainbowtechsolution.data.repository.*
import com.rainbowtechsolution.domain.model.*
import com.rainbowtechsolution.exceptions.*
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
import io.ktor.server.thymeleaf.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import org.valiktor.ConstraintViolationException
import org.valiktor.i18n.mapToMessage
import java.io.File
import java.io.IOException
import java.util.*

fun Route.domainRoutes(
    domains: List<String>,
    roomRepository: RoomRepository,
    userRepository: UserRepository,
    messageRepository: MessageRepository,
    domainRepository: DomainRepository,
    rankRepository: RankRepository,
    permissionRepository: PermissionRepository,
    reportRepository: ReportRepository,
    newsRepository: NewsRepository,
) {

    if (domains.isEmpty()) return

    val errors = mapOf<String, String>()
    val data = mapOf<String, String>()

    host(domains) {
        authenticate(Auth.AUTH_SESSION) {
            get("") {
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomain()
                    val id = chatSession?.id!!
                    val user = userRepository.findUserById(id) ?: throw UserNotFoundException()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    val roomId = user.roomId
                    user.roomId ?: run {
                        call.respondRedirect("lobby")
                        return@get
                    }
                    val room = roomRepository.findRoomById(roomId!!) ?: throw RoomNotFoundException()
                    val permission = permissionRepository.findPermissionByRank(user.rank?.id!!) ?: throw Exception()
                    val model = mapOf("domain" to domain, "room" to room, "user" to user, "permission" to permission)
                    call.respondTemplate("client/chat", model)
                } catch (e: UserNotFoundException) {
                    call.sessions.clear<ChatSession>()
                    call.respondRedirect("/")
                } catch (e: RoomNotFoundException) {
                    call.respond(HttpStatusCode.NotFound)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError)
                    e.printStackTrace()
                }
            }

            get("/lobby") {
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomain()
                    val user = userRepository.findUserById(chatSession?.id!!) ?: throw UserNotFoundException()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    val rooms = roomRepository.getRoomsByDomain(domain.id!!)
                    call.respondTemplate("client/lobby", mapOf("domain" to domain, "rooms" to rooms, "user" to user))
                } catch (e: UserNotFoundException) {
                    call.sessions.clear<ChatSession>()
                    call.respondRedirect("/")
                } catch (e: DomainNotFoundException) {
                    call.respond(HttpStatusCode.NotFound)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError)
                    e.printStackTrace()
                }
            }

            get("/{id}/rooms") {
                try {
                    val domainId = call.parameters["id"]?.toInt()
                    val rooms = roomRepository.getRoomsByDomain(domainId!!)
                    call.respond(HttpStatusCode.OK, rooms)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                }
            }

            get("/{id}/reports") {
                try {
                    val domainId = call.parameters["id"]!!.toInt()
                    val reports = reportRepository.getReportsByDomain(domainId)
                    call.respond(HttpStatusCode.OK, reports)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                }
            }

            get("/{id}/news") {
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val userId = chatSession?.id!!
                    val domainId = call.parameters["id"]!!.toInt()
                    val news = newsRepository.getNews(domainId, userId)
                    call.respond(HttpStatusCode.OK, news)
                } catch (e: Exception) {
                    e.printStackTrace()
                    call.respond(HttpStatusCode.InternalServerError)
                }
            }

            post("/{id}/read-news") {
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val userId = chatSession?.id!!
                    val domainId = call.parameters["id"]!!.toInt()
                    newsRepository.readNews(domainId, userId)
                    call.respond(HttpStatusCode.OK)
                } catch (e: Exception) {
                    e.printStackTrace()
                    call.respond(HttpStatusCode.InternalServerError)
                }
            }

            post("/guest-register") {
                val err = mutableMapOf<String, String>()
                val params = call.receiveParameters()
                val name = params["name"]?.trim()
                val password = params["password"]?.trim()
                val email = params["email"]?.trim() ?: ""
                val gender = params["gender"].toString()
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomain()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw Exception()

                    var user = User(
                        id = chatSession?.id!!, name = name, email = email, password = password,
                        gender = gender, avatar = ChatDefaults.USER_AVATAR
                    ).also { it.validate() }

                    user = user.copy(password = password!!.hashPassword())

                    val isUserExists = userRepository.isEmailExists(user.email!!, domain.id!!)
                    if (isUserExists) throw UserAlreadyFoundException("Email address already exists.")

                    val rankId = rankRepository.findRankByCode(RankNames.USER, domain.id!!)?.id ?: throw Exception()

                    userRepository.guestRegister(user, rankId)
                    call.respond(HttpStatusCode.OK)
                } catch (e: UserAlreadyFoundException) {
                    err["default"] = e.message ?: "Something went wrong. Try again"
                    call.respond(HttpStatusCode.InternalServerError, err)
                } catch (e: ConstraintViolationException) {
                    e.constraintViolations
                        .mapToMessage(baseName = "messages", locale = Locale.ENGLISH)
                        .forEach { err[it.property] = it.message }
                    call.respond(HttpStatusCode.InternalServerError, err)
                } catch (e: Exception) {
                    e.printStackTrace()
                    err["default"] = "Something went wrong. Try again"
                    call.respond(HttpStatusCode.InternalServerError, err)
                }
            }

            route("/room") {

                post("/join") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val roomId = call.receiveParameters()["id"]?.toInt()
                        userRepository.joinRoom(roomId!!, chatSession?.id!!)
                        call.respondRedirect("/")
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.InternalServerError)
                        e.printStackTrace()
                    }
                }

                get("/{id}/messages") {
                    try {
                        val roomId = call.parameters["id"]?.toInt()
                        val messages = messageRepository.getRoomMessages(roomId!!)
                        call.respond(HttpStatusCode.OK, messages)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                    }
                }

                get("/{id}/users") {
                    try {
                        val roomId = call.parameters["id"].toString().toInt()
                        val limit = call.request.queryParameters["limit"].toString().toInt()
                        val users = userRepository.getUsersByRoom(roomId, limit)
                        call.respond(HttpStatusCode.OK, users)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                    }
                }

                post("/upload-image") {
                    val parts = call.receiveMultipart()
                    var content = ""
                    val renderFormat = "webp"
                    val imageName = "${getUUID()}.$renderFormat"
                    var filePath = ChatDefaults.MAIN_IMAGE_UPLOAD_FOLDER

                    try {
                        val uploadDir = File(filePath)
                        if (!uploadDir.mkdirs() && !uploadDir.exists()) {
                            throw IOException("Failed to create directory ${uploadDir.absolutePath}")
                        }
                        filePath += imageName
                        parts.forEachPart { part ->
                            when (part) {
                                is PartData.FormItem -> content = part.value
                                is PartData.FileItem -> part.saveImage(filePath, renderFormat)
                                else -> Unit
                            }
                        }
                        val message = Message(content = content, image = filePath, type = MessageType.Chat)
                        call.respond(HttpStatusCode.OK, message)
                    } catch (e: IOException) {
                        call.respond(HttpStatusCode.InternalServerError)
                    } catch (e: Exception) {
                        File(filePath).delete()
                        call.respond(HttpStatusCode.BadRequest)
                    }
                }

                post("/upload-audio") {
                    val parts = call.receiveMultipart()
                    var content = ""
                    val audioName = "${getUUID()}.mp3"
                    var filePath = ChatDefaults.MAIN_AUDIO_UPLOAD_FOLDER

                    try {
                        val uploadDir = File(filePath)
                        if (!uploadDir.mkdirs() && !uploadDir.exists()) {
                            throw IOException("Failed to create directory ${uploadDir.absolutePath}")
                        }
                        filePath += audioName
                        parts.forEachPart { part ->
                            when (part) {
                                is PartData.FormItem -> content = part.value
                                is PartData.FileItem -> part.saveAudio(filePath)
                                else -> Unit
                            }
                        }
                        val message = Message(content = content, audio = filePath, type = MessageType.Chat)
                        call.respond(HttpStatusCode.OK, message)
                    } catch (e: IOException) {
                        call.respond(HttpStatusCode.InternalServerError)
                    } catch (e: Exception) {
                        File(filePath).delete()
                        call.respond(HttpStatusCode.BadRequest)
                    }
                }
            }

            route("/reports") {
                post("/create") {
                    try {
                        val userId = call.sessions.get<ChatSession>()?.id!!
                        val params = call.receiveParameters()
                        val targetId = params["targetId"]?.toLong()!!
                        val domainId = params["domainId"]?.toInt()!!
                        val roomId = params["roomId"]?.toInt()!!
                        val reason = params["reason"].toString()
                        val type = ReportType.valueOf(params["type"].toString())
                        reportRepository.createReport(userId, targetId, domainId, type, reason, roomId)
                        val staffIds = userRepository.getStaffIdsByDomainId(domainId)
                        val message = PvtMessage(content = "", type = MessageType.Report)
                        WsController.broadCastToStaff(staffIds, message.encodeToString())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                    }
                }
            }

            route("/message") {

                get("/{id}") {
                    try {
                        val id = call.parameters["id"]!!.toLong()
                        val message = messageRepository.findMessageById(id) ?: throw MessageNotFoundException()
                        call.respond(HttpStatusCode.OK, message)
                    } catch (e: MessageNotFoundException) {
                        call.respond(HttpStatusCode.NotFound, e.message.toString())
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                    }
                }

                delete("/{id}/delete") {
                    try {
                        val id = call.parameters["id"]!!.toLong()
                        val userId = call.sessions.get<ChatSession>()?.id!!
                        val user = userRepository.findUserById(userId) ?: throw UserNotFoundException()
                        val permission =
                            permissionRepository.findPermissionByRank(user.rank?.id!!) ?: throw Exception()
                        if (!permission.delMsg) throw PermissionDeniedException()
                        messageRepository.deleteMessage(id)
                        val message = Message(id = id, content = "", type = MessageType.Delete)
                        WsController.broadcastToRoom(user.roomId!!, message.encodeToString())
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

                route("/pvt") {

                    get("/{id}/messages") {
                        try {
                            val chatSession = call.sessions.get<ChatSession>()
                            val sender = chatSession?.id!!
                            val receiver = call.parameters["id"]!!.toLong()
                            val messages = messageRepository.getPrivateMessages(sender, receiver)
                            call.respond(HttpStatusCode.OK, messages)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    get("/users") {
                        try {
                            val chatSession = call.sessions.get<ChatSession>()
                            val userId = chatSession?.id!!
                            val pvtUsersId = messageRepository.getPvtUserIds(userId)
                            val usersMessages = pvtUsersId.map {
                                async { messageRepository.getPrivateMessages(it, userId) }
                            }.awaitAll()
                            val pvtUsers = pvtUsersId.mapIndexed { i, id ->
                                val sender =
                                    if (usersMessages[i][0].receiver?.id == userId) usersMessages[i][0].sender
                                    else usersMessages[i][0].receiver
                                PvtUser(
                                    id, sender?.name, sender?.avatar, sender?.nameColor, sender?.nameFont,
                                    sender?.private!!, usersMessages[i]
                                )
                            }
                            call.respond(HttpStatusCode.OK, pvtUsers)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/{id}/all-seen") {
                        try {
                            val chatSession = call.sessions.get<ChatSession>()
                            val receiver = chatSession?.id!!
                            val sender = call.parameters["id"]!!.toLong()
                            messageRepository.setAllSeen(sender, receiver)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/{id}/seen") {
                        try {
                            val messageId = call.parameters["id"]!!.toLong()
                            messageRepository.setSeen(messageId)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/{id}/upload-audio") {
                        val sender = User(id = call.sessions.get<ChatSession>()?.id)
                        val receiver = User(id = call.parameters["id"]?.toLong())
                        val parts = call.receiveMultipart()
                        var content = ""
                        val audioName = "${getUUID()}.mp3"
                        var filePath = ChatDefaults.PRIVATE_AUDIO_UPLOAD_FOLDER

                        try {
                            val uploadDir = File(filePath)
                            if (!uploadDir.mkdirs() && !uploadDir.exists()) {
                                throw IOException("Failed to create directory ${uploadDir.absolutePath}")
                            }
                            filePath += audioName
                            parts.forEachPart { part ->
                                when (part) {
                                    is PartData.FormItem -> content = part.value
                                    is PartData.FileItem -> part.saveAudio(filePath)
                                    else -> Unit
                                }
                            }
                            val message = PvtMessage(
                                content = content, audio = filePath, type = MessageType.Chat,
                                sender = sender, receiver = receiver
                            )
                            call.respond(HttpStatusCode.OK, message)
                        } catch (e: IOException) {
                            call.respond(HttpStatusCode.InternalServerError)
                        } catch (e: Exception) {
                            File(filePath).delete()
                            call.respond(HttpStatusCode.BadRequest)
                        }
                    }

                    post("/{id}/upload-image") {
                        val sender = User(id = call.sessions.get<ChatSession>()?.id)
                        val receiver = User(id = call.parameters["id"]?.toLong())
                        val parts = call.receiveMultipart()
                        var content = ""
                        val renderFormat = "webp"
                        val imageName = "${getUUID()}.$renderFormat"
                        var filePath = ChatDefaults.PRIVATE_IMAGE_UPLOAD_FOLDER

                        try {
                            val uploadDir = File(filePath)
                            if (!uploadDir.mkdirs() && !uploadDir.exists()) {
                                throw IOException("Failed to create directory ${uploadDir.absolutePath}")
                            }
                            filePath += imageName
                            parts.forEachPart { part ->
                                when (part) {
                                    is PartData.FormItem -> content = part.value
                                    is PartData.FileItem -> part.saveImage(filePath, renderFormat)
                                    else -> Unit
                                }
                            }
                            val message = PvtMessage(
                                content = content, image = filePath, type = MessageType.Chat,
                                sender = sender, receiver = receiver
                            )
                            call.respond(HttpStatusCode.OK, message)
                        } catch (e: IOException) {
                            call.respond(HttpStatusCode.InternalServerError)
                        } catch (e: Exception) {
                            File(filePath).delete()
                            call.respond(HttpStatusCode.BadRequest)
                        }
                    }
                }

            }

            route("/user") {
                get("/{id}") {
                    try {
                        call.sessions.get<ChatSession>() ?: throw Exception()
                        val id = call.parameters["id"]!!.toLong()
                        val user = userRepository.findUserById(id) ?: throw UserNotFoundException()
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: UserNotFoundException) {
                        call.respond(HttpStatusCode.NotFound, "User not found")
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.InternalServerError, "Something went error")
                    }

                }

                post("/update-avatar") {
                    val parts = call.receiveMultipart()
                    val renderFormat = "webp"
                    val imageName = "${getUUID()}.$renderFormat"
                    var filePath = ChatDefaults.AVATAR_FOLDER
                    val chatSession = call.sessions.get<ChatSession>()
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
                        userRepository.updateAvatar(chatSession?.id!!, filePath)
                        val user = userRepository.findUserById(chatSession.id!!)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: IOException) {
                        call.respond(HttpStatusCode.InternalServerError)
                    } catch (e: Exception) {
                        File(filePath).delete()
                        call.respond(HttpStatusCode.BadRequest)
                    }
                }

                post("/update-default-avatar") {
                    try {
                        println(call.receiveParameters())
                        val chatSession = call.sessions.get<ChatSession>()
                        val avatar = call.receiveParameters()["avatar"].toString()
                        userRepository.updateAvatar(chatSession?.id!!, avatar)
                        val user = userRepository.findUserById(chatSession.id!!)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.BadRequest)
                    }
                }

                post("/update-name") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val id = chatSession?.id!!
                        val name = call.receiveParameters()["name"].toString()
                        if (!name.isNameValid()) throw ValidationException("Name should not contain special characters.")
                        val slug = call.request.host().getDomain()
                        val domain = domainRepository.findDomainBySlug(slug) ?: throw Exception()
                        val isUserExists = userRepository.isUserExists(name, domain.id!!)
                        if (isUserExists) throw UserAlreadyFoundException("Username already taken.")
                        userRepository.updateName(id, name)
                        val user = userRepository.findUserById(id)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: ValidationException) {
                        call.respond(HttpStatusCode.Conflict, e.message ?: "Something went wrong.")
                    } catch (e: UserAlreadyFoundException) {
                        call.respond(HttpStatusCode.Conflict, e.message ?: "Something went wrong.")
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/customize-name") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val id = chatSession?.id!!
                        val nameColor = call.receiveParameters()["nameColor"]
                        val font = call.receiveParameters()["nameFont"]
                        userRepository.customizeName(id, nameColor, font)
                        val user = userRepository.findUserById(id)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/update-password") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val user = userRepository.findUserById(chatSession?.id!!) ?: throw Exception()
                        if (user.rank?.code == RankNames.GUEST) throw Exception()
                        val password = call.receiveParameters()["password"].toString()
                        if (password.length < 8) throw Exception("Must have min 8 letters")
                        userRepository.updatePassword(chatSession.id!!, password.hashPassword())
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/update-mood") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val mood = call.receiveParameters()["mood"]
                        userRepository.updateMood(chatSession?.id!!, mood)
                        val user = userRepository.findUserById(chatSession.id!!)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/update-about") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val about = call.receiveParameters()["about"]
                        userRepository.updateAbout(chatSession?.id!!, about)
                        val user = userRepository.findUserById(chatSession.id!!)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/update-status") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val id = chatSession?.id!!
                        val status = call.receiveParameters()["status"].toString()
                        userRepository.updateStatus(id, Status.valueOf(status))
                        val user = userRepository.findUserById(id)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/update-gender") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val id = chatSession?.id!!
                        val gender = call.receiveParameters()["gender"].toString()
                        userRepository.updateGender(id, Gender.valueOf(gender))
                        val user = userRepository.findUserById(id)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/update-dob") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val param = call.receiveParameters()["dob"]
                        userRepository.updateDob(chatSession?.id!!, param?.toDob())
                        val user = userRepository.findUserById(chatSession.id!!)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/customize-text") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val isTextBold = call.receiveParameters()["textBold"].toBoolean()
                        val textColor = call.receiveParameters()["textColor"]
                        val textFont = call.receiveParameters()["textFont"]
                        userRepository.customizeText(chatSession?.id!!, isTextBold, textColor, textFont)
                        val user = userRepository.findUserById(chatSession.id!!)
                        WsController.updateMember(user!!)
                        call.respond(HttpStatusCode.OK, user)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/change-sound-settings") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val id = chatSession?.id!!
                        val chatSound = call.receiveParameters()["chatSound"].toBoolean()
                        val pvtSound = call.receiveParameters()["pvtSound"].toBoolean()
                        val nameSound = call.receiveParameters()["nameSound"].toBoolean()
                        val notifiSound = call.receiveParameters()["notifiSound"].toBoolean()
                        userRepository.changeSoundSettings(id, chatSound, pvtSound, nameSound, notifiSound)
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }

                post("/change-private") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val id = chatSession?.id!!
                        val private = call.receiveParameters()["private"].toBoolean()
                        userRepository.changePrivate(id, private)
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                    }
                }
            }

            post("/logout") {
                try {
                    val chatSession = call.principal<ChatSession>()
                    val user = userRepository.findUserById(chatSession?.id!!)
                    if (user?.rank?.code == RankNames.GUEST) userRepository.delete(user.id!!)
                    call.sessions.clear<ChatSession>()
                    call.respondRedirect("/")
                } catch (e: Exception) {
                    e.printStackTrace()
                    call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                }
            }

        }

        route("/register") {

            get {
                val model = mutableMapOf<String, Any>("errors" to errors, "data" to data)
                var domain: Domain? = null
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomain()
                    domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    if (chatSession == null) {
                        model["domain"] = domain
                        call.respondTemplate("client/auth/register", model)
                        return@get
                    }
                    userRepository.findUserById(chatSession.id!!) ?: throw UserNotFoundException()
                    call.respondRedirect("/")
                } catch (e: UserNotFoundException) {
                    call.sessions.clear<ChatSession>()
                    model["domain"] = domain!!
                    call.respondTemplate("client/auth/register", model)
                } catch (e: DomainNotFoundException) {
                    call.respond(HttpStatusCode.NotFound)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError)
                    e.printStackTrace()
                }
            }

            authenticate(Auth.AUTH_REGISTER_FORM) {
                post {
                    val chatSession = call.principal<ChatSession>()
                    call.sessions.set(chatSession)
                    call.respondRedirect("/")
                }
            }
        }

        route("/guest") {

            get {
                val model = mutableMapOf<String, Any>("errors" to errors)
                var domain: Domain? = null
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomain()
                    domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    if (chatSession == null) {
                        model["domain"] = domain!!
                        call.respondTemplate("client/auth/guest", model)
                        return@get
                    }
                    userRepository.findUserById(chatSession.id!!) ?: throw UserNotFoundException()
                    call.respondRedirect("/")
                } catch (e: UserNotFoundException) {
                    call.sessions.clear<ChatSession>()
                    model["domain"] = domain!!
                    call.respondTemplate("client/auth/guest", model)
                } catch (e: DomainNotFoundException) {
                    call.respond(HttpStatusCode.NotFound)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError)
                    e.printStackTrace()
                }

            }

            authenticate(Auth.AUTH_GUEST_FORM) {
                post {
                    val chatSession = call.principal<ChatSession>()
                    call.sessions.set(chatSession)
                    call.respondRedirect("/")
                }
            }
        }

        route("/login") {
            get {
                val model = mutableMapOf<String, Any>("errors" to errors)
                var domain: Domain? = null
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomain()
                    domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    if (chatSession == null) {
                        model["domain"] = domain!!
                        call.respondTemplate("client/auth/login", model)
                        return@get
                    }
                    userRepository.findUserById(chatSession.id!!) ?: throw UserNotFoundException()
                    call.respondRedirect("/")
                } catch (e: UserNotFoundException) {
                    call.sessions.clear<ChatSession>()
                    model["domain"] = domain!!
                    call.respondTemplate("client/auth/login", model)
                } catch (e: DomainNotFoundException) {
                    call.respond(HttpStatusCode.NotFound)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            authenticate(Auth.AUTH_LOGIN_FORM) {
                post {
                    val chatSession = call.principal<ChatSession>()
                    call.sessions.set(chatSession)
                    call.respondRedirect("/")
                }
            }
        }

    }
}




