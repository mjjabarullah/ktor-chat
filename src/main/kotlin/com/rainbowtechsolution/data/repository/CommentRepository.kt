package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.entity.PostType
import com.rainbowtechsolution.data.model.Comment

interface CommentRepository {

    suspend fun createComment(comment: Comment): Int

    suspend fun getComments(postId: Int, type: PostType, offset: Long): List<Comment>

    suspend fun deleteComment(id: Int)
}
