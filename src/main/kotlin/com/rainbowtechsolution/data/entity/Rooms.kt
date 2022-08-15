package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime


object Rooms : IntIdTable("rooms") {
    val name = varchar("name", 20)
    val description = varchar("description", 100)
    val topic = varchar("topic", 255)
    val showJoin = bool("show_join").default(true)
    val showLeave = bool("show_leave").default(true)
    val showGreet = bool("show_greet").default(true)
    val domainId = reference("domain_id", Domains.id, onDelete = ReferenceOption.CASCADE)
    val createdAt = datetime("created_at")
}
