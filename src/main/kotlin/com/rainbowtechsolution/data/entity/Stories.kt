package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime


object Stories : IntIdTable("stories") {
    val userId = reference("user_id", Users.id, onDelete = ReferenceOption.CASCADE)
    val domainId = reference("domain_id", Domains.id, onDelete = ReferenceOption.CASCADE)
    val content = varchar("content", 255).nullable()
    val link = varchar("link", 255)
    val type = enumerationByName<StoryType>("type", 20)
    val createdAt = datetime("created_at")
}

enum class StoryType {
    Image, Video
}