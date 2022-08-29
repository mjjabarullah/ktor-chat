package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.MessageType
import com.rainbowtechsolution.data.repository.MessageRepository
import com.rainbowtechsolution.data.repository.WsRepository
import com.rainbowtechsolution.data.repository.UserRepository
import com.rainbowtechsolution.domain.model.Message
import com.rainbowtechsolution.domain.model.PvtMessage
import com.rainbowtechsolution.domain.model.Room
import com.rainbowtechsolution.domain.model.User
import com.rainbowtechsolution.utils.clean
import com.rainbowtechsolution.utils.encodeToString
import com.rainbowtechsolution.utils.getLogger
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.isActive
import java.util.concurrent.ConcurrentHashMap

class WsController(
    private val messageRepository: MessageRepository,
    private val userRepository: UserRepository,
) : WsRepository {

    private val logger = getLogger()

    companion object {
        val roomMembers = ConcurrentHashMap<Int, HashMap<String, User>>()
        val domainRoomMembers = ConcurrentHashMap<Int, HashMap<Int, HashMap<String, User>>>()
        val members = ConcurrentHashMap<String, User>()

        fun updateMember(user: User) {
            members.forEach { (sessionId, u) ->
                if (u.id!! == user.id!!) {
                    user.socket = members[sessionId]?.socket
                    members[sessionId] = user
                    return@forEach
                }
            }
        }

        private suspend fun send(socket: WebSocketSession?, message: String) {
            try {
                if (socket?.isActive == true) socket.send(Frame.Text(message))
            } catch (_: Exception) {
            }
        }

        suspend fun broadCastToMember(id: Long, message: String) {
            members.values.forEach {
                if (it.id == id) {
                    send(it.socket, message)
                }
            }
        }

        suspend fun broadcastToAll(message: String) {
            members.values.forEach {
                send(it.socket, message)
            }
        }

        suspend fun broadcastToRoom(roomId: Int, message: String) {
            roomMembers[roomId]?.values?.forEach {
                send(it.socket, message)
            }
        }

        suspend fun broadcastPvtMessage(senderId: Long, receiverId: Long, message: String) {
            broadCastToMember(senderId, message)
            broadCastToMember(receiverId, message)
        }

        suspend fun broadCastToStaff(users: List<Long>, message: String) {
            members.values.forEach {
                if (users.contains(it.id)) {
                    send(it.socket, message)
                }
            }
        }
    }

    override suspend fun connectRoom(user: User, room: Room, sessionId: String) {
        userRepository.setSessions(user.id!!, true)
        val roomId = room.id!!
        val joinMessage = Message(content = "joined", user = user, type = MessageType.Join).encodeToString()
        roomMembers.putIfAbsent(roomId, hashMapOf())
        roomMembers[roomId]?.set(sessionId, user)
        broadcastToRoom(roomId, joinMessage)
        logger.info(roomMembers.toString())
    }

    override suspend fun connectUser(user: User, sessionId: String) {
        members[sessionId] = user
        logger.info(members.toString())
    }

    override suspend fun sendMessage(sessionId: String, room: Room, message: Message) {
        val user = members[sessionId] ?: return
        val roomId = room.id!!
        var msg = message.copy(content = message.content.trim().clean(), user = user, roomId = roomId)
        if (message.type == MessageType.Chat) {
            msg = messageRepository.insertRoomMessage(msg)
        }
        msg.id?.let {
            broadcastToRoom(roomId, msg.encodeToString())
            userRepository.increasePoints(user.id!!)
        }
    }

    override suspend fun sendPrivateMessage(message: PvtMessage) {
        var pvtMessage = message.copy(content = message.content.trim().clean())
        if (message.type == MessageType.Chat) {
            pvtMessage = messageRepository.insertPrivateMessage(pvtMessage)
        }
        val senderId = pvtMessage.sender?.id!!
        val receiverId = pvtMessage.receiver?.id!!
        broadcastPvtMessage(senderId, receiverId, pvtMessage.encodeToString())
    }

    override suspend fun disconnectRoom(user: User, roomId: Int, sessionId: String) {
        val currentRoom = roomMembers[roomId]
        currentRoom?.get(sessionId)?.apply {
            if (currentRoom.containsKey(sessionId)) {
                currentRoom.remove(sessionId)
            }
        }
        val message = Message(content = "", user = user, type = MessageType.Leave).encodeToString()
        broadcastToRoom(roomId, message)
        logger.info(roomMembers.toString())
    }

    override suspend fun disconnectUser(sessionId: String) {
        val member = members[sessionId]
        if (member != null) {
            try {
                member.socket?.close(CloseReason(CloseReason.Codes.NORMAL, "server closed"))
                members.remove(sessionId)
            } catch (_: Exception) {
            }
        }
    }

}
