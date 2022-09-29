package com.rainbowtechsolution.data.entity


import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime


object Notifications : IntIdTable("notifications") {
    //val sender = reference("sender", Users.id, onDelete = ReferenceOption.CASCADE)
    val receiver = reference("receiver", Users.id, onDelete = ReferenceOption.CASCADE)
    //val type = enumerationByName<NotificationType>("type", 10)
    val content = varchar("content", 255)
    val seen = bool("seen").default(false)
    val createdAt = datetime("created_at")
}

enum class NotificationType {
    Mute, Unmute, NameChange, AvatarChange, LevelChange, RankChange, Post, FriendRequest, AcceptFriend
}
