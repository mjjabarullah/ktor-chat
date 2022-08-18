package com.rainbowtechsolution.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Permission(
    val id: Int? = null,
    val rankId: Int? = null,
    val name: Boolean = false,
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
    val seeReports: Boolean = false,
    val mute: Boolean = false,
    val kick: Boolean = false,
    val ban: Boolean = false
)