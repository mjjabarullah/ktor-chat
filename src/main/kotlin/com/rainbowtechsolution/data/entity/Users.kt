package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime

object Users : LongIdTable("users") {
    val name = varchar("name", 15)
    val email = varchar("email", 50)
    val password = varchar("password", 80)
    val owner = bool("owner").default(false)
    val staff = bool("staff").default(false)
    val avatar = varchar("avatar", 255)
    val gender = enumeration<Gender>("gender")
    val dob = varchar("dob", 10).nullable()
    val domainId = reference("domain_id", Domains.id, onDelete = ReferenceOption.CASCADE)
    val roomId = optReference("room_id", Rooms.id)
    val rankId = reference("rank_id", Ranks.id)
    val sessions = integer("sessions").default(0)
    val about = varchar("about", 255).nullable()
    val mood = varchar("mood", 255).nullable()
    val status = enumeration<Status>("status").default(Status.Online)
    val cover = varchar("cover", 255).nullable()
    val nameColor = varchar("name_color", 20).nullable()
    val nameFont = varchar("name_font", 30).nullable()
    val textColor = varchar("text_color", 20).nullable()
    val textFont = varchar("text_font", 20).nullable()
    val textBold = bool("text_bold").default(false)
    val level = integer("level").default(1)
    val points = integer("points").default(1)
    val ip = varchar("ip", 100).nullable()
    val timezone = varchar("timezone", 100).nullable()
    val deviceId = varchar("device_id", 100).nullable()
    val country = varchar("country", 100).nullable()
    val private = bool("private").default(true)
    val muted = bool("muted").default(false)
    val kicked = bool("kicked").default(false)
    val banned = bool("banned").default(false)
    val muteMsg = varchar("mute_msg", 255).nullable()
    val kickMsg = varchar("kick_msg", 255).nullable()
    val banMsg = varchar("ban_msg", 255).nullable()
    val createdAt = datetime("created_at")
}

enum class Gender {
    Male, Female
}

enum class Status {
    Stay, Online, Away, Busy, Eating, Gaming, Singing, Listening
}