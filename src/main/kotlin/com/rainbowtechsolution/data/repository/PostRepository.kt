package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.entity.PostType
import com.rainbowtechsolution.data.model.Post
import com.rainbowtechsolution.data.model.PostRes

interface PostRepository : PostReactRepository, SeenRepository , CommentRepository{

    suspend fun createPost(post: Post): Int

    suspend fun getPosts(domainId: Int, userId: Long, postType: PostType): PostRes

    suspend fun readPost(domainId: Int, userId: Long, postType: PostType)

    suspend fun deletePost(id: Int)
}
