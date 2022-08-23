package com.rainbowtechsolution.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class News(
    val news: List<Announcement> = emptyList(),
    val unReadCount: Int = 0
)
