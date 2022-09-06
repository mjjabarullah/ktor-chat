package com.rainbowtechsolution.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Adminship(
    val id: Int? = null,
    val content: String? = null,
    val image: String? = null,
    val user: User? = null,
    val domainId: Int? = null,
    val unReadCount: Int? = null,
    val createdAt: String? = null
)
