package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.domain.model.Room

interface RoomRepository {

    suspend fun createRoom(room: Room): Int

    suspend fun findRoomById(id: Int): Room?

    suspend fun getRoomsByDomain(id: Int): List<Room>

    suspend fun deleteRoom(id:Int):Int

}