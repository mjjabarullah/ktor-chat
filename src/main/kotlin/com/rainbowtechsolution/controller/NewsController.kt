package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.Announcements
import com.rainbowtechsolution.data.entity.Seen
import com.rainbowtechsolution.data.entity.SeenType
import com.rainbowtechsolution.data.entity.Users
import com.rainbowtechsolution.data.repository.NewsRepository
import com.rainbowtechsolution.data.repository.SeenRepository
import com.rainbowtechsolution.domain.mappers.toNewsModel
import com.rainbowtechsolution.domain.model.Announcement
import com.rainbowtechsolution.domain.model.News
import com.rainbowtechsolution.domain.model.User
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.*
import java.time.LocalDateTime

class NewsController(val seenRepository: SeenRepository) : NewsRepository {

    override suspend fun createNews(announcement: Announcement): Int {
        val newsId = dbQuery {
            Announcements.insertAndGetId {
                it[content] = announcement.content!!
                it[image] = announcement.image
                it[userId] = announcement.user?.id!!
                it[domainId] = announcement.domainId!!
                it[createdAt] = LocalDateTime.now()
            }.value
        }
        readNews(announcement.domainId!!, announcement.user?.id!!)
        return newsId
    }

    override suspend fun getNews(domainId: Int, userId: Long): News = dbQuery {
        val date = Seen
            .select { (Seen.domainId eq domainId) and (Seen.userId eq userId) and (Seen.type eq SeenType.News) }
            .first().let { it[Seen.createdAt] }
        val subQuery = Announcements
            .slice(Announcements.id.count())
            .select { (Announcements.createdAt greater date) and (Announcements.domainId eq domainId) }
        val unReadCount = wrapAsExpression<Long>(subQuery).alias("unReadCount")
        val expressions = (Announcements.columns as List<Expression<*>>).toTypedArray()
        var count: Int? = 0
        val announcements = Announcements
            .innerJoin(Users)
            .slice(
                unReadCount, *expressions, Users.id, Users.name, Users.avatar, Users.gender, Users.nameColor,
                Users.textColor, Users.nameFont, Users.textBold, Users.textFont
            )
            .select { Announcements.domainId eq domainId }
            .limit(20)
            .orderBy(Announcements.id, SortOrder.DESC)
            .map {
                count = it[unReadCount]?.toInt()
                val user = User(
                    id = it[Users.id].value, avatar = it[Users.avatar], name = it[Users.name],
                    gender = it[Users.gender].name, nameFont = it[Users.nameFont], nameColor = it[Users.nameColor],
                    textColor = it[Users.textColor], textFont = it[Users.textFont], textBold = it[Users.textBold]
                )
                it.toNewsModel(user)
            }
        News(announcements, count ?: 0)
    }

    override suspend fun readNews(domainId: Int, userId: Long): Unit = seenRepository.makeSeen(
        domainId, userId, SeenType.News
    )

    override suspend fun deleteNews(id: Int): Unit = dbQuery {
        Announcements
            .deleteWhere { Announcements.id eq id }
    }

}