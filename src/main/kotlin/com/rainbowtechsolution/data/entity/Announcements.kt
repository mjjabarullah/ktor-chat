package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime


object Announcements : IntIdTable("News") {
    val content = text("content")
    val image = varchar("image", 100).nullable()
    val userId = reference("user_id", Users.id, onDelete = ReferenceOption.CASCADE)
    val domainId = reference("domain_id", Domains.id, onDelete = ReferenceOption.CASCADE)
    val createdAt = datetime("created_at")
}
