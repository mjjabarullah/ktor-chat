package com.rainbowtechsolution.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class AdminshipRes(
    val adminships: List<Adminship> = emptyList(),
    val unReadCount: Int = 0
)
