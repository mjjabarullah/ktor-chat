package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.model.Message
import com.rainbowtechsolution.data.model.Permission
import com.rainbowtechsolution.data.model.PvtMessage
import com.rainbowtechsolution.data.model.User
import io.ktor.websocket.*

interface WsRepository {

    suspend fun connectRoom(user: User, roomId: Int, domainId: Int)

    suspend fun sendMessage(domainId: Int, roomId: Int, userId: Long, message: Message, permission: Permission)

    suspend fun connectUser(user: User)

    suspend fun sendPrivateMessage(message: PvtMessage)

    suspend fun disconnectRoom(domainId: Int, roomId: Int, user: User, socket: WebSocketSession)

    suspend fun disconnectUser(socket: WebSocketSession)
}