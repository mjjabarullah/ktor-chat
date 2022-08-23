package com.rainbowtechsolution.data.database

import com.rainbowtechsolution.data.entity.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.DatabaseConfig
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.configureDatabase() {
    val config = environment.config
    val jdbcUrl = config.property("database.jdbcUrl").getString()
    val driverClassName = config.property("database.driverClassName").getString()
    val dbUser = config.property("database.dbUser").getString()
    val dbPassword = config.property("database.dbPassword").getString()
    val db = Database.connect(jdbcUrl, driverClassName, user = dbUser, password = dbPassword)
    TransactionManager.defaultDatabase = db

    transaction {
        SchemaUtils.createMissingTablesAndColumns(
            Domains, Rooms, Users, Ranks, Permissions, Messages, PvtMessages, Reports, Seen, Announcements
        )
    }

}
