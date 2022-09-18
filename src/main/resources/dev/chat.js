"use strict"

import Alpine from 'alpinejs'
import * as fn from './functions'
import {
    avatars, bgColors, Css, Defaults, Errors, Gender, MessageType, PostLink, RankCode, ReactType, ReportType,
    Status, Success, textColors
} from "./constant"
/*import {soundManager} from 'soundmanager2/script/soundmanager2-nodebug' TODO: uncommend on production*/
import {soundManager} from 'soundmanager2'


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
            user: null,
            u: {user: null},
            bgColors: bgColors,
            avatars: avatars,
            emoTab: 0,
            rooms: [],
            roomUsers: [],
            blockedUsers: [],
            onlineUsers: [],
            offlineUsers: [],
            pvtUsers: [],
            reports: [],
            notification: {notifications: [], unReadCount: 0},
            news: {posts: [], unReadCount: 0},
            globalFeed: {posts: [], unReadCount: 0},
            adminship: {posts: [], unReadCount: 0},
            pvtNotifiCount: 0,
            totalCount: 0,
            isRecording: false,
            remainingTime: Defaults.MAX_RECORDING_TIME,
            muteInterval: null,
            init() {

                Object.freeze(domain)
                Object.freeze(room)
                Object.freeze(permission)
                Object.freeze(rank)
                Object.freeze(user)

                this.initSM2()

                this.setUser()

                this.muteInterval = setInterval(() => this.checkMute(), 1e4)

                this.recorder = new MicRecorder({bitrate: 80})

                this.$refs.mainEmojis.innerHTML = fn.getEmojisHtml()

                this.$refs.mainInput.disabled = this.user.muted

                this.checkMute()

                this.responsive()

                this.connectRoomWs()

                this.connectUserWs()

                this.getBlockedUsers()

                this.reCheckPvtMessages()

                this.setStatusColor()

                this.setGenderColor()

                this.getReports()

                this.getNews()

                this.getGlobalFeed()

                this.getAdminships()

                this.getMessages()

                this.getNotifications()

                let isUGCShowed = localStorage.getItem('isUGCShowed')
                if (isUGCShowed !== 'true') {
                    this.showLoader = false
                    this.showUCGPolicyDialog()
                } else {
                    setTimeout(() => {
                        this.showLoader = false
                        this.showMessages = true
                    }, 15e2)
                    if (rank.code === RankCode.GUEST) this.showSmallModal(fn.guestDialogHtml())
                    else this.$refs.mainInput.focus()
                }

                this.$watch('user', currentUser => {
                    const user = this.onlineUsers.find(user => user.id === userId)
                    if (user) {
                        user.name = currentUser.name
                        user.mood = currentUser.mood
                        user.avatar = currentUser.avatar
                        user.nameColor = currentUser.nameColor
                        user.nameFont = currentUser.nameFont
                        user.gender = currentUser.gender
                    }
                })

                this.$watch('news.unReadCount', () => this.setTotalCount())
                this.$watch('adminship.unReadCount', () => this.setTotalCount())
                this.$watch('globalFeed.unReadCount', () => this.setTotalCount())

            },
            setTotalCount() {
                this.totalCount = this.news.unReadCount + this.adminship.unReadCount + this.globalFeed.unReadCount
            },
            setUser() {
                this.user = JSON.parse(JSON.stringify(user))
                this.user.statusColor = this.user.password = Defaults.EMPTY_STRING
                this.user.textBold = `${this.user.textBold}`
                this.user.canSeeInfo = rank.code === RankCode.OWNER || rank.code === RankCode.S_ADMIN || rank.code === RankCode.ADMIN
                this.user.canSeeAdminship = this.user.canSeeInfo || rank.code === RankCode.MODERATOR
                this.setSounds()
            },
            setSounds() {
                let sounds = this.user.sounds.split('')
                this.user.chatSound = sounds[0] === '1'
                this.user.pvtSound = sounds[1] === '1'
                this.user.nameSound = sounds[2] === '1'
                this.user.notifySound = sounds[3] === '1'
            },
            setPermissions() {
                let isLowRank = this.u.user.rank.order > rank.order
                let guest = this.u.user.rank.code === Defaults.GUEST
                this.user.canChangeRank = permission.changeRank && !guest && isLowRank
                this.user.canMute = permission.mute && isLowRank
                this.user.canKick = permission.kick && isLowRank
                this.user.canBan = permission.ban && isLowRank
                this.user.canChangeName = permission.userName && isLowRank
                this.user.canChangeAvatar = permission.avatar && isLowRank
                this.user.canDelAc = permission.delAccount && isLowRank
            },
            initSM2() {
                soundManager.setup({
                    onready: () => {
                        soundManager.createSound({id: 'chat', url: '/sounds/chat.mp3'})
                        soundManager.createSound({id: 'private', url: '/sounds/private.mp3'})
                        soundManager.createSound({id: 'name', url: '/sounds/name.mp3'})
                        soundManager.createSound({id: 'notify', url: '/sounds/notify.mp3'})
                        soundManager.createSound({id: 'post', url: '/sounds/post.mp3'})
                    },
                })
            },
            /**
             * Websocket
             * */
            connectRoomWs() {
                let protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
                this.roomSocket = new WebSocket(`${protocol}//${location.host}/chat/${domain.id}/room/${room.id}`)
                this.roomSocket.addEventListener('message', e => this.onMessageReceived(e))
                this.roomSocket.addEventListener('close', () => this.connectRoomWs())
            },
            connectUserWs() {
                let protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
                this.userSocket = new WebSocket(`${protocol}//${location.host}/${domain.id}/member/${userId}`)
                this.userSocket.addEventListener('message', e => this.onPvtMessageReceived(e))
                this.userSocket.addEventListener('close', () => this.connectUserWs())
            },
            /**
             * Responsive
             * */
            responsive() {
                this.showRight = desktop.matches || tablet.matches
                this.showLeft = desktop.matches

                desktop.onchange = () => {
                    this.showLeft = desktop.matches
                    this.showRight = desktop.matches || tablet.matches
                }

                tablet.onchange = () => this.showRight = desktop.matches || tablet.matches
            },
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
                const alertMsg = this.$refs.alertMsg
                if (this.alertInterval) clearInterval(this.alertInterval)
                const show = () => {
                    alertMsg.classList.add(color)
                    alertMsg.innerHTML = `<div class="flex flex-col justify-center items-center w-full h-full">
                            <p class="w-full text-center">${msg}</p>
                        </div>`
                    this.showAlert = true
                }
                const hide = () => {
                    alertMsg.classList.remove(color)
                    alertMsg.innerHTML = Defaults.EMPTY_STRING
                    this.showAlert = false
                }
                this.alertInterval = setTimeout(() => hide(), 3e3)
                show()
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
                if (rank.code === RankCode.GUEST) {
                    this.showSmallModal(fn.guestDialogHtml())
                }
            },
            /**
             *
             * */
            getNotifications() {
                axios.get(`/${domain.id}/users/notifications`).then(res => {
                    this.notification = res.data
                })
            },
            openNotificationModal() {
                this.showFullModal(fn.notificationModalHtml())
            },
            closeNotificationModal() {
                axios.put(`/${domain.id}/users/notifications/read`).then(() => {
                    this.notification.notifications.forEach(notification => notification.seen = true)
                    this.notification.unReadCount = 0
                })
                this.closeFullModal()
            },
            /**
             * Profile
             * */
            setStatusColor() {
                this.user.status === Status.Online ? this.user.statusColor = Css.GREEN :
                    this.user.status === Status.Away ? this.user.statusColor = Css.YELLOW :
                        this.user.status === Status.Busy || this.user.status === Status.Muted || this.user.status === Status.Kicked || this.user.status === Status.Banned ? this.user.statusColor = Css.RED :
                            this.user.statusColor = Defaults.EMPTY_STRING
            },
            setGenderColor() {
                this.user.gender === Gender.Male ? this.user.genderColor = Css.Blue :
                    this.user.gender === Gender.Female ? this.user.genderColor = Css.Pink : this.user.statusColor = Defaults.EMPTY_STRING
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
                const data = new FormData()
                data.append('avatar', this.avatars[index])
                axios.put(`/${domain.id}/users/update-default-avatar`, data).then(res => {
                    this.user.avatar = res.data.avatar
                    this.showAlertMsg(Success.AVATAR_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            changeAvatar(el) {
                const formData = new FormData()
                const file = el.files[0]
                const pattern = /image-*/
                if (file == null || file.type === Defaults.UNDEFINED) return
                if (!file.type.match(pattern)) {
                    this.showAlertMsg(Errors.INVALID_FILE_FORMAT, Css.ERROR)
                    return
                }
                this.showLoader = true
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
                if (!permission.name) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.changeNameHtml())
            },
            changeName(name) {
                if (!permission.name) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                if (this.user.name.length < 4 || this.user.name.length > 12) {
                    this.showAlertMsg(Errors.NAME_INVALID, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('name', name)
                axios.put(`/${domain.id}/users/update-name`, formData).then(res => {
                    this.user.name = res.data.name
                    this.showAlertMsg(Success.NAME_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            customizeNameDialog() {
                if (!permission.nameFont && !permission.nameColor) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.customizeNameHtml())
            },
            changeMoodDialog() {
                this.showSmallModal(fn.changeMoodHtml())
            },
            changeMood(mood) {
                if (mood.length >= 40) {
                    this.showAlertMsg(Errors.MOOD_INVALID, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('mood', mood)
                axios.put(`/${domain.id}/users/update-mood`, formData).then(res => {
                    this.user.mood = res.data.mood
                    this.showAlertMsg(Success.MOOD_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(e.response.data, Css.ERROR))
                this.closeSmallModal()
            },
            changeAboutDialog() {
                this.showSmallModal(fn.changeAboutHtml())
            },
            changeAbout(about) {
                const formData = new FormData()
                formData.append('about', about)
                axios.put(`/${domain.id}/users/update-about`, formData).then(res => {
                    this.user.about = res.data.about
                    this.showAlertMsg(Success.ABOUT_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(e.response.data, Css.ERROR))
                this.closeSmallModal()
            },
            changePasswordDialog() {
                if (rank.code === RankCode.GUEST) {
                    this.showAlertMsg(Errors.GUEST_DOESNT_HAVE_PASSWORD, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.changePasswordHtml())
            },
            changePassword(password) {
                if (password.length < Defaults.MIN_PASS_LENGTH) {
                    this.showAlertMsg(Errors.PASSWORD_MUST_HAVE, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('password', password)
                axios.post(`/${domain.id}/users/update-password`, formData)
                    .then(() => this.showAlertMsg(Success.PASSWORD_CHANGED, Css.SUCCESS))
                    .catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            changeStatusDialog() {
                if (this.user.muted > 0) return
                this.showSmallModal(fn.changeStatusHtml())
            },
            changeStatus(status) {
                if (status === Defaults.EMPTY_STRING) return
                const formData = new FormData()
                formData.append('status', status)
                axios.put(`/${domain.id}/users/update-status`, formData).then(res => {
                    this.user.status = res.data.status
                    this.setStatusColor()
                    this.showAlertMsg(Success.STATUS_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            changeGenderDialog() {
                this.showSmallModal(fn.changeGenderHtml())
            },
            changeGender(gender) {
                if (gender === Defaults.EMPTY_STRING) return
                const formData = new FormData()
                formData.append('gender', gender)
                axios.put(`/${domain.id}/users/update-gender`, formData).then(res => {
                    this.user.gender = res.data.gender
                    this.setGenderColor()
                    this.showAlertMsg(Success.GENDER_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            changeDobDialog() {
                this.showSmallModal(fn.changeDobHtml())
            },
            changeDob(dob) {
                if (this.user.dob === Defaults.EMPTY_STRING) return
                const formData = new FormData()
                formData.append('dob', dob)
                axios.put(`${domain.id}/users/update-dob`, formData).then(res => {
                    this.user.dob = res.data.dob
                    this.showAlertMsg(Success.DOB_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            customizeTextDialog() {
                this.showSmallModal(fn.customizeTextHtml())
            },
            closeCustomizeText() {
                this.showEmo = false
                this.showOption = false
            },
            changeSounds() {
                const formData = new FormData()
                let sounds = this.user.chatSound ? '1' : '0'
                sounds += this.user.pvtSound ? '1' : '0'
                sounds += this.user.nameSound ? '1' : '0'
                sounds += this.user.notifySound ? '1' : '0'
                formData.append('sounds', sounds)
                axios.put(`/${domain.id}/users/change-sounds`, formData).catch(e => {
                    this.user.sounds = user.sounds
                    this.setSounds()
                    this.showAlertMsg(Errors.SOMETHING_WENT_WRONG, Css.ERROR)
                })
            },
            changePrivate() {
                const formData = new FormData()
                formData.append('private', this.user.private)
                axios.put(`/${domain.id}/users/change-private`, formData).catch(e => {
                    this.user.private = user.private
                    this.showAlertMsg(Errors.SOMETHING_WENT_WRONG, Css.ERROR)
                })
            },
            showGuestRegisterDialog() {
                if (rank.code !== RankCode.GUEST) return
                this.showSmallModal(fn.guestRegisterHtml())
            },

            /**
             * User blocking
             * */
            openBlockedModal() {
                this.showProfile = false
                this.showFullModal(fn.blockedModalHtml())
            },
            getBlockedUsers() {
                axios.get(`/${domain.id}/users/blocked-users`).then(res => this.blockedUsers = res.data)
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
                    this.u.user.blocked = this.blockedUsers.find(user => user.id === this.u.user.id) != null
                    this.u.user.tempStatus = this.u.user.status
                    this.setUserStatus()
                    this.setUserStatusColor()
                    this.setUserGenderColor()
                    this.setPermissions()
                    this.showUserProfile = true
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },
            closeUserProfile() {
                this.showUserProfile = false
            },
            setUserStatus() {
                this.u.user.muted > 0 ? this.u.user.status = Status.Muted :
                    this.u.user.kicked > 0 ? this.u.user.status = Status.Kicked :
                        this.u.user.banned > 0 ? this.u.user.status = Status.Banned : this.u.user.status
            },
            setUserStatusColor() {
                this.u.user.statusColor = Defaults.EMPTY_STRING
                this.u.user.status === Status.Online ? this.u.user.statusColor = Css.GREEN :
                    this.u.user.status === Status.Away ? this.u.user.statusColor = Css.YELLOW :
                        this.u.user.status === Status.Busy || this.u.user.status === Status.Muted || this.u.user.status === Status.Kicked || this.u.user.status === Status.Banned ? this.u.user.statusColor = Css.RED :
                            this.u.user.statusColor = Defaults.EMPTY_STRING
            },
            setUserGenderColor() {
                this.u.user.gender === Gender.Male ? this.u.user.genderColor = Css.Blue :
                    this.u.user.gender === Gender.Female ? this.u.user.genderColor = Css.Pink : this.u.user.statusColor = Defaults.EMPTY_STRING
            },
            changeUserNameDialog() {
                if (!this.user.canChangeName) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.changeUserNameHtml())
            },
            changeUserName(name) {
                if (!this.user.canChangeName) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                if (name.length < 4 || name.length > 12) {
                    this.showAlertMsg(Errors.NAME_INVALID, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('name', name)
                axios.put(`/${domain.id}/users/${this.u.user.id}/update-name`, formData).then(() => {
                    this.u.user.name = name
                    this.showAlertMsg(Success.NAME_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            changeUserAvatarDialog() {
                if (!this.user.canChangeAvatar) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.changeUserAvatarHtml())
            },
            setUserAvatar(index) {
                if (!this.user.canChangeAvatar) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                const data = new FormData()
                data.append('avatar', avatars[index])
                axios.put(`/${domain.id}/users/${this.u.user.id}/update-default-avatar`, data).then(() => {
                    this.u.user.avatar = avatars[index]
                    this.showAlertMsg(Success.AVATAR_CHANGED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
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
                axios.put(`/${domain.id}/users/${this.u.user.id}/update-avatar`, formData).then(() => {
                    this.showLoader = false
                    this.showAlertMsg(Success.AVATAR_CHANGED, Css.SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR)
                })
                this.showUserProfile = false
                this.closeSmallModal()
            },
            changeUserRankDialog() {
                if (!this.user.canChangeRank) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.changeUserRankHtml(this.u.ranks))
            },
            changeUserRank() {
                if (!this.user.canChangeRank) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('rankId', this.u.user.rank.id)
                axios.put(`/${domain.id}/users/${this.u.user.id}/update-rank`, formData).then(res => {
                    this.u.user.rank = res.data
                    this.showAlertMsg(Success.RANK_CHANGED.replace(/%USER%/g, this.u.user.name), Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },

            /**
             * Messages
             * */
            getMessages() {
                const chatMessages = this.$refs.chatMessages
                axios.get(`${domain.id}/rooms/${room.id}/messages`).then(res =>
                    res.data.forEach(message => {
                        let user = this.blockedUsers.find(user => user.id === message.user.id)
                        if (user == null) chatMessages.insertAdjacentHTML('afterbegin', fn.renderChatMessage(message))
                    })
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
                if (this.user.muted > 0) {
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
                    }).catch((e) => this.showAlertMsg(Errors.NO_MIC_PERMISSION, Css.ERROR))

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
            onMessageReceived(e) {
                const message = JSON.parse(e.data)
                if (message.type === MessageType.Join) {
                    this.getRoomUsers()
                    const chatMessages = this.$refs.chatMessages
                    if (message.user.id === userId) {
                        setTimeout(() => {
                            chatMessages.insertAdjacentHTML('afterbegin', fn.renderWelcomeMessage())
                        }, 5e2)
                        return
                    }
                    let user = this.blockedUsers.find(user => user.id === message.user.id)
                    if (user == null) chatMessages.insertAdjacentHTML('afterbegin', fn.renderJoinMessage(message))
                }
                if (message.type === MessageType.Chat) {
                    const chatMessages = this.$refs.chatMessages
                    let user = this.blockedUsers.find(user => user.id === message.user.id)
                    if (user == null) {
                        chatMessages.insertAdjacentHTML('afterbegin', fn.renderChatMessage(message))
                        if (message.user.id !== userId) soundManager.play('chat')
                    }
                }
                if (message.type === MessageType.Leave) {
                    const chatMessages = this.$refs.chatMessages
                    this.getRoomUsers()
                    if (message.user.id !== userId) chatMessages.insertAdjacentHTML('afterbegin', fn.renderLeaveMessage(message))
                }
                if (message.type === MessageType.DelChat) {
                    const li = document.getElementById(`chat-${message.id}`)
                    if (li != null) li.remove()
                }
                if (message.type === MessageType.News) {
                    this.getNews()
                    let makeSound = message.user.id !== userId && rank.code !== RankCode.GUEST && this.user.notifySound
                    if (makeSound) soundManager.play('post')
                }
                if (message.type === MessageType.GlobalFeed) {
                    this.getGlobalFeed()
                    let makeSound = message.user.id !== userId && rank.code !== RankCode.GUEST && this.user.notifySound
                    if (makeSound) soundManager.play('post')
                }
                if (message.type === MessageType.Adminship) {
                    this.getAdminships()
                    let makeSound = message.user.id !== userId && permission.adminship && this.user.notifySound
                    if (makeSound) soundManager.play('post')
                }
                if (message.type === MessageType.Report) {
                    this.getReports()
                    let makeSound = permission.reports && this.user.notifySound
                    if (makeSound) soundManager.play('notify')
                }
                if (message.type === MessageType.DelNews) this.getNews()
                if (message.type === MessageType.DelGlobalFeed) this.getGlobalFeed()
                if (message.type === MessageType.DelAdminship) this.getAdminships()
                if (message.type === MessageType.ActionTaken) if (permission.reports) this.getReports()
                if (message.type === MessageType.Mute) {
                    const user = this.roomUsers.find(user => user.id === message.user.id)
                    if (user) user.muted = 123456789
                }
                if (message.type === MessageType.UnMute) {
                    const user = this.roomUsers.find(user => user.id === message.user.id)
                    if (user) user.muted = 0
                }
            },
            deleteChat(id) {
                if (!permission.delMsg) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.delete(`/${domain.id}/rooms/${room.id}/messages/${id}/delete`).catch(() => this.showAlertMsg(Errors.DELETE_MESSAGE, Css.ERROR))
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
            getPvtMessage(user) {
                const message = user.messages[0]
                const person = (message != null && message.sender.id === userId) ? 'You : ' : `${user.name} :`
                let content = message != null ? fn.appendEmojis(message.content) : Defaults.EMPTY_STRING
                if (message.image && content === Defaults.EMPTY_STRING) content += '(Image)'
                if (message.audio && content === Defaults.EMPTY_STRING) content += '(Audio)'
                return person + content
            },
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
                if (this.user.muted > 0) {
                    this.showAlertMsg(Errors.YOU_ARE_MUTED, Css.ERROR)
                    return
                }
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
                    } else soundManager.play('private')
                    user.messages.unshift(message)
                    this.setPvtNotifiCount()
                }
                if (message.type === MessageType.DataChanges) location.reload()
                if (message.type === MessageType.Notification) {
                    this.getNotifications()
                    if (this.user.notifySound) soundManager.play('notify')
                }
                if (message.type === MessageType.Mute) {
                    this.user.muted = 1234567890
                    this.muteInterval = setInterval(() => this.checkMute(), 1e4)
                    this.checkMute()
                }
                if (message.type === MessageType.UnMute) {
                    this.user.muted = 0
                    this.checkMute()
                }
                if (message.type === MessageType.Kick) location.reload()
                if (message.type === MessageType.Ban) location.reload()
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
                })
            },
            openMessageModal() {
                this.showFullModal(fn.messageModalHtml())
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
                        message.content = fn.appendEmojis(message.content)
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
                axios.get(`/${domain.id}/rooms`).then(res => {
                    this.rooms = res.data
                    this.showFullModal(fn.roomModalHtml())
                })
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
                })
            },

            /**
             * Reports
             * */
            getReports() {
                permission.reports &&
                axios.get(`/${domain.id}/reports`).then(res => {
                    this.reports = res.data
                })
            },
            openReportsModal() {
                this.showFullModal(fn.reportModalHtml())
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
            getNews() {
                if (rank.code !== RankCode.GUEST) axios.get(`/${domain.id}/news`).then(res => this.news = res.data)
            },
            openNewsModal() {
                if (mobile.matches) this.showLeft = false
                this.showFullModal(fn.newsModalHtml(this.news.posts))
                if (this.news.unReadCount !== 0) axios.post(`/${domain.id}/news/read`).then(() => this.news.unReadCount = 0)
            },
            writeNewsDialog() {
                if (!permission.writeNews) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.writeNewsDialogHtml())
            },
            delNews(postId) {
                if (!permission.delNews) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.delete(`/${domain.id}/news/${postId}/delete`)
                    .then(() => this.showAlertMsg(Success.NEWS_DELETED, Css.SUCCESS))
                    .catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },

            /**
             * Adminship
             * */
            getAdminships() {
                if (this.user.canSeeAdminship) axios.get(`/${domain.id}/adminship`).then(res => this.adminship = res.data)
            },
            openAdminshipModal() {
                if (mobile.matches) this.showLeft = false
                this.showFullModal(fn.adminshipModalHtml(this.adminship.posts))
                if (this.this.adminship.unReadCount !== 0) axios.post(`/${domain.id}/adminship/read`).then(() => this.adminship.unReadCount = 0)
            },
            writeAdminshipDialog() {
                if (!this.user.canSeeAdminship) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.writeAdminshipDialogHtml())
            },
            delAdminship(postId) {
                if (!permission.delAS) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.delete(`/${domain.id}/adminship/${postId}/delete`).then(() => {
                    this.showAlertMsg(Success.ADMINSHIP_DELETED, Css.SUCCESS)
                    this.adminship.posts = this.adminship.posts.filter(adminship => adminship.id !== postId)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },

            /*
            * Global Feed
            * */
            getGlobalFeed() {
                if (rank.code !== RankCode.GUEST) axios.get(`/${domain.id}/global-feed`).then(res => this.globalFeed = res.data)
            },
            openGlobalFeedModal() {
                if (mobile.matches) this.showLeft = false
                this.showFullModal(fn.globalFeedModalHtml())
                if (this.this.globalFeed.unReadCount !== 0) axios.post(`/${domain.id}/global-feed/read`).then(() => this.globalFeed.unReadCount = 0)
            },
            writeGlobalFeedDialog() {
                if (this.user.muted > 0) {
                    this.showAlertMsg(Errors.YOU_ARE_MUTED, Css.ERROR)
                    return
                }
                if (rank.code === RankCode.GUEST) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.writeGlobalFeedDialogHtml())
            },
            delGlobalFeed(postId) {
                if (!permission.delGF) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.delete(`/${domain.id}/global-feed/${postId}/delete`)
                    .then(() => this.showAlertMsg(Success.GLOBAL_FEED_DELETED, Css.SUCCESS))
                    .catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },

            /**
             * Actions
             * */
            actionBlock() {
                if (this.u.user.blocked) {
                    this.unblock(this.u.user.id, this.u.user.name)
                    this.u.user.blocked = false
                } else {
                    this.block(this.u.user.id)
                    this.u.user.blocked = true
                }
            },
            block(userId) {
                const formData = new FormData()
                formData.append('blocked', userId)
                axios.post(`/${domain.id}/users/block`, formData).then(() => {
                    this.showAlertMsg(Success.USER_BLOCKED.replace(/%USER%/g, this.u.user.name), Css.SUCCESS)
                    this.getBlockedUsers()
                }).catch(e => this.showAlertMsg(Errors.BLOCKING_FAILED, Css.ERROR))
            },
            unblock(userId, name) {
                const formData = new FormData()
                formData.append('blocked', userId)
                axios.delete(`/${domain.id}/users/unblock`, {data: formData}).then(() => {
                    this.showAlertMsg(Success.USER_UNBLOCKED.replace(/%USER%/g, name), Css.SUCCESS)
                    this.blockedUsers = this.blockedUsers.filter(user => user.id !== userId)
                }).catch(e => this.showAlertMsg(Errors.UNBLOCKING_FAILED, Css.ERROR))
            },
            actionMuteDialog() {
                if (!this.user.canMute) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.u.user.muted !== 0 ? this.unmute() : this.showSmallModal(fn.muteDialogHtml())
            },
            mute(time, reason) {
                if (!this.user.canMute) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                let formData = new FormData()
                formData.append('time', time)
                if (reason !== Defaults.EMPTY_STRING) formData.append('reason', reason)
                axios.put(`/${domain.id}/users/${this.u.user.id}/mute`, formData).then(res => {
                    this.u.user.muted = res.data
                    this.u.user.status = Status.Muted
                    this.setUserStatusColor()
                    this.showAlertMsg(Success.USER_MUTED.replace(/%USER%/g, this.u.user.name), Css.SUCCESS)
                    this.closeSmallModal()
                })
            },
            unmute() {
                if (!this.user.canMute) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.put(`/${domain.id}/users/${this.u.user.id}/unmute`).then(() => {
                    this.u.user.muted = 0
                    this.u.user.status = this.u.user.tempStatus
                    this.setUserStatusColor()
                    this.showAlertMsg(Success.USER_UNMUTED.replace(/%USER%/g, this.u.user.name), Css.SUCCESS)
                })
            },
            checkMute() {
                if (this.user.muted > 0) {
                    axios.get(`/${domain.id}/users/check-mute`).then(res => {
                        this.user.muted = res.data
                        this.user.muted > 0 ? this.user.status = Status.Muted : this.user.status = user.status
                        this.setStatusColor()
                        this.$refs.mainInput.disabled = this.user.muted > 0
                    })
                } else clearInterval(this.muteInterval)
            },
            actionKickDialog() {
                if (!this.user.canKick) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.u.user.kicked !== 0 ? this.unkick() : this.showSmallModal(fn.kickDialogHtml())
            },
            kick(time, reason) {
                if (!this.user.canKick) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                let formData = new FormData()
                formData.append('time', time)
                if (reason !== Defaults.EMPTY_STRING) formData.append('reason', reason)
                axios.put(`/${domain.id}/users/${this.u.user.id}/kick`, formData).then(res => {
                    this.u.user.kicked = res.data
                    this.u.user.muted = 0
                    this.u.user.status = Status.Kicked
                    this.setUserStatusColor()
                    this.showAlertMsg(Success.USER_KICKED.replace(/%USER%/g, this.u.user.name), Css.SUCCESS)
                    this.closeSmallModal()
                })
            },
            unkick() {
                if (!this.user.canKick) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.put(`/${domain.id}/users/${this.u.user.id}/unkick`).then(() => {
                    this.u.user.kicked = 0
                    this.u.user.status = this.u.user.tempStatus
                    this.setUserStatusColor()
                    this.showAlertMsg(Success.USER_UNKICKED.replace(/%USER%/g, this.u.user.name), Css.SUCCESS)
                })
            },
            actionBanDialog() {
                if (!this.user.canBan) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.u.user.banned !== 0 ? this.unban() : this.showSmallModal(fn.banDialogHtml())
            },
            ban(reason) {
                if (!this.user.canBan) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                let formData = new FormData()
                if (reason !== Defaults.EMPTY_STRING) formData.append('reason', reason)
                axios.put(`/${domain.id}/users/${this.u.user.id}/ban`, formData).then(res => {
                    this.u.user.banned = res.data
                    this.u.user.kicked = 0
                    this.u.user.muted = 0
                    this.u.user.status = Status.Banned
                    this.setUserStatusColor()
                    this.showAlertMsg(Success.USER_BANNED.replace(/%USER%/g, this.u.user.name), Css.SUCCESS)
                    this.closeSmallModal()
                })
            },
            unban() {
                if (!this.user.canBan) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.put(`/${domain.id}/users/${this.u.user.id}/unban`).then(() => {
                    this.u.user.banned = 0
                    this.u.user.status = this.u.user.tempStatus
                    this.setUserStatusColor()
                    this.showAlertMsg(Success.USER_UNBANNED.replace(/%USER%/g, this.u.user.name), Css.SUCCESS)
                    this.closeSmallModal()
                })
            },
            actionDelAcDialog() {
                if (!this.user.canDelAc) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                this.showSmallModal(fn.delAcDialogHtml())
            },
            delAccount() {
                if (!this.user.canDelAc) {
                    this.showAlertMsg(Errors.PERMISSION_DENIED, Css.ERROR)
                    return
                }
                axios.delete(`/${domain.id}/users/${this.u.user.id}/delete`).then(() => {
                    this.showAlertMsg(Success.USER_DELETED.replace(/%USER%/g, this.u.user.name), Css.SUCCESS)
                    this.showUserProfile = false
                }).catch(e => this.showAlertMsg(Errors.USER_DELETION_FAILED))
                this.closeSmallModal()
            }
        }
    })

    Alpine.data('customize', () => {
        return {
            nameFont: '',
            nameColor: '',
            textFont: '',
            textColor: '',
            textBold: '',
            init() {
                this.nameFont = this.user.nameFont
                this.nameColor = this.user.nameColor
                this.textFont = this.user.textFont
                this.textColor = this.user.textColor
                this.textBold = this.user.textBold
            },
            setNameColor(index) {
                this.nameColor = textColors[index]
            },
            isShowTickForName(index) {
                return this.nameColor === textColors[index]
            },
            customizeName() {
                if (this.nameColor === this.user.nameColor && this.nameFont === this.user.nameFont) return
                const formData = new FormData()
                formData.append('nameColor', this.nameColor)
                formData.append('nameFont', this.nameFont)
                axios.put(`/${domain.id}/users/customize-name`, formData).then(res => {
                    this.user.nameColor = res.data.nameColor
                    this.user.nameFont = res.data.nameFont
                    this.showAlertMsg(Success.NAME_CUSTOMIZED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
            setTextColor(index) {
                this.textColor = textColors[index]
            },
            isShowTick(index) {
                return this.textColor === textColors[index]
            },
            customizeText() {
                if (this.textBold === this.user.textBold && this.textColor === this.user.textColor && this.textFont === this.user.textFont) return
                const formData = new FormData()
                formData.append('textBold', this.textBold)
                formData.append('textColor', this.textColor)
                formData.append('textFont', this.textFont)
                axios.put(`/${domain.id}/users/customize-text`, formData).then(res => {
                    this.user.textColor = res.data.textColor
                    this.user.textBold = res.data.textBold
                    this.user.textFont = res.data.textFont
                    this.showAlertMsg(Success.CHAT_TEXT_CUSTOMIZED, Css.SUCCESS)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
                this.closeSmallModal()
            },
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
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            }
        }
    })

    Alpine.data('adminship', () => {
        return {
            content: Defaults.EMPTY_STRING,
            image: Defaults.EMPTY_STRING,
            init() {
                this.$nextTick(() => this.$refs.postInput.focus())
            },
            addImage(el) {
                const reader = new FileReader()
                reader.onload = e => this.image = e.target.result
                reader.readAsDataURL(el.files[0])
            },
            writeAdminship() {
                const input = this.$refs.input
                if (!this.user.canSeeAdminship) {
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
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            }
        }
    })

    Alpine.data('globalFeed', () => {
        return {
            content: Defaults.EMPTY_STRING,
            image: Defaults.EMPTY_STRING,
            init() {
                this.$nextTick(() => this.$refs.postInput.focus())
            },
            addImage(el) {
                const reader = new FileReader()
                reader.onload = e => this.image = e.target.result
                reader.readAsDataURL(el.files[0])
            },
            writeGlobalFeed() {
                const input = this.$refs.input
                if (rank.code === RankCode.GUEST) {
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

    Alpine.data('post', () => {
        return {
            showComments: false,
            getCommentClicked: 0,
            type: 0,
            slug: '',
            setData(type) {
                this.type = type
                this.slug = type === 1 ? PostLink.Announcement : type === 2 ? PostLink.GlobalFeed : type === 3 ? PostLink.Adminship : Defaults.EMPTY_STRING
            },
            getReactType(type) {
                return type === 1 ? ReactType.Like : type === 2 ? ReactType.Love :
                    type === 3 ? ReactType.Lol : type === 4 ? ReactType.Dislike : Defaults.EMPTY_STRING
            },
            getPost(postId) {
                return this.type === 1 ? this.news.posts.find(post => post.id === postId) :
                    this.type === 2 ? this.globalFeed.posts.find(post => post.id === postId) :
                        this.type === 3 ? this.adminship.posts.find(post => post.id === postId) : null
            },
            postReact(postId, type) {
                const reactType = this.getReactType(type)
                if (reactType === Defaults.EMPTY_STRING) return
                const post = this.getPost(postId)
                const formData = new FormData()
                formData.append('type', reactType)
                axios.post(`/${domain.id}/${this.slug}/${postId}/react`, formData).then(res => {
                    let reaction = res.data
                    let oldReaction = reaction.oldReaction
                    let newReaction = reaction.newReaction
                    if (!oldReaction && !newReaction) fn.removeReaction(post, reactType)
                    if (oldReaction && newReaction) fn.updateReaction(post, oldReaction, newReaction)
                    if (!oldReaction && newReaction) fn.makeReaction(post, newReaction)
                })
            },
            getComments(postId) {
                const post = this.getPost(postId)
                if (this.getCommentClicked && post.comments.length > 0) {
                    this.showComments = !this.showComments
                    return
                }
                axios.get(`/${domain.id}/${this.slug}/${postId}/comments`).then(res => {
                    post.comments = res.data
                    this.showComments = true
                    this.getCommentClicked = true
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },
            writeComment(postId) {
                const post = this.getPost(postId)
                const formData = new FormData()
                const content = this.$refs.input.value
                if (content === Defaults.EMPTY_STRING) {
                    this.showAlertMsg(Errors.CONTENT_EMPTY, Css.ERROR)
                    return
                }
                formData.append('content', content)
                axios.post(`/${domain.id}/${this.slug}/${postId}/comments/create`, formData).then(res => {
                    post.comments.unshift(res.data)
                    post.commentsCount++
                    this.showComments = true
                    this.$nextTick(() => this.$refs.input.value = Defaults.EMPTY_STRING)
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            },
            delComment(postId, commentId) {
                const post = this.getPost(postId)
                axios.delete(`/${domain.id}/${this.slug}/${postId}/comments/${commentId}/delete`).then(() => {
                    post.comments = post.comments.filter(comment => comment.id !== commentId)
                    post.commentsCount--
                }).catch(e => this.showAlertMsg(fn.getErrorMsg(e), Css.ERROR))
            }
        }
    })

    Alpine.data('actions', () => {
        return {
            reason: '',
            selectedTime: 5
        }
    })

    Alpine.data('kickActions', () => {
        return {
            kicked: kicked,
            kickInterval: null,
            kickTime: '',
            init() {
                this.connectWs()
                this.timeBetweenDates()
                this.checkKick()
            },
            connectWs() {
                this.userSocket = new WebSocket(`wss://${location.host}/${domainId}/member/${userId}`)
                this.userSocket.addEventListener('message', (e) => this.onPvtMessageReceived(e))
                this.userSocket.addEventListener('close', () => this.connectWs())
            },
            onPvtMessageReceived(e) {
                const message = JSON.parse(e.data)
                if (message.type === MessageType.UnKick || message.type === MessageType.Ban) location.reload()
            },
            checkKick() {
                this.kickInterval = setInterval(() => this.timeBetweenDates(), 1e3)
            },
            timeBetweenDates() {
                const date = new Date()
                let currentMilliSeconds = date.getTime()
                let difference = this.kicked - currentMilliSeconds
                if (difference <= 0) {
                    if (this.kickInterval) clearInterval(this.kickInterval)
                    axios.get(`/${domainId}/users/check-kick`).then(() => location.reload())
                } else {
                    let seconds = Math.floor(difference / 1000)
                    let minutes = Math.floor(seconds / 60)
                    let hours = Math.floor(minutes / 60)
                    let days = Math.floor(hours / 24)
                    days %= 30
                    hours %= 24
                    minutes %= 60
                    seconds %= 60
                    this.days = days === 0 ? '' : days.toString().split('').length < 2 ? `0${days}:` : `${days}:`
                    this.hours = hours === 0 ? '' : hours.toString().split('').length < 2 ? `0${hours}:` : `${hours}:`
                    this.minutes = minutes === 0 ? '' : minutes.toString().split('').length < 2 ? `0${minutes}:` : `${minutes}:`
                    this.seconds = seconds.toString().split('').length < 2 ? `0${seconds}` : seconds
                    this.kickTime = `${this.days}${this.hours}${this.minutes}${this.seconds}`
                }
            }
        }
    })

    Alpine.data('banActions', () => {
        return {
            init() {
                this.connectWs()
            },
            connectWs() {
                this.userSocket = new WebSocket(`wss://${location.host}/${domainId}/member/${userId}`)
                this.userSocket.addEventListener('message', (e) => this.onPvtMessageReceived(e))
                this.userSocket.addEventListener('close', () => this.connectWs())
            },
            onPvtMessageReceived(e) {
                const message = JSON.parse(e.data)
                if (message.type === MessageType.UnBan) location.reload()
            },
        }
    })
})

Alpine.start()







