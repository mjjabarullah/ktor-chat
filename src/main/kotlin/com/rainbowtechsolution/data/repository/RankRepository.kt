package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.entity.Ranks
import com.rainbowtechsolution.data.model.Rank

interface RankRepository {

    suspend fun createRank(rank: Rank): Int

    suspend fun getAllRank(domainId: Int): List<Rank>

    suspend fun findRankByCode(code: String, domainId: Int): Rank?

    suspend fun findRankById(id: Int, domainId: Int): Rank?

    suspend fun getRanksBelowOrder(order: Int, domainId: Int): List<Rank>

}