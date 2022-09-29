package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.StoryType

@kotlinx.serialization.Serializable
data class Story(
    val id: Int? = null,
    val user: User? = null,
    val domainId: Int? = null,
    val content: String? = null,
    val link: String? = null,
    val type: StoryType,
    val seen: Boolean = false,
    val createdAt: String? = null
)
