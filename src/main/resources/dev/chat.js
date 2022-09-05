"use strict"

import Alpine from 'alpinejs'


//disableDevtool() /*TODO : Uncomment this in production*/

window.axios = require('axios')
window.Alpine = Alpine

Object.freeze(domain)
Object.freeze(room)
Object.freeze(permission)
Object.freeze(rank)

const MicRecorder = require('mic-recorder-to-mp3')
const MessageType = {
    Join: 'Join', Chat: 'Chat', Leave: 'Leave', DelChat: 'DelChat', Report: 'Report', ActionTaken: 'ActionTaken',
    News: 'News', DelNews: 'DelNews', DataChanges: 'DataChanges', Mute: 'Mute', UnMute: 'UnMute',
    Kick: 'Kick', Ban: 'Ban'
}
const Status = {Stay: 'Stay', Online: 'Online', Away: 'Away', Busy: 'Busy'}
const ReportType = {Chat: 'Chat', PvtChat: 'PvtChat', NewsFeed: 'NewsFeed'}
const textColors = ['red', 'red-1', 'red-2', 'red-3', 'orange', 'orange-1', 'orange-2', 'orange-3', 'amber', 'amber-1', 'amber-2', 'amber-3', 'yellow', 'yellow-1', 'yellow-2', 'yellow-3', 'lime', 'lime-1', 'lime-2', 'lime-3', 'green', 'green-1', 'green-2', 'green-3', 'emerald', 'emerald-1', 'emerald-2', 'emerald-3', 'teal', 'teal-1', 'teal-2', 'teal-3', 'cyan', 'cyan-1', 'cyan-2', 'cyan-3', 'sky', 'sky-1', 'sky-2', 'sky-3', 'blue', 'blue-1', 'blue-2', 'blue-3', 'indigo', 'indigo-1', 'indigo-2', 'indigo-3', 'violet', 'violet-1', 'violet-2', 'violet-3', 'purple', 'purple-1', 'purple-2', 'purple-3', 'fuchsia', 'fuchsia-1', 'fuchsia-2', 'fuchsia-3', 'pink', 'pink-1', 'pink-2', 'pink-3', 'rose', 'rose-1', 'rose-2', 'rose-3', 'slate', 'slate-1', 'slate-2', 'slate-3', 'gray', 'gray-1', 'gray-2', 'gray-3', 'zinc', 'zinc-1', 'zinc-2', 'zinc-3', 'stone', 'stone-1', 'stone-2', 'stone-3', 'black']
const bgColors = ['b-red', 'b-red-1', 'b-red-2', 'b-red-3', 'b-orange', 'b-orange-1', 'b-orange-2', 'b-orange-3', 'b-amber', 'b-amber-1', 'b-amber-2', 'b-amber-3', 'b-yellow', 'b-yellow-1', 'b-yellow-2', 'b-yellow-3', 'b-lime', 'b-lime-1', 'b-lime-2', 'b-lime-3', 'b-green', 'b-green-1', 'b-green-2', 'b-green-3', 'b-emerald', 'b-emerald-1', 'b-emerald-2', 'b-emerald-3', 'b-teal', 'b-teal-1', 'b-teal-2', 'b-teal-3', 'b-cyan', 'b-cyan-1', 'b-cyan-2', 'b-cyan-3', 'b-sky', 'b-sky-1', 'b-sky-2', 'b-sky-3', 'b-blue', 'b-blue-1', 'b-blue-2', 'b-blue-3', 'b-indigo', 'b-indigo-1', 'b-indigo-2', 'b-indigo-3', 'b-violet', 'b-violet-1', 'b-violet-2', 'b-violet-3', 'b-purple', 'b-purple-1', 'b-purple-2', 'b-purple-3', 'b-fuchsia', 'b-fuchsia-1', 'b-fuchsia-2', 'b-fuchsia-3', 'b-pink', 'b-pink-1', 'b-pink-2', 'b-pink-3', 'b-rose', 'b-rose-1', 'b-rose-2', 'b-rose-3', 'b-slate', 'b-slate-1', 'b-slate-2', 'b-slate-3', 'b-gray', 'b-gray-1', 'b-gray-2', 'b-gray-3', 'b-zinc', 'b-zinc-1', 'b-zinc-2', 'b-zinc-3', 'b-stone', 'b-stone-1', 'b-stone-2', 'b-stone-3', 'b-black']
const avatars = ['/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp',]
const emojis = [easy, modern, easy, modern]

/**
 * Responsive windows
 * */
const mobile = window.matchMedia('(max-width: 640px)')
const tablet = window.matchMedia('(min-width: 768px)')
const desktop = window.matchMedia('(min-width: 1024px)')

/**
 * Success Messages
 * */
const AVATAR_HAS_BEEN_CHANGED = 'Avatar has been changed'
const NAME_HAS_BEEN_CHANGED = 'Name has been changed'
const NAME_CUSTOMIZED = 'Name text customized.'
const MOOD_HAS_BEEN_CHANGED = 'Mood has been changed'
const ABOUT_HAS_BEEN_CHANGED = 'About me has been changed'
const PASSWORD_HAS_BEEN_CHANGED = 'Password has been changed'
const STATUS_HAS_BEEN_CHANGED = 'Status has been changed'
const GENDER_HAS_BEEN_CHANGED = 'Gender has been changed'
const DOB_HAS_BEEN_CHANGED = 'DOB has been changed'
const CHAT_TEXT_CUSTOMIZED = 'Chat text customized'
const NEWS_CREATED = 'Announcement created successfully'
const NEWS_DELETED = 'Announcement deleted successfully'
/**
 * Common errors
 * */
const ERROR_NAME_INVALID = 'Must have min 4 to max 12 letters'
const ERROR_MOOD_INVALID = 'Must have max 40 letters'
const ERROR_PERMISSION_DENIED = 'Permission denied'
const ERROR_SOMETHING_WENT_WRONG = 'Something went wrong'
const ERROR_INVALID_FILE_FORMAT = 'Invalid file format'
const ERROR_GUEST_DOESNT_HAVE_PASSWORD = 'Guest does not have password'
const ERROR_PASSWORD_MUST_HAVE = 'Must have at least 8 characters'
const ERROR_YOU_ARE_MUTED = 'You are muted'
const ERROR_RECORD_LENGTH = 'Record length at least 10 seconds'
const ERROR_UPLOAD_FAILED = 'Upload failed'
const ERROR_RECORDING_FAILED = 'Recording failed'
const ERROR_DELETE_MESSAGE = 'Deleting message failed'
const ERROR_CANT_PRIVATE = 'You cannot private to this user'
const ERROR_NO_MIC_PERMISSION = 'You haven\'t given mic permission'

/**
 * Css classes
 * */
const SUCCESS = 'success'
const ERROR = 'error'
const GREEN = 'green'
const YELLOW = 'yellow'
const RED = 'red'

/**
 * Constants
 * */
const EMPTY_STRING = ''
const UNDEFINED = 'undefined'
const GUEST = 'guest'
const RECORDING_TIME = 180
const MIN_RECORDING_TIME = 10


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
            onlineUsers: [],
            offlineUsers: [],
            pvtUsers: [],
            reports: [],
            news: {news: [], unReadCount: 0},
            pvtNotifiCount: 0,
            reportNotifiCount: 0,
            notifiCount: 0,
            newsUnreadCount: 0,
            adminShipUnreadCount: 0,
            globalFeedUnreadCount: 0,
            totalCount: 0,
            isRecording: false,
            remainingTime: RECORDING_TIME,
            init() {

                this.showRight = desktop.matches || tablet.matches
                this.showLeft = desktop.matches

                desktop.onchange = () => {
                    this.showLeft = desktop.matches
                    this.showRight = desktop.matches || tablet.matches
                }

                tablet.onchange = () => this.showRight = desktop.matches || tablet.matches

                this.recorder = new MicRecorder({bitrate: 80})

                this.$refs.mainEmojis.innerHTML = getEmojisHtml()

                this.getMessages()

                this.reCheckPvtMessages()

                this.setStatusColor()

                this.getReports()

                this.getNews()

                this.roomSocket.addEventListener('message', (e) => {
                    const message = JSON.parse(e.data)
                    this.onMessageReceived(message)
                    message.user.id !== userId && message.type === MessageType.Chat && this.$refs.chatSound.play()
                })

                this.roomSocket.addEventListener('close', (e) => {
                }/*location.reload()*/)

                this.userSocket.addEventListener('message', (e) => this.onPvtMessageReceived(e))

                this.userSocket.addEventListener('close', (e) => {
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
                    if (rank.code === 'guest') {
                        this.showSmallModal(guestDialogHtml())
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
                    this.totalCount = this.newsUnreadCount + this.adminShipUnreadCount + this.globalFeedUnreadCount
                })

                this.$watch('adminShipUnreadCount', () => {
                    this.totalCount = this.newsUnreadCount + this.adminShipUnreadCount + this.globalFeedUnreadCount
                })

                this.$watch('globalFeedUnreadCount', () => {
                    this.totalCount = this.newsUnreadCount + this.adminShipUnreadCount + this.globalFeedUnreadCount
                })

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
            showSmallModal(html) {
                this.$refs.modalContent.innerHTML = html
                this.showModal = true
            },
            closeSmallModal() {
                this.$refs.modalContent.innerText = EMPTY_STRING
                this.showModal = false
            },
            showImgModal(html) {
                this.$refs.fullImage.innerHTML = html
                this.showImage = true
            },
            closeImgModal() {
                this.$refs.fullImage.innerText = EMPTY_STRING
                this.showImage = false
            },
            showFullModal(html) {
                this.$refs.fullModalContent.innerHTML = html
                this.showFulModal = true
            },
            closeFullModal() {
                this.showFulModal = false
                let content = this.$refs.fullModalContent
                setTimeout(() => content.innerHTML = EMPTY_STRING, 5e2)
            },
            showUCGPolicyDialog() {
                this.showSmallModal(ucgPolicyHtml())
            },
            closeUGCPolicy() {
                this.closeSmallModal()
                this.showMessages = true
                this.$refs.mainInput.focus()
                localStorage.setItem("isUGCShowed", "true")
                if (rank.code === 'guest') {
                    this.showSmallModal(guestDialogHtml())
                }
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
            setStatusColor() {
                if (this.user.status === Status.Online) this.statusColor = GREEN
                else if (this.user.status === Status.Away) this.statusColor = YELLOW
                else if (this.user.status === Status.Busy) this.statusColor = RED
                else this.statusColor = EMPTY_STRING
            },
            setUserStatusColor() {
                if (this.user.status === Status.Online) this.statusColor = GREEN
                else if (this.user.status === Status.Away) this.statusColor = YELLOW
                else if (this.user.status === Status.Busy) this.statusColor = RED
                else this.statusColor = EMPTY_STRING
            },
            getMessages() {
                this.$refs.chatMessages.innerHTML = EMPTY_STRING
                axios.get(`${domain.id}/rooms/${room.id}/messages`).then(res =>
                    res.data.forEach(message => this.onMessageReceived(message))
                )
            },
            getReports() {
                if (permission.reports) {
                    axios.get(`/${domain.id}/reports`).then(res => {
                        this.reports = res.data
                        this.reportNotifiCount = this.reports.length
                    })
                }
            },
            getNews(callback = () => {
            }) {
                axios.get(`/${domain.id}/news`).then(res => {
                    this.news = res.data
                    this.newsUnreadCount = this.news.unReadCount
                    if (typeof callback === 'function') callback()
                })
            },
            getPvtEmojis(el) {
                el.innerHTML = pvtEmojisHtml()
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
                }).catch(e => this.showAlertMsg(getErrorMsg(e)))
            },
            showGuestRegisterDialog() {
                if (rank.code !== GUEST) return
                this.showSmallModal(guestRegisterHtml())
            },
            getUserProfile(uId) {
                if (mobile.matches) this.showRight = false
                if (uId === userId) {
                    this.showProfile = true
                    return
                }
                axios.get(`/${domain.id}/users/${uId}`).then(res => {
                    this.u = res.data
                    this.setUserStatusColor()
                    this.showUserProfile = true
                }).catch(e => this.showAlertMsg(getErrorMsg(e), ERROR))
            },
            showLogoutDialog() {
                this.showSmallModal(logoutHtml())
            },
            logout() {
                axios.post('logout').then(() => location.reload()).catch(e => this.showAlertMsg(getErrorMsg(e), ERROR))
            },
            changeAvatarDialog() {
                this.showSmallModal(changeAvatarHtml())
            },
            setAvatar(index) {
                this.showLoader = true
                const data = new FormData()
                data.append('avatar', avatars[index])
                axios.put(`/${domain.id}/users/update-default-avatar`, data).then(res => {
                    this.user.avatar = res.data.avatar
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(AVATAR_HAS_BEEN_CHANGED, SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(getErrorMsg(e), ERROR)
                })
            },
            changeAvatar(el) {
                this.showLoader = true
                const formData = new FormData()
                const file = el.files[0]
                const pattern = /image-*/
                if (file == null || file.type === UNDEFINED) return
                if (!file.type.match(pattern)) {
                    this.showLoader = false
                    this.showAlertMsg(ERROR_INVALID_FILE_FORMAT, ERROR)
                    return
                }
                formData.append('avatar', file)
                axios.put(`/${domain.id}/users/update-avatar`, formData).then(res => {
                    this.user.avatar = res.data.avatar
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(AVATAR_HAS_BEEN_CHANGED, SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(getErrorMsg(e), ERROR)
                })
            },
            changeNameDialog() {
                this.showSmallModal(changeNameHtml())
            },
            closeNameDialog() {
                this.user.name = name
                this.closeSmallModal()
            },
            changeName() {
                if (this.user.name.length < 4 || this.user.name.length > 12) {
                    this.showAlertMsg(ERROR_NAME_INVALID, ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('name', this.user.name)
                axios.put(`/${domain.id}/users/update-name`, formData).then(res => {
                    name = this.user.name
                    this.closeSmallModal()
                    this.showAlertMsg(NAME_HAS_BEEN_CHANGED, SUCCESS)
                }).catch(e => {
                    this.closeNameDialog()
                    this.showAlertMsg(getErrorMsg(e), ERROR)
                })
            },
            customizeNameDialog() {
                this.showSmallModal(customizeNameHtml())
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
                    this.showAlertMsg(NAME_CUSTOMIZED, SUCCESS)
                }).catch(e => {
                    this.closeCustomizeNameDialog()
                    this.showAlertMsg(getErrorMsg(e), ERROR)
                })
            },
            changeMoodDialog() {
                this.showSmallModal(changeMoodHtml())
            },
            closeMoodDialog() {
                this.user.mood = mood
                this.closeSmallModal()
            },
            changeMood() {
                if (this.user.mood.length >= 40) {
                    this.showAlertMsg(ERROR_MOOD_INVALID, ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('mood', this.user.mood)
                axios.put(`/${domain.id}/users/update-mood`, formData).then(res => {
                    mood = res.data.mood
                    this.closeSmallModal()
                    this.showAlertMsg(MOOD_HAS_BEEN_CHANGED, SUCCESS)
                }).catch(e => {
                    this.closeMoodDialog()
                    this.showAlertMsg(e.response.data, ERROR)
                })
            },
            changeAboutDialog() {
                this.showSmallModal(changeAboutHtml())
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
                    this.showAlertMsg(ABOUT_HAS_BEEN_CHANGED, SUCCESS)
                }).catch(e => {
                    this.closeAboutDialog()
                    this.showAlertMsg(e.response.data, ERROR)
                })
            },
            changePasswordDialog() {
                if (rank.code === GUEST) {
                    this.showAlertMsg(ERROR_GUEST_DOESNT_HAVE_PASSWORD, ERROR)
                    return
                }
                this.showSmallModal(changePasswordHtml())
            },
            changePassword() {
                if (this.user.password.length < 8) {
                    this.showAlertMsg(ERROR_PASSWORD_MUST_HAVE, ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('password', this.user.password)
                axios.post(`/${domain.id}/users/update-password`, formData).then(() =>
                    this.showAlertMsg(PASSWORD_HAS_BEEN_CHANGED, SUCCESS)
                ).catch(e => this.showAlertMsg(getErrorMsg(e), ERROR))
                this.closeSmallModal()
            },
            changeStatusDialog() {
                this.showSmallModal(changeStatusHtml())
            },
            changeStatus() {
                if (this.user.status === EMPTY_STRING) return
                const formData = new FormData()
                formData.append('status', this.user.status)
                axios.post(`/${domain.id}/users/update-status`, formData).then(res => {
                    this.showAlertMsg(STATUS_HAS_BEEN_CHANGED, SUCCESS)
                    this.user.status = res.data.status
                    this.setStatusColor()
                }).catch(e => this.showAlertMsg(getErrorMsg(e), ERROR))
                this.closeSmallModal()
            },
            changeGenderDialog() {
                this.showSmallModal(changeGenderHtml())
            },
            changeGender() {
                if (this.user.gender === EMPTY_STRING) return
                const formData = new FormData()
                formData.append('gender', this.user.gender)
                axios.post(`/${domain.id}/users/update-gender`, formData).then(res => {
                    this.user.gender = res.data.gender
                    this.showAlertMsg(GENDER_HAS_BEEN_CHANGED, SUCCESS)
                }).catch(e => this.showAlertMsg(getErrorMsg(e), ERROR))
                this.closeSmallModal()
            },
            changeDobDialog() {
                this.showSmallModal(changeDobHtml())
            },
            closeDobDialog() {
                this.user.dob = dob
                this.closeSmallModal()
            },
            changeDob() {
                if (this.user.dob === EMPTY_STRING) return
                const formData = new FormData()
                formData.append('dob', this.user.dob)
                axios.post(`${domain.id}/users/update-dob`, formData).then(res => {
                    this.showAlertMsg(DOB_HAS_BEEN_CHANGED, SUCCESS)
                    this.user.dob = res.data.dob
                    this.closeSmallModal()
                }).catch(e => {
                    this.closeDobDialog()
                    this.showAlertMsg(getErrorMsg(e), ERROR)
                })
            },
            customizeTextDialog() {
                this.showSmallModal(customizeTextHtml())
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
                    this.showAlertMsg(CHAT_TEXT_CUSTOMIZED, SUCCESS)
                }).catch(e => {
                    this.closeCustomizeTextDialog()
                    this.showAlertMsg(getErrorMsg(e), ERROR)
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
                    this.showAlertMsg(ERROR_SOMETHING_WENT_WRONG, ERROR)
                })
            },
            changePrivate() {
                const formData = new FormData()
                formData.append('private', this.user.private)
                axios.put(`/${domain.id}/users/change-private`, formData).catch(e => {
                    this.user.private = pvt
                    this.showAlertMsg(ERROR_SOMETHING_WENT_WRONG, ERROR)
                })
            },
            removeTopic() {
                document.getElementById('topic').remove()
            },
            welcomeMessage(name) {
                this.$refs.mainInput.value = `Welcome ${name}`
            },
            addMainEmo(emo) {
                const input = this.$refs.mainInput
                input.value === EMPTY_STRING ? input.value = `${emo} ` : input.value += ` ${emo} `
                this.showEmo = false
                input.focus()
            },
            addPvtEmo(emo,) {
                const input = this.$refs.pvtInput
                input.value === EMPTY_STRING ? input.value = `${emo} ` : input.value += ` ${emo} `
                input.focus()
            },
            appendUserName(el) {
                const username = el.innerText
                const input = this.$refs.mainInput
                input.value === EMPTY_STRING ? input.value = `${username} ` : input.value += ` ${username} `
                input.focus()
            },
            sendToRoom(message) {
                this.roomSocket.send(JSON.stringify(message))
            },
            sendMessage() {
                if (this.user.muted) {
                    this.showAlertMsg(ERROR_YOU_ARE_MUTED, ERROR)
                    return
                }
                const content = this.$refs.mainInput.value
                if (content === EMPTY_STRING) {
                    this.$refs.mainInput.focus()
                    return
                }
                this.sendToRoom({content: content, type: MessageType.Chat})
                this.$refs.mainInput.value = EMPTY_STRING
                this.$refs.mainInput.focus()
            },
            recordMainAudio() {
                if (this.user.muted) {
                    this.showAlertMsg(ERROR_YOU_ARE_MUTED, ERROR)
                    return
                }
                if (this.isRecording) {
                    this.showEmo = false
                    this.showOption = false
                    if (!(RECORDING_TIME - this.remainingTime > MIN_RECORDING_TIME)) {
                        this.recorder.stop()
                        this.isRecording = false
                        this.remainingTime = RECORDING_TIME
                        clearInterval(this.mainInterval)
                        this.showAlertMsg(ERROR_RECORD_LENGTH, ERROR)
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
                            .catch(() => this.showAlertMsg(ERROR_UPLOAD_FAILED, ERROR))
                    }).catch(() => this.showAlertMsg(ERROR_RECORDING_FAILED, ERROR))
                    this.isRecording = false
                    this.remainingTime = RECORDING_TIME
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
                        this.showAlertMsg('You haven\'t given mic permission', ERROR)
                    })

                }
            },
            uploadImage(event) {
                if (this.user.muted) {
                    this.showAlertMsg(ERROR_YOU_ARE_MUTED, ERROR)
                    return
                }
                this.showLoader = true
                const formData = new FormData()
                const file = event.target.files[0]
                const pattern = /image-*/
                const content = this.$refs.mainInput.value
                if (file == null || file.type === UNDEFINED) return
                if (!file.type.match(pattern)) {
                    this.showAlertMsg(ERROR_INVALID_FILE_FORMAT, ERROR)
                    this.showLoader = false
                    return
                }
                formData.append('image', file)
                formData.append('content', content)
                axios.post(`${domain.id}/rooms/${room.id}/upload-image`, formData).then(res => {
                    this.sendToRoom(res.data)
                    this.$refs.mainInput.value = EMPTY_STRING
                    this.$refs.mainInput.focus()
                    this.showLoader = false
                }).catch(() => {
                    this.showLoader = false
                    this.showAlertMsg(ERROR_UPLOAD_FAILED, ERROR)
                })
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
            onMessageReceived(message) {
                const chatMessages = this.$refs.chatMessages
                if (message.type === MessageType.Join) {
                    this.getRoomUsers()
                    if (message.user.id === userId) {
                        setTimeout(() => {
                            chatMessages.insertAdjacentHTML("afterbegin", renderWelcomeMessage())
                        }, 1e3)
                        return
                    }
                    chatMessages.insertAdjacentHTML("afterbegin", renderJoinMessage(message))
                } else if (message.type === MessageType.Chat) {
                    chatMessages.insertAdjacentHTML("afterbegin", renderChatMessage(message))
                } else if (message.type === MessageType.Leave) {
                    this.getRoomUsers()
                    if (message.user.id === userId) {
                        location.replace(`/${domain.id}/lobby`)
                        return
                    }
                    chatMessages.insertAdjacentHTML("afterbegin", renderLeaveMessage(message))
                } else if (message.type === MessageType.DelChat) {
                    const li = document.getElementById(`chat-${message.id}`)
                    li != null && li.remove()
                } else if (message.type === MessageType.News) {
                    if (message.user.id !== userId) {
                        this.getNews()
                        this.user.notifiSound && this.$refs.notifiSound.play()
                    }
                } else if (message.type === MessageType.DelNews) {
                    this.getNews()
                } else if (message.type === MessageType.Mute) {
                    const user = this.roomUsers.find(user => user.id === message.user.id)
                    if (user) user.muted = true
                    if (message.user.id === userId) {
                        this.user.muted = true
                        this.$refs.mainInput.disabled = this.user.muted
                        this.showAlertMsg('You have been muted', ERROR)
                    }
                } else if (message.type === MessageType.UnMute) {
                    const user = this.roomUsers.find(user => user.id === message.user.id)
                    if (user) user.muted = false
                    if (message.user.id === userId) {
                        this.user.muted = false
                        this.$refs.mainInput.disabled = this.user.muted
                        this.showAlertMsg('You have been unmuted', SUCCESS)
                    }
                }
            },
            deleteChat(id) {
                if (permission.delMsg) {
                    axios.delete(`/${domain.id}/rooms/${room.id}/messages/${id}/delete`)
                        .catch(() => this.showAlertMsg(ERROR_DELETE_MESSAGE, ERROR))
                } else this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
            },
            reportDialog(id, type) {
                const reportType = type === 1 ? ReportType.Chat : (type === 2) ? ReportType.PvtChat : ReportType.NewsFeed
                this.showSmallModal(reportDialogHtml(id, reportType))
            },
            report(targetId, reason, type) {
                const formData = new FormData()
                formData.append('targetId', targetId)
                formData.append('reason', reason)
                formData.append('roomId', room.id)
                formData.append('type', type)
                axios.post(`${domain.id}/reports/create`, formData).then(res => {
                    this.showAlertMsg('Message reported successfully', SUCCESS)
                }).catch(e => {
                    this.showAlertMsg('Reporting message failed', ERROR)
                })
                this.closeSmallModal()
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
                if (exists != null && exists !== 'undefined') {
                    exists.minimize = false
                    exists.added = true
                    if (exists.unReadCount > 0) {
                        this.setAllSeen(exists.id)
                    }
                    this.$nextTick(() => {
                        dragElement(document.getElementById(`draggable-${exists.id}`), exists.id)
                    })
                    return
                }
                axios.get(`/${domain.id}/pvt/${id}/messages`).then(res => {
                    user.messages = res.data
                    user.minimize = false
                    user.added = true
                    user.isRecording = false
                    user.remainingTime = RECORDING_TIME
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
                    this.showAlertMsg(ERROR_CANT_PRIVATE, ERROR)
                    return
                }
                const content = input.value
                if (content === EMPTY_STRING) {
                    input.focus()
                    return
                }
                this.sendToUser({sender: {id: userId}, receiver: {id: id}, content: content, type: MessageType.Chat})
                input.value = EMPTY_STRING
                input.focus()
            },
            sendToUser(message) {
                this.userSocket.send(JSON.stringify(message))
            },
            recordPvtAudio(id) {
                const user = this.pvtUsers.find(user => user.id === id)
                if (!user.private || !permission.private) {
                    this.showAlertMsg(ERROR_CANT_PRIVATE, ERROR)
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
                    }).catch(() => this.showAlertMsg(ERROR_NO_MIC_PERMISSION, ERROR))
                } else {
                    if (!(RECORDING_TIME - user.remainingTime > MIN_RECORDING_TIME)) {
                        user.recorder.stop()
                        user.isRecording = false
                        clearInterval(user.interval)
                        user.remainingTime = RECORDING_TIME
                        this.showAlertMsg(ERROR_RECORD_LENGTH, ERROR)
                        return
                    }
                    user.recorder.stop().getMp3().then(([buffer, blob]) => {
                        const audioFile = new File(buffer, 'music.mp3', {type: blob.type, lastModified: Date.now()})
                        const formData = new FormData()
                        formData.append('audio', audioFile)
                        axios.post(`/${domain.id}/pvt/${id}/upload-audio`, formData).then(res => {
                            this.sendToUser(res.data)
                        }).catch(err => {
                            this.showAlertMsg(ERROR_UPLOAD_FAILED, ERROR)
                        })
                    }).catch((e) => {
                        this.showAlertMsg(ERROR_RECORDING_FAILED, ERROR)
                    })
                    user.isRecording = false
                    clearInterval(user.interval)
                    user.remainingTime = RECORDING_TIME
                }
            },
            uploadPvtImage(id, event) {
                const user = this.pvtUsers.find(user => user.id === id)
                if (!user.private || !permission.private) {
                    this.showAlertMsg('You can\'t private to this user', ERROR)
                    return
                }
                this.showLoader = true
                const formData = new FormData()
                const file = event.target.files[0]
                const pattern = /image-*/
                if (file == null || file.type === UNDEFINED) return
                if (!file.type.match(pattern)) {
                    this.showAlertMsg(ERROR_INVALID_FILE_FORMAT, ERROR)
                    this.showLoader = false
                    return
                }
                formData.append("image", file)
                axios.post(`/${domain.id}/pvt/${id}/upload-image`, formData).then(res => {
                    this.sendToUser(res.data)
                    this.showLoader = false
                }).catch(e => {
                    this.showLoader = false
                    this.showAlertMsg(ERROR_UPLOAD_FAILED, ERROR)
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
                        user.remainingTime = RECORDING_TIME
                        user.recorder = new MicRecorder({bitrate: 80})
                        user.interval = null
                    })
                    this.setPvtNotifiCount()
                }).catch(e => {
                })
            },
            openRoomsModal() {
                if (mobile.matches) this.showLeft = false
                axios.get(`/${domain.id}/rooms`).then(res => this.showFullModal(roomModalHtml(res.data)))
            },
            openMessageModal() {
                this.showFullModal(messageModalHtml(this.pvtUsers))
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
            openReportsModal() {
                this.showFullModal(reportModalHtml(this.reports))
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
                        html += renderReportChatMessage(res.data, reportId, targetId, roomId, type)
                        this.showSmallModal(html)
                    }).catch(e => {
                        if (e.response) {
                            if (e.response.status === 404) {
                                this.showAlertMsg(e.response.data, ERROR)
                                const formData = new FormData()
                                formData.append('domainId', domain.id)
                                axios.delete(`/${domain.id}/reports/${reportId}/delete`, {data: formData})
                            }
                            return
                        }
                        this.showAlertMsg('Something went wrong', ERROR)
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
            openNewsModal() {
                if (mobile.matches) this.showLeft = false
                this.showFullModal(newsModalHtml(this.news.news))
                this.newsUnreadCount !== 0 &&
                axios.post(`/${domain.id}/news/read`).then(() => this.newsUnreadCount = this.news.unReadCount = 0)
            },
            writeNewsDialog() {
                if (!permission.writeNews) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                this.showSmallModal(writeNewsDialogHtml())
            },
            delNews(newsId) {
                if (!permission.delNews) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                axios.delete(`/${domain.id}/news/${newsId}/delete`).then(() => {
                    this.showAlertMsg(NEWS_DELETED, SUCCESS)
                    this.news.news = this.news.news.filter(news => news.id !== newsId)
                    this.openNewsModal()
                }).catch(e => this.showAlertMsg(getErrorMsg(e), ERROR))
            },
            changeUserNameDialog() {
                if (!permission.userName) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                this.showSmallModal(changeUserNameHtml())
            },
            changeUserName() {
                if (!permission.userName) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                if (name.length < 4 || name.length > 12) {
                    this.showAlertMsg(ERROR_NAME_INVALID, ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('name', this.u.name)
                axios.post(`/${domain.id}/users/${this.u.id}/update-name`, formData).then(() =>
                    this.showAlertMsg(NAME_HAS_BEEN_CHANGED, SUCCESS)
                ).catch(e => this.showAlertMsg(getErrorMsg(e), ERROR))
                this.showUserProfile = false
                this.closeSmallModal()
            },
            changeUserAvatarDialog() {
                if (!permission.avatar) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                this.showSmallModal(changeUserAvatarHtml())
            },
            setUserAvatar(index) {
                if (!permission.avatar) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                this.showLoader = true
                const data = new FormData()
                data.append('avatar', avatars[index])
                axios.put(`/${domain.id}/users/${this.u.id}/update-default-avatar`, data).then(res => {
                    this.showLoader = false
                    this.showAlertMsg(AVATAR_HAS_BEEN_CHANGED, SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    this.showAlertMsg(getErrorMsg(e), ERROR)
                })
                this.showUserProfile = false
                this.closeSmallModal()
            },
            changeUserAvatar(el) {
                if (!permission.avatar) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                this.showLoader = true
                const formData = new FormData()
                const file = el.files[0]
                const pattern = /image-*/
                if (file == null || file.type === UNDEFINED) return
                if (!file.type.match(pattern)) {
                    this.showLoader = false
                    this.showAlertMsg(ERROR_INVALID_FILE_FORMAT, ERROR)
                    return
                }
                formData.append('avatar', file)
                axios.post(`/${domain.id}/users/${this.u.id}/update-avatar`, formData).then(() => {
                    this.showLoader = false
                    this.showAlertMsg(AVATAR_HAS_BEEN_CHANGED, SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    this.showAlertMsg(getErrorMsg(e), ERROR)
                })
                this.showUserProfile = false
                this.closeSmallModal()
            },
            actionMute() {
                if (!permission.mute) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                this.u.muted ? axios.post(`/user/${this.u.id}/mute`).catch(() => this.u.muted = false)
                    : axios.post(`/user/${this.u.id}/unmute`).catch(() => this.u.muted = true)
            },
            kickUser(id) {
                if (!permission.kick) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                axios.post(`/user/${id}/kick`)
            },
            banUser(id) {
                if (!permission.ban) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                axios.post(`/user/${id}/ban`)
            },
            textArea(el, height) {
                el.style.height = `${height}px`
                el.style.height = `${el.scrollHeight}px`
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
                    this.showAlertMsg(res.data, SUCCESS)
                }).catch(e => {
                    this.showLoader = false
                    if (e.response) this.errors = e.response.data
                })
            },
        }
    })

    Alpine.data('announcement', () => {
        return {
            content: EMPTY_STRING,
            image: EMPTY_STRING,
            init() {
                this.$nextTick(()=>this.$refs.newsInput.focus())
            },
            addImage(el) {
                const reader = new FileReader()
                reader.onload = e => this.image = e.target.result
                reader.readAsDataURL(el.files[0])
            },
            writeNews() {
                const input = this.$refs.input
                if (!permission.writeNews) {
                    this.showAlertMsg(ERROR_PERMISSION_DENIED, ERROR)
                    return
                }
                if (this.content === EMPTY_STRING) {
                    this.showAlertMsg('Content cannot be empty', ERROR)
                    return
                }
                const formData = new FormData()
                formData.append('content', this.content)
                if (this.image !== EMPTY_STRING) formData.append('image', input.files[0])
                axios.post(`/${domain.id}/news/create`, formData).then(() => {
                    this.closeSmallModal()
                    this.showAlertMsg(NEWS_CREATED, SUCCESS)
                    this.getNews(() => {
                        this.openNewsModal()
                    })
                }).catch(e => this.showAlertMsg(getErrorMsg(e), ERROR))
            }
        }
    })
})

Alpine.start()


/**
 * Global functions
 * */
function renderReportChatMessage(message, id, targetId, roomId, type) {
    const image = message.image ? `<img @click="showImageDialog($el)" src="${message.image}" alt="" class="lobby-image">` : ''
    const audio = message.audio ? `<audio preload="auto" controls controlslist="nodownload noplaybackrate" class="w-[250px]"><source src="${message.audio}" type="audio/mpeg"></audio>` : ''
    message.content = appendEmojis(message.content)
    return `
    <div class="p-4">
        <li class="chat-wrap mb-4" style="border: none">
            <div class="flex py-1 px-2 w-full" >
                <img @click="getUserProfile(${message.user.id})" class="w-[36px] h-[36px] rounded-full flex-none cursor-pointer" src="${message.user.avatar}">
                <div class="ml-2 flex-1 ">
                    <div class="flex justify-between">
                        <p class="username clip "> ${message.user.name}</p>
                        <div class="flex items-center gap-2 mr-2">
                            <p class="date">${message.createdAt}</p>
                        </div>
                    </div>
                    <div class="pr-2">${image} ${audio}
                        <p class="chat clip text-start">${message.content}</p>
                    </div>
                </div>
           </div>
        </li> 
        <button @click="takeAction(${id}, ${targetId},${roomId}, '${type}')" class="btn btn-skin text-center">Take Action<button>
        <button @click="noAction(${id}, '${type}')" class="btn btn-disabled text-center ml-2">No Action<button>
    </div></div>`
}

function renderWelcomeMessage() {
    const topic = room.topic.replace(/%ROOM%/g, room.name)
    return `
         <li id="topic" class="w-full flex justify-center !bg-skin-primary/10 relative">
             <i @click="removeTopic" class="cursor-pointer fa-solid fa-circle-xmark absolute text-sm text-skin-primary top-2 right-4"></i>
             <div class="flex py-4 px-2 w-full">
                <img class="w-[32px] h-[32px] mt-0.5 rounded-lg flex-none" src="images/defaults/topic.webp" alt="">
                <div class="ml-2 flex-1 ">
                    <p class="username ml-1 mb-1">Topic</p>
                    <p class="chat text-skin-hover px-1 pr-2">
                        <span class="tag mr-1">${name}</span> ${topic}
                    </p>  
                </div>
            </div>
        </li>
    `
}

function renderJoinMessage(message) {
    return `
         <li class="w-full flex justify-center border-t border-gray-200">
            <div class="p-1" @click="welcomeMessage(\'${message.user.name}\')">
               <p class="rounded-md px-4 py-1 text-white bg-skin-primary text-[12px]"><b class="cursor-pointer">${message.user.name}</b> has joined the room.</p>
            </div>
        </li>
    `
}

function renderLeaveMessage(message) {
    return `
         <li class="w-full flex justify-center border-t border-gray-200">
            <div class="p-1">
               <p class="px-4 py-1 text-gray-800 text-[12px]">${message.user.name} has left the room.</p>
            </div>
        </li>
    `
}

function renderChatMessage(message) {
    const image = message.image ? `<img @click="showImageDialog($el)" src="${message.image}" alt="" class="lobby-image">` : EMPTY_STRING
    const audio = message.audio ? `<audio preload="auto" controls controlslist="nodownload noplaybackrate" class="w-[250px]"><source src="${message.audio}" type="audio/mpeg"></audio>` : EMPTY_STRING
    const gender = message.user.gender === 'Male' ? 'male' : 'female'
    const bold = message.user.textBold ? ' font-bold' : ' font-normal'
    const delIcon = permission.delMsg ? `<i @click="deleteChat(${message.id})" class="fa-solid fa-square-xmark icon-sm"></i>` : EMPTY_STRING
    message.content = appendEmojis(message.content)
    message.content = message.content.replace(RegExp(`${name}`, 'gi'), `<span class="tag">${name}</span>`)
    return `
         <li id="chat-${message.id}" class="chat-wrap">
           <div class="flex py-1 px-2 w-full" >
            <img @click="getUserProfile(${message.user.id})" class="avatar flex-none cursor-pointer ${gender}" src="${message.user.avatar}">
                <div class="ml-2 flex-1 ">
                <div class="flex justify-between">
                    <div class="inline-flex items-center gap-0.5">
                        <img class="rank-icon-sm" src="${message.user.rank.icon}" alt="" title="${message.user.rank.name}">
                        <p @click="appendUserName($el)" class="username clip ${message.user.nameColor} ${message.user.nameFont}"> 
                            ${message.user.name}
                        </p>
                    </div>
                    <div class="flex items-center gap-2 mr-2">
                        <p class="date">${message.createdAt}</p>
                        <i @click="reportDialog(${message.id}, 1)" class="fa-solid fa-font-awesome icon-sm"></i> ${delIcon}
                    </div>
                </div>
                <div class=" px-1 pr-2">${image} ${audio}
                    <p class="chat clip ${message.user.textColor} ${message.user.textFont} ${bold} ">
                        ${message.content}
                    </p>
                </div>
            </div>
           </div>
         </li>
    `
}

function getEmojisHtml() {
    let head = '<div class="emo-head">'
    let emos = ''
    emojis.forEach((emoji, index) => {
        emos += `<div x-show="emoTab === ${index}"  class="emojis">`
        Object.keys(emoji).forEach(key => {
            if (key === 'head') head += `<img @click="emoTab=${index}" class="head" src="${emoji[key]}" :class="[emoTab==${index}?'active': '']" alt="${key}">`
            else emos += `<img @click="addMainEmo('${key}')" class="emoticon" src="${emoji[key]}" alt="${key}"> `
        })
        emos += '</div>'
    })
    head += '</div>'
    return head + emos
}

function pvtEmojisHtml() {
    let head = '<div class="emo-head">'
    let emos = ''
    emojis.forEach((emoji, index) => {
        emos += `<div x-show="pvtEmoTab == ${index}" class="pvt-emojis">`
        Object.keys(emoji).forEach(key => {
            if (key === 'head') head += `<img @click="pvtEmoTab=${index}" class="head" src="${emoji[key]}" :class="[pvtEmoTab===${index}?'active': '']" alt="${key}">`
            else emos += `<img @click="addPvtEmo('${key}');showPvtEmo=false" class="emoticon" src="${emoji[key]}" alt="${key}"> `
        })
        emos += '</div>'
    })
    head += '</div>'
    return head + emos
}

function appendEmojis(content) {
    if (content === '') return content
    let result = ''
    const words = content.split(" ")
    words.forEach(word => {
        if (word.startsWith(':')) {
            let src = getEmoSource(word)
            if (src !== null) result += `<img class="emoticon" src="${src}">`
            else result += ` ${word}`
        } else result += ` ${word}`
    })
    return result
}

function getEmoSource(name) {
    let src = null
    emojis.forEach(emoji => {
        Object.keys(emoji).forEach(function (key) {
            if (key === name) src = emoji[key]
        })
    })
    return src
}

function dragElement(el, id) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    if (document.getElementById(`pvt-header-${id}`)) {
        document.getElementById(`pvt-header-${id}`).onmousedown = dragMouseDown
    } else {
        el.onmousedown = dragMouseDown
    }

    function dragMouseDown(e) {
        e = e || window.event
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    function elementDrag(e) {
        e = e || window.event
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        el.style.top = (el.offsetTop - pos2) + "px"
        el.style.left = (el.offsetLeft - pos1) + "px"
    }

    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
    }
}

function ucgPolicyHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Information</p>
                <i @click="closeUGCPolicy" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <i class="fa-solid fa-triangle-exclamation text-[70px]" ></i>
                <p class="text-lg font-bold ">Do Not Spam / Abuse</p>
                <p class="pt-2 text-[14px] text-left">To improve our chat room app we use UGC Policy to control abusive chat.</p>
                <p class="pt-2 text-[14px] text-left">Our automatic abuse detection system can mark your message as spam and block or mute your account immediately.</p>
            </div>
        </div>
    `
}

function guestDialogHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-end items-center">
                <i @click="closeSmallModal; $refs.mainInput.focus()" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4 text-center ">
               <img class="w-20 h-20 mx-auto" src="/images/defaults/happy.webp" alt=""> 
                <p class="mt-2 text-2xl font-bold">Welcome ${name}</p>
                <p class="mt-2 text-[13px] leading-[15px]">You are currently logged in as guest. Click here to register your account in order to access more features.</p>
                <div class="text-center flex gap-2 justify-center mt-2"> 
                    <button @click="closeSmallModal; $refs.mainInput.focus()" class="px-2 btn btn-disabled text-center">Close</button>
                    <button @click="showGuestRegisterDialog" class="px-2 btn btn-skin text-center">Register</button>
                </div> 
            </div>
        </div>
    `
}

function guestRegisterHtml() {
    return `
        <div x-data="guestRegister" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Register</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4 text-left">
                <form class="w-full" @submit.prevent="guestRegister">
                    <div x-show="errors.default" x-text="errors.default" class="error-default"></div>
                    <div class="mb-4">
                        <div class="h-10">
                            <label class="h-full">
                                <input x-model="email" name="email"  class="input-text"
                                       type="email" placeholder="Email Address" autoComplete="off" required>
                            </label>
                        </div>
                       <div x-show="errors.email" x-text="errors.email" class="error-text"></div> 
                    </div>
                    <div class="mb-4">
                        <div class="h-10">
                            <label class="h-full">
                                <input x-model="password" name="password"  class="input-text"
                                       type="password" placeholder="Password" autoComplete="off" required >
                            </label>
                        </div>
                        <div x-show="errors.password" x-text="errors.password" class="error-text"></div>
                    </div>
                    <div class="text-center"> 
                        <button type="submit" class="w-36 btn btn-skin text-center">Register</button>
                    </div>  
                </form>
            </div>
        </div>`
}

function logoutHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Logout</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="px-4 py-2">
                <p class="text-[14px] mb-2">Are you really want to log out?</p>  
                <div class="flex gap-2 justify-center">
                    <button @click="logout" class=" text-center outline-none bg-skin-hover/20 text-skin-hover font-bold rounded-md text-sm py-1 px-5">Yes<button>          
                    <button @click="closeSmallModal" class=" text-center outline-none bg-skin-hover/20 text-skin-hover font-bold rounded-md text-sm py-1 px-5">No<button>          
                </div>
            </div>
        </div>
    `;
}

function changeAvatarHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Avatar</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                Select an image
                <div class="w-full mt-1 mb-2 grid grid-cols-5 space-y-2 max-h-[150px] overflow-y-auto scrollbar">
                  <template x-for="(avatar, index) in avatars " :key="index">
                      <div class="w-[50px] h-[50px] relative">
                        <img @click="setAvatar(index)" class="w-full h-full rounded-full cursor-pointer" :src="avatar" alt="" src=""> 
                      </div>
                  </template>
                </div> 
                Or 
                <div class="mt-1">
                    <input x-ref='uploadAvatar' @change="changeAvatar($el)" class="input-image" type="file"
                               accept="image/*">
                    <button @click="$refs.uploadAvatar.click()" class="w-36 btn btn-skin text-center">Upload<button>
                </div>  
            </div>
        </div>
    `
}

function changeNameHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Username</p>
                <i @click="closeNameDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="h-10 mb-4">
                    <label class="h-full">
                        <input x-model="user.name" name="name" onkeypress="return /^[a-zA-Z\\d_-]*$/i.test(event.key)"
                               class="input-text" type="text" placeholder="Username"
                               autocomplete="off" required minlength="4" maxlength="12" autofocus>
                    </label> 
                </div>    
                <button @click="changeName" class="w-36 btn btn-skin text-center">Change<button>
            </div>
        </div>
    `;
}

function customizeNameHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Customize Username</p>
                <i @click="closeCustomizeNameDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <template x-if="user.nameFont"> 
                    <p class="w-full font-bold clip" :class="[user.nameFont, user.nameColor]" x-text="user.name"></p>
                </template>
                <template x-if="permission.nameFont"> 
                    <div class="w-full h-10 mb-4">
                    <select x-model="user.nameFont" class="input-text">
                        <option>Select Font</option>
                        <option value="signika">Signika</option>
                        <option value="grandstander">Grandstander</option>
                        <option value="comic">Comic</option>
                        <option value="orbitron">Orbitron</option>
                        <option value="quicksand">Quicksand</option>
                        <option value="lemonada">Lemonada</option>
                        <option value="grenze">Grenze</option>
                        <option value="kalam">Kalam</option>
                        <option value="merienda">Merienda</option>
                        <option value="amita">Amita</option>
                        <option value="averia">Averia</option>
                        <option value="turret">Turret</option>
                        <option value="sansita">Sansita</option>
                        <option value="comfortaa">Comfortaa</option>
                        <option value="charm">Charm</option>
                        <option value="lobste">Lobster</option>
                    </select>
                </div>
                </template>
                 <template x-if="permission.nameColor"> 
                    <div class="w-full mb-4 grid grid-cols-7 space-y-1 space-x-1 max-h-[150px] overflow-y-auto scrollbar">
                      <template x-for="(color, index) in bgColors " :key="index">
                        <div @click="setNameColor(index)" class="h-6 w-10 cursor-pointer flex items-center justify-center" :class="color">
                            <i x-show="isShowTickForName(index)" x-transition class="fa-solid fa-check text-white text-center top-0 left-0"></i>
                        </div>
                      </template>
                    </div>   
                </template>
                <button @click="customizeName" class="w-36 btn btn-skin text-center">Change<button>
            </div>
        </div>
    `
}

function changeMoodHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Your Mood</p>
                <i @click="closeMoodDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="h-10 mb-4">
                    <label class="h-full">
                        <input x-model="user.mood" name="mood" onkeypress="return /^[a-zA-Z\\d_-\\s]*$/i.test(event.key)"
                               class="input-text" type="text" placeholder="Type mood here"
                               autocomplete="off" required maxlength="40" autofocus>
                    </label>
                </div> 
                <button @click="changeMood" class="w-36 btn btn-skin text-center">Change<button>
            </div>
        </div>
    `
}

function changeAboutHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change About Me</p>
                <i @click="closeAboutDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="mb-4">
                    <textarea @keyup="textArea($el, 60)" class="text-area" x-model="user.about" type="text" maxlength="150" name="about" autofocus></textarea>
                </div>
                <button @click="changeAbout" class="w-36 btn btn-skin text-center">Change<button>
            </div>
        </div>
    `
}

function changePasswordHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Password</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="h-10 mb-4">
                    <label class="h-full">
                        <input x-model="user.password" name="password" class="input-text" type="text" 
                        placeholder="New password" autocomplete="off" autofocus>
                    </label>
                </div> 
                <button @click="changePassword" class="w-36 btn btn-skin text-center">Change<button>
            </div>   
        </div>
    `
}

function changeStatusHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Status</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="w-full h-10 mb-4">
                    <select x-model="user.status" class="input-text">
                        <option value="" selected>Select Status</option>
                        <option value="Stay">Stay</option>
                        <option value="Online">Online</option>
                        <option value="Away">Away</option>
                        <option value="Busy">Busy</option>
                        <option value="Eating">Eating</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Singing">Singing</option>
                        <option value="Listening">Listening</option>
                    </select>
                </div>
                <button @click="changeStatus" class="w-36 btn btn-skin text-center">Change<button>
            </div>
        </div>
   `
}

function changeGenderHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Gender</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div>
            <div class="p-4">
                <div class="w-full h-10 mb-4">
                    <select x-model="user.gender" class="input-text">
                        <option value="" selected="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <button @click="changeGender" class="w-36 btn btn-skin text-center">Change<button>
            </div>
        </div>
   `
}

function changeDobHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Date of Birth</p>
                <i @click="closeDobDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div>
            <div class="p-4">
                <div class="w-full h-10 mb-4">
                    <input x-model="user.dob" class="input-text"  name="dob" max="2010-12-31" min="1970-12-31" type="date">
                </div>
                <button @click="changeDob" class="w-36 btn btn-skin text-center">Change<button>
            </div>
        </div>
    `
}

function customizeTextHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Chat Option</p>
                <i @click="closeCustomizeTextDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div>
            <div class="p-4">
                <template x-if="user.textFont"> 
                    <p class="w-full clip" :class="[user.textFont, user.textColor, user.textBold=='true' ? 'font-bold' : 'font-normal' ]">Sample Text</p>
                </template>    
                <div class="w-full h-10 mb-4">
                    <select @change="console.log($el.value)" x-model="user.textFont" class="input-text">
                        <option>Select Font</option>
                        <option value="signika">Signika</option>
                        <option value="grandstander">Grandstander</option>
                        <option value="comic">Comic</option>
                        <option value="orbitron">Orbitron</option>
                        <option value="quicksand">Quicksand</option>
                        <option value="lemonada">Lemonada</option>
                        <option value="grenze">Grenze</option>
                        <option value="kalam">Kalam</option>
                        <option value="merienda">Merienda</option>
                        <option value="amita">Amita</option>
                        <option value="averia">Averia</option>
                        <option value="turret">Turret</option>
                        <option value="sansita">Sansita</option>
                        <option value="comfortaa">Comfortaa</option>
                        <option value="charm">Charm</option>
                        <option value="lobster">Lobster</option>
                    </select>
                </div>
                <p class="text-left font-bold text-[12px]">Text Bold</p>
                <div class="w-full h-10 mb-2">
                    <select x-model="user.textBold" class="input-text">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <p class="text-left font-bold text-[12px]">Text Color</p>
                <div class="w-full mb-4 grid grid-cols-7 space-y-1 space-x-1 max-h-[150px] overflow-y-auto scrollbar">
                  <template x-for="(color, index) in bgColors " :key="index">
                    <div @click="setTextColor(index)" class="h-6 w-10 cursor-pointer flex items-center justify-center" :class="color">
                        <i x-show="isShowTick(index)" x-transition class="fa-solid fa-check text-white text-center top-0 left-0"></i>
                    </div>
                  </template>
                </div>
                <button @click="customizeText" class="w-36 btn btn-skin text-center">Change<button>
            </div>
        </div>
    `
}

function reportDialogHtml(id, type) {
    return `
        <div x-data="{ id: ${id}, selectedReason :'', reasons:['Abusive Language','Spam Content','Inappropriate Content', 'Sexual Harashment']}"
         class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
            <div class="inline-flex items-center"> 
                <i class="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
                <p class="ml-2 text-md font-bold ">Report This Content</p>
            </div>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <p class="mb-4 text-[13px] text-start leading-[15px]">Please only submit actionable offences. Abuse or false reporting may lead to action taken against your own account. Select the reason to report this content.</p>
                <template x-for="(reason, index) in reasons" :key="index"> 
                     <div class="flex gap-2 items-center text-[13px] font-bold">
                        <i @click="selectedReason = reason" class="cursor-pointer text-[15px]" 
                        :class="selectedReason === reason? 'fa-solid fa-circle-check text-green-500':'fa-regular fa-circle' "></i>
                        <p x-text="reason"></p>
                    </div>
                </template>
                <button @click="report(id, selectedReason, '${type}')" class="w-36 btn btn-skin text-center mt-2">Report<button>
            </div>
        </div>
    `
}

function messageModalHtml(pvtUsers) {
    let html = `
        <div class="text-skin-on-primary h-full">
            <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                <p class="text-md font-bold ">Messages</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-[10px]">
                <ul class="h-full ">
    `
    if (pvtUsers.length > 0) {
        pvtUsers.forEach(user => {
            let count = user.unReadCount > 0 ? `<p class="count-md">${user.unReadCount}</p>` : EMPTY_STRING
            const message = user.messages[0]
            const person = (message != null && message.sender.id === userId) ? 'You : ' : `${user.name} : `
            let content = message != null ? appendEmojis(message.content) : EMPTY_STRING
            if (message.image && content === EMPTY_STRING) content += '(Image)'
            if (message.audio && content === EMPTY_STRING) content += '(Audio)'
            content = person + content
            html += `
                <li @click="openPvtDialog(${user.id})" class="pvt-user-wrap">
                   <div class="w-full gap-2">
                        <div class="flex h-full w-full items-center">
                            <img class="avatar flex-none mx-1" src="${user.avatar}">
                            <div class="flex-1 px-1 whitespace-nowrap overflow-hidden flex flex-col justify-center">
                                <p class="ellipsis username clip ${user.nameColor} ${user.nameFont}"> ${user.name}
                                <p class="flex items-center clip ellipsis text-gray-500 text-[12px]">${content}</p>
                            </div>${count}
                        </div>
                    </div>
                </li>
            `
        })
    } else {
        html += `
            <li class="pvt-user-wrap">
               <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                    <i class="fa-solid fa-envelope text-[40px]"></i>
                    <p class="text-[12px] font-bold" > No Messages</p>
                </div>
            </li>
        `
    }
    html += '</ul></div></div>'
    return html
}

function changeUserNameHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Username</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div>
            <div class="p-4">
                <div class="h-10 mb-4">
                    <label class="h-full">
                        <input x-model="u.name" name="name" onkeypress="return /^[a-zA-Z\\d_-]*$/i.test(event.key)"
                               class="input-text" type="text" placeholder="Username"
                               autocomplete="off" required minlength="4" maxlength="12" autofocus>
                    </label> 
                </div>    
                <button @click="changeUserName" class="w-36 btn btn-skin text-center">Change<button>
            </div>
        </div>
    `
}

function changeUserAvatarHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Avatar</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                Select an image
                <div class="w-full mt-1 mb-2 grid grid-cols-5 space-y-2 max-h-[150px] overflow-y-auto scrollbar">
                  <template x-for="(avatar, index) in avatars " :key="index">
                      <div class="w-[50px] h-[50px] relative">
                        <img @click="setUserAvatar(index)" class="w-full h-full rounded-full cursor-pointer" :src="avatar" alt=""> 
                      </div>
                  </template>
                </div> 
                Or 
                <div class="mt-1">
                    <input x-ref='uploadUserAvatar' @change="changeUserAvatar($el)" class="input-image" type="file" accept="image/*">
                    <button @click="$refs.uploadUserAvatar.click()" class="w-36 btn btn-skin text-center">Upload<button>
                </div>  
            </div>
        </div>
   `
}

function reportModalHtml(reports) {
    let html = `
        <div class="text-skin-on-primary h-full">
            <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                <p class="text-md font-bold ">Reports</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-[10px]">
                <ul class="h-full ">
    `
    if (reports.length > 0) {
        reports.forEach((report) => {
            html += `
                <li @click="openReportActionDialog(${report.id}, ${report.targetId}, ${report.roomId}, '${report.type}')" class="report-user-wrap">
                   <div class="w-full gap-2">
                        <div class="flex h-full w-full items-center">
                            <img class="avatar flex-none mx-1" src="${report.avatar}">
                            <div class="flex-1 px-1 whitespace-nowrap overflow-hidden flex flex-col justify-center">
                                <p class="ellipsis username clip text-black"> ${report.name}
                                <p class="flex items-center clip ellipsis text-gray-500 text-[13px]">Reason : ${report.reason}</p>
                                <p class="date">${report.createdAt}</p>
                            </div>
                        </div>
                    </div>
                </li>
            `
        })
    } else {
        html += `
            <li class="pvt-user-wrap">
               <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                    <i class="fa-solid fa-flag text-[40px]"></i>
                    <p class="text-[12px] font-bold" > No Reports</p>
                </div>
            </li>
        `
    }
    html += '</ul></div></div>'
    return html
}

function roomModalHtml(rooms) {
    let html = `
        <div class="text-skin-on-primary h-full">
            <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                <p class="text-md font-bold ">Room List</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-[10px]">
                <ul class="h-full">
    `
    rooms.forEach((rm, index) => {
        const submitBtn = rm.id === room.id ?
            '<p class="text-black text-[10px] font-bold">(Current Room)</p>' :
            `<form class="flex-none" action="/${domain.id}/rooms/${rm.id}/join" method="post">
                <button type="submit" class="btn-join">Join&nbsp&nbsp<i class="fa-solid fa-angles-right"></i></button>
            </form>`
        html += `
            <li class="my-2 px-2 py-1 border border-gray-200 flex items-center rounded shadow-md shadow-black/5 ">
                <i class="fa-solid fa-earth-americas text-3xl flex-none text-skin-hover"></i>
                <div class="flex-1 text-left ml-2 text-black">
                    <p class="font-bold text-[12px]">${rm.name}</p>
                    <div>
                        <i class="fa-solid fa-user-group "></i>&nbsp&nbsp${rm.onlineUsers}
                    </div>
                </div>${submitBtn}
            </li>
        `
    })
    html += `</ul></div></div>`
    return html
}

function newsModalHtml(news) {
    let addNew = permission.writeNews ?
        '<button @click="writeNewsDialog" class="flex-none mx-auto my-2 btn-sm btn-skin"><i class="fa-solid fa-pen-to-square"></i>&nbsp;&nbsp;Add New</button>' : EMPTY_STRING
    let html = `
        <div x-data="{image:'hello'}" class="flex flex-col text-skin-on-primary h-full w-full text-center">
            <div class="sticky px-4 py-1 flex justify-between items-center bg-skin-hover/90 flex-none">
                <p class="text-md font-bold ">Announcements</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div>
            <div class="p-[10px] flex-1 relative">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">${addNew}
                    <ul>
        `
    if (news.length > 0) {
        news.forEach(news => {
            let user = news.user
            let fontStyle = user.textBold ? 'font-bold' : 'font-normal'
            let image = news.image != null ? `<img @click="showImageDialog($el)" src="${news.image}" alt="" class="w-full mt-2 cursor-pointer">` : ''
            let content = news.content.replaceAll('\r\n', '<br>')
            html += `
                <li class="card-wrap" xmlns="http://www.w3.org/1999/html">
                   <div class="flex flex-col w-full">
                       <div class="flex items-center justify-between"> 
                           <div class="flex items-center gap-2">
                               <img @click="getUserProfile(${user.id})" class="avatar flex-none cursor-pointer" src="${user.avatar}" alt="">
                               <p class="username clip ${user.nameColor} ${user.nameFont}">${user.name}</p>
                           </div>  
                           <div class="flex items-center gap-2">
                                <p class="date">${news.createdAt}</p>
                                <i @click="delNews(${news.id})" class="fa-solid fa-trash-can icon-sm"></i>
                           </div>                       
                       </div>
                       <div class="text-start mt-2">
                           <p class="chat clip ${user.textColor} ${fontStyle} ${user.textFont}">${content}</p>${image}
                       </div>  
                   </div>
                </li>
            `
        })
    } else {
        html += `
            <li class="card-wrap">
               <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                    <img class="w-[40px]" src="/images/defaults/announcement.webp" alt="">
                    <p class="text-[12px] font-bold" > No Announcements</p>
                </div>
            </li>
       `
    }
    html += `</ul></div></div></div>`
    return html
}

function writeNewsDialogHtml() {
    return `
        <div x-data="announcement" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Write Announcement</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="mb-4">
                   <textarea x-ref="newsInput" @keyup="textArea($el, 120)" class="text-area h-[120px]" x-model="content" type="text" 
                        maxlength="3000" placeholder="write announcement"></textarea>
                   <template x-if="image"> <img :src="image" class="h-20" alt=""></template>
                   <input x-ref="input" @change="addImage($el)" type="file" name="image" class="hidden">
                </div>
                <div class="flex justify-end gap-2 items-center"> 
                 <img @click="$refs.input.click()" src="/images/defaults/picture.webp" class="w-6 h-6" alt=""> 
                 <button @click.once="writeNews" class="btn btn-skin text-center">Post<button>
                </div>
            </div>
        </div>
    `
}

/**
 * Utility Functions
 * */
function getErrorMsg(e) {
    return e.response ? e.response.data : ERROR_SOMETHING_WENT_WRONG
}



