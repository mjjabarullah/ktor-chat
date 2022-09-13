package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime


object Messages : LongIdTable("messages") {
    val content = text("content")
    val image = varchar("image", 100).nullable()
    val audio = varchar("audio", 100).nullable()
    val userId = reference("user_id", Users.id, onDelete = ReferenceOption.CASCADE)
    val roomId = reference("room_id", Rooms.id, onDelete = ReferenceOption.CASCADE)
    val type = enumerationByName<MessageType>("type", 10)
    val createdAt = datetime("created_at")
}

enum class MessageType {
    Join, Chat, Leave, DelChat, Report, ActionTaken, DataChanges, News, DelNews, Adminship, DelAdminship, GlobalFeed,
    DelGlobalFeed, Mute, UnMute, Kick, UnKick, Ban, UnBan, Notification
}