package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.model.GlobalFeed
import com.rainbowtechsolution.data.model.GlobalFeedRes

interface GlobalFeedRepository {

    suspend fun createGlobalFeed(globalFeed: GlobalFeed): Int

    suspend fun getGlobalFeeds(domainId: Int, userId: Long): GlobalFeedRes

    suspend fun readGlobalFeed(domainId: Int, userId: Long)

    suspend fun deleteGlobalFeed(id: Int)
}
