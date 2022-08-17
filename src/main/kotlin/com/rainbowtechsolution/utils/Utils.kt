package com.rainbowtechsolution.utils

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.rainbowtechsolution.common.Validation
import io.ktor.http.content.*
import io.ktor.server.http.content.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.mindrot.jbcrypt.BCrypt
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*
import javax.imageio.ImageIO

fun getUUID() = UUID.randomUUID().toString()

inline fun <reified T> T.getLogger(): Logger {
    return LoggerFactory.getLogger(T::class.simpleName.toString())
}

inline fun <reified T> T.encodeToString(): String =
    jacksonObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_NULL).writeValueAsString(this)

inline fun <reified T> String.decodeFromString(): T = jacksonObjectMapper().readValue<T>(this)

suspend fun PartData.FileItem.saveImage(path: String, renderFormat: String) {
    withContext(Dispatchers.IO) {
        ByteArrayInputStream(streamProvider().readBytes()).also { input ->
            val bufferedImage = ImageIO.read(input)
            ByteArrayOutputStream().also { output ->
                ImageIO.write(bufferedImage, renderFormat, output)
                File(path).writeBytes(output.toByteArray())
                output.close()
            }
            input.close()
        }
    }
}

suspend fun PartData.FileItem.saveAudio(path: String) {
    withContext(Dispatchers.IO) {
        val fileBytes = streamProvider().readBytes()
        File(path).writeBytes(fileBytes)
    }
}

suspend fun <T> dbQuery(block: () -> T): T = newSuspendedTransaction(Dispatchers.IO) { block() }


fun String.isNameValid(): Boolean {
    for (char in Validation.BAD_CHARS) {
        if (this.trim().contains(char)) return false
    }
    return true
}

fun String.clean(): String {
    var result = this
    for (char in Validation.BAD_CHARS) {
        result = result.replace(char, "")
    }
    return result
}

fun String.hashPassword(): String = BCrypt.hashpw(this, BCrypt.gensalt())

fun String.checkPassword(passwordToCheck: String): Boolean = BCrypt.checkpw(passwordToCheck, this)

fun String.getDomain() = split(".")[0]

fun String.capitalize() = replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }

fun String.capitalizeWords() = split(" ").joinToString(" ") { it.lowercase().capitalize() }

fun String.toDob(): String {
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    val f = DateTimeFormatter.ofPattern("dd-MM-yyyy")
    val date = LocalDate.parse(this, formatter)
    return date.format(f)
}

fun LocalDateTime.format(format: String = "dd/MM  H:mm"): String = format(DateTimeFormatter.ofPattern(format))


