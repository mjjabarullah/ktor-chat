package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.entity.PostType
import com.rainbowtechsolution.data.model.Notification
import com.rainbowtechsolution.data.model.NotificationRes
import com.rainbowtechsolution.data.model.Post
import com.rainbowtechsolution.data.model.PostRes

interface NotificationRepository {

    suspend fun createNotification(notification: Notification): Int

    suspend fun getNotifications(userId: Long): NotificationRes

    suspend fun read(userId: Long)

    suspend fun deleteNotification(id: Int)
}
