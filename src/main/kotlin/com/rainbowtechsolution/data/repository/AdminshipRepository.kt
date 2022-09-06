package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.model.Adminship
import com.rainbowtechsolution.data.model.AdminshipRes

interface AdminshipRepository {

    suspend fun createAdminship(adminship: Adminship): Int

    suspend fun getAdminships(domainId: Int, userId: Long): AdminshipRes

    suspend fun readAdminship(domainId: Int, userId: Long)

    suspend fun deleteAdminship(id: Int)
}
