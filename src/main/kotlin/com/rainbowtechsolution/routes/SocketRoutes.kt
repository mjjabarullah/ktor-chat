package com.rainbowtechsolution.routes

import com.rainbowtechsolution.controller.WsController
import com.rainbowtechsolution.data.entity.MessageType
import com.rainbowtechsolution.data.repository.ReportRepository
import com.rainbowtechsolution.data.repository.RoomRepository
import com.rainbowtechsolution.data.repository.WsRepository
import com.rainbowtechsolution.data.repository.UserRepository
import com.rainbowtechsolution.domain.model.ChatSession
import com.rainbowtechsolution.domain.model.Message
import com.rainbowtechsolution.domain.model.PvtMessage
import com.rainbowtechsolution.utils.decodeFromString
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.channels.consumeEach


fun Route.wsRoutes(
    wsRepository: WsRepository,
    userRepository: UserRepository,
    roomRepository: RoomRepository
) {

    webSocket("/chatroom/{roomId}") {
        val roomId = call.parameters["roomId"]?.toInt()
        val chatSession = call.sessions.get<ChatSession>()
        val sessionId = call.sessionId
        if (chatSession == null || sessionId == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No session."))
            return@webSocket
        }
        val user = userRepository.findUserById(chatSession.id!!)?.copy()
        if (user == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No user found"))
            return@webSocket
        }
        user.socket = this
        val room = roomId?.let { roomRepository.findRoomById(it) }
        if (room == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No room found"))
            return@webSocket
        }
        try {
            wsRepository.connectRoom(user, room, sessionId)
            incoming.consumeEach { frame ->
                when (frame) {
                    is Frame.Text -> {
                        val message = frame.readText().decodeFromString<Message>()
                        wsRepository.sendMessage(sessionId, room, message)
                    }
                    else -> Unit
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            userRepository.setSessions(user.id!!, false)
            wsRepository.disconnectRoom(user, roomId, sessionId)
        }
    }

    webSocket("/member/{userId}") {
        val userId = call.parameters["userId"]?.toLong()
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
            wsRepository.connectUser(sender, sessionId)
            incoming.consumeEach { frame ->
                if (frame is Frame.Text) {
                    var pvtMessage = frame.readText().decodeFromString<PvtMessage>()
                    pvtMessage = pvtMessage.copy(sender = sender)
                    wsRepository.sendPrivateMessage(pvtMessage)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            wsRepository.disconnectUser(sessionId)
        }
    }
}

