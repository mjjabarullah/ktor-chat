package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.SeenType

data class Seen(
    val userId: Long,
    val domainId: Int,
    val type: SeenType,
)
