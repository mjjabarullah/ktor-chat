package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.model.Domain

interface DomainRepository {

    suspend fun createDomain(domain: Domain): Int?

    suspend fun getAllDomain(): List<Domain>

    suspend fun findDomainById(id: Int): Domain?

    suspend fun findDomainBySlug(slug: String): Domain?

    suspend fun deleteDomain(id: Int): Int
}