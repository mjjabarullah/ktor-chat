package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.domain.model.*
import io.ktor.websocket.*

interface WsRepository {

    suspend fun connectRoom(user: User, roomId: Int, domainId: Int)

    suspend fun sendMessage(domainId: Int, roomId: Int, userId: Long, message: Message)

    suspend fun connectUser(user: User)

    suspend fun sendPrivateMessage(message: PvtMessage)

    suspend fun disconnectRoom(domainId: Int, roomId: Int, user: User, socket: WebSocketSession)

    suspend fun disconnectUser(socket: WebSocketSession)
}