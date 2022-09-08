package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.CommentType
import kotlinx.serialization.Serializable

@Serializable
data class Comment(
    val id: Int? = null,
    val content: String,
    val user: User,
    val postId: Int,
    val type: CommentType,
    val createdAt: String? = null
)