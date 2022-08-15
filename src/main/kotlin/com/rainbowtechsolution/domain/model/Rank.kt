package com.rainbowtechsolution.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Rank(
    val id: Int? = null,
    val name: String,
    val code: String,
    val icon: String,
    val order: Int,
    val domainId: Int? = null,
    val permission: Permission? = null
)