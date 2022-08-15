package com.rainbowtechsolution.domain.mappers

import com.rainbowtechsolution.data.entity.*
import com.rainbowtechsolution.domain.model.*
import com.rainbowtechsolution.utils.capitalize
import com.rainbowtechsolution.utils.format
import org.jetbrains.exposed.sql.QueryAlias
import org.jetbrains.exposed.sql.ResultRow

fun ResultRow.toDomainModel(): Domain {
    return Domain(
        id = this[Domains.id].value,
        name = this[Domains.name],
        slug = this[Domains.slug],
        description = this[Domains.description],
        theme = this[Domains.theme],
        allowGuest = this[Domains.allowGuest],
        allowRegister = this[Domains.allowRegister],
        radioUrl = this[Domains.radioUrl],
        nameLength = this[Domains.nameLength],
        uploadSize = this[Domains.uploadSize],
        chatLogDelete = this[Domains.chatLogDelete],
        pvtLogDelete = this[Domains.pvtLogDelete],
        inactiveUserDelete = this[Domains.inactiveUserDelete],
        chatChars = this[Domains.chatChars],
        pvtChars = this[Domains.pvtChars],
        offlineLimit = this[Domains.offlineLimit],
        createdAt = this[Domains.createdAt].toString()
    )

}

fun ResultRow.toRoomModel(): Room {
    return Room(
        id = this[Rooms.id].value,
        name = this[Rooms.name],
        description = this[Rooms.description],
        topic = this[Rooms.topic],
        showJoin = this[Rooms.showJoin],
        showLeave = this[Rooms.showLeave],
        showGreet = this[Rooms.showGreet],
        createdAt = this[Rooms.createdAt].toString()
    )
}

fun ResultRow.toUserModel(): User {
    val rank = if (this.hasValue(Ranks.id)) toRankModel() else null
    return User(
        id = this[Users.id].value,
        name = this[Users.name].capitalize(),
        avatar = this[Users.avatar],
        gender = this[Users.gender].name,
        dob = this[Users.dob],
        about = this[Users.about],
        mood = this[Users.mood],
        status = this[Users.status].name,
        cover = this[Users.cover],
        nameColor = this[Users.nameColor],
        nameFont = this[Users.nameFont],
        textColor = this[Users.textColor],
        textBold = this[Users.textBold],
        textFont = this[Users.textFont],
        roomId = this[Users.roomId]?.value,
        sessions = this[Users.sessions],
        rank = rank,
        points = this[Users.points],
        level = this[Users.level],
        ip = this[Users.ip],
        timezone = this[Users.timezone],
        deviceId = this[Users.deviceId],
        country = this[Users.country],
        private = this[Users.private],
        online = this[Users.online],
        muted = this[Users.muted],
        kicked = this[Users.kicked],
        banned = this[Users.banned],
        muteMsg = this[Users.muteMsg],
        kickMsg = this[Users.kickMsg],
        banMsg = this[Users.banMsg],
        createdAt = this[Users.createdAt].format("dd MMM yyyy hh:mm a")
    )
}

fun ResultRow.toRankModel(): Rank {
    val permission = if (this.hasValue(Permissions.id)) toPermissionModel() else null
    return Rank(
        id = this[Ranks.id].value,
        name = this[Ranks.name],
        code = this[Ranks.code],
        icon = this[Ranks.icon],
        order = this[Ranks.order],
        permission = permission,
    )
}

fun ResultRow.toMessageModel(): Message {
    return Message(
        id = this[Messages.id].value,
        content = this[Messages.content],
        image = this[Messages.image],
        audio = this[Messages.audio],
        type = this[Messages.type],
        user = toUserModel(),
        createdAt = this[Messages.createdAt].format()
    )
}

fun ResultRow.toPvtMessageModel(sender: QueryAlias, receiver: QueryAlias): PvtMessage {
    val userSender = User(
        id = this[sender[Users.id]].value,
        name = this[sender[Users.name]].capitalize(),
        avatar = this[sender[Users.avatar]],
        gender = this[sender[Users.gender]].name,
        nameColor = this[sender[Users.nameColor]],
        nameFont = this[sender[Users.nameFont]]
    )
    val userReceiver = User(
        id = this[receiver[Users.id]].value,
        name = this[receiver[Users.name]].capitalize(),
        avatar = this[receiver[Users.avatar]],
        gender = this[sender[Users.gender]].name,
        nameColor = this[receiver[Users.nameColor]],
        nameFont = this[receiver[Users.nameFont]],
    )
    return PvtMessage(
        id = this[PvtMessages.id].value,
        content = this[PvtMessages.content],
        image = this[PvtMessages.image],
        audio = this[PvtMessages.audio],
        sender = userSender,
        receiver = userReceiver,
        type = this[PvtMessages.type],
        seen = this[PvtMessages.seen],
        createdAt = this[PvtMessages.createdAt].format()
    )
}

fun ResultRow.toPermissionModel(): Permission {
    return Permission(
        id = this[Permissions.id].value,
        rankId = this[Permissions.rankId].value,
        name = this[Permissions.name],
        nameColor = this[Permissions.nameColor],
        nameGradient = this[Permissions.nameGradient],
        nameFont = this[Permissions.nameFont],
        avatar = this[Permissions.avatar],
        textColor = this[Permissions.textColor],
        textGradient = this[Permissions.textGradient],
        textFont = this[Permissions.textFont],
        textBold = this[Permissions.textBold],
        voice = this[Permissions.voice],
        upload = this[Permissions.upload],
        gifUpload = this[Permissions.gifUpload],
        private = this[Permissions.private],
        splEmo = this[Permissions.splEmo],
        status = this[Permissions.status],
        delMsg = this[Permissions.delMsg],
        mute = this[Permissions.mute],
        kick = this[Permissions.kick],
        ban = this[Permissions.ban]
    )
}

fun ResultRow.toReportModel(): Report {
    return Report(
        id = this[Reports.id].value,
        name = this[Users.name],
        avatar = this[Users.avatar],
        targetId = this[Reports.targetId],
        type = this[Reports.type],
        reason = this[Reports.reason],
        roomId = this[Reports.roomId].value,
        createdAt = this[Reports.createdAt].format(),
    )
}