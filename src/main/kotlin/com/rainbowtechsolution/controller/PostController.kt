package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.*
import com.rainbowtechsolution.data.entity.Seen
import com.rainbowtechsolution.data.repository.SeenRepository
import com.rainbowtechsolution.data.model.*
import com.rainbowtechsolution.data.repository.PostReactRepository
import com.rainbowtechsolution.data.repository.PostRepository
import com.rainbowtechsolution.utils.capitalize
import com.rainbowtechsolution.utils.dbQuery
import com.rainbowtechsolution.utils.format
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.time.LocalDateTime

class PostController : PostRepository {

    override suspend fun createPost(post: Post): Int {
        val postId = dbQuery {
            Posts.insertAndGetId {
                it[content] = post.content
                it[image] = post.image
                it[userId] = post.user?.id!!
                it[domainId] = post.domainId!!
                it[type] = post.type!!
                it[createdAt] = LocalDateTime.now()
            }.value
        }
        readPost(post.domainId!!, post.user?.id!!, post.type!!)
        return postId
    }

    override suspend fun getPosts(domainId: Int, userId: Long, postType: PostType): PostRes = dbQuery {
        val date = Seen
            .select { (Seen.domainId eq domainId) and (Seen.userId eq userId) and (Seen.type eq postType) }
            .first().let { it[Seen.createdAt] }
        val unReadCount = wrapAsExpression<Long>(Posts
            .slice(Posts.id.count())
            .select { (Posts.createdAt greater date) and (Posts.domainId eq domainId) and (Posts.type eq postType) }
        ).alias("unReadCount")
        val commentCount = wrapAsExpression<Long>(Comments
            .slice(Comments.id.count())
            .select { (Comments.postId eq Posts.id) and (Comments.type eq postType) }
        ).alias("commentCount")
        val likeCount = wrapAsExpression<Long>(PostReactions
            .slice(PostReactions.id.count())
            .select { (PostReactions.postId eq Posts.id) and (PostReactions.type eq ReactType.Like) }
        ).alias("likeCount")
        val loveCount = wrapAsExpression<Long>(PostReactions
            .slice(PostReactions.id.count())
            .select { (PostReactions.postId eq Posts.id) and (PostReactions.type eq ReactType.Love) }
        ).alias("loveCount")
        val lolCount = wrapAsExpression<Long>(PostReactions
            .slice(PostReactions.id.count())
            .select { (PostReactions.postId eq Posts.id) and (PostReactions.type eq ReactType.Lol) }
        ).alias("lolCount")
        val dislikeCount = wrapAsExpression<Long>(PostReactions
            .slice(PostReactions.id.count())
            .select { (PostReactions.postId eq Posts.id) and (PostReactions.type eq ReactType.Dislike) }
        ).alias("dislikeCount")
        val liked = wrapAsExpression<Long>(PostReactions
            .slice(PostReactions.id.count())
            .select { (PostReactions.postId eq Posts.id) and (PostReactions.userId eq userId) and (PostReactions.type eq ReactType.Like) }
        ).alias("liked")
        val loved = wrapAsExpression<Long>(PostReactions
            .slice(PostReactions.id.count())
            .select { (PostReactions.postId eq Posts.id) and (PostReactions.userId eq userId) and (PostReactions.type eq ReactType.Love) }
        ).alias("loved")
        val laughed = wrapAsExpression<Long>(PostReactions
            .slice(PostReactions.id.count())
            .select { (PostReactions.postId eq Posts.id) and (PostReactions.userId eq userId) and (PostReactions.type eq ReactType.Lol) }
        ).alias("laughed")
        val disliked = wrapAsExpression<Long>(PostReactions
            .slice(PostReactions.id.count())
            .select { (PostReactions.postId eq Posts.id) and (PostReactions.userId eq userId) and (PostReactions.type eq ReactType.Dislike) }
        ).alias("disliked")

        var count: Int? = 0
        val expressions = (Posts.columns as List<Expression<*>>).toTypedArray()
        val posts = Posts
            .innerJoin(Users)
            .slice(
                likeCount, loveCount, lolCount, dislikeCount, commentCount, unReadCount, liked, loved, laughed,
                disliked, *expressions, Users.id, Users.name, Users.avatar, Users.gender, Users.nameColor,
                Users.textColor, Users.nameFont, Users.textBold, Users.textFont
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
                    commentsCount = it[commentCount]?.toInt() ?: 0,
                    likeCount = it[likeCount]?.toInt() ?: 0,
                    loveCount = it[loveCount]?.toInt() ?: 0,
                    lolCount = it[lolCount]?.toInt() ?: 0,
                    dislikeCount = it[dislikeCount]?.toInt() ?: 0,
                    liked = it[liked]!! > 0,
                    loved = it[loved]!! > 0,
                    laughed = it[laughed]!! > 0,
                    disliked = it[disliked]!! > 0,
                    createdAt = it[Posts.createdAt].format()
                )
            }
        PostRes(posts, count ?: 0)
    }

    override suspend fun readPost(domainId: Int, userId: Long, postType: PostType) = makeSeen(
        domainId, userId, postType
    )

    override suspend fun deletePost(id: Int): Unit = dbQuery {
        Posts.deleteWhere { Posts.id eq id }
    }

    override suspend fun react(postId: Int, userId: Long, type: ReactType): Reaction = dbQuery {
        PostReactions.insert {
            it[PostReactions.postId] = postId
            it[PostReactions.userId] = userId
            it[PostReactions.type] = type
            it[PostReactions.createdAt] = LocalDateTime.now()
        }
        Reaction(newReaction = type)
    }

    override suspend fun updateReaction(postId: Int, userId: Long, type: ReactType): Reaction = dbQuery {
        PostReactions.update({ (PostReactions.postId eq postId) and (PostReactions.userId eq userId) }) {
            it[PostReactions.type] = type
        }
        Reaction(newReaction = type)
    }

    override suspend fun deleteReaction(postId: Int, userId: Long): Unit = dbQuery {
        PostReactions.deleteWhere { (PostReactions.postId eq postId) and (PostReactions.userId eq userId) }
    }

    override suspend fun getPostReactionByUserId(postId: Int, userId: Long): Reaction? = dbQuery {
        PostReactions
            .select { (PostReactions.postId eq postId) and (PostReactions.userId eq userId) }
            .firstOrNull()?.let { Reaction(oldReaction = it[PostReactions.type]) }
    }

    override suspend fun createSeen(seen: List<com.rainbowtechsolution.data.model.Seen>): Unit = dbQuery {
        Seen.batchInsert(seen) {
            this[Seen.userId] = it.userId
            this[Seen.domainId] = it.domainId
            this[Seen.type] = it.type
            this[Seen.createdAt] = LocalDateTime.of(2018, 1, 1, 0, 0, 0, 0)
        }
    }

    override suspend fun makeSeen(domainId: Int, userId: Long, type: PostType): Unit = dbQuery {
        Seen.update({ (Seen.domainId eq domainId) and (Seen.userId eq userId) and (Seen.type eq type) }) {
            it[createdAt] = LocalDateTime.now()
        }
    }

    override suspend fun createComment(comment: Comment): Int = dbQuery {
        Comments.insertAndGetId {
            it[content] = comment.content
            it[userId] = comment.user.id!!
            it[postId] = comment.postId
            it[type] = comment.type
            it[createdAt] = LocalDateTime.now()
        }.value
    }

    override suspend fun getComments(postId: Int, type: PostType, offset: Long): List<Comment> = dbQuery {
        Comments
            .innerJoin(Users)
            .slice(
                Users.id, Users.name, Users.avatar, Users.nameColor, Users.nameFont, Users.gender, Users.textColor,
                Comments.id, Comments.content, Comments.type, Comments.postId, Comments.createdAt
            )
            .select { (Comments.postId eq postId) and (Comments.type eq type) }
            .limit(10, offset)
            .orderBy(Comments.createdAt to SortOrder.DESC)
            .map {
                val user = User(
                    id = it[Users.id].value, name = it[Users.name].capitalize(), avatar = it[Users.avatar],
                    gender = it[Users.gender].name, nameColor = it[Users.nameColor], nameFont = it[Users.nameFont],
                    textColor = it[Users.textColor]
                )
                Comment(
                    id = it[Comments.id].value, content = it[Comments.content], user = user, type = it[Comments.type],
                    postId = it[Comments.postId].value, createdAt = it[Comments.createdAt].format()
                )
            }
    }

    override suspend fun deleteComment(id: Int): Unit = dbQuery {
        Comments.deleteWhere { Comments.id eq id }
    }
}