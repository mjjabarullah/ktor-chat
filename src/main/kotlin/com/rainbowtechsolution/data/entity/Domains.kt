package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.javatime.datetime


object Domains : IntIdTable("domains") {
    val name = varchar("name", 20)
    val slug = varchar("slug", 10).uniqueIndex()
    val description = varchar("description", 100)
    val theme = varchar("theme", 20)
    val allowGuest = bool("allow_guest").default(false)
    val allowRegister = bool("allow_register").default(false)
    val nameLength = integer("name_length").default(12)
    val uploadSize = integer("upload_size").default(1)
    val chatLogDelete = integer("chat_log_delete").default(7)
    val pvtLogDelete = integer("pvt_log_delete").default(7)
    val inactiveUserDelete = integer("inactive_user_delete").default(90)
    val chatChars = integer("chat_chars").default(300)
    val pvtChars = integer("pvt_chars").default(300)
    val offlineLimit = integer("offline_limit").default(5)
    val radioUrl = varchar("radio_url", 255).nullable()
    val cache = float("cache_version").default(1.00F)
    val createdAt = datetime("created_at")
}

