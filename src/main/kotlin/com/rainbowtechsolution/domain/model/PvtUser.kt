package com.rainbowtechsolution.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class PvtUser(
    val id: Long,
    val name: String?,
    val avatar: String?,
    val nameColor: String?,
    val nameFont: String?,
    val messages: List<PvtMessage> = emptyList()
)


