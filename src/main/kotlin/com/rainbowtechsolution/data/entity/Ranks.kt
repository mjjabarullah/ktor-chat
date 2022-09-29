package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption

object Ranks : IntIdTable("ranks") {
    val name = varchar("name", 20)
    val code = varchar("code", 20)
    val icon = varchar("icon", 255)
    val order = integer("order")
    val domainId = reference("domain_id", Domains.id, onDelete = ReferenceOption.CASCADE)
}

