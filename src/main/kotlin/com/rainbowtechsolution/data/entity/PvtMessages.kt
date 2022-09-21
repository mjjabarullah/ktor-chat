package com.rainbowtechsolution.data.entity


import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime


object PvtMessages : LongIdTable("pvt_messages") {
    val content = varchar("content", 255).nullable()
    val image = varchar("image", 100).nullable()
    val audio = varchar("audio", 100).nullable()
    val sender = reference("sender", Users.id, onDelete = ReferenceOption.CASCADE)
    val receiver = reference("receiver", Users.id, onDelete = ReferenceOption.CASCADE)
    val domainId = reference("domain_id", Domains.id, onDelete = ReferenceOption.CASCADE)
    val type = enumerationByName<MessageType>("type", 10)
    val seen = bool("seen").default(false)
    val createdAt = datetime("created_at")
}
