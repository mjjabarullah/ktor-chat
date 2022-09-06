package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Rank(
    val id: Int? = null,
    val name: String? = null,
    val code: String? = null,
    val icon: String? = null,
    val order: Int? = null,
    val domainId: Int? = null,
    val permission: Permission? = null
)