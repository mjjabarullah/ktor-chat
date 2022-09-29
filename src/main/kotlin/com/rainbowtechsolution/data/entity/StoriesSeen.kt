package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption


object StoriesSeen : IntIdTable("stories_seen") {
    val userId = reference("user_id", Users.id, onDelete = ReferenceOption.CASCADE)
    val storyId = reference("story_id", Stories.id, onDelete = ReferenceOption.CASCADE)
}