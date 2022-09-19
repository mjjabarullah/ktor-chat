package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.MessageType
import kotlinx.serialization.Serializable

@Serializable
data class Message(
    var id: Long? = null,
    val content: String? = null,
    val image: String? = null,
    val audio: String? = null,
    val user: User? = null,
    val roomId: Int? = null,
    val type: MessageType,
    val highLighted: Boolean = false,
    val ytFrame: String? = null,
    val createdAt: String? = null
)