package com.rainbowtechsolution.data.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.rainbowtechsolution.common.Validation
import com.rainbowtechsolution.data.entity.Gender
import io.ktor.websocket.*
import kotlinx.serialization.Serializable
import org.valiktor.functions.*
import org.valiktor.validate

@Serializable
data class User(
    var id: Long? = null,
    var name: String? = null,
    var email: String? = null,
    var password: String? = null,
    var owner: Boolean = false,
    var bot: Boolean = false,
    var gender: String? = null,
    var avatar: String? = null,
    var dob: String? = null,
    var about: String? = null,
    var mood: String? = null,
    var status: String? = null,
    var cover: String? = null,
    val nameColor: String? = null,
    val nameFont: String? = null,
    val textColor: String? = null,
    val textBold: Boolean = false,
    val textFont: String? = null,
    var roomId: Int? = null,
    var sessions: Int? = null,
    var rank: Rank? = null,
    var points: Int = 0,
    var level: Int = 0,
    var ip: String? = null,
    var timezone: String? = null,
    var deviceId: String? = null,
    var country: String? = null,
    var private: Boolean = false,
    val sounds: String? = null,
    var muted: Long = 0,
    var kicked: Long = 0,
    var banned: Long = 0,
    var muteMsg: String? = null,
    var kickMsg: String? = null,
    var banMsg: String? = null,
    var createdAt: String? = null,
    var stories: List<Story> = emptyList(),
    @JsonIgnore
    var socket: WebSocketSession? = null
) {

    fun validate() {
        validate(this) {
            validate(User::name).isNotNull().isNotEmpty().isNotBlank().hasSize(min = 4, max = 12)
                .doesNotContainAny(Validation.BAD_CHARS).doesNotContain("\\s+".toRegex())
            validate(User::email).isNotNull().isNotEmpty().isNotBlank().isEmail()
            validate(User::password).hasSize(min = 8)
            validate(User::gender).containsAny(Gender.values().map { it.name })
        }
    }

}