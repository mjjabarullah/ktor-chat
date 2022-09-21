package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.MessageType
import kotlinx.serialization.Serializable

@Serializable
data class PvtMessage(
    var id: Long? = null,
    val content: String? = null,
    val image: String? = null,
    val audio: String? = null,
    val sender: User? = null,
    val receiver: User? = null,
    val domainId: Int? = null,
    val type: MessageType,
    val seen: Boolean = false,
    val createdAt: String? = null
)