package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime


object Seen : LongIdTable("seen") {
    val userId = reference("user_id", Users.id, onDelete = ReferenceOption.CASCADE)
    val domainId = reference("domain_id", Domains.id, onDelete = ReferenceOption.CASCADE)
    val type = enumerationByName<SeenType>("type", 20)
    val createdAt = datetime("created_at")
}

enum class SeenType {
    News, AdminShip, GlobalWall
}