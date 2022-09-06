package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.ReportType
import kotlinx.serialization.Serializable

@Serializable
data class Report(
    val id: Int? = null,
    val name: String? = null,
    val avatar: String? = null,
    val targetId: Long? = null,
    val type: ReportType? = null,
    val reason: String? = null,
    val roomId: Int? = null,
    val createdAt: String? = null
)

