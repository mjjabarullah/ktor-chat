package com.rainbowtechsolution.data.model

import kotlinx.serialization.Serializable

@Serializable
data class UserRes(
    val user: User? = null,
    val ranks: List<Rank> = emptyList(),
    val sameIps: List<String> = emptyList(),
    val sameDevices: List<String> = emptyList()
)
