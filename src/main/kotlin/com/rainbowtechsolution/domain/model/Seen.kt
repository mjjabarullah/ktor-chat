package com.rainbowtechsolution.domain.model

import com.rainbowtechsolution.data.entity.SeenType

data class Seen(
    val userId: Long,
    val domainId: Int,
    val type: SeenType,
)
