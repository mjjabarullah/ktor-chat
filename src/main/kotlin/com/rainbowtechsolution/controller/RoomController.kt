package com.rainbowtechsolution.controller

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.rainbowtechsolution.data.entity.PvtMessages
import com.rainbowtechsolution.data.entity.Rooms
import com.rainbowtechsolution.data.entity.Users
import com.rainbowtechsolution.data.repository.RoomRepository
import com.rainbowtechsolution.domain.mappers.toRoomModel
import com.rainbowtechsolution.domain.model.Room
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.time.LocalDateTime

class RoomController : RoomRepository {

    private val roomCache: Cache<Int, Room> = Caffeine.newBuilder()
        .maximumSize(10_000)
        .build()

    override suspend fun createRoom(room: Room): Int = dbQuery {
        Rooms.insertAndGetId {
            it[name] = room.name!!
            it[description] = room.description!!
            it[topic] = room.topic!!
            it[showJoin] = room.showJoin
            it[showGreet] = room.showGreet
            it[domainId] = room.domainId!!
            it[createdAt] = LocalDateTime.now()
        }.value
    }

    override suspend fun findRoomById(id: Int): Room? = dbQuery {
        var room = roomCache.getIfPresent(id)
        if (room != null) room
        else {
            room = Rooms.select { Rooms.id eq id }.firstOrNull()?.toRoomModel()
            roomCache.put(id, room)
            room
        }
    }

    override suspend fun getRoomsByDomain(id: Int): List<Room> = dbQuery {
        val subQuery = Users.slice(Users.roomId.count()).select { (Users.roomId eq Rooms.id) and (Users.sessions greater 0) }
        val onlineUsers = wrapAsExpression<Long>(subQuery).alias("onlineUsers")
        Rooms
            .slice(
                Rooms.id, Rooms.name, Rooms.description, Rooms.topic, Rooms.showJoin, Rooms.showLeave,
                Rooms.showGreet, Rooms.domainId, Rooms.createdAt, onlineUsers
            )
            .select { Rooms.domainId eq id }
            .groupBy(Rooms.id)
            .map {
                Room(
                    id = it[Rooms.id].value, name = it[Rooms.name], description = it[Rooms.description],
                    topic = it[Rooms.topic], showJoin = it[Rooms.showJoin], showLeave = it[Rooms.showLeave],
                    showGreet = it[Rooms.showGreet], onlineUsers = it[onlineUsers]?.toInt()
                )
            }
    }

    override suspend fun deleteRoom(id: Int): Int = dbQuery {
        roomCache.invalidate(id)
        Rooms.deleteWhere { Rooms.id eq id }
    }
}

