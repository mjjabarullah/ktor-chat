package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.domain.model.Announcement
import com.rainbowtechsolution.domain.model.News

interface NewsRepository {

    suspend fun createNews(announcement: Announcement): Int

    suspend fun getNews(domainId: Int, userId: Long): News

    suspend fun readNews(domainId: Int, userId: Long)

    suspend fun deleteNews(id: Int)
}
