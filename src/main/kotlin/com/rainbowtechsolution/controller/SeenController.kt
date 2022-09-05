package com.rainbowtechsolution.controller


import com.rainbowtechsolution.data.entity.SeenType
import com.rainbowtechsolution.data.repository.SeenRepository
import com.rainbowtechsolution.domain.model.Seen
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.update
import java.time.LocalDateTime
import com.rainbowtechsolution.data.entity.Seen as Seeen

class SeenController : SeenRepository {

    override suspend fun createSeen(seen: List<Seen>): Unit = dbQuery {
        Seeen.batchInsert(seen) {
            this[Seeen.userId] = it.userId
            this[Seeen.domainId] = it.domainId
            this[Seeen.type] = it.type
            this[Seeen.createdAt] = LocalDateTime.of(2018, 1, 1, 0, 0, 0, 0)
        }
    }

    override suspend fun makeSeen(domainId: Int, userId: Long, type: SeenType): Unit = dbQuery {
        Seeen.update({ (Seeen.domainId eq domainId) and (Seeen.userId eq userId) and (Seeen.type eq type) }) {
            it[createdAt] = LocalDateTime.now()
        }
    }
}