package com.rainbowtechsolution.controller

import com.rainbowtechsolution.common.RankIcons
import com.rainbowtechsolution.common.RankNames
import com.rainbowtechsolution.data.entity.Ranks
import com.rainbowtechsolution.data.repository.RankRepository
import com.rainbowtechsolution.domain.mappers.toRankModel
import com.rainbowtechsolution.domain.model.Rank
import com.rainbowtechsolution.utils.capitalize
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select

class RankController : RankRepository {

    override suspend fun createRank(rank: Rank): Int = dbQuery {
        Ranks.insertAndGetId {
            it[name] = rank.name
            it[code] = rank.code
            it[icon] = rank.icon
            it[order] = rank.order
            it[domainId] = rank.domainId!!
        }.value
    }

    override suspend fun getAllRank(domainId: Int): List<Rank> = dbQuery {
        Ranks.select { Ranks.domainId eq domainId }.map { it.toRankModel() }
    }

    override suspend fun findRankByCode(code: String, domainId: Int): Rank? =
        dbQuery { Ranks.select { Ranks.code eq code }.firstOrNull()?.toRankModel() }

}