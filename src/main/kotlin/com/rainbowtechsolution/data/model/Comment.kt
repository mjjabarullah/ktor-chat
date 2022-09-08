package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.PostType
import kotlinx.serialization.Serializable

@Serializable
data class Comment(
    val id: Int? = null,
    val content: String,
    val user: User,
    val postId: Int,
    val type: PostType,
    val createdAt: String? = null
)