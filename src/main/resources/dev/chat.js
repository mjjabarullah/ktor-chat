"use strict"

import Alpine from 'alpinejs'
import * as fn from './functions'
import {
    MessageType, ReportType, Status, Success, Errors, Css, Defaults, textColors, avatars, bgColors
} from "./constant"

Object.freeze(domain)
Object.freeze(room)
Object.freeze(permission)
Object.freeze(rank)

//disableDevtool() /*TODO : Uncomment this in production*/

window.axios = require('axios')
window.Alpine = Alpine
window.MicRecorder = require('mic-recorder-to-mp3')
window.mobile = window.matchMedia('(max-width: 640px)')
window.tablet = window.matchMedia('(min-width: 768px)')
window.desktop = window.matchMedia('(min-width: 1024px)')

document.addEventListener('alpine:init', () => {

    Alpine.data('chat', () => {
        return {
            showLeft: true,
            showRight: true,
            showModal: false,
            showImage: false,
            showFulModal: false,
            showAlert: false,
            showLoader: true,
            showDropDown: false,
            showProfile: false,
            showUserProfile: false,
            showOption: false,
            showEmo: false,
            showMessages: false,
            user: {
                avatar: avatar,
                name: name,
                gender: gender,
                mood: mood,
                about: about,
                nameColor: nameColor,
                nameFont: nameFont,
                textColor: textColor,
                textBold: `${textBold}`,
                textFont: textFont,
                status: status,
                joined: joined,
                dob: dob,
                points: points,
                level: level,
                private: pvt,
                chatSound: chatSound,
                pvtSound: pvtSound,
                nameSound: nameSound,
                notifiSound: notifiSound,
                muted: muted,
                hasActionPerm: permission.mute || permission.kick || permission.ban,
                password: ''
            },
            u: null,
            bgColors: bgColors,
            avatars: avatars,
            statusColor: '',
            userStatusColor: '',
            emoTab: 0,
            roomSocket: new WebSocket(`wss://${location.host}/chat/${domain.id}/room/${room.id}`),
            userSocket: new WebSocket(`wss://${location.host}/${domain.id}/member/${userId}`),
            roomUsers: [],
            blockedUsers: [],
            onlineUsers: [],
            offlineUsers: [],
            pvtUsers: [],
            reports: [],
            news: {news: [], unReadCount: 0},
            globalFeed: {globalFeeds: [], unReadCount: 0},
            adminship: {adminships: [], unReadCount: 0},
            pvtNotifiCount: 0,
            reportNotifiCount: 0,
            notifiCount: 0,
            newsUnreadCount: 0,
            adminshipUnreadCount: 0,
            globalFeedUnreadCount: 0,
            totalCount: 0,
            isRecording: false,
            remainingTime: Defaults.MAX_RECORDING_TIME,
            init() {
                this.showRight = desktop.matches || tablet.matches
                this.showLeft = desktop.matches

                desktop.onchange = () => {
                    this.showLeft = desktop.matches
                    this.showRight = desktop.matches || tablet.matches
                }

                tablet.onchange = () => this.showRight = desktop.matches || tablet.matches

                this.recorder = new MicRecorder({bitrate: 80})

                this.$refs.mainEmojis.innerHTML = fn.getEmojisHtml()

                this.getBlockedUsers()

                this.reCheckPvtMessages()

                this.setStatusColor()

                this.getReports()

                this.getNews()

                this.getGlobalFeed()

                this.getAdminships()

                this.getMessages()

                this.roomSocket.addEventListener('message', (e) => {
                    const message = JSON.parse(e.data)
                    this.onMessageReceived(message)
                    message.type === MessageType.Chat && message.user.id !== userId && this.$refs.chatSound.play()
                })

                this.roomSocket.addEventListener('close', () => {
                }/*location.reload()*/)

                this.userSocket.addEventListener('message', (e) => this.onPvtMessageReceived(e))

                this.userSocket.addEventListener('close', () => {
                } /*location.reload()*/)

                const isUGCShowed = localStorage.getItem('isUGCShowed')
                if (isUGCShowed !== "true") {
                    this.showLoader = false
                    this.showUCGPolicyDialog()
                } else {
                    /*TODO: uncomment this*/
                    /* this.showLoader = true
                     setTimeout(() => {
                         this.showLoader = false
                         this.$refs.mainInput.focus()
                         this.showMessages = true
                     }, 15e2)*/

                    this.showMessages = true
                    this.showLoader = false
                    if (rank.code === Defaults.GUEST) {
                        this.showSmallModal(fn.guestDialogHtml())
                    } else {
                        this.$refs.mainInput.focus()
                    }
                }

                this.$refs.mainInput.disabled = this.user.muted

                this.$watch('user', () => {
                    const user = this.onlineUsers.find(user => user.id === userId)
                    user.name = this.user.name
                    user.mood = this.user.mood
                    user.avatar = this.user.avatar
                    user.nameColor = this.user.nameColor
                    user.nameFont = this.user.nameFont
                    user.gender = this.user.gender
                })

                this.$watch('newsUnreadCount', () => {
                    this.totalCount = this.newsUnreadCount + this.adminshipUnreadCount + this.globalFeedUnreadCount
                })

                this.$watch('adminshipUnreadCount', () => {
                    this.totalCount = this.newsUnreadCount + this.adminshipUnreadCount + this.globalFeedUnreadCount
                })

                this.$watch('globalFeedUnreadCount', () => {
                    this.totalCount = this.newsUnreadCount + this.adminshipUnreadCount + this.globalFeedUnreadCount
                })

            },

            /**
             * Responsive
             * */
            toggleLeft() {
                this.showLeft = !this.showLeft
                if (tablet.matches) return
                this.showRight = false
            },
            toggleRight() {
                this.showLeft = false
                this.showRight = !this.showRight
            },

            /**
             * Global modals and functions
             * */
            showSmallModal(html) {
                this.$refs.modalContent.innerHTML = html
                this.showModal = true
            },
            closeSmallModal() {
                this.$refs.modalContent.innerText = Defaults.EMPTY_STRING
                this.showModal = false
            },
            showImgModal(html) {
                this.$refs.fullImage.innerHTML = html
                this.showImage = true
            },
            closeImgModal() {
                this.$refs.fullImage.innerText = Defaults.EMPTY_STRING
                this.showImage = false
            },
            showFullModal(html) {
                this.$refs.fullModalContent.innerHTML = html
                this.showFulModal = true
            },
            closeFullModal() {
                this.showFulModal = false
                let content = this.$refs.fullModalContent
                setTimeout(() => content.innerHTML = Defaults.EMPTY_STRING, 5e2)
            },
            showAlertMsg(msg, color) {
                this.$refs.alertMsg.classList.add(color)
                this.$refs.alertMsg.innerHTML = `
                <div class="flex flex-col justify-center items-center w-full h-full">
                    <p class="w-full text-center">${msg}</p>
                </div>
                `
                this.showAlert = true
                setTimeout(() => {
                    this.$refs.alertMsg.classList.remove(color)
                    this.$refs.alertMsg.innerHTML = ''
                    this.showAlert = false
                }, 3e3)
            },
            textArea(el, height) {
                el.style.height = `${height}px`
                el.style.height = `${el.scrollHeight}px`
            },
            showImageDialog(el) {
                const html = `
                    <div class="relative w-full mx-auto">
                        <img src="${el.src}" class="mx-auto" alt="">
                        <div class="bg-white rounded-full z-10 text-gray-700 absolute -top-2 -right-2 cursor-pointer px-1"> 
                            <i @click="closeImgModal" class="fas fa-times-circle text-2xl "></i>
                        </div>
                    </div>
                `
                this.showImgModal(html)
            },

            /**
             * UGC Dialog
             * */
            showUCGPolicyDialog() {
                this.showSmallModal(fn.ucgPolicyHtml())
            },
            closeUGCPolicy() {
                this.closeSmallModal()
                this.showMessages = true
                this.$refs.mainInput.focus()
                localStorage.setItem("isUGCShowed", "true")
                if (rank.code === Defaults.GUEST) {
                    this.showSmallModal(fn.guestDialogHtml())
                }
            },

            /**
             * Profile
             * */
            setStatusColor() {
                this.user.status === Status.Online ? this.statusColor = Css.GREEN :
                    this.user.status === Status.Away ? this.statusColor = Css.YELLOW :
                        this.user.status === Status.Busy ? this.statusColor = Css.RED :
                            this.statusColor = Defaults.EMPTY_STRING
            },
            showLogoutDialog() {
                this.showSmallModal(fn.logoutHtml())
            },
            logout() {
                axios.post('logout').then(() => location.reload()).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },
            changeAvatarDialog() {
                this.showSmallModal(fn.changeAvatarHtml())
            },
            setAvatar(index) {
                this.showLoader = true
                const data = new FormData()
                data.append('avatar', avatars[index])
                axios.put(`/${domain.id}/users/update-default-avatar`, data).then(res => {
                    this.user.avatar = res.data.avatar
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(Success.AVATAR_CHANGED, Css.SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR)
                })
            },
            changeAvatar(el) {
                this.showLoader = true
                const formData = new FormData()
                const file = el.files[0]
                const pattern = /image-*/
                if (file == null || file.type === Defaults.UNDEFINED) return
                if (!file.type.match(pattern)) {
                    this.showLoader = false
                    this.showAlertMsg(Errors.INVALID_FILE_FORMAT, Css.ERROR)
                    return
                }
                formData.append('avatar', file)
                axios.put(`/${domain.id}/users/update-avatar`, formData).then(res => {
                    this.user.avatar = res.data.avatar
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(Success.AVATAR_CHANGED, Css.SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR)
                })
            },
            changeNameDialog() {
                this.showSmallModal(fn.changeNameHtml())
            },
            closeNameDialog() {
                this.user.name = name
                this.closeSmallModal()
            },
            changeName() {
                if (this.user.name.length < 4 || this.user.name.length > 12) {
                    this.showAlertMsg(Errors.NAME_INVALID, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('name', this.user.name)
                axios.put(`/${domain.id}/users/update-name`, formData).then(res => {
                    name = this.user.name
                    this.closeSmallModal()
                    this.showAlertMsg(Success.NAME_CHANGED, Css.SUCCESS)
                }).catch(e => {
                    this.closeNameDialog()
                    this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR)
                })
            },
            customizeNameDialog() {
                this.showSmallModal(fn.customizeNameHtml())
            },
            closeCustomizeNameDialog() {
                this.user.nameColor = nameColor
                this.user.nameFont = nameFont
                this.closeSmallModal()
            },
            setNameColor(index) {
                this.user.nameColor = textColors[index]
            },
            isShowTickForName(index) {
                return this.user.nameColor === textColors[index]
            },
            customizeName() {
                if (nameColor === this.user.nameColor && nameFont === this.user.nameFont) {
                    return
                }
                const formData = new FormData()
                formData.append('nameColor', this.user.nameColor)
                formData.append('nameFont', this.user.nameFont)
                axios.put(`/${domain.id}/users/customize-name`, formData).then(res => {
                    nameColor = res.data.nameColor
                    nameFont = res.data.nameFont
                    this.closeSmallModal()
                    this.showAlertMsg(Success.NAME_CUSTOMIZED, Css.SUCCESS)
                }).catch(e => {
                    this.closeCustomizeNameDialog()
                    this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR)
                })
            },
            changeMoodDialog() {
                this.showSmallModal(fn.changeMoodHtml())
            },
            closeMoodDialog() {
                this.user.mood = mood
                this.closeSmallModal()
            },
            changeMood() {
                if (this.user.mood.length >= 40) {
                    this.showAlertMsg(Errors.MOOD_INVALID, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('mood', this.user.mood)
                axios.put(`/${domain.id}/users/update-mood`, formData).then(res => {
                    mood = res.data.mood
                    this.closeSmallModal()
                    this.showAlertMsg(Success.MOOD_CHANGED, Css.SUCCESS)
                }).catch(e => {
                    this.closeMoodDialog()
                    this.showAlertMsg(e.response.data, Css.ERROR)
                })
            },
            changeAboutDialog() {
                this.showSmallModal(fn.changeAboutHtml())
            },
            closeAboutDialog() {
                this.user.about = about
                this.closeSmallModal()
            },
            changeAbout() {
                const formData = new FormData()
                formData.append('about', this.user.about)
                axios.put(`/${domain.id}/users/update-about`, formData).then(res => {
                    about = res.data.about
                    this.closeSmallModal()
                    this.showAlertMsg(Success.ABOUT_CHANGED, Css.SUCCESS)
                }).catch(e => {
                    this.closeAboutDialog()
                    this.showAlertMsg(e.response.data, Css.ERROR)
                })
            },
            changePasswordDialog() {
                if (rank.code === Defaults.GUEST) {
                    this.showAlertMsg(Errors.GUEST_DOESNT_HAVE_PASSWORD, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.changePasswordHtml())
            },
            changePassword() {
                if (this.user.password.length < 8) {
                    this.showAlertMsg(Errors.PASSWORD_MUST_HAVE, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('password', this.user.password)
                axios.post(`/${domain.id}/users/update-password`, formData).then(() =>
                    this.showAlertMsg(Success.PASSWORD_CHANGED, Css.SUCCESS)
                ).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            changeStatusDialog() {
                this.showSmallModal(fn.changeStatusHtml())
            },
            changeStatus() {
                if (this.user.status === Defaults.EMPTY_STRING) return
                const formData = new FormData()
                formData.append('status', this.user.status)
                axios.put(`/${domain.id}/users/update-status`, formData).then(res => {
                    this.showAlertMsg(Success.STATUS_CHANGED, Css.SUCCESS)
                    this.user.status = res.data.status
                    this.setStatusColor()
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            changeGenderDialog() {
                this.showSmallModal(fn.changeGenderHtml())
            },
            changeGender() {
                if (this.user.gender === Defaults.EMPTY_STRING) return
                const formData = new FormData()
                formData.append('gender', this.user.gender)
                axios.post(`/${domain.id}/users/update-gender`, formData).then(res => {
                    this.user.gender = res.data.gender
                    this.showAlertMsg(Success.GENDER_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            changeDobDialog() {
                this.showSmallModal(fn.changeDobHtml())
            },
            closeDobDialog() {
                this.user.dob = dob
                this.closeSmallModal()
            },
            changeDob() {
                if (this.user.dob === Defaults.EMPTY_STRING) return
                const formData = new FormData()
                formData.append('dob', this.user.dob)
                axios.post(`${domain.id}/users/update-dob`, formData).then(res => {
                    this.showAlertMsg(Success.DOB_CHANGED, Css.SUCCESS)
                    this.user.dob = res.data.dob
                    this.closeSmallModal()
                }).catch(e => {
                    this.closeDobDialog()
                    this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR)
                })
            },
            customizeTextDialog() {
                this.showSmallModal(fn.customizeTextHtml())
            },
            closeCustomizeTextDialog() {
                this.user.textColor = textColor
                this.user.textBold = textBold
                this.user.textFont = textFont
                this.closeSmallModal()
            },
            setTextColor(index) {
                this.user.textColor = textColors[index]
            },
            isShowTick(index) {
                return this.user.textColor === textColors[index]
            },
            closeCustomizeText() {
                this.showEmo = false
                this.showOption = false
            },
            customizeText() {
                if (textBold === this.user.textBold && textColor === this.user.textColor && textFont === this.user.textFont) return
                const formData = new FormData()
                formData.append('textBold', this.user.textBold)
                formData.append('textColor', this.user.textColor)
                formData.append('textFont', this.user.textFont)
                axios.put(`/${domain.id}/users/customize-text`, formData).then(res => {
                    textColor = res.data.textColor
                    textBold = res.data.textBold
                    textFont = res.data.textFont
                    this.closeSmallModal()
                    this.showAlertMsg(Success.CHAT_TEXT_CUSTOMIZED, Css.SUCCESS)
                }).catch(e => {
                    this.closeCustomizeTextDialog()
                    this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR)
                })
            },
            changeSoundSettings() {
                const formData = new FormData()
                formData.append('chatSound', this.user.chatSound)
                formData.append('pvtSound', this.user.pvtSound)
                formData.append('nameSound', this.user.nameSound)
                formData.append('notifiSound', this.user.notifiSound)
                axios.put(`/${domain.id}/users/change-sound-settings`, formData).catch(e => {
                    this.user.chatSound = chatSound
                    this.user.pvtSound = pvtSound
                    this.user.notifiSound = notifiSound
                    this.user.nameSound = nameSound
                    this.showAlertMsg(Errors.SOMETHING_WENT_WRONG, Css.ERROR)
                })
            },
            changePrivate() {
                const formData = new FormData()
                formData.append('private', this.user.private)
                axios.put(`/${domain.id}/users/change-private`, formData).catch(e => {
                    this.user.private = pvt
                    this.showAlertMsg(Errors.SOMETHING_WENT_WRONG, Css.ERROR)
                })
            },
            showGuestRegisterDialog() {
                if (rank.code !== Defaults.GUEST) return
                this.showSmallModal(fn.guestRegisterHtml())
            },

            /**
             * User blocking
             * */
            getBlockedUsers() {
                axios.get(`/${domain.id}/users/blocked-users`).then(res => this.blockedUsers = res.data)
            },
            actionBlock() {
                this.u.blocked ?
                    this.unblock(this.u.id, () => this.u.blocked = false) :
                    this.block(this.u.id, () => this.u.blocked = true)
            },
            block(userId, callback = () => {
            }) {
                const formData = new FormData()
                formData.append('blocked', userId)
                axios.post(`/${domain.id}/users/block`, formData).then(() => {
                    this.showAlertMsg(Success.USER_BLOCKED, Css.SUCCESS)
                    this.getBlockedUsers()
                    if (typeof callback === Defaults.FUNC_TYPE) callback()
                }).catch(e => this.showAlertMsg(Errors.BLOCKING_FAILED, Css.ERROR))
            },
            unblock(userId, callback = () => {
            }) {
                const formData = new FormData()
                formData.append('blocked', userId)
                axios.delete(`/${domain.id}/users/unblock`, {data: formData}).then(() => {
                    this.showAlertMsg(Success.USER_UNBLOCKED, Css.SUCCESS)
                    this.blockedUsers = this.blockedUsers.filter(user => user.id !== userId)
                    if (typeof callback === Defaults.FUNC_TYPE) callback()
                }).catch(e => this.showAlertMsg(Errors.UNBLOCKING_FAILED, Css.ERROR))
            },
            openBlockedModal() {
                this.showProfile = false
                this.showFullModal(fn.blockedModalHtml(this.blockedUsers))
            },

            /**
             * User Profile
             * */
            getUserProfile(uId) {
                if (mobile.matches) this.showRight = false
                if (uId === userId) {
                    this.showProfile = true
                    return
                }
                axios.get(`/${domain.id}/users/${uId}`).then(res => {
                    this.u = res.data
                    const user = this.blockedUsers.find(user => user.id === this.u.id)
                    this.u.blocked = user != null
                    this.setUserStatusColor()
                    this.showUserProfile = true
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },
            closeUserProfile() {
                this.showUserProfile = false
            },
            setUserStatusColor() {
                this.user.status === Status.Online ? this.statusColor = Css.GREEN :
                    this.user.status === Status.Away ? this.statusColor = Css.YELLOW :
                        this.user.status === Status.Busy ? this.statusColor = Css.RED :
                            this.statusColor = Defaults.EMPTY_STRING
            },
            changeUserNameDialog() {
                if (!permission.userName) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.changeUserNameHtml())
            },
            changeUserName() {
                if (!permission.userName) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                if (name.length < 4 || name.length > 12) {
                    this.showAlertMsg(Errors.NAME_INVALID, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('name', this.u.name)
                axios.post(`/${domain.id}/users/${this.u.id}/update-name`, formData).then(() =>
                    this.showAlertMsg(Success.NAME_CHANGED, Css.SUCCESS)
                ).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.showUserProfile = false
                this.closeSmallModal()
            },
            changeUserAvatarDialog() {
                if (!permission.avatar) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.changeUserAvatarHtml())
            },
            setUserAvatar(index) {
                if (!permission.avatar) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showLoader = true
                const data = new FormData()
                data.append('avatar', avatars[index])
                axios.put(`/${domain.id}/users/${this.u.id}/update-default-avatar`, data).then(res => {
                    this.showLoader = false
                    this.showAlertMsg(Success.AVATAR_CHANGED, Css.SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR)
                })
                this.showUserProfile = false
                this.closeSmallModal()
            },
            changeUserAvatar(el) {
                if (!permission.avatar) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showLoader = true
                const formData = new FormData()
                const file = el.files[0]
                const pattern = /image-*/
                if (file == null || file.type === Defaults.UNDEFINED) return
                if (!file.type.match(pattern)) {
                    this.showLoader = false
                    this.showAlertMsg(Errors.INVALID_FILE_FORMAT, Css.ERROR)
                    return
                }
                formData.append('avatar', file)
                axios.put(`/${domain.id}/users/${this.u.id}/update-avatar`, formData).then(() => {
                    this.showLoader = false
                    this.showAlertMsg(Success.AVATAR_CHANGED, Css.SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR)
                })
                this.showUserProfile = false
                this.closeSmallModal()
            },

            /**
             * Messages
             * */
            getMessages() {
                this.$refs.chatMessages.innerHTML = Defaults.EMPTY_STRING
                axios.get(`${domain.id}/rooms/${room.id}/messages`).then(res =>
                    res.data.forEach(message => this.onMessageReceived(message))
                )
            },
            addMainEmo(emo) {
                const input = this.$refs.mainInput
                input.value === Defaults.EMPTY_STRING ? input.value = `${emo} ` : input.value += ` ${emo} `
                this.showEmo = false
                input.focus()
            },
            appendUserName(el) {
                const username = el.innerText
                const input = this.$refs.mainInput
                input.value === Defaults.EMPTY_STRING ? input.value = `${username} ` : input.value += ` ${username} `
                input.focus()
            },
            sendToRoom(message) {
                this.roomSocket.send(JSON.stringify(message))
            },
            sendMessage() {
                if (this.user.muted) {
                    this.showAlertMsg(Errors.YOU_ARE_MUTED, Css.ERROR)
                    return
                }
                const content = this.$refs.mainInput.value
                if (content === Defaults.EMPTY_STRING) {
                    this.$refs.mainInput.focus()
                    return
                }
                this.sendToRoom({content: content, type: MessageType.Chat})
                this.$refs.mainInput.value = Defaults.EMPTY_STRING
                this.$refs.mainInput.focus()
            },
            recordMainAudio() {
                if (this.user.muted) {
                    this.showAlertMsg(Errors.YOU_ARE_MUTED, Css.ERROR)
                    return
                }
                if (this.isRecording) {
                    this.showEmo = false
                    this.showOption = false
                    if (!(Defaults.MAX_RECORDING_TIME - this.remainingTime > Defaults.MIN_RECORDING_TIME)) {
                        this.recorder.stop()
                        this.isRecording = false
                        this.remainingTime = Defaults.MAX_RECORDING_TIME
                        clearInterval(this.mainInterval)
                        this.showAlertMsg(Errors.RECORD_LENGTH, Css.ERROR)
                        return
                    }
                    this.recorder.stop().getMp3().then(([buffer, blob]) => {
                        const audioFile = new File(buffer, 'music.mp3', {type: blob.type, lastModified: Date.now()})
                        const formData = new FormData()
                        formData.append('audio', audioFile)
                        const content = this.$refs.mainInput.value
                        formData.append('content', content)
                        axios.post(`/${domain.id}/rooms/${room.id}/upload-audio`, formData)
                            .then(res => this.sendToRoom(res.data))
                            .catch(() => this.showAlertMsg(Errors.UPLOAD_FAILED, Css.ERROR))
                    }).catch(() => this.showAlertMsg(Errors.RECORDING_FAILED, Css.ERROR))
                    this.isRecording = false
                    this.remainingTime = Defaults.MAX_RECORDING_TIME
                    clearInterval(this.mainInterval)
                } else {
                    this.showEmo = false
                    this.showOption = false
                    this.recorder.start().then(() => {
                        this.mainInterval = setInterval(() => {
                            if (this.remainingTime === 1) {
                                this.recordMainAudio()
                            } else this.remainingTime--
                        }, 1000)

                        this.isRecording = true
                    }).catch((e) => {
                        this.showAlertMsg('You haven\'t given mic permission', Css.ERROR)
                    })

                }
            },
            uploadImage(event) {
                if (this.user.muted) {
                    this.showAlertMsg(Errors.YOU_ARE_MUTED, Css.ERROR)
                    return
                }
                this.showLoader = true
                const formData = new FormData()
                const file = event.target.files[0]
                const pattern = /image-*/
                const content = this.$refs.mainInput.value
                if (file == null || file.type === Defaults.UNDEFINED) return
                if (!file.type.match(pattern)) {
                    this.showAlertMsg(Errors.INVALID_FILE_FORMAT, Css.ERROR)
                    this.showLoader = false
                    return
                }
                formData.append('image', file)
                formData.append('content', content)
                axios.post(`${domain.id}/rooms/${room.id}/upload-image`, formData).then(res => {
                    this.sendToRoom(res.data)
                    this.$refs.mainInput.value = Defaults.EMPTY_STRING
                    this.$refs.mainInput.focus()
                    this.showLoader = false
                }).catch(() => {
                    this.showLoader = false
                    this.showAlertMsg(Errors.UPLOAD_FAILED, Css.ERROR)
                })
            },
            onMessageReceived(message) {
                const chatMessages = this.$refs.chatMessages
                if (message.type === MessageType.Join) {
                    this.getRoomUsers()
                    if (message.user.id === userId) {
                        setTimeout(() => {
                            chatMessages.insertAdjacentHTML('afterbegin', fn.renderWelcomeMessage())
                        }, 1e3)
                        return
                    }
                    chatMessages.insertAdjacentHTML('afterbegin', fn.renderJoinMessage(message))
                } else if (message.type === MessageType.Chat) {
                    let user = this.blockedUsers.find(user => user.id === message.user.id)
                    user == null && chatMessages.insertAdjacentHTML('afterbegin', fn.renderChatMessage(message))
                } else if (message.type === MessageType.Leave) {
                    this.getRoomUsers()
                    message.user.id !== userId && chatMessages.insertAdjacentHTML('afterbegin', fn.renderLeaveMessage(message))
                } else if (message.type === MessageType.DelChat) {
                    const li = document.getElementById(`chat-${message.id}`)
                    li != null && li.remove()
                } else if (message.type === MessageType.News) {
                    message.user.id !== userId && this.getNews()
                    message.user.id !== userId && rank.code !== Defaults.GUEST && this.user.notifiSound && this.$refs.newsSound.play()
                } else if (message.type === MessageType.DelNews) {
                    this.getNews()
                } else if (message.type === MessageType.Adminship) {
                    message.user.id !== userId && this.getAdminships()
                    message.user.id !== userId && permission.adminship && this.user.notifiSound && this.$refs.newsSound.play()
                } else if (message.type === MessageType.DelAdminship) {
                    this.getAdminships()
                } else if (message.type === MessageType.GlobalFeed) {
                    message.user.id !== userId && this.getGlobalFeed()
                    message.user.id !== userId && rank.code !== Defaults.GUEST && this.user.notifiSound && this.$refs.newsSound.play()
                } else if (message.type === MessageType.DelGlobalFeed) {
                    this.getGlobalFeed()
                } else if (message.type === MessageType.Mute) {
                    const user = this.roomUsers.find(user => user.id === message.user.id)
                    if (user) user.muted = true
                    if (message.user.id === userId) {
                        this.user.muted = true
                        this.$refs.mainInput.disabled = this.user.muted
                        this.showAlertMsg('You have been muted', Css.ERROR)
                    }
                } else if (message.type === MessageType.UnMute) {
                    const user = this.roomUsers.find(user => user.id === message.user.id)
                    if (user) user.muted = false
                    if (message.user.id === userId) {
                        this.user.muted = false
                        this.$refs.mainInput.disabled = this.user.muted
                        this.showAlertMsg('You have been unmuted', Css.SUCCESS)
                    }
                }
            },
            deleteChat(id) {
                if (permission.delMsg) {
                    axios.delete(`/${domain.id}/rooms/${room.id}/messages/${id}/delete`)
                        .catch(() => this.showAlertMsg(Errors.DELETE_MESSAGE, Css.ERROR))
                } else this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
            },
            removeTopic() {
                document.getElementById('topic').remove()
            },
            welcomeMessage(name) {
                this.$refs.mainInput.value = `Welcome ${name}`
            },

            /**
             * Private Messages
             * */
            getPvtEmojis(el) {
                el.innerHTML = fn.pvtEmojisHtml()
            },
            addPvtEmo(emo,) {
                const input = this.$refs.pvtInput
                input.value === Defaults.EMPTY_STRING ? input.value = `${emo} ` : input.value += ` ${emo} `
                input.focus()
            },
            openPvtDialog(id) {
                const user = this.u
                const exists = this.pvtUsers.find(user => user.id === id)
                this.showUserProfile = false
                this.closeFullModal()
                if (mobile.matches) {
                    this.showLeft = false
                    this.showRight = false
                }
                if (exists != null && exists !== Defaults.UNDEFINED) {
                    exists.minimize = false
                    exists.added = true
                    if (exists.unReadCount > 0) {
                        this.setAllSeen(exists.id)
                    }
                    this.$nextTick(() => {
                        fn.dragElement(document.getElementById(`draggable-${exists.id}`), exists.id)
                    })
                    return
                }
                axios.get(`/${domain.id}/pvt/${id}/messages`).then(res => {
                    user.messages = res.data
                    user.minimize = false
                    user.added = true
                    user.isRecording = false
                    user.remainingTime = Defaults.MAX_RECORDING_TIME
                    user.recorder = new MicRecorder({bitrate: 80})
                    user.interval = null
                    this.pvtUsers.unshift(user)
                    this.showUserProfile = false
                })
                this.setPvtNotifiCount()
            },
            closePvtModal(id) {
                const user = this.pvtUsers.find(user => user.id === id)
                user.minimize = false
                user.added = false
            },
            maximize(id) {
                const user = this.pvtUsers.find(user => user.id === id)
                user.minimize = false
                if (user.unReadCount > 0) {
                    this.setAllSeen(user.id)
                }
            },
            sendPvtMessage(id, input) {
                const user = this.pvtUsers.find(user => user.id === id)
                if (!user.private || !permission.private) {
                    this.showAlertMsg(Errors.CANT_PRIVATE, Css.ERROR)
                    return
                }
                const content = input.value
                if (content === Defaults.EMPTY_STRING) {
                    input.focus()
                    return
                }
                this.sendToUser({sender: {id: userId}, receiver: {id: id}, content: content, type: MessageType.Chat})
                input.value = Defaults.EMPTY_STRING
                input.focus()
            },
            sendToUser(message) {
                this.userSocket.send(JSON.stringify(message))
            },
            recordPvtAudio(id) {
                const user = this.pvtUsers.find(user => user.id === id)
                if (!user.private || !permission.private) {
                    this.showAlertMsg(Errors.CANT_PRIVATE, Css.ERROR)
                    return
                }
                if (!user.isRecording) {
                    user.recorder.start().then(() => {
                        user.interval = setInterval(() => {
                            if (user.remainingTime === 1) {
                                this.recordPvtAudio(id)
                            } else user.remainingTime--
                        }, 1000)
                        user.isRecording = true
                    }).catch(() => this.showAlertMsg(Errors.NO_MIC_PERMISSION, Css.ERROR))
                } else {
                    if (!(Defaults.MAX_RECORDING_TIME - user.remainingTime > Defaults.MIN_RECORDING_TIME)) {
                        user.recorder.stop()
                        user.isRecording = false
                        clearInterval(user.interval)
                        user.remainingTime = Defaults.MAX_RECORDING_TIME
                        this.showAlertMsg(Errors.RECORD_LENGTH, Css.ERROR)
                        return
                    }
                    user.recorder.stop().getMp3().then(([buffer, blob]) => {
                        const audioFile = new File(buffer, 'music.mp3', {type: blob.type, lastModified: Date.now()})
                        const formData = new FormData()
                        formData.append('audio', audioFile)
                        axios.post(`/${domain.id}/pvt/${id}/upload-audio`, formData).then(res => {
                            this.sendToUser(res.data)
                        }).catch(err => {
                            this.showAlertMsg(Errors.UPLOAD_FAILED, Css.ERROR)
                        })
                    }).catch((e) => {
                        this.showAlertMsg(Errors.RECORDING_FAILED, Css.ERROR)
                    })
                    user.isRecording = false
                    clearInterval(user.interval)
                    user.remainingTime = Defaults.MAX_RECORDING_TIME
                }
            },
            uploadPvtImage(id, event) {
                const user = this.pvtUsers.find(user => user.id === id)
                if (!user.private || !permission.private) {
                    this.showAlertMsg('You can\'t private to this user', Css.ERROR)
                    return
                }
                this.showLoader = true
                const formData = new FormData()
                const file = event.target.files[0]
                const pattern = /image-*/
                if (file == null || file.type === Defaults.UNDEFINED) return
                if (!file.type.match(pattern)) {
                    this.showAlertMsg(Errors.INVALID_FILE_FORMAT, Css.ERROR)
                    this.showLoader = false
                    return
                }
                formData.append("image", file)
                axios.post(`/${domain.id}/pvt/${id}/upload-image`, formData).then(res => {
                    this.sendToUser(res.data)
                    this.showLoader = false
                }).catch(e => {
                    this.showLoader = false
                    this.showAlertMsg(Errors.UPLOAD_FAILED, Css.ERROR)
                })
            },
            onPvtMessageReceived(e) {
                const message = JSON.parse(e.data)
                if (message.type === MessageType.Chat) {
                    const id = message.sender.id === userId ? message.receiver.id : message.sender.id
                    const user = this.pvtUsers.find(user => user.id === id)
                    if (user.added && user.minimize === false) {
                        if (message.sender.id !== userId) {
                            message.seen = true
                            this.setPvtMessageSeen(message.id)
                        }
                    } else {
                        this.$refs.pvtSound.play()
                    }
                    user.messages.unshift(message)
                    this.setPvtNotifiCount()
                } else if (message.type === MessageType.Report || message.type === MessageType.ActionTaken) {
                    this.getReports()
                } else if (message.type === MessageType.DataChanges) {
                    location.reload()
                }
            },
            reCheckPvtMessages() {
                axios.get(`/${domain.id}/pvt/users`).then(res => {
                    this.pvtUsers = res.data
                    this.pvtUsers.forEach(user => {
                        user.minimize = false
                        user.added = false
                        user.isRecording = false
                        user.remainingTime = Defaults.MAX_RECORDING_TIME
                        user.recorder = new MicRecorder({bitrate: 80})
                        user.interval = null
                    })
                    this.setPvtNotifiCount()
                }).catch(e => {
                })
            },
            openMessageModal() {
                this.showFullModal(fn.messageModalHtml(this.pvtUsers))
            },
            setAllSeen(sender) {
                axios.post(`${domain.id}/pvt/${sender}/all-seen`).then(res => {
                    const user = this.pvtUsers.find(user => user.id === sender)
                    user.messages.forEach(message => message.seen = true)
                    this.setPvtNotifiCount()
                })
            },
            setPvtNotifiCount() {
                let count = 0
                this.pvtUsers.forEach(user => {
                    user.unReadCount = 0
                    let unSeen = false
                    user.messages.forEach(message => {
                        if (message.receiver.id === userId && message.seen === false) {
                            user.unReadCount++
                            unSeen = true
                        }
                        message.content = appendEmojis(message.content)
                    })
                    if (unSeen === true) count++
                })
                this.pvtNotifiCount = count
            },
            setPvtMessageSeen(id) {
                axios.post(`/${domain.id}/pvt/${id}/seen`)
            },
            makeItBefore(el) {
                el.style.zIndex = "60"
            },
            makeItBehind(el) {
                el.style.zIndex = "50"
            },

            /**
             * Rooms
             * */
            openRoomsModal() {
                if (mobile.matches) this.showLeft = false
                this.showFullModal(fn.roomModalLoadingHtml())
                axios.get(`/${domain.id}/rooms`).then(res => this.showFullModal(fn.roomModalHtml(res.data)))
            },
            getRoomUsers() {
                axios.get(`/${domain.id}/rooms/${room.id}/users?limit=${domain.offlineLimit}`).then(res => {
                    this.roomUsers = res.data
                    this.onlineUsers = []
                    this.offlineUsers = []
                    this.roomUsers.forEach(user => {
                        if (user.sessions > 0 || user.status === Status.Stay) this.onlineUsers.push(user)
                        else this.offlineUsers.push(user)
                    })
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e)))
            },

            /**
             * Reports
             * */
            getReports() {
                permission.reports &&
                axios.get(`/${domain.id}/reports`).then(res => {
                    this.reports = res.data
                    this.reportNotifiCount = this.reports.length
                })
            },
            openReportsModal() {
                this.showFullModal(fn.reportModalHtml(this.reports))
            },
            reportDialog(id, type) {
                const reportType = type === 1 ? ReportType.Chat : (type === 2) ? ReportType.PvtChat : ReportType.NewsFeed
                this.showSmallModal(fn.reportDialogHtml(id, reportType))
            },
            openReportActionDialog(reportId, targetId, roomId, type) {
                this.closeFullModal()
                let html = `<div class="text-gray-700 text-center">
                    <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                        <p class="text-md font-bold ">Report Action</p>
                        <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                    </div>`
                if (type === ReportType.Chat) {
                    axios.get(`/${domain.id}/rooms/${room.id}/messages/${targetId}`).then(res => {
                        html += fn.renderReportChatMessage(res.data, reportId, targetId, roomId, type)
                        this.showSmallModal(html)
                    }).catch(e => {
                        if (e.response) {
                            if (e.response.status === 404) {
                                this.showAlertMsg(e.response.data, Css.ERROR)
                                axios.delete(`/${domain.id}/reports/${reportId}/delete`)
                            }
                            return
                        }
                        this.showAlertMsg(Errors.SOMETHING_WENT_WRONG, Css.ERROR)
                    })
                } else if (type === ReportType.PvtChat) {

                } else if (type === ReportType.NewsFeed) {

                }
            },
            takeAction(reportId, targetId, roomId, type) {
                const formData = new FormData()
                formData.append('targetId', targetId)
                formData.append('roomId', room.id)
                formData.append('type', type)
                axios.post(`/${domain.id}/reports/${reportId}/take-action`, formData).then(() => this.closeSmallModal())
            },
            noAction(reportId, type) {
                const formData = new FormData()
                formData.append('type', type)
                axios.post(`/${domain.id}/reports/${reportId}/no-action`, formData).then(() => this.closeSmallModal())
            },

            /**
             * Announcement
             * */
            getNews(callback = () => {
            }) {
                rank.code !== Defaults.GUEST &&
                axios.get(`/${domain.id}/news`).then(res => {
                    this.news = res.data
                    this.newsUnreadCount = this.news.unReadCount
                    if (typeof callback === Defaults.FUNC_TYPE) callback()
                })
            },
            openNewsModal() {
                if (mobile.matches) this.showLeft = false
                this.showFullModal(fn.newsModalHtml(this.news.news))
                this.newsUnreadCount !== 0 &&
                axios.post(`/${domain.id}/news/read`).then(() => this.newsUnreadCount = this.news.unReadCount = 0)
            },
            writeNewsDialog() {
                if (!permission.writeNews) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.writeNewsDialogHtml())
            },
            delNews(newsId) {
                if (!permission.delNews) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.delete(`/${domain.id}/news/${newsId}/delete`).then(() => {
                    this.showAlertMsg(Success.NEWS_DELETED, Css.SUCCESS)
                    this.news.news = this.news.news.filter(news => news.id !== newsId)
                    this.openNewsModal()
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },

            /**
             * AdminShip
             * */
            getAdminships(callback = () => {
            }) {
                permission.adminship &&
                axios.get(`/${domain.id}/adminship`).then(res => {
                    this.adminship = res.data
                    this.adminshipUnreadCount = this.adminship.unReadCount
                    if (typeof callback === Defaults.FUNC_TYPE) callback()
                })
            },
            openAdminshipModal() {
                if (mobile.matches) this.showLeft = false
                this.showFullModal(fn.adminshipModalHtml(this.adminship.adminships))
                this.adminshipUnreadCount !== 0 &&
                axios.post(`/${domain.id}/adminship/read`).then(() => this.adminshipUnreadCount = this.adminship.unReadCount = 0)
            },
            writeAdminShipDialog() {
                if (!permission.writeAdminship) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.writeAdminshipDialogHtml())
            },
            delAdminShip(postId) {
                if (!permission.delAdminship) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.delete(`/${domain.id}/adminship/${postId}/delete`).then(() => {
                    this.showAlertMsg(Success.ADMINSHIP_DELETED, Css.SUCCESS)
                    this.adminship.adminships = this.adminship.adminships.filter(adminship => adminship.id !== postId)
                    this.openAdminshipModal()
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },

            /*
            * Global Feed
            * */
            getGlobalFeed() {
                rank.code !== Defaults.GUEST &&
                axios.get(`/${domain.id}/global-feed`).then(res => {
                    this.globalFeed = res.data
                    this.globalFeedUnreadCount = this.globalFeed.unReadCount
                })
            },
            openGlobalFeedModal() {
                if (mobile.matches) this.showLeft = false
                this.showFullModal(fn.globalFeedModalHtml(this.globalFeed.globalFeeds))
                this.globalFeedUnreadCount !== 0 &&
                axios.post(`/${domain.id}/global-feed/read`).then(() => this.globalFeedUnreadCount = this.globalFeed.unReadCount = 0)
            },
            writeGlobalFeedDialog() {
                if (rank.code === Defaults.GUEST) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.writeGlobalFeedDialogHtml())
            },
            delGlobalFeed(postId) {
                if (!permission.delGlobalFeed) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.delete(`/${domain.id}/global-feed/${postId}/delete`).then(() => {
                    this.showAlertMsg(Success.GLOBAL_FEED_DELETED, Css.SUCCESS)
                    this.globalFeed.globalFeeds = this.globalFeed.globalFeeds.filter(globalFeed => globalFeed.id !== postId)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },

            /**
             * Actions
             * */
            actionMute() {
                if (!permission.mute) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.u.muted ? axios.post(`/user/${this.u.id}/mute`).catch(() => this.u.muted = false)
                    : axios.post(`/user/${this.u.id}/unmute`).catch(() => this.u.muted = true)
            },
            kickUser(id) {
                if (!permission.kick) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.post(`/user/${id}/kick`)
            },
            banUser(id) {
                if (!permission.ban) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.post(`/user/${id}/ban`)
            }
        }
    })

    Alpine.data('guestRegister', () => {
        return {
            email: '',
            password: '',
            errors: {},
            guestRegister() {
                this.showLoader = true
                const form = new FormData()
                form.append('name', this.user.name)
                form.append('email', this.email)
                form.append('password', this.password)
                form.append('gender', this.user.gender)

                axios.put(`/${domain.id}/register`, form).then(res => {
                    this.showLoader = true
                    this.closeSmallModal()
                    setTimeout(() => location.reload(), 2000)
                    this.showAlertMsg(res.data, Css.SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    if (e.response) this.errors = e.response.data
                })
            },
        }
    })

    Alpine.data('announcement', () => {
        return {
            content: Defaults.EMPTY_STRING,
            image: Defaults.EMPTY_STRING,
            init() {
                this.$nextTick(() => this.$refs.newsInput.focus())
            },
            addImage(el) {
                const reader = new FileReader()
                reader.onload = e => this.image = e.target.result
                reader.readAsDataURL(el.files[0])
            },
            writeNews() {
                const input = this.$refs.input
                if (!permission.writeNews) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                if (this.content === Defaults.EMPTY_STRING) {
                    this.showAlertMsg(Errors.CONTENT_EMPTY, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('content', this.content)
                if (this.image !== Defaults.EMPTY_STRING) formData.append('image', input.files[0])
                axios.post(`/${domain.id}/news/create`, formData).then(() => {
                    this.closeSmallModal()
                    this.showAlertMsg(Success.NEWS_CREATED, Css.SUCCESS)
                    this.getNews(() => {
                        this.openNewsModal()
                    })
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            }
        }
    })

    Alpine.data('adminship', () => {
        return {
            content: Defaults.EMPTY_STRING,
            image: Defaults.EMPTY_STRING,
            init() {
                this.$nextTick(() => this.$refs.adminshipInput.focus())
            },
            addImage(el) {
                const reader = new FileReader()
                reader.onload = e => this.image = e.target.result
                reader.readAsDataURL(el.files[0])
            },
            writeAdminship() {
                const input = this.$refs.input
                if (!permission.writeAdminship) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                if (this.content === Defaults.EMPTY_STRING) {
                    this.showAlertMsg(Errors.CONTENT_EMPTY, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('content', this.content)
                if (this.image !== Defaults.EMPTY_STRING) formData.append('image', input.files[0])
                axios.post(`/${domain.id}/adminship/create`, formData).then(() => {
                    this.closeSmallModal()
                    this.showAlertMsg(Success.ADMINSHIP_CREATED, Css.SUCCESS)
                    this.getAdminships(() => {
                        this.openAdminshipModal()
                    })
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            }
        }
    })

    Alpine.data('globalFeed', () => {
        return {
            content: Defaults.EMPTY_STRING,
            image: Defaults.EMPTY_STRING,
            init() {
                this.$nextTick(() => this.$refs.feedInput.focus())
            },
            addImage(el) {
                const reader = new FileReader()
                reader.onload = e => this.image = e.target.result
                reader.readAsDataURL(el.files[0])
            },
            writeGlobalFeed() {
                const input = this.$refs.input
                if (rank.code === Defaults.GUEST) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                if (this.content === Defaults.EMPTY_STRING) {
                    this.showAlertMsg(Errors.CONTENT_EMPTY, Css.ERROR)
                    this.$nextTick(() => this.$refs.feedInput.focus())
                    return
                }
                const formData = new FormData()
                formData.append('content', this.content)
                if (this.image !== Defaults.EMPTY_STRING) formData.append('image', input.files[0])
                axios.post(`/${domain.id}/global-feed/create`, formData).then(() => {
                    this.closeSmallModal()
                    this.showAlertMsg(Success.GLOBAL_FEED_CREATED, Css.SUCCESS)
                    this.getGlobalFeed()
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            }
        }
    })

    Alpine.data('report', () => {
        return {
            selectedReason: '',
            reasons: ['Abusive Language', 'Spam Content', 'Inappropriate Content', 'Sexual Harassment'],
            report(targetId, type) {
                const formData = new FormData()
                formData.append('targetId', targetId)
                formData.append('reason', this.selectedReason)
                formData.append('roomId', room.id)
                formData.append('type', type)
                axios.post(`${domain.id}/reports/create`, formData).then(() =>
                    this.showAlertMsg(Success.MESSAGE_REPORTED, Css.SUCCESS)
                ).catch(() => this.showAlertMsg(Errors.REPORTING_FAILED, Css.ERROR))
                this.closeSmallModal()
            },
        }
    })

    Alpine.data('comments', () => {
        return {
            showComments: false,
            getGFComments(postId) {
                const post = this.globalFeed.globalFeeds.find(post => post.id === postId)
                axios.get(`/${domain.id}/global-feed/${postId}/comments`).then(res => {
                    post.comments = res.data
                    this.showComments = !this.showComments
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },

            writeGFComment(postId) {
                const post = this.globalFeed.globalFeeds.find(post => post.id === postId)
                const formData = new FormData()
                const content = this.$refs.input.value
                if (content === Defaults.EMPTY_STRING) {
                    this.showAlertMsg(Errors.CONTENT_EMPTY, Css.ERROR)
                    return
                }
                formData.append('content', content)
                axios.post(`/${domain.id}/global-feed/${postId}/comments/create`, formData).then(res => {
                    post.comments.unshift(res.data)
                    post.totalComments += 1
                    this.showComments = true
                    this.$nextTick(() => this.$refs.input.value = Defaults.EMPTY_STRING)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },

        }
    })
})

Alpine.start()







