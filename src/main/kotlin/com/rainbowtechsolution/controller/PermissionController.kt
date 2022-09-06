package com.rainbowtechsolution.controller

import com.rainbowtechsolution.data.entity.Permissions
import com.rainbowtechsolution.data.repository.PermissionRepository
import com.rainbowtechsolution.data.mappers.toPermissionModel
import com.rainbowtechsolution.data.model.Permission
import com.rainbowtechsolution.utils.dbQuery
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select

class PermissionController : PermissionRepository {

    override suspend fun createPermission(permission: Permission): Unit = dbQuery {
        Permissions.insert {
            it[rankId] = permission.rankId!!
            it[name] = permission.name
            it[nameColor] = permission.nameColor
        }
    }

    override suspend fun findPermissionByRank(rankId: Int): Permission? = dbQuery {
        Permissions
            .select { Permissions.rankId eq rankId }
            .firstOrNull()
            ?.toPermissionModel()
    }
}