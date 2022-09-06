package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PvtUser(
    val id: Long? = null,
    val name: String? = null,
    val avatar: String? = null,
    val nameColor: String? = null,
    val nameFont: String? = null,
    val private: Boolean = false,
    val messages: List<PvtMessage> = emptyList()
)


