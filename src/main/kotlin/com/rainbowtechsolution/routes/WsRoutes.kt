package com.rainbowtechsolution.routes

import com.rainbowtechsolution.data.model.ChatSession
import com.rainbowtechsolution.data.model.Message
import com.rainbowtechsolution.data.model.PvtMessage
import com.rainbowtechsolution.data.repository.PermissionRepository
import com.rainbowtechsolution.data.repository.RoomRepository
import com.rainbowtechsolution.data.repository.UserRepository
import com.rainbowtechsolution.data.repository.WsRepository
import com.rainbowtechsolution.utils.decodeFromString
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.channels.consumeEach


fun Route.wsRoutes(
    wsRepository: WsRepository,
    userRepository: UserRepository,
    roomRepository: RoomRepository,
    permissionRepository: PermissionRepository
) {

    webSocket("/chat/{domainId}/room/{roomId}") {
        val roomId = call.parameters["roomId"]!!.toInt()
        val domainId = call.parameters["domainId"]!!.toInt()
        val chatSession = call.sessions.get<ChatSession>()
        if (chatSession == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No session."))
            return@webSocket
        }
        val userId = chatSession.id!!
        val user = userRepository.findUserById(userId)?.copy()
        if (user == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No user found"))
            return@webSocket
        }
        user.socket = this
        val room = roomRepository.findRoomById(roomId)
        if (room == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No room found"))
            return@webSocket
        }
        val permission = permissionRepository.findPermissionByRank(user.rank?.id!!)!!
        try {
            wsRepository.connectRoom(user, roomId, domainId)
            incoming.consumeEach { frame ->
                when (frame) {
                    is Frame.Text -> {
                        var message = frame.readText().decodeFromString<Message>()
                        message = message.copy(roomId = roomId, user= user, domainId = domainId)
                        wsRepository.sendMessage(message, permission)
                    }
                    else -> Unit
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            userRepository.setSessions(userId, false)
            wsRepository.disconnectRoom(domainId, roomId, user, this)
        }
    }

    webSocket("/{domainId}/member/{userId}") {
        val userId = call.parameters["userId"]?.toLong()
        val domainId = call.parameters["domainId"]!!.toInt()
        val chatSession = call.sessions.get<ChatSession>()
        val sessionId = call.sessionId
        if (chatSession == null || sessionId == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No session."))
            return@webSocket
        }
        val sender = userRepository.findUserById(userId!!)?.copy()
        if (sender == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No user found"))
            return@webSocket
        }
        sender.socket = this
        try {
            wsRepository.connectUser(sender)
            incoming.consumeEach { frame ->
                if (frame is Frame.Text) {
                    var pvtMessage = frame.readText().decodeFromString<PvtMessage>()
                    pvtMessage = pvtMessage.copy(sender = sender, domainId = domainId)
                    wsRepository.sendPrivateMessage(pvtMessage)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            wsRepository.disconnectUser(this)
        }
    }
}

