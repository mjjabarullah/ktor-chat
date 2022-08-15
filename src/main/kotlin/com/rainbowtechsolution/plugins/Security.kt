package com.rainbowtechsolution.plugins

import com.rainbowtechsolution.common.Auth
import com.rainbowtechsolution.common.ChatDefaults
import com.rainbowtechsolution.common.RankNames
import com.rainbowtechsolution.data.entity.Gender
import com.rainbowtechsolution.data.repository.DomainRepository
import com.rainbowtechsolution.data.repository.RankRepository
import com.rainbowtechsolution.data.repository.UserRepository
import com.rainbowtechsolution.domain.model.ChatSession
import com.rainbowtechsolution.domain.model.Domain
import com.rainbowtechsolution.domain.model.User
import com.rainbowtechsolution.exceptions.DomainNotFoundException
import com.rainbowtechsolution.exceptions.UserAlreadyFoundException
import com.rainbowtechsolution.exceptions.UserNotFoundException
import com.rainbowtechsolution.utils.getDomain
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

    val errors = mutableMapOf<String, String>()
    val data = mutableMapOf<String, String>()
    val config = environment.config
    val signKey = config.property("session.secretSignKey").getString()
    val encryptKey = config.property("session.secretEncryptKey").getString()

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

    install(Authentication) {
        form(Auth.AUTH_REGISTER_FORM) {
            userParamName = Auth.FIELD_USERNAME
            passwordParamName = Auth.FIELD_PASSWORD
            var domain: Domain? = null
            validate { credential ->
                errors.clear()
                val params = receiveParameters()
                val name = credential.name.trim()
                val password = credential.password.trim()
                val gender = Gender.values()[params["gender"]?.toInt()!!].name
                val email = params["email"]?.trim() ?: ""
                data["name"] = name
                data["email"] = email
                data["password"] = password
                val ip = params["ip"] ?: request.origin.remoteHost
                val deviceId = params["deviceId"]
                val timezone = params["timezone"]
                val country = params["country"]
                try {
                    val slug = request.host().getDomain()
                    domain = domainRepository.findDomainBySlug(slug) ?: throw Exception()

                    var user = User(
                        name = name, email = email, password = password, avatar = ChatDefaults.USER_AVATAR, ip = ip,
                        gender = gender, deviceId = deviceId, timezone = timezone, country = country
                    ).also { it.validate() }
                    user = user.copy(password = password.hashPassword())

                    val isUserExists = userRepository.isUserExists(user.name!!, user.email!!, domain?.id!!)
                    if (isUserExists) throw UserAlreadyFoundException("Username or Email address already exists.")

                    val rankId = rankRepository.findRankByCode(RankNames.USER, domain?.id!!)?.id ?: throw Exception()
                    val id = userRepository.register(user, domain?.id!!, rankId)
                    ChatSession(id)

                } catch (e: UserAlreadyFoundException) {
                    errors["default"] = e.message ?: "Something went wrong. Try again"
                    null
                } catch (e: ConstraintViolationException) {
                    e.constraintViolations
                        .mapToMessage(baseName = "messages", locale = Locale.ENGLISH)
                        .forEach { errors[it.property] = it.message }
                    null
                } catch (e: Exception) {
                    e.printStackTrace()
                    errors["default"] = "Something went wrong. Try again"
                    null
                }
            }
            challenge {
                if (domain != null) {
                    call.respondTemplate(
                        "client/auth/register",
                        mapOf("errors" to errors, "data" to data, "domain" to domain!!)
                    )
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }
        }

        form(Auth.AUTH_GUEST_FORM) {
            userParamName = Auth.FIELD_USERNAME
            passwordParamName = Auth.FIELD_PASSWORD
            var domain: Domain? = null
            validate { credential ->
                errors.clear()
                val params = receiveParameters()
                val name = credential.name
                val password = Auth.GUEST_PASSWORD
                val email = Auth.GUEST_EMAIL
                val ip = params["ip"] ?: request.origin.remoteHost
                val deviceId = params["deviceId"]
                val timezone = params["timezone"]
                val country = params["country"]
                try {
                    val slug = request.host().getDomain()
                    domain = domainRepository.findDomainBySlug(slug) ?: throw Exception()

                    val paramGender = params["gender"]
                    if (paramGender.isNullOrEmpty()) throw Exception()
                    val gender = Gender.values()[params["gender"]?.toInt()!!].name

                    var user = User(
                        name = name, email = email, password = password, avatar = ChatDefaults.GUEST_AVATAR,
                        ip = ip, gender = gender, deviceId = deviceId, timezone = timezone, country = country
                    ).also { it.validate() }
                    user = user.copy(password = password.hashPassword())

                    val isUserExists = userRepository.isUserExists(user.name!!, domain?.id!!)
                    if (isUserExists) throw UserAlreadyFoundException("Username already registered.")

                    val rankId = rankRepository.findRankByCode(RankNames.GUEST, domain?.id!!)?.id ?: throw Exception()
                    val id = userRepository.register(user, domain?.id!!, rankId)
                    ChatSession(id)

                } catch (e: UserAlreadyFoundException) {
                    errors["default"] = e.message ?: "Something went wrong. Try again"
                    null
                } catch (e: ConstraintViolationException) {
                    e.constraintViolations
                        .mapToMessage(baseName = "messages", locale = Locale.ENGLISH)
                        .forEach {
                            println(it.property + " - " + it.message)
                            errors[it.property] = it.message
                        }
                    null
                } catch (e: Exception) {
                    errors["default"] = "Something went wrong. Try again"
                    null
                }
            }
            challenge {
                if (domain != null) {
                    call.respondTemplate(
                        "client/auth/guest",
                        mapOf("errors" to errors, "data" to data, "domain" to domain!!)
                    )
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }
        }

        form(Auth.AUTH_LOGIN_FORM) {
            userParamName = Auth.FIELD_USERNAME
            passwordParamName = Auth.FIELD_PASSWORD
            var domain: Domain? = null
            validate { credential ->
                errors.clear()
                val params = receiveParameters()
                val name = credential.name
                val password = credential.password
                val ip = params["ip"] ?: request.origin.remoteHost
                val deviceId = params["deviceId"]
                val timezone = params["timezone"]
                val country = params["country"]
                try {
                    val slug = request.host().getDomain()
                    domain = domainRepository.findDomainBySlug(slug) ?: throw Exception()

                    var user = userRepository.login(name, password, domain?.id!!) ?: throw UserNotFoundException()
                    user = user.copy(ip = ip, deviceId = deviceId, timezone = timezone, country = country)
                    if (user.rank?.code == RankNames.GUEST) throw UserNotFoundException()

                    userRepository.update(user)
                    ChatSession(user.id)
                } catch (e: UserNotFoundException) {
                    errors["default"] = e.message ?: "Something went wrong. Try again"
                    null
                } catch (e: Exception) {
                    e.printStackTrace()
                    errors["default"] = "Something went wrong. Try again"
                    null
                }
            }
            challenge {
                if (domain != null) {
                    call.respondTemplate(
                        "client/auth/login",
                        mapOf("errors" to errors, "data" to data, "domain" to domain!!)
                    )
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }
        }

        session<ChatSession>(Auth.AUTH_SESSION) {
            validate { chatSession ->
                chatSession
            }
            challenge {
                try {
                    val slug = call.request.host().getDomain()
                    val domain = domainRepository.findDomainBySlug(slug) ?: throw DomainNotFoundException()
                    call.respondTemplate("client/index", mapOf("domain" to domain))
                } catch (_: DomainNotFoundException) {
                    call.respond(HttpStatusCode.NotFound)
                }
            }
        }
    }
}

