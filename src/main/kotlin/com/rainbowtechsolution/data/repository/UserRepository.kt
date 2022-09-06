package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.entity.Gender
import com.rainbowtechsolution.data.entity.Status
import com.rainbowtechsolution.data.model.User

interface UserRepository {

    suspend fun register(user: User, domainId: Int, rankId: Int): Long

    suspend fun guestRegister(user: User, rankId: Int)

    suspend fun isUserExists(name: String, email: String, domainId: Int): Boolean

    suspend fun isEmailExists(email: String, domainId: Int): Boolean

    suspend fun isUserExists(name: String, domainId: Int): Boolean

    suspend fun login(name: String, password: String, domainId: Int): User?

    suspend fun update(user: User)

    suspend fun findUserById(id: Long): User?

    suspend fun setSessions(id: Long, mode: Boolean)

    suspend fun joinRoom(roomId: Int, userId: Long)

    suspend fun getUsersByRoom(roomId: Int, limit: Int): List<User>

    suspend fun increasePoints(id: Long)

    suspend fun updateAvatar(id: Long, avatar: String)

    suspend fun updateName(id: Long, name: String)

    suspend fun customizeName(id: Long, nameColor: String?, nameFont: String?)

    suspend fun updatePassword(id: Long, password: String)

    suspend fun updateMood(id: Long, mood: String?)

    suspend fun updateAbout(id: Long, about: String?)

    suspend fun updateStatus(id: Long, status: Status)

    suspend fun updateGender(id: Long, gender: Gender)

    suspend fun updateDob(id: Long, dob: String?)

    suspend fun customizeText(id: Long, textBold: Boolean, textColor: String?, textFont: String?)

    suspend fun changeSoundSettings(
        id: Long, chatSound: Boolean, pvtSound: Boolean, nameSound: Boolean, notifiSound: Boolean
    )

    suspend fun changePrivate(id: Long, private: Boolean)

    suspend fun getStaffIdsByDomainId(domainId: Int): List<Long>

    suspend fun mute(id: Long)

    suspend fun unMute(id: Long)

    suspend fun kick(id: Long, roomId: Int)

    suspend fun unKick(id: Long, roomId: Int)

    suspend fun ban(id: Long)

    suspend fun unBan(id: Long)

    suspend fun delete(id: Long): Int

}