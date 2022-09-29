package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.ReportType
import com.rainbowtechsolution.data.entity.Reports
import com.rainbowtechsolution.data.entity.Users
import com.rainbowtechsolution.data.mappers.toReportModel
import com.rainbowtechsolution.data.model.Report
import com.rainbowtechsolution.data.repository.ReportRepository
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import java.time.LocalDateTime

class ReportController : ReportRepository {
    override suspend fun getReportsByDomain(domainId: Int): List<Report> = dbQuery {
        Reports
            .innerJoin(Users)
            .slice(
                Users.name, Users.avatar, Reports.id, Reports.reason, Reports.type, Reports.targetId, Reports.createdAt,
                Reports.roomId
            )
            .select { Reports.domainId eq domainId }
            .map { it.toReportModel() }
    }

    override suspend fun createReport(
        userId: Long, targetId: Long, domainId: Int,  type: ReportType, reason: String, roomId: Int
    ): Int = dbQuery {
        Reports.insertAndGetId {
            it[Reports.userId] = userId
            it[Reports.targetId] = targetId
            it[Reports.domainId] = domainId
            it[Reports.type] = type
            it[Reports.reason] = reason
            it[Reports.roomId] = roomId
            it[createdAt] = LocalDateTime.now()
        }.value
    }

    override suspend fun findReportById(id: Int): Report? {
        return null
    }

    override suspend fun deleteReportById(id: Int): Int = dbQuery {
        Reports.deleteWhere { Reports.id eq id }
    }


}

