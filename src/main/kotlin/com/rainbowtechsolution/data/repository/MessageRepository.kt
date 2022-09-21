package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.model.Message
import com.rainbowtechsolution.data.model.PvtMessage
import com.rainbowtechsolution.data.model.PvtUser


interface MessageRepository {

    suspend fun insertRoomMessage(message: Message): Message

    suspend fun findMessageById(id: Long): Message?

    suspend fun insertPrivateMessage(message: PvtMessage): PvtMessage

    suspend fun getRoomMessages(id: Int): List<Message>

    suspend fun getPrivateMessages(sender: Long, receiver: Long): List<PvtMessage>

    suspend fun getPrivateMessagesByUser(userId: Long): List<PvtMessage>

    suspend fun getPrivateMessagesByDomain(domainId: Int): List<PvtMessage>

    suspend fun getPvtUserIds(id: Long): List<Long>

    suspend fun setAllSeen(sender: Long, receiver: Long)

    suspend fun setSeen(id: Long)

    suspend fun deleteMessage(id: Long): Int

    suspend fun deleteAllMessageByRoomId(roomId: Int)
}