package com.rainbowtechsolution.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Room(
    var id: Int? = null,
    var name: String? = null,
    var description: String? = null,
    var topic: String? = null,
    var showJoin: Boolean = false,
    var showLeave: Boolean = false,
    var showGreet: Boolean = false,
    var domainId: Int? = null,
    var onlineUsers: Int? = null
)