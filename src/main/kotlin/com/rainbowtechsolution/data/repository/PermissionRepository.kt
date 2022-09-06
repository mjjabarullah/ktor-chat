package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.model.Permission
import com.rainbowtechsolution.data.model.Rank

interface PermissionRepository {

    suspend fun createPermission(permission: Permission)

    suspend fun findPermissionByRank(rankId: Int): Permission?

}