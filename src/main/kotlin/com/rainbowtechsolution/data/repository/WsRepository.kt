package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.domain.model.Message
import com.rainbowtechsolution.domain.model.PvtMessage
import com.rainbowtechsolution.domain.model.Room
import com.rainbowtechsolution.domain.model.User

interface WsRepository {

    suspend fun connectRoom(user: User, room: Room, sessionId: String)

    suspend fun connectUser(user: User, sessionId: String)

    suspend fun sendMessage(sessionId: String, room: Room, message: Message)

    suspend fun sendPrivateMessage(message: PvtMessage)

    suspend fun disconnectRoom(user: User, roomId: Int, sessionId: String)

    suspend fun disconnectUser(sessionId: String)
}