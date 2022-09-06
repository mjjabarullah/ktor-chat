package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.domain.model.Adminship
import com.rainbowtechsolution.domain.model.AdminshipRes

interface AdminshipRepository {

    suspend fun createAdminship(adminship: Adminship): Int

    suspend fun getAdminships(domainId: Int, userId: Long): AdminshipRes

    suspend fun readAdminShip(domainId: Int, userId: Long)

    suspend fun deleteAdminship(id: Int)
}
