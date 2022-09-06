package com.rainbowtechsolution.plugins

import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cachingheaders.*

fun Application.configureCachingHeaders() {
    install(CachingHeaders) {
        val monthInSeconds = 60 * 60 * 24 * 30
        options { _, outgoingContent ->
            when (outgoingContent.contentType?.withoutParameters()) {
                //ContentType.Text.CSS -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 2))
                ContentType.Image.PNG -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = monthInSeconds))
                ContentType("image", "webp") -> CachingOptions(
                    CacheControl.MaxAge(maxAgeSeconds = monthInSeconds)
                )
                ContentType("audio", "mp3") -> CachingOptions(
                    CacheControl.MaxAge(maxAgeSeconds = monthInSeconds)
                )
                else -> null
            }
        }
    }
}