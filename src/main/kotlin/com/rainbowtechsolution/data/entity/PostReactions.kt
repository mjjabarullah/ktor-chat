package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime

object PostReactions : IntIdTable("post_reactions") {
    val userId = reference("user_id", Users.id, onDelete = ReferenceOption.CASCADE)
    val postId = reference("post_id", Posts.id, onDelete = ReferenceOption.CASCADE)
    val type = enumerationByName<ReactType>("type", 20)
    val createdAt = datetime("created_at")
}

enum class ReactType {
    Like, Love, Lol, Dislike
}