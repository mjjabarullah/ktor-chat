package com.rainbowtechsolution.data.repository


import com.rainbowtechsolution.data.model.Story
import com.rainbowtechsolution.data.model.User

interface StoryRepository {

    suspend fun createStory(story: Story)

    suspend fun getStories(userId: Long, domainId: Int): List<User>

    suspend fun seenStory(userId: Long, storyId: Int)

    suspend fun deleteStory(id: Int)

}
