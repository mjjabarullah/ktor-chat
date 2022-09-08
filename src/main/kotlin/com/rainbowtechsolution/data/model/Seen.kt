package com.rainbowtechsolution.data.model

import com.rainbowtechsolution.data.entity.PostType

data class Seen(
    val userId: Long,
    val domainId: Int,
    val type: PostType,
)
