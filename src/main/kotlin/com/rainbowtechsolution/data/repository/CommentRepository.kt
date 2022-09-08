package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.entity.CommentType
import com.rainbowtechsolution.data.model.Adminship
import com.rainbowtechsolution.data.model.AdminshipRes
import com.rainbowtechsolution.data.model.Comment

interface CommentRepository {

    suspend fun createComment(comment: Comment): Int

    suspend fun getComments(postId: Int, type: CommentType, offset: Long): List<Comment>

    suspend fun deleteComment(id: Int)
}
