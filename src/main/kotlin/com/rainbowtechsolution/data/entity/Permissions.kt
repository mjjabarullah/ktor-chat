package com.rainbowtechsolution.data.entity

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption

object Permissions : IntIdTable("permissions") {
    val rankId = reference("rank_id", Ranks.id, onDelete = ReferenceOption.CASCADE)
    val avatar = bool("avatar").default(false)
    val name = bool("name").default(false)
    val nameColor = bool("name_color").default(false)
    val nameGradient = bool("name_gradient").default(false)
    val nameFont = bool("name_font").default(false)
    val textGradient = bool("text_gradient").default(false)
    val textBold = bool("text_bold").default(false)
    val textColor = bool("text_color").default(false)
    val textFont = bool("text_font").default(false)
    val voice = bool("voice").default(false)
    val upload = bool("upload").default(false)
    val gifUpload = bool("gif_upload").default(false)
    val private = bool("private").default(false)
    val splEmo = bool("spl_emo").default(false)
    val status = bool("status").default(false)
    val delMsg = bool("del_msg").default(false)
    val mute = bool("mute").default(false)
    val kick = bool("kick").default(false)
    val ban = bool("ban").default(false)

}

