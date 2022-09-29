package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.Stories
import com.rainbowtechsolution.data.entity.StoriesSeen
import com.rainbowtechsolution.data.entity.Users
import com.rainbowtechsolution.data.model.Story
import com.rainbowtechsolution.data.model.User
import com.rainbowtechsolution.data.repository.StoryRepository
import com.rainbowtechsolution.utils.dbQuery
import com.rainbowtechsolution.utils.format
import org.jetbrains.exposed.sql.*
import java.time.LocalDateTime
import java.util.concurrent.ConcurrentHashMap

class StoryController : StoryRepository {

    override suspend fun createStory(story: Story): Unit = dbQuery {
        Stories.insert {
            it[userId] = story.user?.id!!
            it[domainId] = story.domainId!!
            it[content] = story.content
            it[link] = story.link!!
            it[type] = story.type
            it[createdAt] = LocalDateTime.now()
        }
    }

    override suspend fun getStories(userId: Long, domainId: Int): List<User> = dbQuery {
        val seen = wrapAsExpression<Long>(
            StoriesSeen
                .slice(StoriesSeen.id.count())
                .select { (StoriesSeen.userId eq userId) and (StoriesSeen.storyId eq Stories.id) }
        ).alias("seen")
        Stories
            .innerJoin(Users)
            .slice(
                Users.id, Users.name, Users.avatar, Users.gender, Stories.id, Stories.userId, Stories.domainId,
                Stories.content, Stories.link, Stories.type, Stories.createdAt, seen
            )
            .select { Stories.domainId eq domainId }
            .orderBy(Stories.id, SortOrder.DESC)
            .asSequence()
            .map {
                val user = User(
                    id = it[Users.id].value, avatar = it[Users.avatar], name = it[Users.name],
                    gender = it[Users.gender].name
                )
                Story(
                    id = it[Stories.id].value, user = user, content = it[Stories.content], link = it[Stories.link],
                    type = it[Stories.type], seen = it[seen]!! > 0, createdAt = it[Stories.createdAt].format()
                )
            }
            .groupBy { it.user!! }
            .map {
                val user = it.key.copy()
                user.stories = it.value
                user
            }.map {
                it.stories = it.stories.map { story -> story.copy(user = null) }
                it
            }.sortedByDescending { it.stories[0].id }
            .toList()
    }

    override suspend fun seenStory(userId: Long, storyId: Int): Unit = dbQuery {
        StoriesSeen.insert {
            it[StoriesSeen.userId] = userId
            it[StoriesSeen.storyId] = storyId
        }
    }

    override suspend fun deleteStory(id: Int): Unit = dbQuery {
        Stories.deleteWhere { Stories.id eq id }
    }
}