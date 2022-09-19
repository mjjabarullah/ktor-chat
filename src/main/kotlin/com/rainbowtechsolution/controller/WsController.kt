package com.rainbowtechsolution.controller

import com.rainbowtechsolution.common.ChatDefaults
import com.rainbowtechsolution.data.entity.MessageType
import com.rainbowtechsolution.data.model.*
import com.rainbowtechsolution.data.repository.MessageRepository
import com.rainbowtechsolution.data.repository.NotificationRepository
import com.rainbowtechsolution.data.repository.UserRepository
import com.rainbowtechsolution.data.repository.WsRepository
import com.rainbowtechsolution.utils.*
import io.ktor.websocket.*
import kotlinx.coroutines.isActive
import java.util.concurrent.ConcurrentHashMap

class WsController(
    private val messageRepository: MessageRepository,
    private val userRepository: UserRepository,
    private val notificationRepository: NotificationRepository,
) : WsRepository {

    private val logger = getLogger()

    companion object {
        private val domainRoomMembers = ConcurrentHashMap<Int, HashMap<Int, HashMap<WebSocketSession, User>>>()
        private val members = ConcurrentHashMap<WebSocketSession, User>()

        fun updateMember(user: User) {
            members.values.forEach { if (it.id == user.id) members[it.socket!!] = user.copy(socket = it.socket) }
        }

        suspend fun broadCastToMember(id: Long, message: String) {
            members.values.forEach { if (it.id == id) send(it.socket, message) }
        }

        suspend fun broadcastToAll(message: String) {
            members.values.forEach { send(it.socket, message) }
        }

        suspend fun broadcastToRoom(domainId: Int, roomId: Int, message: String) {
            domainRoomMembers[domainId]?.get(roomId)?.values?.forEach { send(it.socket, message) }
        }

        suspend fun broadcastToDomain(domainId: Int, message: String) {
            domainRoomMembers[domainId]?.values?.forEach { users -> users.values.forEach { send(it.socket, message) } }
        }

        private suspend fun send(socket: WebSocketSession?, message: String) {
            try {
                if (socket?.isActive == true) socket.send(Frame.Text(message))
            } catch (e: Exception) {
                e.printStackTrace()
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

    override suspend fun sendMessage(
        domainId: Int, roomId: Int, userId: Long, message: Message, permission: Permission
    ) {
        val user = getUser(userId) ?: return
        try {
            var msg = message.copy(user = user, roomId = roomId)
            msg = processCommands(msg, user, permission)
            when (msg.type) {
                MessageType.Chat -> {
                    msg = checkYoutube(msg, permission)
                    msg = messageRepository.insertRoomMessage(msg)
                    msg.id?.let {
                        increasePoints(user)
                        broadcastToRoom(domainId, roomId, msg.encodeToString())
                    }
                }
                MessageType.ClearChat -> {
                    messageRepository.deleteAllMessageByRoomId(roomId)
                    broadcastToRoom(domainId, roomId, msg.encodeToString())
                }
                else -> Unit
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override suspend fun sendPrivateMessage(message: PvtMessage) {
        if (message.type == MessageType.Chat) {
            var pvtMessage = message.copy(content = message.content?.trim()?.clean())
            pvtMessage = messageRepository.insertPrivateMessage(pvtMessage)
            val senderId = pvtMessage.sender?.id!!
            val receiverId = pvtMessage.receiver?.id!!
            val msg = pvtMessage.encodeToString()
            broadCastToMember(senderId, msg)
            broadCastToMember(receiverId, msg)
        }
    }

    override suspend fun disconnectRoom(domainId: Int, roomId: Int, user: User, socket: WebSocketSession) {
        val currentRoom = domainRoomMembers[domainId]?.get(roomId)
        currentRoom?.remove(socket)
        val message = Message(user = user, type = MessageType.Leave).encodeToString()
        broadcastToRoom(domainId, roomId, message)
        logger.info(domainRoomMembers.toString())
    }

    override suspend fun disconnectUser(socket: WebSocketSession) {
        members.remove(socket)
    }

    private fun getUser(userId: Long): User? = members.values.find { it.id == userId }

    private suspend fun increasePoints(user: User) {
        if (user.points > user.level * ChatDefaults.LEVEL_INCREASE) {
            user.level += 1
            user.points = 0
            val notification = Notification(receiver = user, content = "Congratulations! You got level ${user.level}")
            notificationRepository.createNotification(notification)
            val message = Message(type = MessageType.Notification)
            broadCastToMember(user.id!!, message.encodeToString())
        } else user.points += 1
        userRepository.updatePointsAndLevel(user.id!!, user.points, user.level)
        UserController.updateUser(user)
    }
}
