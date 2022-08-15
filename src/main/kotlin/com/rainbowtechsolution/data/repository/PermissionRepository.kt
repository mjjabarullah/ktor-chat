package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.domain.model.Permission
import com.rainbowtechsolution.domain.model.Rank

interface PermissionRepository {

    suspend fun createPermission(permission: Permission)

    suspend fun findPermissionByRank(rankId: Int): Permission?

}