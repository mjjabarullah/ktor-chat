package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.GlobalFeeds
import com.rainbowtechsolution.data.entity.Seen
import com.rainbowtechsolution.data.entity.SeenType
import com.rainbowtechsolution.data.entity.Users
import com.rainbowtechsolution.data.repository.GlobalFeedRepository
import com.rainbowtechsolution.data.repository.SeenRepository
import com.rainbowtechsolution.data.mappers.toGlobalFeedModel
import com.rainbowtechsolution.data.model.GlobalFeed
import com.rainbowtechsolution.data.model.GlobalFeedRes
import com.rainbowtechsolution.data.model.User
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.*
import java.time.LocalDateTime

class GlobalFeedController(private val seenRepository: SeenRepository) : GlobalFeedRepository {

    override suspend fun createGlobalFeed(globalFeed: GlobalFeed): Int {
        val postId = dbQuery {
            GlobalFeeds.insertAndGetId {
                it[content] = globalFeed.content!!
                it[image] = globalFeed.image
                it[userId] = globalFeed.user?.id!!
                it[domainId] = globalFeed.domainId!!
                it[createdAt] = LocalDateTime.now()
            }.value
        }
        readGlobalFeed(globalFeed.domainId!!, globalFeed.user?.id!!)
        return postId
    }

    override suspend fun getGlobalFeeds(domainId: Int, userId: Long): GlobalFeedRes = dbQuery {
        val date = Seen
            .select { (Seen.domainId eq domainId) and (Seen.userId eq userId) and (Seen.type eq SeenType.GlobalFeed) }
            .first().let { it[Seen.createdAt] }
        val subQuery = GlobalFeeds
            .slice(GlobalFeeds.id.count())
            .select { (GlobalFeeds.createdAt greater date) and (GlobalFeeds.domainId eq domainId) }
        val unReadCount = wrapAsExpression<Long>(subQuery).alias("unReadCount")
        val expressions = (GlobalFeeds.columns as List<Expression<*>>).toTypedArray()
        var count: Int? = 0
        val globalFeeds = GlobalFeeds
            .innerJoin(Users)
            .slice(
                unReadCount, *expressions, Users.id, Users.name, Users.avatar, Users.gender, Users.nameColor,
                Users.textColor, Users.nameFont, Users.textBold, Users.textFont
            )
            .select { GlobalFeeds.domainId eq domainId }
            .limit(20)
            .orderBy(GlobalFeeds.id, SortOrder.DESC)
            .map {
                count = it[unReadCount]?.toInt()
                val user = User(
                    id = it[Users.id].value, avatar = it[Users.avatar], name = it[Users.name],
                    gender = it[Users.gender].name, nameFont = it[Users.nameFont], nameColor = it[Users.nameColor],
                    textColor = it[Users.textColor], textFont = it[Users.textFont], textBold = it[Users.textBold]
                )
                it.toGlobalFeedModel(user)
            }
        GlobalFeedRes(globalFeeds, count ?: 0)
    }

    override suspend fun readGlobalFeed(domainId: Int, userId: Long)  = seenRepository.makeSeen(
        domainId, userId, SeenType.GlobalFeed
    )

    override suspend fun deleteGlobalFeed(id: Int): Unit = dbQuery {
        GlobalFeeds.deleteWhere { GlobalFeeds.id eq id }
    }


}