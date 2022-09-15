package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Permission(
    val id: Int? = null,
    val rankId: Int? = null,
    val avatar: Boolean = false,
    val changeRank: Boolean = false,
    val name: Boolean = false,
    val userName: Boolean = false,
    val nameColor: Boolean = false,
    val nameGradient: Boolean = false,
    val nameFont: Boolean = false,
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
    val delGF: Boolean = true,
    val delAS: Boolean = false,
    val writeNews: Boolean = false,
    val delNews: Boolean = false,
    val delAccount:Boolean =false,
    val mute: Boolean = false,
    val kick: Boolean = false,
    val ban: Boolean = false
)