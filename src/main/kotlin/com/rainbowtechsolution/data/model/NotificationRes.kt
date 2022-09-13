package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class NotificationRes(
    val notifications: List<Notification> = emptyList(),
    val unReadCount: Int = 0
)
