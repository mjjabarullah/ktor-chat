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
    val commentsCount: Int = 0,
    val likeCount: Int = 0,
    val dislikeCount: Int = 0,
    val loveCount: Int = 0,
    val lolCount: Int = 0,
    val liked: Boolean = false,
    val loved: Boolean = false,
    val laughed: Boolean = false,
    val disliked: Boolean = false,
    val createdAt: String? = null
)
