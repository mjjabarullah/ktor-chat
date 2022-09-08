package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.PostType
import kotlinx.serialization.Serializable

@Serializable
data class Post(
    val id: Int? = null,
    val content: String,
    val image: String? = null,
    val user: User,
    val domainId: Int,
    val type: PostType,
    val comments: List<Comment> = emptyList(),
    val totalComments: Int = 0,
    val createdAt: String? = null
)
