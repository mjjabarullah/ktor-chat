package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.model.Rank

interface RankRepository {

    suspend fun createRank(rank: Rank): Int

    suspend fun getAllRank(domainId: Int): List<Rank>

    suspend fun findRankByCode(code: String, domainId: Int): Rank?

}