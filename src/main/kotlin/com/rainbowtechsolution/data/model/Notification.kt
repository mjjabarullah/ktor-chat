package com.rainbowtechsolution.data.model


import kotlinx.serialization.Serializable


@Serializable
data class Notification(
    val id: Int? = null,
    //val sender = reference("sender", Users.id, onDelete = ReferenceOption.CASCADE)
    val receiver: User? = null,
    //val type = enumerationByName<NotificationType>("type", 10)
    val content: String,
    val seen: Boolean = false,
    val createdAt: String? = null
)
