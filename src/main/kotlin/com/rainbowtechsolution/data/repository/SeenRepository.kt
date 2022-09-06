package com.rainbowtechsolution.data.repository


import com.rainbowtechsolution.data.entity.SeenType
import com.rainbowtechsolution.data.model.Seen

interface SeenRepository {

    suspend fun createSeen(seen: List<Seen>)

    suspend fun makeSeen(domainId: Int, userId: Long, type: SeenType)

}
