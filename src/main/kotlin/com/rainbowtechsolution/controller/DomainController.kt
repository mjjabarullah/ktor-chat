package com.rainbowtechsolution.controller

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.rainbowtechsolution.data.entity.Domains
import com.rainbowtechsolution.data.entity.Ranks
import com.rainbowtechsolution.data.entity.Rooms
import com.rainbowtechsolution.data.entity.Users
import com.rainbowtechsolution.data.repository.DomainRepository
import com.rainbowtechsolution.domain.mappers.toDomainModel
import com.rainbowtechsolution.domain.mappers.toRoomModel
import com.rainbowtechsolution.domain.mappers.toUserModel
import com.rainbowtechsolution.domain.model.Domain
import com.rainbowtechsolution.domain.model.Room
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import java.time.LocalDateTime

class DomainController() : DomainRepository {

    private val domainCache: Cache<Int, Domain> = Caffeine.newBuilder()
        .maximumSize(10_000)
        .build()

    private val domainSlugCache: Cache<String, Domain> = Caffeine.newBuilder()
        .maximumSize(10_000)
        .build()

    override suspend fun createDomain(domain: Domain): Int = dbQuery {
        Domains.insertAndGetId {
            it[name] = domain.name
            it[slug] = domain.slug
            it[description] = domain.description
            it[theme] = domain.theme
            it[allowGuest] = domain.allowGuest
            it[allowRegister] = domain.allowRegister
            it[radioUrl] = domain.radioUrl
            it[createdAt] = LocalDateTime.now()
        }.value
    }

    override suspend fun getAllDomain(): List<Domain> = dbQuery { Domains.selectAll().map { it.toDomainModel() } }

    override suspend fun findDomainById(id: Int): Domain? = dbQuery {
        var domain = domainCache.getIfPresent(id)
        if (domain != null) domain
        else {
            domain = Domains.select { Domains.id eq id }.firstOrNull()?.toDomainModel()
            domainCache.put(id, domain)
            domain
        }
    }

    override suspend fun findDomainBySlug(slug: String): Domain? = dbQuery {
        var domainSlug = domainSlugCache.getIfPresent(slug)
        if (domainSlug != null) domainSlug
        else {
            domainSlug = Domains.select { Domains.slug eq slug }.firstOrNull()?.toDomainModel()
            domainSlugCache.put(slug, domainSlug)
            domainSlug
        }
    }

    override suspend fun deleteDomain(id: Int): Int = dbQuery {
        Domains.deleteWhere { Domains.id eq id }
    }

}