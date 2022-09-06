package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Permission(
    val id: Int? = null,
    val rankId: Int? = null,
    val name: Boolean = false,
    val userName: Boolean = false,
    val nameColor: Boolean = false,
    val nameFont: Boolean = false,
    val nameGradient: Boolean = false,
    val avatar: Boolean = false,
    val textColor: Boolean = false,
    val textGradient: Boolean = false,
    val textBold: Boolean = false,
    val textFont: Boolean = false,
    val voice: Boolean = false,
    val upload: Boolean = false,
    val gifUpload: Boolean = false,
    val private: Boolean = false,
    val splEmo: Boolean = false,
    val status: Boolean = false,
    val delMsg: Boolean = false,
    val reports: Boolean = false,
    val writeGlobalFeed: Boolean = true, /* TODO :Change*/
    val delGlobalFeed: Boolean = true, /* TODO :Change*/
    val adminship: Boolean = true, /* TODO :Change*/
    val writeAdminship: Boolean = true, /* TODO :Change*/
    val delAdminship: Boolean = true, /* TODO :Change*/
    val writeNews: Boolean = true, /* TODO :Change*/
    val delNews: Boolean = true, /* TODO :Change*/
    val mute: Boolean = false,
    val kick: Boolean = false,
    val ban: Boolean = false
)