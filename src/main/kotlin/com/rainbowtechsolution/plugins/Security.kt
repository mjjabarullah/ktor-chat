package com.rainbowtechsolution.plugins

import com.rainbowtechsolution.common.Auth
import com.rainbowtechsolution.common.ChatDefaults
import com.rainbowtechsolution.common.Errors
import com.rainbowtechsolution.common.RankNames
import com.rainbowtechsolution.data.entity.Gender
import com.rainbowtechsolution.data.entity.PostType
import com.rainbowtechsolution.data.model.ChatSession
import com.rainbowtechsolution.data.model.Seen
import com.rainbowtechsolution.data.model.User
import com.rainbowtechsolution.data.repository.*
import com.rainbowtechsolution.exceptions.DomainNotFoundException
import com.rainbowtechsolution.exceptions.UserAlreadyFoundException
import com.rainbowtechsolution.exceptions.UserNotFoundException
import com.rainbowtechsolution.utils.getDomainSlug
import com.rainbowtechsolution.utils.hashPassword
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.plugins.*
import io.ktor.server.plugins.doublereceive.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.sessions.*
import io.ktor.server.thymeleaf.*
import io.ktor.util.*
import org.koin.ktor.ext.inject
import org.valiktor.ConstraintViolationException
import org.valiktor.i18n.mapToMessage
import java.io.File
import java.util.*
import kotlin.time.Duration

fun Application.configureSecurity() {

    val userRepository by inject<UserRepository>()
    val domainRepository by inject<DomainRepository>()
    val rankRepository by inject<RankRepository>()
    val postRepository by inject<PostRepository>()

    val config = environment.config
    val signKey = config.property("session.secretSignKey").getString()
    val encryptKey = config.property("session.secretEncryptKey").getString()

    install(Authentication) {
        form(Auth.AUTH_REGISTER_FORM) {
            userParamName = Auth.FIELD_USERNAME
            passwordParamName = Auth.FIELD_PASSWORD
            val errors = mutableMapOf<String, String>()
            validate { credential ->
                val params = receiveParameters()
                val name = credential.name.trim()
                val password = credential.password.trim()
                val gender = Gender.valueOf(params["gender"].toString()).name
                val email = params["email"].toString().trim()
                val ip = params["ip"] ?: request.origin.remoteHost
                val deviceId = params["deviceId"]
                val timezone = params["timezone"]
                val country = params["country"]
                try {
                    val slug = request.host().getDomainSlug()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw Exception()
                    val domainId = domain.id!!

                    var user = User(
                        name = name, email = email, password = password, avatar = ChatDefaults.USER_AVATAR, ip = ip,
                        gender = gender, deviceId = deviceId, timezone = timezone, country = country
                    ).also { it.validate() }
                    user = user.copy(password = password.hashPassword())

                    val isUserExists = userRepository.isUserExists(name, email, domainId)
                    if (isUserExists) throw UserAlreadyFoundException(Errors.USER_NAME_OR_EMAIL_REGISTERED)

                    val rankId = rankRepository.findRankByCode(RankNames.USER, domainId)?.id ?: throw Exception()
                    val userId = userRepository.register(user, domainId, rankId)

                    val seen = PostType.values().map { Seen(userId, domainId, it) }
                    postRepository.createSeen(seen)

                    ChatSession(userId)
                } catch (e: ConstraintViolationException) {
                    e.printStackTrace()
                    e.constraintViolations
                        .mapToMessage(baseName = "messages", locale = Locale.ENGLISH)
                        .forEach { errors[it.property] = it.message }
                    null
                } catch (e: Exception) {
                    e.printStackTrace()
                    errors["default"] = e.message ?: Errors.SOMETHING_WENT_WRONG
                    null
                }
            }
            challenge { call.respond(HttpStatusCode.BadRequest, errors) }
        }

        form(Auth.AUTH_GUEST_FORM) {
            userParamName = Auth.FIELD_USERNAME
            passwordParamName = Auth.FIELD_PASSWORD
            val errors = mutableMapOf<String, String>()
            validate { credential ->
                val params = receiveParameters()
                val name = credential.name
                val password = Auth.GUEST_PASSWORD
                val email = Auth.GUEST_EMAIL
                val ip = params["ip"] ?: request.origin.remoteHost
                val deviceId = params["deviceId"]
                val timezone = params["timezone"]
                val country = params["country"]
                try {
                    val slug = request.host().getDomainSlug()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw Exception()
                    val domainId = domain.id!!
                    val paramGender = params["gender"].toString()
                    val gender = Gender.valueOf(paramGender).name

                    var user = User(
                        name = name, email = email, password = password, avatar = ChatDefaults.GUEST_AVATAR,
                        ip = ip, gender = gender, deviceId = deviceId, timezone = timezone, country = country
                    ).also { it.validate() }
                    user = user.copy(password = password.hashPassword())

                    val isUserExists = userRepository.isUserExists(name, domainId)
                    if (isUserExists) throw UserAlreadyFoundException(Errors.USER_NAME_REGISTERED)

                    val rankId = rankRepository.findRankByCode(RankNames.GUEST, domainId)?.id ?: throw Exception()
                    val userId = userRepository.register(user, domainId, rankId)

                    val seen = PostType.values().map { Seen(userId, domainId, it) }
                    postRepository.createSeen(seen)

                    ChatSession(userId)
                } catch (e: UserAlreadyFoundException) {
                    errors["default"] = e.message.toString()
                    null
                } catch (e: ConstraintViolationException) {
                    e.constraintViolations
                        .mapToMessage(baseName = "messages", locale = Locale.ENGLISH)
                        .forEach {
                            errors[it.property] = it.message
                        }
                    null
                } catch (e: Exception) {
                    errors["default"] = e.message ?: Errors.SOMETHING_WENT_WRONG
                    null
                }
            }
            challenge { call.respond(HttpStatusCode.BadRequest, errors) }
        }

        form(Auth.AUTH_LOGIN_FORM) {
            userParamName = Auth.FIELD_USERNAME
            passwordParamName = Auth.FIELD_PASSWORD
            val errors = mutableMapOf<String, String>()
            validate { credential ->
                val params = receiveParameters()
                val name = credential.name
                val password = credential.password
                val ip = params["ip"] ?: request.origin.remoteHost
                val deviceId = params["deviceId"]
                val timezone = params["timezone"]
                val country = params["country"]
                try {
                    val slug = request.host().getDomainSlug()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw Exception()
                    val domainId = domain.id!!

                    var user = userRepository.login(name, password, domainId)
                        ?: throw UserNotFoundException("Username or Password invalid.")
                    user = user.copy(ip = ip, deviceId = deviceId, timezone = timezone, country = country)
                    if (user.rank?.code == RankNames.GUEST) throw UserNotFoundException("Username or Password invalid.")

                    userRepository.update(user)
                    ChatSession(user.id)
                } catch (e: Exception) {
                    errors["default"] = e.message ?: Errors.SOMETHING_WENT_WRONG
                    null
                }
            }
            challenge { call.respond(HttpStatusCode.BadRequest, errors) }
        }

        session<ChatSession>(Auth.AUTH_SESSION) {
            validate { chatSession ->
                chatSession
            }
            challenge {
                try {
                    val slug = call.request.host().getDomainSlug()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    call.respondTemplate("client/index", mapOf("domain" to domain))
                } catch (_: DomainNotFoundException) {
                    call.respond(HttpStatusCode.NotFound)
                }
            }
        }
    }

    install(DoubleReceive)

    install(Sessions) {
        val secretSignKey = hex(signKey)
        val secretEncryptKey = hex(encryptKey)
        cookie<ChatSession>(Auth.COOKIE_AUTH, storage = directorySessionStorage(File("build/.sessions"))) {
            cookie.path = "/"
            cookie.extensions["SameSite"] = "lax"
            cookie.maxAge = Duration.INFINITE
            transform(SessionTransportTransformerEncrypt(secretEncryptKey, secretSignKey))
        }
    }

}

