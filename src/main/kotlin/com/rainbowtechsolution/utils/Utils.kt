package com.rainbowtechsolution.utils

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.rainbowtechsolution.common.*
import com.rainbowtechsolution.data.entity.MessageType
import com.rainbowtechsolution.data.model.Message
import com.rainbowtechsolution.data.model.Permission
import com.rainbowtechsolution.data.model.User
import io.ktor.http.content.*
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
import java.util.regex.Pattern
import javax.imageio.ImageIO


fun getUUID() = UUID.randomUUID().toString()

inline fun <reified T> T.getLogger(): Logger = LoggerFactory.getLogger(T::class.simpleName.toString())

inline fun <reified T> T.encodeToString(): String =
    jacksonObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_NULL).writeValueAsString(this)

inline fun <reified T> String.decodeFromString(): T = jacksonObjectMapper().readValue(this)

suspend fun PartData.FileItem.saveFile(path: String, renderFormat: String) {
    when (renderFormat) {
        ImageType.GIF, VideoType.MP4 -> {
            val fileBytes = streamProvider().readBytes()
            File(path).writeBytes(fileBytes)
        }
        else -> withContext(Dispatchers.IO) {
            ByteArrayInputStream(streamProvider().readBytes()).also { input ->
                val bufferedImage = ImageIO.read(input)
                ByteArrayOutputStream().also { output ->
                    ImageIO.write(bufferedImage, ImageType.WEBP, output)
                    File(path).writeBytes(output.toByteArray())
                    output.close()
                }
                input.close()
            }
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
        if (this.contains(char)) return false
    }
    return true
}

fun String.clean(): String {
    var result = this
    Validation.BAD_CHARS.forEach { result = result.replace(it, "") }
    return result
}

fun String.hashPassword(): String = BCrypt.hashpw(this, BCrypt.gensalt())

fun String.checkPassword(passwordToCheck: String): Boolean = BCrypt.checkpw(passwordToCheck, this)

fun String.getDomainSlug() = split(".")[0]

fun String.capitalize() = replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }

fun String.capitalizeWords() = split(" ").joinToString(" ") { it.lowercase().capitalize() }

fun String.toDob(): String {
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    val f = DateTimeFormatter.ofPattern("dd-MM-yyyy")
    val date = LocalDate.parse(this, formatter)
    return date.format(f)
}

fun LocalDateTime.format(format: String = "dd/MM  HH:mm"): String = format(DateTimeFormatter.ofPattern(format))

fun Long.getTime(): String {
    val hour = this / 60
    val day = this / (60 * 24)
    return when {
        hour < 1L -> "$this minutes"
        hour == 1L -> "$hour hour"
        hour in 2..23 -> "$hour hours"
        day == 1L -> "$day day"
        day > 1L -> "$day days"
        else -> ""
    }
}

fun checkYoutube(message: Message, permission: Permission): Message {
    val content = message.content!!
    val hasYoutube = content.contains("https://www.youtu") || content.contains("https://youtu")
            || content.contains("https://www.youtube") || content.contains("https://youtube")
    return when {
        hasYoutube && permission.directDisplay -> {
            val trimmedContent = content.replace("https?://\\S+\\s?".toRegex(), "")
            val videoId = getYoutubeVideoId(extractUrls(content)[0])
            if (videoId == null) message
            else message.copy(
                ytFrame = """<iframe frameborder="0" scrolling="no" marginheight="0" marginwidth="0" class="youtube" 
                src="https://www.youtube.com/embed/$videoId"> </iframe> """.trimIndent(), content = trimmedContent
            )
        }
        else -> message
    }
}

private fun extractUrls(text: String): List<String> {
    val containedUrls = mutableListOf<String>()
    val urlRegex = "((https?|ftp|gopher|telnet|file):((//)|(\\\\))+[\\w\\d:#@%/;$()~_?+-=\\\\.&]*)"
    val pattern = Pattern.compile(urlRegex, Pattern.CASE_INSENSITIVE)
    val urlMatcher = pattern.matcher(text)
    while (urlMatcher.find()) {
        containedUrls.add(text.substring(urlMatcher.start(0), urlMatcher.end(0)).trim())
    }
    return containedUrls
}

private fun getYoutubeVideoId(url: String): String? {
    if (url.isEmpty()) return null
    var validYoutubeVideoId: String? = null
    val regexPattern =
        "^(?:https?://)?(?:[\\dA-Z-]+\\.)?(?:youtu\\.be/|youtube\\.com\\S*[^\\w\\-\\s])([\\w\\-]{11})(?=[^\\w\\-]|$)(?![?=&+%\\w]*(?:['\"][^<>]*>|</a>))[?=&+%\\w]*"
    val regexCompiled = Pattern.compile(regexPattern, Pattern.CASE_INSENSITIVE)
    val regexMatcher = regexCompiled.matcher(url)
    if (regexMatcher.find()) {
        try {
            validYoutubeVideoId = regexMatcher.group(1)
        } catch (ignore: Exception) {
        }
    }
    return validYoutubeVideoId
}

fun processCommands(message: Message, user: User, permission: Permission): Message {
    var content = message.content!!
    if (!content.startsWith("/")) return message
    val code = user.rank?.code
    val isGuest = code == RankNames.GUEST
    val isUser = code == RankNames.USER
    val isStaff =
        code == RankNames.OWNER || code == RankNames.S_ADMIN || code == RankNames.ADMIN || code == RankNames.MODERATOR
    val command = when {
        content.length >= 3 && content.substring(0, 3).matches(Commands.ME.toRegex()) -> {
            content = message.content.replace(Commands.ME, "")
            Commands.ME
        }
        content.length >= 3 && content.substring(0, 3).matches(Commands.WC.toRegex()) -> {
            content = message.content.replace(Commands.WC, "")
            content =
                """<img src="/images/defaults/welcome.svg" class="emoticon-md" /> Welcome<img src="/images/defaults/welcome.svg" class="emoticon-md" /> $content""".trimIndent()
            Commands.WC
        }
        content.length >= 6 && content.substring(0, 6).matches(Commands.CLEAR.toRegex()) -> Commands.CLEAR
        else -> ""
    }
    return when {
        command == Commands.ME && !isGuest -> message.copy(highLighted = true, content = content)
        command == Commands.WC && !isGuest && !isUser -> message.copy(content = content)
        command == Commands.CLEAR && isStaff -> message.copy(type = MessageType.ClearChat)
        else -> message
    }
}





