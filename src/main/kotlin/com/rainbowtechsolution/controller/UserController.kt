package com.rainbowtechsolution.controller

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.rainbowtechsolution.common.ChatDefaults
import com.rainbowtechsolution.data.entity.*
import com.rainbowtechsolution.data.mappers.toUserModel
import com.rainbowtechsolution.data.model.Rank
import com.rainbowtechsolution.data.model.User
import com.rainbowtechsolution.data.model.UserRes
import com.rainbowtechsolution.data.repository.UserRepository
import com.rainbowtechsolution.utils.capitalize
import com.rainbowtechsolution.utils.checkPassword
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.*
import java.time.LocalDateTime

class UserController : UserRepository {

    companion object {
        private var userCache: Cache<Long, User> = Caffeine.newBuilder().maximumSize(10_000).build()

        fun updateUser(user: User) {
            val cachedUser = userCache.getIfPresent(user.id) ?: return
            cachedUser.points = user.points
            cachedUser.level = user.level
        }
    }

    override suspend fun register(user: User, domainId: Int, rankId: Int): Long = dbQuery {
        Users.insertAndGetId {
            it[name] = user.name!!
            it[email] = user.email!!
            it[password] = user.password!!
            it[avatar] = user.avatar!!
            it[gender] = if (user.gender == Gender.Male.name) Gender.Male else Gender.Female
            it[Users.domainId] = domainId
            it[Users.rankId] = rankId
            it[nameColor] = ChatDefaults.COLOR
            it[textColor] = ChatDefaults.COLOR
            it[ip] = user.ip
            it[deviceId] = user.deviceId
            it[timezone] = user.timezone
            it[country] = user.country
            it[createdAt] = LocalDateTime.now()
        }.value
    }

    override suspend fun guestRegister(user: User, rankId: Int): Unit = dbQuery {
        userCache.invalidate(user.id!!)
        Users.update({ Users.id eq user.id!! }) {
            it[name] = user.name!!
            it[email] = user.email!!
            it[password] = user.password!!
            it[avatar] = user.avatar!!
            it[Users.rankId] = rankId
        }
    }

    override suspend fun isUserExists(name: String, email: String, domainId: Int): Boolean = dbQuery {
        Users.select {
            (Users.name eq name) or (Users.email eq email) and (Users.domainId eq domainId)
        }.count() > 0
    }

    override suspend fun isUserExists(name: String, domainId: Int): Boolean = dbQuery {
        Users.select { (Users.name eq name and (Users.domainId eq domainId)) }.count() > 0
    }

    override suspend fun isEmailExists(email: String, domainId: Int): Boolean = dbQuery {
        Users.select { (Users.email eq email and (Users.domainId eq domainId)) }.count() > 0
    }

    override suspend fun login(name: String, password: String, domainId: Int): User? = dbQuery {
        val row = Users.innerJoin(Ranks).select { (Users.name eq name) and (Users.domainId eq domainId) }.firstOrNull()
        when {
            row == null -> null
            !row[Users.password].checkPassword(password) -> null
            else -> row.toUserModel()
        }
    }

    override suspend fun update(user: User): Unit = dbQuery {
        Users.update({ Users.id eq user.id }) {
            it[ip] = user.ip
            it[timezone] = user.timezone
            it[deviceId] = user.deviceId
            it[country] = user.country
        }
    }

    override suspend fun findUserById(id: Long): User? = dbQuery {
        var user = userCache.getIfPresent(id)
        if (user != null) user
        else {
            user = Users.innerJoin(Ranks).select { Users.id eq id }.firstOrNull()?.toUserModel()
            if (user != null) userCache.put(id, user)
            user
        }
    }

    override suspend fun sameUser(domainId: Int, ip: String, deviceId: String): UserRes = dbQuery {
        val sameIps = Users
            .slice(Users.name, Users.domainId, Users.ip)
            .select { (Users.domainId eq domainId) and (Users.ip eq ip) }
            .map { it[Users.name] }
        val sameDevices = Users
            .slice(Users.name, Users.domainId, Users.ip)
            .select { (Users.domainId eq domainId) and (Users.deviceId eq deviceId) }
            .map { it[Users.name] }
        UserRes(sameIps = sameIps, sameDevices = sameDevices)
    }

    override suspend fun setSessions(id: Long, mode: Boolean): Unit = dbQuery {
        Users.update({ Users.id eq id }) {
            with(SqlExpressionBuilder) {
                if (mode) it[sessions] = sessions + 1 else it[sessions] = sessions - 1
            }
        }
    }

    override suspend fun joinRoom(roomId: Int, userId: Long): Unit = dbQuery {
        userCache.invalidate(userId)
        Users.update({ Users.id eq userId }) {
            it[Users.roomId] = roomId
        }
    }

    override suspend fun getUsersByRoom(roomId: Int, limit: Int): List<User> = dbQuery {
        val expressions = listOf<Expression<*>>(
            Users.id, Users.name, Users.avatar, Users.gender, Users.mood, Users.level, Users.status, Users.roomId,
            Users.sessions, Users.nameColor, Users.nameFont, Users.muted, Ranks.name, Ranks.icon, Ranks.order
        )
        val online = Users
            .innerJoin(Ranks)
            .slice(expressions)
            .select { (Users.roomId eq roomId) and ((Users.sessions greater 0) or (Users.status eq Status.Stay)) }
            .orderBy(Ranks.order)
        val offline = Users
            .innerJoin(Ranks)
            .slice(expressions)
            .select { (Users.roomId eq roomId) and ((Users.sessions eq 0) and (Users.status neq Status.Stay)) }
            .limit(limit)
            .orderBy(Ranks.order)
        online.unionAll(offline).map {
            User(
                id = it[Users.id].value, name = it[Users.name], avatar = it[Users.avatar], mood = it[Users.mood],
                gender = it[Users.gender].name, nameColor = it[Users.nameColor], nameFont = it[Users.nameFont],
                level = it[Users.level], sessions = it[Users.sessions], status = it[Users.status].name,
                muted = it[Users.muted], rank = Rank(name = it[Ranks.name], icon = it[Ranks.icon])
            )
        }
    }

    override suspend fun updatePointsAndLevel(id: Long, points: Int, level: Int): Unit = dbQuery {
        Users.update({ Users.id eq id }) {
            it[Users.points]= points
            it[Users.level]= level
        }
    }

    override suspend fun updateAvatar(id: Long, avatar: String): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.avatar] = avatar
        }
    }

    override suspend fun updateName(id: Long, name: String): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.name] = name
        }
    }

    override suspend fun updateRank(id: Long, rankId: Int): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.rankId] = rankId
        }
    }

    override suspend fun customizeName(id: Long, nameColor: String?, nameFont: String?): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.nameColor] = nameColor
            it[Users.nameFont] = nameFont
        }
    }

    override suspend fun updatePassword(id: Long, password: String): Unit = dbQuery {
        Users.update({ Users.id eq id }) {
            it[Users.password] = password
        }
    }

    override suspend fun updateMood(id: Long, mood: String?): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.mood] = mood
        }
    }

    override suspend fun updateAbout(id: Long, about: String?): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.about] = about
        }
    }

    override suspend fun updateStatus(id: Long, status: Status): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.status] = status
        }
    }

    override suspend fun updateGender(id: Long, gender: Gender): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.gender] = gender
        }
    }

    override suspend fun updateDob(id: Long, dob: String?): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.dob] = dob
        }
    }

    override suspend fun customizeText(id: Long, textBold: Boolean, textColor: String?, textFont: String?): Unit =
        dbQuery {
            userCache.invalidate(id)
            Users.update({ Users.id eq id }) {
                it[Users.textBold] = textBold
                it[Users.textColor] = textColor
                it[Users.textFont] = textFont
            }
        }

    override suspend fun changeSounds(id: Long, sounds: String): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.sounds] = sounds
        }
    }

    override suspend fun changePrivate(id: Long, private: Boolean): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[Users.private] = private
        }
    }

    override suspend fun mute(id: Long, time: Long, reason: String?): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[muted] = time
            it[muteMsg] = reason
        }
    }

    override suspend fun unMute(id: Long): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[muted] = 0
            it[muteMsg] = null
        }
    }

    override suspend fun kick(id: Long, time: Long, reason: String?): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[kicked] = time
            it[kickMsg] = reason
        }
    }

    override suspend fun unKick(id: Long): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[kicked] = 0
            it[kickMsg] = null
        }
    }

    override suspend fun ban(id: Long, time: Long, reason: String?) {
        dbQuery {
            userCache.invalidate(id)
            Users.update({ Users.id eq id }) {
                it[banned] = time
                it[banMsg] = reason
                it[muted] = 0
                it[muteMsg] = null
            }
        }
        unKick(id)
    }

    override suspend fun unBan(id: Long): Unit = dbQuery {
        userCache.invalidate(id)
        Users.update({ Users.id eq id }) {
            it[banned] = 0
            it[banMsg] = null
        }
    }

    override suspend fun delete(id: Long): Int = dbQuery {
        userCache.invalidate(id)
        Users.deleteWhere { Users.id eq id }
    }

    override suspend fun blockUser(blocker: Long, blocked: Long): Unit = dbQuery {
        Blocks.insert {
            it[Blocks.blocker] = blocker
            it[Blocks.blocked] = blocked
            it[createdAt] = LocalDateTime.now()
        }
    }

    override suspend fun unblockUser(blocker: Long, blocked: Long): Unit = dbQuery {
        Blocks.deleteWhere { (Blocks.blocker eq blocker) and (Blocks.blocked eq blocked) }
    }

    override suspend fun getBlockedUsers(userId: Long): List<User> = dbQuery {
        val expressions = listOf<Expression<*>>(
            Users.id, Users.name, Users.avatar, Users.nameColor, Users.nameFont, Users.gender
        )
        val userTable = Users.slice(expressions).selectAll().alias("blocked")
        Blocks
            .innerJoin(userTable, { blocked }, { userTable[Users.id] })
            .select { Blocks.blocker eq userId }
            .orderBy(Blocks.createdAt to SortOrder.DESC)
            .map {
                User(
                    id = it[userTable[Users.id]].value,
                    name = it[userTable[Users.name]].capitalize(),
                    avatar = it[userTable[Users.avatar]],
                    gender = it[userTable[Users.gender]].name,
                    nameColor = it[userTable[Users.nameColor]],
                    nameFont = it[userTable[Users.nameFont]]
                )
            }
    }
}