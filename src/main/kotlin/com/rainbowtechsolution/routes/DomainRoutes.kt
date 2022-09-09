package com.rainbowtechsolution.routes

import com.rainbowtechsolution.common.Auth
import com.rainbowtechsolution.common.ChatDefaults
import com.rainbowtechsolution.common.Errors
import com.rainbowtechsolution.common.RankNames
import com.rainbowtechsolution.controller.WsController
import com.rainbowtechsolution.data.entity.*
import com.rainbowtechsolution.data.model.*
import com.rainbowtechsolution.data.repository.*
import com.rainbowtechsolution.exceptions.*
import com.rainbowtechsolution.utils.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import io.ktor.server.thymeleaf.*
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import org.valiktor.ConstraintViolationException
import org.valiktor.i18n.mapToMessage
import java.io.File
import java.io.IOException
import java.time.LocalDateTime
import java.util.*

fun Route.domainRoutes(
    domains: List<String>, roomRepository: RoomRepository, userRepository: UserRepository,
    messageRepository: MessageRepository, domainRepository: DomainRepository, rankRepository: RankRepository,
    permissionRepository: PermissionRepository, reportRepository: ReportRepository, postRepository: PostRepository,
    commentRepository: CommentRepository,
) {

    if (domains.isEmpty()) return

    host(domains) {
        authenticate(Auth.AUTH_SESSION) {
            get {
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomainSlug()
                    val userId = chatSession?.id!!
                    val user = userRepository.findUserById(userId) ?: throw UserNotFoundException()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    val roomId = user.roomId
                    user.roomId ?: run {
                        call.respondRedirect("/${domain.id}/lobby")
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

            post("/logout") {
                try {
                    val userId = call.sessions.get<ChatSession>()?.id!!
                    val user = userRepository.findUserById(userId)
                    if (user?.rank?.code == RankNames.GUEST) userRepository.delete(user.id!!)
                    call.sessions.clear<ChatSession>()
                    call.respondRedirect("/")
                } catch (e: Exception) {
                    e.printStackTrace()
                    call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                }
            }

            route("/{domainId}") {

                get("/lobby") {
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val userId = chatSession?.id!!
                        val domainId = call.parameters["domainId"]!!.toInt()
                        val user = userRepository.findUserById(userId) ?: throw UserNotFoundException()
                        val domain = domainRepository.findDomainById(domainId) ?: throw DomainNotFoundException()
                        val rooms = roomRepository.getRoomsByDomain(domainId)
                        call.respondTemplate(
                            "client/lobby",
                            mapOf("domain" to domain, "rooms" to rooms, "user" to user)
                        )
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

                put("/register") {
                    val err = mutableMapOf<String, String>()
                    val params = call.receiveParameters()
                    val name = params["name"]?.trim()
                    val password = params["password"]?.trim()
                    val email = params["email"]?.trim() ?: ""
                    val gender = params["gender"].toString()
                    try {
                        val chatSession = call.sessions.get<ChatSession>()
                        val domainId = call.parameters["domainId"]!!.toInt()
                        val domain = domainRepository.findDomainById(domainId) ?: throw Exception()

                        var user = User(
                            id = chatSession?.id!!, name = name, email = email, password = password,
                            gender = gender, avatar = ChatDefaults.USER_AVATAR
                        ).also { it.validate() }

                        user = user.copy(password = password!!.hashPassword())

                        val isUserExists = userRepository.isEmailExists(user.email!!, domain.id!!)
                        if (isUserExists) throw UserAlreadyFoundException("Email address already exists.")

                        val rankId = rankRepository.findRankByCode(RankNames.USER, domain.id!!)?.id ?: throw Exception()

                        userRepository.guestRegister(user, rankId)
                        call.respond(HttpStatusCode.OK, "Registration Successful")
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

                route("/users") {

                    get("/{userId}") {
                        try {
                            val userId = call.parameters["userId"]!!.toLong()
                            val user = userRepository.findUserById(userId) ?: throw UserNotFoundException()
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: UserNotFoundException) {
                            call.respond(HttpStatusCode.NotFound)
                        } catch (e: Exception) {
                            call.respond(HttpStatusCode.InternalServerError, Errors.SOMETHING_WENT_WRONG)
                        }
                    }

                    get("/blocked-users") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val users = userRepository.getBlockedUsers(userId)
                            call.respond(HttpStatusCode.OK, users)
                        } catch (e: Exception) {
                            call.respond(HttpStatusCode.InternalServerError, Errors.SOMETHING_WENT_WRONG)
                        }
                    }

                    post("/block") {
                        try {
                            val blocker = call.sessions.get<ChatSession>()?.id!!
                            val blocked = call.receiveParameters()["blocked"]!!.toLong()
                            userRepository.blockUser(blocker, blocked)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            call.respond(HttpStatusCode.InternalServerError, Errors.SOMETHING_WENT_WRONG)
                        }
                    }

                    delete("/unblock") {
                        try {
                            val blocker = call.sessions.get<ChatSession>()?.id!!
                            val blocked = call.receiveParameters()["blocked"]!!.toLong()
                            userRepository.unblockUser(blocker, blocked)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            call.respond(HttpStatusCode.InternalServerError, Errors.SOMETHING_WENT_WRONG)
                        }
                    }

                    put("/update-avatar") {
                        val parts = call.receiveMultipart()
                        val renderFormat = "webp"
                        val imageName = "${getUUID()}.$renderFormat"
                        var filePath = ChatDefaults.AVATAR_FOLDER
                        val userId = call.sessions.get<ChatSession>()?.id!!
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
                            val user = userRepository.findUserById(userId)
                            WsController.updateMember(user!!)
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: IOException) {
                            call.respond(HttpStatusCode.InternalServerError)
                        } catch (e: Exception) {
                            call.respond(HttpStatusCode.BadRequest)
                        }
                    }

                    put("/update-default-avatar") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val avatar = call.receiveParameters()["avatar"].toString()
                            userRepository.updateAvatar(userId, avatar)
                            val user = userRepository.findUserById(userId)
                            WsController.updateMember(user!!)
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.BadRequest)
                        }
                    }

                    put("/update-name") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val name = call.receiveParameters()["name"].toString()
                            if (!name.isNameValid()) throw ValidationException("Name should not contain special characters.")
                            val slug = call.request.host().getDomainSlug()
                            val domain = domainRepository.findDomainBySlug(slug) ?: throw Exception()
                            val isUserExists = userRepository.isUserExists(name, domain.id!!)
                            if (isUserExists) throw UserAlreadyFoundException("Username already taken.")
                            userRepository.updateName(userId, name)
                            val user = userRepository.findUserById(userId)
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

                    put("/customize-name") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val nameColor = call.receiveParameters()["nameColor"]
                            val font = call.receiveParameters()["nameFont"]
                            userRepository.customizeName(userId, nameColor, font)
                            val user = userRepository.findUserById(userId)
                            WsController.updateMember(user!!)
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }

                    put("/update-password") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val user = userRepository.findUserById(userId) ?: throw Exception()
                            if (user.rank?.code == RankNames.GUEST) throw Exception()
                            val password = call.receiveParameters()["password"].toString()
                            if (password.length < 8) throw Exception("Must have min 8 letters")
                            userRepository.updatePassword(userId, password.hashPassword())
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }

                    put("/update-mood") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val mood = call.receiveParameters()["mood"]
                            userRepository.updateMood(userId, mood)
                            val user = userRepository.findUserById(userId)
                            WsController.updateMember(user!!)
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }

                    put("/update-about") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val about = call.receiveParameters()["about"]
                            userRepository.updateAbout(userId, about)
                            val user = userRepository.findUserById(userId)
                            WsController.updateMember(user!!)
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }

                    put("/update-status") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val status = call.receiveParameters()["status"].toString()
                            userRepository.updateStatus(userId, Status.valueOf(status))
                            val user = userRepository.findUserById(userId)
                            WsController.updateMember(user!!)
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }

                    put("/update-gender") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val gender = call.receiveParameters()["gender"].toString()
                            userRepository.updateGender(userId, Gender.valueOf(gender))
                            val user = userRepository.findUserById(userId)
                            WsController.updateMember(user!!)
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }

                    put("/update-dob") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val param = call.receiveParameters()["dob"]
                            userRepository.updateDob(userId, param?.toDob())
                            val user = userRepository.findUserById(userId)
                            WsController.updateMember(user!!)
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }

                    put("/customize-text") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val params = call.receiveParameters()
                            val isTextBold = params["textBold"].toBoolean()
                            val textColor = params["textColor"]
                            val textFont = params["textFont"]
                            userRepository.customizeText(userId, isTextBold, textColor, textFont)
                            val user = userRepository.findUserById(userId)
                            WsController.updateMember(user!!)
                            call.respond(HttpStatusCode.OK, user)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }

                    put("/change-sound-settings") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val params = call.receiveParameters()
                            val chatSound = params["chatSound"].toBoolean()
                            val pvtSound = params["pvtSound"].toBoolean()
                            val nameSound = params["nameSound"].toBoolean()
                            val notifiSound = params["notifiSound"].toBoolean()
                            userRepository.changeSoundSettings(userId, chatSound, pvtSound, nameSound, notifiSound)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }

                    put("/change-private") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val private = call.receiveParameters()["private"].toBoolean()
                            userRepository.changePrivate(userId, private)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong.")
                        }
                    }
                }

                route("/rooms") {

                    get {
                        try {
                            val domainId = call.parameters["domainId"]!!.toInt()
                            val rooms = roomRepository.getRoomsByDomain(domainId)
                            call.respond(HttpStatusCode.OK, rooms)
                        } catch (e: Exception) {
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                        }
                    }

                    route("/{roomId}") {

                        get("/users") {
                            try {
                                val roomId = call.parameters["roomId"]!!.toInt()
                                val limit = call.request.queryParameters["limit"].toString().toInt()
                                val users = userRepository.getUsersByRoom(roomId, limit)
                                call.respond(HttpStatusCode.OK, users)
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                            }
                        }

                        post("/join") {
                            try {
                                val chatSession = call.sessions.get<ChatSession>()
                                val userId = chatSession?.id!!
                                val roomId = call.parameters["roomId"]!!.toInt()
                                userRepository.joinRoom(roomId, userId)
                                call.respondRedirect("/")
                            } catch (e: Exception) {
                                call.respond(HttpStatusCode.InternalServerError)
                                e.printStackTrace()
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

                        route("/messages") {

                            get {
                                try {
                                    val roomId = call.parameters["roomId"]?.toInt()
                                    val messages = messageRepository.getRoomMessages(roomId!!)
                                    call.respond(HttpStatusCode.OK, messages)
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                                }
                            }

                            get("/{msgId}") {
                                try {
                                    val msgId = call.parameters["msgId"]!!.toLong()
                                    val message =
                                        messageRepository.findMessageById(msgId) ?: throw MessageNotFoundException()
                                    call.respond(HttpStatusCode.OK, message)
                                } catch (e: MessageNotFoundException) {
                                    call.respond(HttpStatusCode.NotFound, e.message.toString())
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                                }
                            }
                        }
                    }
                }

                route("/pvt") {

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

                    get("/{receiverId}/messages") {
                        try {
                            val sender = call.sessions.get<ChatSession>()?.id!!
                            val receiver = call.parameters["receiverId"]!!.toLong()
                            val messages = messageRepository.getPrivateMessages(sender, receiver)
                            call.respond(HttpStatusCode.OK, messages)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/{senderId}/all-seen") {
                        try {
                            val receiver = call.sessions.get<ChatSession>()?.id!!
                            val sender = call.parameters["senderId"]!!.toLong()
                            messageRepository.setAllSeen(sender, receiver)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/{msgId}/seen") {
                        try {
                            val msgId = call.parameters["msgId"]!!.toLong()
                            messageRepository.setSeen(msgId)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/{receiverId}/upload-audio") {
                        val sender = User(id = call.sessions.get<ChatSession>()?.id)
                        val receiver = User(id = call.parameters["receiverId"]?.toLong())
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

                    post("/{receiverId}/upload-image") {
                        val sender = User(id = call.sessions.get<ChatSession>()?.id)
                        val receiver = User(id = call.parameters["receiverId"]?.toLong())
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

                route("/reports") {
                    get {
                        try {
                            val domainId = call.parameters["domainId"]!!.toInt()
                            val reports = reportRepository.getReportsByDomain(domainId)
                            call.respond(HttpStatusCode.OK, reports)
                        } catch (e: Exception) {
                            call.respond(HttpStatusCode.InternalServerError, "Something went wrong")
                        }
                    }

                    post("/create") {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val domainId = call.parameters["domainId"]?.toInt()!!
                            val params = call.receiveParameters()
                            val targetId = params["targetId"]?.toLong()!!
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

                route("/news") {
                    get {
                        try {
                            val chatSession = call.sessions.get<ChatSession>()
                            val userId = chatSession?.id!!
                            val domainId = call.parameters["domainId"]!!.toInt()
                            val news = postRepository.getPosts(domainId, userId, PostType.Announcement)
                            call.respond(HttpStatusCode.OK, news)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/read") {
                        try {
                            val chatSession = call.sessions.get<ChatSession>()
                            val userId = chatSession?.id!!
                            val domainId = call.parameters["domainId"]!!.toInt()
                            postRepository.readPost(domainId, userId, PostType.Announcement)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }
                }

                route("/adminship") {
                    get {
                        try {
                            val chatSession = call.sessions.get<ChatSession>()
                            val userId = chatSession?.id!!
                            val domainId = call.parameters["domainId"]!!.toInt()
                            val adminships = postRepository.getPosts(domainId, userId, PostType.AdminShip)
                            call.respond(HttpStatusCode.OK, adminships)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/read") {
                        try {
                            val chatSession = call.sessions.get<ChatSession>()
                            val userId = chatSession?.id!!
                            val domainId = call.parameters["domainId"]!!.toInt()
                            postRepository.readPost(domainId, userId, PostType.AdminShip)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }
                }

                route("/global-feed") {
                    get {
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val domainId = call.parameters["domainId"]!!.toInt()
                            val globalFeeds = postRepository.getPosts(domainId, userId, PostType.GlobalFeed)
                            call.respond(HttpStatusCode.OK, globalFeeds)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/create") {
                        var content = ""
                        val renderFormat = "webp"
                        val imageName = "${getUUID()}.$renderFormat"
                        var filePath = ChatDefaults.NEWS_IMAGE_UPLOAD_FOLDER
                        val uploadDir = File(filePath)
                        try {
                            val userId = call.sessions.get<ChatSession>()?.id!!
                            val domainId = call.parameters["domainId"]!!.toInt()
                            val parts = call.receiveMultipart()

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
                            val post = Post(
                                content = content, image = image, user = User(id = userId), domainId = domainId,
                                type = PostType.GlobalFeed
                            )
                            postRepository.createPost(post = post)
                            val message = Message(
                                content = "", user = User(id = userId), type = MessageType.GlobalFeed
                            ).encodeToString()
                            WsController.broadcastToDomain(domainId, message)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    post("/read") {
                        try {
                            val chatSession = call.sessions.get<ChatSession>()
                            val userId = chatSession?.id!!
                            val domainId = call.parameters["domainId"]!!.toInt()
                            postRepository.readPost(domainId, userId, PostType.GlobalFeed)
                            call.respond(HttpStatusCode.OK)
                        } catch (e: Exception) {
                            e.printStackTrace()
                            call.respond(HttpStatusCode.InternalServerError)
                        }
                    }

                    route("/{postId}") {

                        post("/react") {
                            try {
                                val userId = call.sessions.get<ChatSession>()?.id!!
                                val postId = call.parameters["postId"]!!.toInt()
                                val paramReactType = call.receiveParameters()["type"].toString()
                                val reactType = ReactType.valueOf(paramReactType)
                                var reaction = postRepository.getPostReactionByUserId(postId, userId)
                                reaction = if (reaction == null) postRepository.react(postId, userId, reactType)
                                else {
                                    if (reaction.oldReaction == reactType) {
                                        postRepository.deleteReaction(postId, userId)
                                        Reaction()
                                    } else postRepository.updateReaction(postId, userId, reactType)
                                        .copy(oldReaction = reaction.oldReaction)
                                }
                                call.respond(HttpStatusCode.OK, reaction)
                            } catch (e: Exception) {
                                e.printStackTrace()
                                call.respond(HttpStatusCode.InternalServerError)
                            }
                        }

                        route("/comments") {
                            get {
                                try {
                                    val postId = call.parameters["postId"]!!.toInt()
                                    val page = call.request.queryParameters["page"]?.toLong() ?: 0
                                    val offset = page * ChatDefaults.POST_PER_PAGE
                                    val comments = commentRepository.getComments(postId, PostType.GlobalFeed, offset)
                                    call.respond(HttpStatusCode.OK, comments)
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    call.respond(HttpStatusCode.InternalServerError)
                                }
                            }

                            post("/create") {
                                try {
                                    val userId = call.sessions.get<ChatSession>()?.id!!
                                    val user = userRepository.findUserById(userId) ?: throw UserNotFoundException()
                                    val postId = call.parameters["postId"]!!.toInt()
                                    val params = call.receiveParameters()
                                    val content = params["content"].toString()
                                    var comment = Comment(
                                        content = content, user = user, postId = postId, type = PostType.GlobalFeed
                                    )
                                    val commentId = commentRepository.createComment(comment)
                                    comment = comment.copy(id = commentId, createdAt = LocalDateTime.now().format())
                                    call.respond(HttpStatusCode.OK, comment)
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    call.respond(HttpStatusCode.InternalServerError, e.message.toString())
                                }
                            }

                            delete("/{commentId}/delete") {
                                try {
                                    val commentId = call.parameters["commentId"]!!.toInt()
                                    commentRepository.deleteComment(commentId)
                                    call.respond(HttpStatusCode.OK)
                                } catch (e: Exception) {
                                    call.respond(HttpStatusCode.InternalServerError, Errors.SOMETHING_WENT_WRONG)
                                }
                            }
                        }
                    }
                }
            }
        }

        route("/register") {

            get {
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomainSlug()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    if (chatSession != null) {
                        userRepository.findUserById(chatSession.id!!) ?: throw UserNotFoundException()
                        call.respondRedirect("/")
                        return@get
                    }
                    call.respondTemplate("client/auth/register", mapOf("domain" to domain))
                } catch (e: UserNotFoundException) {
                    call.sessions.clear<ChatSession>()
                    call.respondRedirect("/register")
                } catch (e: DomainNotFoundException) {
                    call.respond(HttpStatusCode.NotFound)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError)
                }
            }

            authenticate(Auth.AUTH_REGISTER_FORM) {
                post {
                    val chatSession = call.principal<ChatSession>()
                    call.sessions.set(chatSession)
                    call.respond(HttpStatusCode.OK)
                }
            }
        }

        route("/guest") {

            get {
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomainSlug()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    if (chatSession != null) {
                        userRepository.findUserById(chatSession.id!!) ?: throw UserNotFoundException()
                        call.respondRedirect("/")
                        return@get
                    }
                    call.respondTemplate("client/auth/guest", mapOf("domain" to domain))
                } catch (e: UserNotFoundException) {
                    call.sessions.clear<ChatSession>()
                    call.respondRedirect("/guest")
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
                    call.respond(HttpStatusCode.OK)
                }
            }
        }

        route("/login") {
            get {
                try {
                    val chatSession = call.sessions.get<ChatSession>()
                    val slug = call.request.host().getDomainSlug()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    if (chatSession != null) {
                        userRepository.findUserById(chatSession.id!!) ?: throw UserNotFoundException()
                        call.respondRedirect("/")
                        return@get
                    }
                    call.respondTemplate("client/auth/login", mapOf("domain" to domain))
                } catch (e: UserNotFoundException) {
                    call.sessions.clear<ChatSession>()
                    call.respondRedirect("/login")
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
                    call.respond(HttpStatusCode.OK)
                }
            }
        }
    }
}




