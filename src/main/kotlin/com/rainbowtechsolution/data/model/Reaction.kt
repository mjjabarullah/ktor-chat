package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.ReactType
import kotlinx.serialization.Serializable

@Serializable
data class Reaction(
    val oldReaction: ReactType? = null,
    val newReaction: ReactType? = null
)