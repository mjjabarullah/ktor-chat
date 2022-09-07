package com.rainbowtechsolution.data.entity


import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime


object Blocks : IntIdTable("blocks") {
    val blocker = reference("sender", Users.id, onDelete = ReferenceOption.CASCADE)
    val blocked = reference("receiver", Users.id, onDelete = ReferenceOption.CASCADE)
    val createdAt = datetime("created_at")
}
