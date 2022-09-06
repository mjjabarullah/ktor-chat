package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class News(
    val news: List<Announcement> = emptyList(),
    val unReadCount: Int = 0
)
