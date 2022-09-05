package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.MessageType
import com.rainbowtechsolution.data.repository.MessageRepository
import com.rainbowtechsolution.data.repository.UserRepository
import com.rainbowtechsolution.data.repository.WsRepository
import com.rainbowtechsolution.domain.model.Message
import com.rainbowtechsolution.domain.model.PvtMessage
import com.rainbowtechsolution.domain.model.User
import com.rainbowtechsolution.utils.clean
import com.rainbowtechsolution.utils.encodeToString
import com.rainbowtechsolution.utils.getLogger
import io.ktor.websocket.*
import kotlinx.coroutines.isActive
import java.util.concurrent.ConcurrentHashMap

class WsController(
    private val messageRepository: MessageRepository,
    private val userRepository: UserRepository,
) : WsRepository {

    private val logger = getLogger()

    companion object {
        private val domainRoomMembers = ConcurrentHashMap<Int, HashMap<Int, HashMap<WebSocketSession, User>>>()
        private val members = ConcurrentHashMap<WebSocketSession, User>()

        fun updateMember(user: User) {
            members.forEach { (sessionId, u) ->
                if (u.id!! == user.id!!) {
                    user.socket = members[sessionId]?.socket
                    members[sessionId] = user
                    return@forEach
                }
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

        suspend fun broadcastToRoom(domainId: Int, roomId: Int, message: String) {
            domainRoomMembers[domainId]?.get(roomId)?.values?.forEach {
                send(it.socket, message)
            }
        }

        suspend fun broadcastToDomain(domainId: Int, message: String) {
            domainRoomMembers[domainId]?.values?.forEach {
                it.values.forEach { user ->
                    send(user.socket, message)
                }
            }
        }

        suspend fun broadCastToStaff(users: List<Long>, message: String) {
            members.values.forEach {
                if (users.contains(it.id)) {
                    send(it.socket, message)
                }
            }
        }

        private suspend fun send(socket: WebSocketSession?, message: String) {
            try {
                if (socket?.isActive == true) socket.send(Frame.Text(message))
            } catch (_: Exception) {
            }
        }
    }

    override suspend fun connectRoom(user: User, roomId: Int, domainId: Int) {
        userRepository.setSessions(user.id!!, true)
        domainRoomMembers.putIfAbsent(domainId, hashMapOf())
        domainRoomMembers[domainId]?.putIfAbsent(roomId, hashMapOf())
        domainRoomMembers[domainId]?.get(roomId)?.set(user.socket!!, user)
        val joinMessage = Message(content = "joined", user = user, type = MessageType.Join).encodeToString()
        broadcastToRoom(domainId, roomId, joinMessage)
        logger.info(domainRoomMembers.toString())
    }

    override suspend fun connectUser(user: User) {
        members[user.socket!!] = user
        logger.info(members.toString())
    }

    override suspend fun sendMessage(domainId: Int, roomId: Int, userId: Long, message: Message) {
        val user = getUser(userId) ?: return
        var msg = message.copy(content = message.content.trim().clean(), user = user, roomId = roomId)
        if (message.type == MessageType.Chat) {
            msg = messageRepository.insertRoomMessage(msg)
        }
        msg.id?.let {
            broadcastToRoom(domainId, roomId, msg.encodeToString())
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
        val msg = pvtMessage.encodeToString()
        broadCastToMember(senderId, msg)
        broadCastToMember(receiverId, msg)
    }

    override suspend fun disconnectRoom(domainId: Int, roomId: Int, user: User, socket: WebSocketSession) {
        val currentRoom = domainRoomMembers[domainId]?.get(roomId)
        currentRoom?.remove(socket)
        val message = Message(content = "", user = user, type = MessageType.Leave).encodeToString()
        broadcastToRoom(domainId, roomId, message)
        logger.info(domainRoomMembers.toString())
    }

    override suspend fun disconnectUser(socket: WebSocketSession) {
        members.remove(socket)
    }

    private fun getUser(userId: Long): User? = members.values.find { it -> it.id!! == userId }
}
