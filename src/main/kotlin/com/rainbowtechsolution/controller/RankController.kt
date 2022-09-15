package com.rainbowtechsolution.controller

import com.rainbowtechsolution.common.RankNames
import com.rainbowtechsolution.data.entity.Ranks
import com.rainbowtechsolution.data.mappers.toRankModel
import com.rainbowtechsolution.data.model.Rank
import com.rainbowtechsolution.data.repository.RankRepository
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select

class RankController : RankRepository {

    override suspend fun createRank(rank: Rank): Int = dbQuery {
        Ranks.insertAndGetId {
            it[name] = rank.name!!
            it[code] = rank.code!!
            it[icon] = rank.icon!!
            it[order] = rank.order!!
            it[domainId] = rank.domainId!!
        }.value
    }

    override suspend fun getAllRank(domainId: Int): List<Rank> = dbQuery {
        Ranks.select { Ranks.domainId eq domainId }.map { it.toRankModel() }
    }

    override suspend fun findRankByCode(code: String, domainId: Int): Rank? =
        dbQuery { Ranks.select { Ranks.code eq code }.firstOrNull()?.toRankModel() }

    override suspend fun findRankById(id: Int, domainId: Int): Rank? =
        dbQuery { Ranks.select { Ranks.id eq id }.firstOrNull()?.toRankModel() }

    override suspend fun getRanksBelowOrder(order: Int, domainId: Int): List<Rank> = dbQuery {
        Ranks
            .select { (Ranks.domainId eq domainId) and (Ranks.order greater order) and (Ranks.code neq RankNames.GUEST) }
            .map { it.toRankModel() }
    }

}