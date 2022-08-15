package com.rainbowtechsolution.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Domain(
    var id: Int? = null,
    var name: String,
    var slug: String,
    var description: String,
    var theme: String,
    val allowGuest: Boolean = false,
    val allowRegister: Boolean = false,
    val radioUrl: String? = null,
    val nameLength: Int? = null,
    val uploadSize: Int? = null,
    val chatLogDelete: Int? = null,
    val pvtLogDelete: Int? = null,
    val inactiveUserDelete: Int? = null,
    val chatChars: Int? = null,
    val pvtChars: Int? = null,
    val offlineLimit: Int? = null,
    var createdAt: String? = null,
)