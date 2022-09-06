package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.*
import com.rainbowtechsolution.data.repository.AdminshipRepository
import com.rainbowtechsolution.data.repository.SeenRepository
import com.rainbowtechsolution.domain.mappers.toAdminshipModel
import com.rainbowtechsolution.domain.model.Adminship
import com.rainbowtechsolution.domain.model.AdminshipRes
import com.rainbowtechsolution.domain.model.User
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.*
import java.time.LocalDateTime

class AdminshipController(private val seenRepository: SeenRepository) : AdminshipRepository {

    override suspend fun createAdminship(adminship: Adminship): Int {
        val postId = dbQuery {
            AdminShips.insertAndGetId {
                it[content] = adminship.content!!
                it[image] = adminship.image
                it[userId] = adminship.user?.id!!
                it[domainId] = adminship.domainId!!
                it[createdAt] = LocalDateTime.now()
            }.value
        }
        readAdminShip(adminship.domainId!!, adminship.user?.id!!)
        return postId
    }

    override suspend fun getAdminships(domainId: Int, userId: Long): AdminshipRes = dbQuery {
        val date = Seen
            .select { (Seen.domainId eq domainId) and (Seen.userId eq userId) and (Seen.type eq SeenType.News) }
            .first().let { it[Seen.createdAt] }
        val subQuery = AdminShips
            .slice(AdminShips.id.count())
            .select { (AdminShips.createdAt greater date) and (AdminShips.domainId eq domainId) }
        val unReadCount = wrapAsExpression<Long>(subQuery).alias("unReadCount")
        val expressions = (AdminShips.columns as List<Expression<*>>).toTypedArray()
        var count: Int? = 0
        val adminships = AdminShips
            .innerJoin(Users)
            .slice(
                unReadCount, *expressions, Users.id, Users.name, Users.avatar, Users.gender, Users.nameColor,
                Users.textColor, Users.nameFont, Users.textBold, Users.textFont
            )
            .select { AdminShips.domainId eq domainId }
            .limit(20)
            .orderBy(AdminShips.id, SortOrder.DESC)
            .map {
                count = it[unReadCount]?.toInt()
                val user = User(
                    id = it[Users.id].value, avatar = it[Users.avatar], name = it[Users.name],
                    gender = it[Users.gender].name, nameFont = it[Users.nameFont], nameColor = it[Users.nameColor],
                    textColor = it[Users.textColor], textFont = it[Users.textFont], textBold = it[Users.textBold]
                )
                it.toAdminshipModel(user)
            }
        AdminshipRes(adminships, count ?: 0)
    }

    override suspend fun readAdminShip(domainId: Int, userId: Long) = seenRepository.makeSeen(
        domainId, userId, SeenType.AdminShip
    )

    override suspend fun deleteAdminship(id: Int): Unit = dbQuery {
        Announcements.deleteWhere { Announcements.id eq id }
    }

}