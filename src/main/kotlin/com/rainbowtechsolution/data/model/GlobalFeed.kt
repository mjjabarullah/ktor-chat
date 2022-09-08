package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class GlobalFeed(
    val id: Int? = null,
    val content: String? = null,
    val image: String? = null,
    val user: User? = null,
    val domainId: Int? = null,
    val unReadCount: Int? = null,
    val comments: List<Comment> = emptyList(),
    val totalComments: Int = 0,
    val createdAt: String? = null
)
