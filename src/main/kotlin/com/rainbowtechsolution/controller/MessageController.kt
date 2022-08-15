package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.Messages
import com.rainbowtechsolution.data.entity.PvtMessages
import com.rainbowtechsolution.data.entity.Ranks
import com.rainbowtechsolution.data.entity.Users
import com.rainbowtechsolution.data.repository.MessageRepository
import com.rainbowtechsolution.domain.mappers.toMessageModel
import com.rainbowtechsolution.domain.mappers.toPvtMessageModel
import com.rainbowtechsolution.domain.model.Message
import com.rainbowtechsolution.domain.model.PvtMessage
import com.rainbowtechsolution.domain.model.User
import com.rainbowtechsolution.utils.dbQuery
import com.rainbowtechsolution.utils.format
import org.jetbrains.exposed.sql.*
import java.time.LocalDateTime

class MessageController : MessageRepository {

    override suspend fun insertRoomMessage(message: Message): Message = dbQuery {
        var resultMsg: Message = message
        Messages.insert {
            it[content] = message.content
            it[image] = message.image
            it[audio] = message.audio
            it[userId] = message.user?.id!!
            it[roomId] = message.roomId!!
            it[type] = message.type
            it[createdAt] = LocalDateTime.now()
        }.resultedValues?.firstOrNull()?.let {
            resultMsg = resultMsg.copy(id = it[Messages.id].value, createdAt = it[Messages.createdAt].format())
        }
        resultMsg
    }

    override suspend fun findMessageById(id: Long): Message? = dbQuery {
        Messages
            .innerJoin(Users)
            .slice(
                Users.id, Users.name, Users.avatar, Messages.id, Messages.content, Messages.createdAt,
                Messages.audio, Messages.image, Messages.type
            )
            .select { Messages.id eq id }
            .firstOrNull()
            ?.let {
                val user = User(id = it[Users.id].value, avatar = it[Users.avatar], name = it[Users.name])
                Message(
                    id = it[Messages.id].value, content = it[Messages.content], audio = it[Messages.audio],
                    image = it[Messages.image], createdAt = it[Messages.createdAt].format(), type = it[Messages.type],
                    user = user
                )
            }
    }

    override suspend fun insertPrivateMessage(message: PvtMessage): PvtMessage = dbQuery {
        var insertedMessage = message
        PvtMessages.insert {
            it[content] = message.content
            it[image] = message.image
            it[audio] = message.audio
            it[sender] = message.sender?.id!!
            it[receiver] = message.receiver?.id!!
            it[type] = message.type
            it[createdAt] = LocalDateTime.now()
        }.resultedValues!!.first().apply {
            insertedMessage =
                message.copy(id = this[PvtMessages.id].value, createdAt = this[PvtMessages.createdAt].format())
        }
        insertedMessage
    }

    override suspend fun getRoomMessages(id: Int): List<Message> = dbQuery {
        Messages
            .innerJoin(Users)
            .innerJoin(Ranks)
            .select { Messages.roomId eq id }
            .limit(20)
            .orderBy(Messages.id to SortOrder.DESC)
            .map { it.toMessageModel() }
            .reversed()

    }

    override suspend fun getPrivateMessages(sender: Long, receiver: Long): List<PvtMessage> = dbQuery {
        val sTable = Users.slice(
            Users.id, Users.name, Users.avatar, Users.nameColor, Users.nameFont, Users.private, Users.gender
        ).selectAll().alias("sender")
        val rTable = Users.slice(
            Users.id, Users.name, Users.avatar, Users.nameColor, Users.nameFont, Users.private, Users.gender
        ).selectAll().alias("receiver")
        PvtMessages
            .innerJoin(sTable, { PvtMessages.sender }, { sTable[Users.id] })
            .innerJoin(rTable, { PvtMessages.receiver }, { rTable[Users.id] })
            .select {
                ((PvtMessages.sender eq sender) and (PvtMessages.receiver eq receiver)) or ((PvtMessages.sender eq receiver) and (PvtMessages.receiver eq sender))
            }.limit(20)
            .orderBy(PvtMessages.id to SortOrder.DESC)
            .map { it.toPvtMessageModel(sTable, rTable) }
    }

    override suspend fun getPvtUserIds(id: Long): List<Long> = dbQuery {
        val userId = Expression.build {
            Case().When(Op.build { PvtMessages.sender eq id }, PvtMessages.receiver).Else(PvtMessages.sender)
        }.alias("userId")
        val maxId = PvtMessages.id.max().alias("id")
        val usersAlias =
            PvtMessages.slice(maxId, PvtMessages.sender, PvtMessages.receiver).selectAll()
                .groupBy(PvtMessages.sender, PvtMessages.receiver).alias("b")
        PvtMessages
            .join(usersAlias, JoinType.INNER, PvtMessages.id, usersAlias[PvtMessages.id])
            .slice(userId, PvtMessages.createdAt)
            .select { (PvtMessages.sender eq id) or (PvtMessages.receiver eq id) }
            .limit(10)
            .orderBy(usersAlias[maxId], SortOrder.DESC)
            .groupBy(userId)
            .map { it[userId].value }
    }

    override suspend fun setAllSeen(sender: Long, receiver: Long): Unit = dbQuery {
        PvtMessages.update({ (PvtMessages.sender eq sender) and (PvtMessages.receiver eq receiver) }) {
            it[seen] = true
        }
    }

    override suspend fun setSeen(id: Long): Unit = dbQuery {
        PvtMessages.update({ PvtMessages.id eq id }) {
            it[seen] = true
        }
    }

    override suspend fun deleteMessage(id: Long): Int = dbQuery {
        Messages.deleteWhere { Messages.id eq id }
    }

}
