package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.entity.ReportType
import com.rainbowtechsolution.data.model.Report

interface ReportRepository {

    suspend fun getReportsByDomain(domainId: Int): List<Report>

    suspend fun createReport(
        userId: Long, targetId: Long, domainId: Int, type: ReportType, reason: String, roomId: Int
    ): Int

    suspend fun findReportById(id: Int): Report?

    suspend fun deleteReportById(id: Int): Int

}