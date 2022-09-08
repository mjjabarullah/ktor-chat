package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.Comments
import com.rainbowtechsolution.data.entity.PostType
import com.rainbowtechsolution.data.entity.Users
import com.rainbowtechsolution.data.model.Comment
import com.rainbowtechsolution.data.model.User
import com.rainbowtechsolution.data.repository.CommentRepository
import com.rainbowtechsolution.utils.capitalize
import com.rainbowtechsolution.utils.dbQuery
import com.rainbowtechsolution.utils.format
import org.jetbrains.exposed.sql.*
import java.time.LocalDateTime

class CommentController : CommentRepository {

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