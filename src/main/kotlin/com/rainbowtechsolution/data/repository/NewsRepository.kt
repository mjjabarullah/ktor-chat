package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.model.Announcement
import com.rainbowtechsolution.data.model.News

interface NewsRepository {

    suspend fun createNews(announcement: Announcement): Int

    suspend fun getNews(domainId: Int, userId: Long): News

    suspend fun readNews(domainId: Int, userId: Long)

    suspend fun deleteNews(id: Int)
}
