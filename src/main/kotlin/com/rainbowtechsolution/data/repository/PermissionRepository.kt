package com.rainbowtechsolution.data.repository

import com.rainbowtechsolution.data.model.Permission

interface PermissionRepository {

    suspend fun createPermission(permission: Permission)

    suspend fun findPermissionByRank(rankId: Int): Permission?

}