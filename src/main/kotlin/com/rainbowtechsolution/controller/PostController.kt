package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.*
import com.rainbowtechsolution.data.entity.Seen
import com.rainbowtechsolution.data.repository.SeenRepository
import com.rainbowtechsolution.data.model.*
import com.rainbowtechsolution.data.repository.PostRepository
import com.rainbowtechsolution.utils.dbQuery
import com.rainbowtechsolution.utils.format
import org.jetbrains.exposed.sql.*
import java.time.LocalDateTime

class PostController(private val seenRepository: SeenRepository) : PostRepository {

    override suspend fun createPost(post: Post): Int {
        val postId = dbQuery {
            Posts.insertAndGetId {
                it[content] = post.content
                it[image] = post.image
                it[userId] = post.user.id!!
                it[domainId] = post.domainId
                it[type] = post.type
                it[createdAt] = LocalDateTime.now()
            }.value
        }
        readPost(post.domainId, post.user.id!!, post.type)
        return postId
    }

    override suspend fun getPosts(domainId: Int, userId: Long, postType: PostType): PostRes = dbQuery {
        val date = Seen
            .select { (Seen.domainId eq domainId) and (Seen.userId eq userId) and (Seen.type eq postType) }
            .first().let { it[Seen.createdAt] }
        val subQuery = Posts
            .slice(Posts.id.count())
            .select { (Posts.createdAt greater date) and (Posts.domainId eq domainId) and (Posts.type eq postType) }
        val unReadCount = wrapAsExpression<Long>(subQuery).alias("unReadCount")
        val expressions = (Posts.columns as List<Expression<*>>).toTypedArray()
        val commentCountQuery = Comments
            .slice(Comments.id.count())
            .select { (Comments.postId eq Posts.id) and (Comments.type eq postType) }
        val commentCount = wrapAsExpression<Long>(commentCountQuery).alias("commentCount")
        var count: Int? = 0
        val posts = Posts
            .innerJoin(Users)
            .slice(
                commentCount, unReadCount, *expressions, Users.id, Users.name, Users.avatar, Users.gender,
                Users.nameColor, Users.textColor, Users.nameFont, Users.textBold, Users.textFont
            )
            .select { (Posts.domainId eq domainId) and (Posts.type eq postType) }
            .limit(20)
            .orderBy(Posts.id, SortOrder.DESC)
            .map {
                count = it[unReadCount]?.toInt()
                val user = User(
                    id = it[Users.id].value, avatar = it[Users.avatar], name = it[Users.name],
                    gender = it[Users.gender].name, nameFont = it[Users.nameFont], nameColor = it[Users.nameColor],
                    textColor = it[Users.textColor], textFont = it[Users.textFont], textBold = it[Users.textBold]
                )
                Post(
                    id = it[Posts.id].value,
                    content = it[Posts.content],
                    image = it[Posts.image],
                    user = user,
                    domainId = domainId,
                    type = postType,
                    totalComments = it[commentCount]?.toInt() ?: 0,
                    createdAt = it[Posts.createdAt].format()
                )
            }
        PostRes(posts, count ?: 0)
    }

    override suspend fun readPost(domainId: Int, userId: Long, postType: PostType) = seenRepository.makeSeen(
        domainId, userId, postType
    )

    override suspend fun deletePost(id: Int): Unit = dbQuery {
        Posts.deleteWhere { Posts.id eq id }
    }

}