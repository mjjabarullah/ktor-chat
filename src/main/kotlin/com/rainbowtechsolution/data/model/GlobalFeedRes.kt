package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class GlobalFeedRes(
    val globalFeeds: List<GlobalFeed> = emptyList(),
    val unReadCount: Int = 0
)
