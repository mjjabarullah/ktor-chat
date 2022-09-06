package com.rainbowtechsolution.common

import com.rainbowtechsolution.data.model.Permission
import com.rainbowtechsolution.data.model.Rank
import com.rainbowtechsolution.utils.capitalizeWords


object Auth {
    const val COOKIE_AUTH = "KSESSIONID"
    const val AUTH_SESSION = "auth_session"
    const val AUTH_LOGIN_FORM = "auth_form"
    const val AUTH_REGISTER_FORM = "auth_register_form"
    const val AUTH_GUEST_FORM = "auth_guest_form"
    const val FIELD_USERNAME = "name"
    const val FIELD_PASSWORD = "password"
    const val GUEST_PASSWORD = "GUEST12345678"
    const val GUEST_EMAIL = "guest@guest.com"
}

object RankNames {
    const val OWNER = "owner"
    const val S_ADMIN = "super admin"
    const val ADMIN = "admin"
    const val MODERATOR = "moderator"
    const val VIP = "vip"
    const val USER = "user"
    const val GUEST = "guest"
}

object RankIcons {
    const val OWNER = "/images/ranks/owner.webp"
    const val S_ADMIN = "/images/ranks/s_admin.webp"
    const val ADMIN = "/images/ranks/admin.webp"
    const val MODERATOR = "/images/ranks/mod.webp"
    const val VIP = "/images/ranks/vip.webp"
    const val USER = "/images/ranks/user.webp"
    const val GUEST = "/images/ranks/guest.webp"
}

object Validation {
    val BAD_CHARS = listOf("{", "}", ">", "<")
}

object ChatDefaults {
    const val USER_AVATAR = "/images/avatars/user.webp"
    const val GUEST_AVATAR = "/images/avatars/guest.webp"
    const val MAIN_IMAGE_UPLOAD_FOLDER = "uploads/main/images/"
    const val MAIN_AUDIO_UPLOAD_FOLDER = "uploads/main/audios/"
    const val PRIVATE_IMAGE_UPLOAD_FOLDER = "uploads/private/images/"
    const val PRIVATE_AUDIO_UPLOAD_FOLDER = "uploads/private/audios/"
    const val NEWS_IMAGE_UPLOAD_FOLDER = "uploads/news/images/"
    const val AVATAR_FOLDER = "uploads/avatars/"
    const val COLOR = "black"

    private val permission = Permission(name = false, nameColor = false)

    val RANKS = listOf(
        Rank(
            name = RankNames.OWNER.capitalizeWords(), code = RankNames.OWNER, icon = RankIcons.OWNER, order = 1,
            permission = permission.copy(name = true, nameColor = true)
        ),
        Rank(
            name = RankNames.S_ADMIN.capitalizeWords(), code = RankNames.S_ADMIN, icon = RankIcons.S_ADMIN, order = 2,
            permission = permission.copy()
        ),
        Rank(
            name = RankNames.ADMIN.capitalizeWords(), code = RankNames.ADMIN, icon = RankIcons.ADMIN, order = 3,
            permission = permission.copy()
        ),
        Rank(
            name = RankNames.MODERATOR.capitalizeWords(), code = RankNames.MODERATOR,
            icon = RankIcons.MODERATOR, order = 4, permission = permission.copy()
        ),
        Rank(
            name = RankNames.VIP.capitalizeWords(), code = RankNames.VIP, icon = RankIcons.VIP, order = 5,
            permission = permission.copy()
        ),
        Rank(
            name = RankNames.USER.capitalizeWords(), code = RankNames.USER, icon = RankIcons.USER, order = 6,
            permission = permission.copy()
        ),
        Rank(
            name = RankNames.GUEST.capitalizeWords(), code = RankNames.GUEST, icon = RankIcons.GUEST, order = 7,
            permission = permission.copy()
        )
    )
}


object Errors {
    const val SOMETHING_WENT_WRONG = "Something went wrong. Try again"
    const val USER_NAME_REGISTERED = "Username already registered."
    const val USER_NAME_OR_EMAIL_REGISTERED = "Username or Email address already exists."
}

