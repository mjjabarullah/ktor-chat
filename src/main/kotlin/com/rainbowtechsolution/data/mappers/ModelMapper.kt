package com.rainbowtechsolution.data.mappers

import com.rainbowtechsolution.data.entity.*
import com.rainbowtechsolution.data.model.*
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
        offlineLimit = this[Domains.offlineLimit]
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
        showGreet = this[Rooms.showGreet]
    )
}

fun ResultRow.toUserModel(): User {
    val rank = if (this.hasValue(Ranks.id)) toRankModel() else null
    return User(
        id = this[Users.id].value,
        name = this[Users.name].capitalize(),
        avatar = this[Users.avatar],
        owner = this[Users.owner],
        bot = this[Users.bot],
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
        chatSound = this[Users.chatSound],
        pvtSound = this[Users.pvtSound],
        nameSound = this[Users.nameSound],
        notifiSound = this[Users.notifiSound],
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

fun ResultRow.toPvtMessageModel(senderAlias: QueryAlias, receiverAlias: QueryAlias): PvtMessage {
    val sender = User(
        id = this[senderAlias[Users.id]].value,
        name = this[senderAlias[Users.name]].capitalize(),
        avatar = this[senderAlias[Users.avatar]],
        gender = this[senderAlias[Users.gender]].name,
        nameColor = this[senderAlias[Users.nameColor]],
        nameFont = this[senderAlias[Users.nameFont]],
        private = this[senderAlias[Users.private]]
    )
    val receiver = User(
        id = this[receiverAlias[Users.id]].value,
        name = this[receiverAlias[Users.name]].capitalize(),
        avatar = this[receiverAlias[Users.avatar]],
        gender = this[receiverAlias[Users.gender]].name,
        nameColor = this[receiverAlias[Users.nameColor]],
        nameFont = this[receiverAlias[Users.nameFont]],
        private = this[receiverAlias[Users.private]]

    )
    return PvtMessage(
        id = this[PvtMessages.id].value,
        content = this[PvtMessages.content],
        image = this[PvtMessages.image],
        audio = this[PvtMessages.audio],
        sender = sender,
        receiver = receiver,
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
        userName = this[Permissions.userName],
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
        reports = this[Permissions.reports],
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



