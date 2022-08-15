package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime

object Reports : IntIdTable("reports") {
    val userId = reference("user_id", Users.id, onDelete = ReferenceOption.CASCADE)
    val targetId = long("target_id")
    val type = enumerationByName<ReportType>("type", 20)
    val reason = varchar("reason", 150)
    val domainId = reference("domain_id", Domains.id, onDelete = ReferenceOption.CASCADE)
    val roomId = reference("room_id", Rooms.id, onDelete = ReferenceOption.CASCADE)
    val createdAt = datetime("created_at")
}

enum class ReportType {
    Chat, PvtChat, NewsFeed
}

