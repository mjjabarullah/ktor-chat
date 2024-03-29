package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.javatime.datetime

object Users : LongIdTable("users") {
    val name = varchar("name", 20)
    val email = varchar("email", 50)
    val password = varchar("password", 255)
    val owner = bool("owner").default(false)
    val bot = bool("bot").default(false)
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
    val nameColor = varchar("name_color", 20)
    val nameFont = varchar("name_font", 30)
    val textColor = varchar("text_color", 20)
    val textFont = varchar("text_font", 20)
    val textBold = bool("text_bold").default(false)
    val level = integer("level").default(1)
    val points = integer("points").default(1)
    val ip = varchar("ip", 100).nullable()
    val timezone = varchar("timezone", 100).nullable()
    val deviceId = varchar("device_id", 100).nullable()
    val country = varchar("country", 100).nullable()
    val private = bool("private").default(true)
    val sounds = varchar("sounds", 4).default("1111")
    val muted = long("muted").default(0)
    val kicked = long("kicked").default(0)
    val banned = long("banned").default(0)
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