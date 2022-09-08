package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PostRes(
    val posts: List<Post> = emptyList(),
    val unReadCount: Int = 0
)
