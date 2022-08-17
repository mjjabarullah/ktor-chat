package com.rainbowtechsolution.routes


import com.rainbowtechsolution.common.Auth
import com.rainbowtechsolution.common.ChatDefaults
import com.rainbowtechsolution.controller.WsController
import com.rainbowtechsolution.data.entity.MessageType
import com.rainbowtechsolution.data.entity.ReportType
import com.rainbowtechsolution.data.repository.*
import com.rainbowtechsolution.domain.model.*
import com.rainbowtechsolution.utils.encodeToString
import com.rainbowtechsolution.utils.getDomain
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import kotlinx.coroutines.async


fun Route.adminRotes(
    domains: List<String>,
    domainRepository: DomainRepository,
    userRepository: UserRepository,
    rankRepository: RankRepository,
    permissionRepository: PermissionRepository,
    roomRepository: RoomRepository,
    messageRepository: MessageRepository,
    reportRepository: ReportRepository
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
        }
    }
}

