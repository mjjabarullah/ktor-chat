package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.Notifications
import com.rainbowtechsolution.data.model.Notification
import com.rainbowtechsolution.data.model.NotificationRes
import com.rainbowtechsolution.data.repository.NotificationRepository
import com.rainbowtechsolution.utils.dbQuery
import com.rainbowtechsolution.utils.format
import org.jetbrains.exposed.sql.*
import java.time.LocalDateTime

class NotificationController : NotificationRepository {

    override suspend fun createNotification(notification: Notification): Int = dbQuery {
        Notifications.insertAndGetId {
            it[receiver] = notification.receiver?.id!!
            it[content] = notification.content
            it[createdAt] = LocalDateTime.now()
        }.value
    }

    override suspend fun getNotifications(userId: Long): NotificationRes = dbQuery {
        val unReadCount = wrapAsExpression<Long>(Notifications
            .slice(Notifications.id.count())
            .select { (Notifications.receiver eq userId) and (Notifications.seen eq false) }
        ).alias("unReadCount")

        var count: Int? = 0
        val notifications = Notifications
            .slice(unReadCount, Notifications.id, Notifications.content, Notifications.createdAt, Notifications.seen)
            .select { (Notifications.receiver eq userId) }
            .limit(20)
            .orderBy(Notifications.id, SortOrder.DESC)
            .map {
                count = it[unReadCount]?.toInt()
                Notification(
                    id = it[Notifications.id].value, content = it[Notifications.content], seen = it[Notifications.seen],
                    createdAt = it[Notifications.createdAt].format()
                )
            }
        NotificationRes(notifications, count ?: 0)
    }

    override suspend fun read(userId: Long): Unit = dbQuery {
        Notifications.update({ (Notifications.receiver eq userId) }) {
            it[seen] = true
        }
    }

    override suspend fun deleteNotification(id: Int): Unit = dbQuery {
        Notifications.deleteWhere { Notifications.id eq id }
    }
}