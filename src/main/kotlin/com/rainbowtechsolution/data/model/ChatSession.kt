package com.rainbowtechsolution.data.model

import io.ktor.server.auth.*
import io.ktor.server.websocket.*
import kotlinx.serialization.Serializable

@Serializable
data class ChatSession(
    var id: Long? = null
) : Principal