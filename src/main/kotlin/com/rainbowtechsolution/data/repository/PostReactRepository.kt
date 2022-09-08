package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.entity.ReactType
import com.rainbowtechsolution.data.model.Reaction

interface PostReactRepository {

    suspend fun getPostReactionByUserId(postId: Int, userId: Long): Reaction?

    suspend fun react(postId: Int, userId: Long, type: ReactType): Reaction

    suspend fun updateReaction(postId: Int, userId: Long, type: ReactType): Reaction

    suspend fun deleteReaction(postId: Int, userId: Long)
}