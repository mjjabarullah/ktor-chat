"use strict"

import Alpine from 'alpinejs'

window.axios = require('axios')
window.Alpine = Alpine

const MicRecorder = require('mic-recorder-to-mp3')
const MessageType = {
    Join: 'Join', Chat: 'Chat', Leave: 'Leave', Delete: 'Delete', Report: 'Report', ActionTaken: 'ActionTaken'
}
const Status = {Stay: 'Stay', Online: 'Online', Away: 'Away', Busy: 'Busy'}
const ReportType = {Chat: 'Chat', PvtChat: 'PvtChat', NewsFeed: 'NewsFeed'}
const textColors = ['red', 'red-1', 'red-2', 'red-3', 'orange', 'orange-1', 'orange-2', 'orange-3', 'amber', 'amber-1', 'amber-2', 'amber-3', 'yellow', 'yellow-1', 'yellow-2', 'yellow-3', 'lime', 'lime-1', 'lime-2', 'lime-3', 'green', 'green-1', 'green-2', 'green-3', 'emerald', 'emerald-1', 'emerald-2', 'emerald-3', 'teal', 'teal-1', 'teal-2', 'teal-3', 'cyan', 'cyan-1', 'cyan-2', 'cyan-3', 'sky', 'sky-1', 'sky-2', 'sky-3', 'blue', 'blue-1', 'blue-2', 'blue-3', 'indigo', 'indigo-1', 'indigo-2', 'indigo-3', 'violet', 'violet-1', 'violet-2', 'violet-3', 'purple', 'purple-1', 'purple-2', 'purple-3', 'fuchsia', 'fuchsia-1', 'fuchsia-2', 'fuchsia-3', 'pink', 'pink-1', 'pink-2', 'pink-3', 'rose', 'rose-1', 'rose-2', 'rose-3', 'slate', 'slate-1', 'slate-2', 'slate-3', 'gray', 'gray-1', 'gray-2', 'gray-3', 'zinc', 'zinc-1', 'zinc-2', 'zinc-3', 'stone', 'stone-1', 'stone-2', 'stone-3', 'black']
const bgColors = ['b-red', 'b-red-1', 'b-red-2', 'b-red-3', 'b-orange', 'b-orange-1', 'b-orange-2', 'b-orange-3', 'b-amber', 'b-amber-1', 'b-amber-2', 'b-amber-3', 'b-yellow', 'b-yellow-1', 'b-yellow-2', 'b-yellow-3', 'b-lime', 'b-lime-1', 'b-lime-2', 'b-lime-3', 'b-green', 'b-green-1', 'b-green-2', 'b-green-3', 'b-emerald', 'b-emerald-1', 'b-emerald-2', 'b-emerald-3', 'b-teal', 'b-teal-1', 'b-teal-2', 'b-teal-3', 'b-cyan', 'b-cyan-1', 'b-cyan-2', 'b-cyan-3', 'b-sky', 'b-sky-1', 'b-sky-2', 'b-sky-3', 'b-blue', 'b-blue-1', 'b-blue-2', 'b-blue-3', 'b-indigo', 'b-indigo-1', 'b-indigo-2', 'b-indigo-3', 'b-violet', 'b-violet-1', 'b-violet-2', 'b-violet-3', 'b-purple', 'b-purple-1', 'b-purple-2', 'b-purple-3', 'b-fuchsia', 'b-fuchsia-1', 'b-fuchsia-2', 'b-fuchsia-3', 'b-pink', 'b-pink-1', 'b-pink-2', 'b-pink-3', 'b-rose', 'b-rose-1', 'b-rose-2', 'b-rose-3', 'b-slate', 'b-slate-1', 'b-slate-2', 'b-slate-3', 'b-gray', 'b-gray-1', 'b-gray-2', 'b-gray-3', 'b-zinc', 'b-zinc-1', 'b-zinc-2', 'b-zinc-3', 'b-stone', 'b-stone-1', 'b-stone-2', 'b-stone-3', 'b-black']
const avatars = ['/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp', '/images/avatars/guest.webp', '/images/avatars/user.webp',]
const emojis = [easy, modern, easy, modern]
const RECORDING_TIME = 180

document.addEventListener('alpine:init', () => {

    Alpine.data('chat', () => ({
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
                rankCode: rankCode,
                rankName: rankName,
                rankIcon: rankIcon,
            },
            u: {},
            bgColors: bgColors,
            avatars: avatars,
            statusColor: '',
            userStatusColor: '',
            emoTab: 0,
            register: {
                email: '',
                password: '',
                errors: {}
            },
            roomSocket: new WebSocket(`wss://${location.host}/chatroom/${roomId}`),
            userSocket: new WebSocket(`wss://${location.host}/member/${userId}`),
            onlineUsers: [],
            offlineUsers: [],
            pvtUsers: [],
            rooms: [],
            reports: [],
            pvtNotificationCount: 0,
            reportNotificationCount: 0,
            notificationCount: 0,
            isRecording: false,
            remainingTime: RECORDING_TIME,
            init() {

                this.recorder = new MicRecorder({bitrate: 80})

                this.getEmojis()

                this.getMessages()

                this.reCheckPvtMessages()

                this.getProfile()

                this.setStatusColor()

                this.getReports()

                this.roomSocket.addEventListener('message', (e) => {
                    this.renderMessage(JSON.parse(e.data))
                })

                this.roomSocket.addEventListener('close', (e) => {
                    this.showAlertMsg('Room connection closed', 'error')
                })

                this.userSocket.addEventListener('message', (e) => this.onPvtMessageReceived(e))

                this.userSocket.addEventListener('close', (e) => {
                    this.showAlertMsg('User connection closed', 'error')
                })

                const isUGCShowed = localStorage.getItem('isUGCShowed')
                if (isUGCShowed !== "true") {
                    this.showLoader = false
                    this.showUCGPolicyDialog()
                } else {
                    /*TODO: uncomment this*/
                    /*this.showLoader = true
                    setTimeout(() => {
                        this.showLoader = false
                        this.$refs.mainInput.focus()
                        this.showMessages = true
                    }, 15e2)*/

                    this.$refs.mainInput.focus()
                    this.showMessages = true
                    this.showLoader = false
                }

                this.$watch('user', () => {
                    const user = this.onlineUsers.find(user => user.id === userId)
                    user.name = this.user.name
                    user.mood = this.user.mood
                    user.avatar = this.user.avatar
                    user.nameColor = this.user.nameColor
                    user.nameFont = this.user.nameFont
                    user.gender = this.user.gender
                })
            },
            showSmallModal(html) {
                this.$refs.modalContent.innerHTML = html
                this.showModal = true
            },
            closeSmallModal() {
                this.$refs.modalContent.innerText = ''
                this.showModal = false
            },
            showImgModal(html) {
                this.$refs.imgModalContent.innerHTML = html
                this.showImage = true
            },
            closeImgModal() {
                this.$refs.imgModalContent.innerText = ''
                this.showImage = false
            },
            showFullModal(html) {
                this.$refs.fullModalContent.innerHTML = html
                this.showFulModal = true
            },
            closeFullModal() {
                this.showFulModal = false
                setTimeout(() => {
                    this.$refs.fullModalContent.innerText = ''
                }, 500)
            },
            showUCGPolicyDialog() {
                const html = `
                <div class="text-gray-700 text-center">
                    <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                        <p class="text-md font-bold ">Information</p>
                        <i @click="closeUGCPolicy" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
                    </div> 
                    <div class="p-4">
                        <i class="fa-solid fa-triangle-exclamation clIcons text-[70px]" ></i>
                        <p class="text-lg font-bold ">Do Not Spam / Abuse</p>
                        <p class="pt-2 text-[14px] text-left">To improve our chat room app we use UGC Policy to control abusive chat.</p>
                        <p class="pt-2 text-[14px] text-left">Our automatic abuse detection system can mark your message as spam and block or mute your account immediately.</p>
                    </div>
                </div>
                `
                this.showSmallModal(html)
            },
            closeUGCPolicy() {
                this.closeSmallModal()
                this.showMessages = true
                this.$refs.mainInput.focus()
                localStorage.setItem("isUGCShowed", "true")
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
                switch (this.user.status) {
                    case Status.Online :
                        this.statusColor = 'green'
                        break
                    case Status.Away:
                        this.statusColor = 'yellow'
                        break
                    case Status.Busy :
                        this.statusColor = 'red'
                        break
                }
            },
            setUserStatusColor() {
                switch (this.u.status) {
                    case Status.Online :
                        this.statusColor = 'green'
                        break
                    case Status.Away:
                        this.statusColor = 'yellow'
                        break
                    case Status.Busy :
                        this.statusColor = 'red'
                        break
                }
            },
            getProfile() {
                this.$refs.profileContent.innerHTML = `
            <div class="profile text-gray-700 text-center">
                <div class="flex rounded px-4 py-2 flex bg-skin-hover to-skin-hover text-white items-center relative">
                    <div class="relative flex-none">
                        <i @click="changeAvatarDialog" class="fa-solid fa-camera upload-icon"></i>
                    </div>
                    <img :src="user.avatar" src="" class="avatar" alt="">
                    <div class="flex ml-4 flex-col flex-1 mt-auto">
                        <p class="text-left">
                            <span class="username" x-text="user.name"></span>
                            <i @click="changeNameDialog" class="ml-1 fa-solid fa-pen-to-square cursor-pointer"></i>
                            <i @click="customizeNameDialog" class="ml-1 fa-solid fa-palette cursor-pointer"></i>
                        </p>
                        <div class="flex text-left whitespace-wrap">
                            <p class="mood" x-text="user.mood ? user.mood : 'Add your mood'"></p>
                            <i @click="changeMoodDialog" class="ml-1 fa-solid fa-pen-to-square icon-sm my-auto"></i>
                        </div>
                    </div>
                    <i @click="showProfile=false" class="fas fa-times-circle icon-white"></i>
                </div>
                <template x-if="user.rankCode === 'guest'">
                    <p @click="showGuestRegisterDialog" class="p-2 w-full bg-green-500 text-white text-[12px] cursor-pointer">
                    <i class="fa-solid fa-circle-info"></i> You are currently logged in as guest. Click here to register your account in order to access more features.</p> 
                </template>
                <div class="p-4 text-gray-900 text-left text-[14px]">
                    <p class="font-bold"> About Me
                        <i @click="changeAboutDialog" class="ml-1 fa-solid fa-pen-to-square cursor-pointer"></i></p>
                    <p class="font-normal" x-text="user.about ? user.about : ''"></p>
                    <div class="flex py-1 items-center">
                        <img class="rank-icon" :src="user.rankIcon" alt="" src="">
                        <p class="font-bold text-[16px] ml-4" x-text="user.rankName"></p>
                    </div>
                    <template>
                       <button x-if="user.rankCode==='guest'" @click="changePasswordDialog" class="btn">Change Password</button>
                    </template>
                    <div class="mt-1 text-black">
                        <table class="table w-full border-separate">
                            <tbody>
                            <tr>
                                <th>Status</th>
                                <td ><span class="font-bold" x-text="user.status" :class="statusColor"></span>
                                <i @click="changeStatusDialog" class="ml-1 text-black fa-solid fa-pen-to-square cursor-pointer"></i></td>
                            </tr>
                            <tr>
                                <th>Gender</th>
                                <td ><span x-text="user.gender"></span>
                                <i @click="changeGenderDialog" class="ml-1 fa-solid fa-pen-to-square cursor-pointer"></i></td>
                            </tr>
                            <tr>
                                <th>Joined</th>
                                <td x-text="joined"></td>
                            </tr>
                            <tr>
                                <th>DOB</th>
                                <td><span x-text="user.dob ? user.dob : 'Set date of birth'"></span>
                                <i @click="changeDobDialog" class="ml-1 fa-solid fa-pen-to-square cursor-pointer"></i></td>
                            </tr>
                            <tr>
                                <th>Points</th>
                                <td ><i class="fa-solid fa-coins text-orange-400 mr-1" ></i><span x-text="user.points"></span></td>
                            </tr>
                            <tr>
                                <th>Level</th>
                                <td > <i class="fa-solid fa-database text-orange-400 mr-1" ></i><span x-text="user.level"></span></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            `
            },
            getMessages() {
                axios.get(`/room/${roomId}/messages`).then(res => {
                    const messages = res.data
                    this.$refs.chatMessages.innerHTML = ''
                    messages.forEach(message => {
                        this.renderMessage(message)
                    })
                })
            },
            getReports() {
                if (canSeeReports) {
                    axios.get(`/${domainId}/reports`).then(res => {
                        this.reports = res.data
                        this.reportNotificationCount = this.reports.length
                    })
                }
            },
            getEmojis() {
                let head = '<div class="emo-head">'
                let emos = ''
                emojis.forEach((emoji, index) => {
                    emos += `<div x-show="emoTab === ${index}"  class="emojis">`
                    Object.keys(emoji).forEach(key => {
                        if (key === 'head') head += `<img @click="emoTab=${index}" class="head" src="${emoji[key]}" :class="[emoTab==${index}?'active': '']" >`
                        else emos += `<img @click="addMainEmo('${key}')" class="emoticon" src="${emoji[key]}"> `
                    })
                    emos += '</div>'
                })
                head += '</div>'
                this.$refs.mainEmojis.innerHTML = head + emos
            },
            getPvtEmojis(element) {
                let head = '<div class="emo-head">'
                let emos = ''
                emojis.forEach((emoji, index) => {
                    emos += `<div x-show="pvtEmoTab == ${index}" class="pvt-emojis">`
                    Object.keys(emoji).forEach(key => {
                        if (key === 'head') head += `<img @click="pvtEmoTab=${index}" class="head" src="${emoji[key]}" :class="[pvtEmoTab===${index}?'active': '']" >`
                        else emos += `<img @click="addPvtEmo('${key}');showPvtEmo=false" class="emoticon" src="${emoji[key]}"> `
                    })
                    emos += '</div>'
                })
                head += '</div>'
                element.innerHTML = head + emos
            },
            getRoomUsers() {
                axios.get(`/room/${roomId}/users?limit=${offlineLimit}`).then(res => {
                    const users = res.data
                    const offline = []
                    const online = []
                    users.forEach(user => {
                        if (user.sessions > 0 || user.status === Status.Stay) {
                            online.push(user)
                        } else {
                            offline.push(user)
                        }
                    })
                    this.onlineUsers = online
                    this.offlineUsers = offline
                    this.offlineUsers = this.offlineUsers.sort()
                }).catch(e => {

                })
            },
            showGuestRegisterDialog() {
                if (rankCode !== 'guest') return
                const html = `
            <div class="text-gray-700 text-center">
                <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                    <p class="text-md font-bold ">Register</p>
                    <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                </div> 
                <div class="p-4 text-left">
                    <form class="w-full" @submit.prevent="guestRegister" method="post">
                        <template x-if="register.errors.default"> 
                            <div x-text="register.errors.default" class="error-default"></div>
                        </template>
                        <div class="mb-4">
                            <div class="h-10">
                                <label class="h-full">
                                    <input x-model="register.email" name="email"  class="input-text"
                                           type="email" placeholder="Email Address" autoComplete="off" required>
                                </label>
                            </div>
                            <template x-if="register.errors.email"> 
                                <div  x-text="register.errors.email" class="error-text"></div>
                            </template>
                        </div>
                        <div class="mb-4">
                            <div class="h-10">
                                <label class="h-full">
                                    <input x-model="register.password" name="password"  class="input-text"
                                           type="password" placeholder="Password" autoComplete="off" required >
                                </label>
                            </div>
                            <template x-if="register.errors.password"> 
                                <div x-text="register.errors.password" class="error-text"></div>
                            </template>
                        </div>
                        <div class="text-center"> 
                            <button type="submit" class="w-36 btn btn-skin text-center">Register </button>
                        </div>  
                    </form>
                </div>
            </div>`
                this.showSmallModal(html)
            },
            guestRegister() {
                this.showLoader = true
                const form = new FormData()
                form.append('name', name)
                form.append('email', this.register.email)
                form.append('password', this.register.password)
                form.append('gender', gender)

                axios.post('/guest-register', form).then(res => {
                    this.showLoader = false
                    this.closeSmallModal()
                    setTimeout(() => {
                        location.reload()
                    }, 2000)
                    this.showAlertMsg("Registration Successful", 'success')
                }).catch(e => {
                    this.showLoader = false
                    this.register.errors = {}
                    this.register.errors = e.response.data
                })
            },
            getUserProfile(id) {
                if (id === userId) {
                    this.showProfile = true
                    return
                }
                axios.get(`/user/${id}`).then(res => {
                    this.u = res.data

                    this.setUserStatusColor()
                    this.$refs.userProfileContent.innerHTML = `
                <div class="profile text-gray-700 text-center">
                    <div class="flex rounded px-4 py-2 bg-skin-hover to-skin-hover text-white items-center relative">
                        <img :src="u.avatar" src="" class="avatar" alt="">
                        <div class="flex ml-4 flex-col flex-1 mt-auto">
                            <p class="text-left">
                                <span class="username" x-text="u.name"></span>
                                <i @click="changeUserNameDialog" class="ml-1 fa-solid fa-pen-to-square cursor-pointer"></i>
                            </p>
                            <div class="flex text-left whitespace-wrap">
                                <p class="mood" x-text="u.mood ? u.mood : 'Add your mood'"></p>
                            </div>
                        </div>
                        <div class="actions"> 
                            <template x-if="u.private"> 
                                <i @click="openPvtDialog(u.id, u.name, u.avatar,u.nameColor, u.nameFont)" class="fa-solid fa-envelope icon-white"></i>
                            </template>
                            <i @click="closeUserProfile" class="fas fa-times-circle icon-white"></i> 
                        </div>
                    </div>
                    <div class="p-4 text-gray-900 text-left text-[14px]">
                        <p class="font-bold"> About Me</p>
                        <p class="font-normal" x-text="u.about ? u.about : ''"></p>
                        <div class="flex py-1 items-center">
                            <img class="rank-icon" :src="u.rank.icon" alt="" src="">
                            <p class="font-bold text-[16px] ml-4" x-text="u.rank.name"></p>
                        </div>
                        <template>
                           <button x-if="u.rank.code==='guest'" @click="changeUserPasswordDialog" class="btn">Change Password</button>
                        </template>
                        <div class="mt-1 text-black">
                            <table class="table w-full border-separate">
                                <tbody>
                                <tr>
                                    <th>Status</th>
                                    <td class="font-bold" x-text="u.status" :class="userStatusColor"></td>
                                </tr>
                                <tr>
                                    <th>Gender</th>
                                    <td x-text="u.gender">
                                </tr>
                                <tr>
                                    <th>Joined</th>
                                    <td x-text="joined"></td>
                                </tr>
                                <tr>
                                    <th>DOB</th>
                                    <td x-text="u.dob ? u.dob : 'Not set'"></td>
                                </tr>
                                <tr>
                                    <th>Points</th>
                                    <td ><i class="fa-solid fa-coins text-orange-400 mr-1" ></i><span x-text="u.points"></span></td>
                                </tr>
                                <tr>
                                    <th>Level</th>
                                    <td > <i class="fa-solid fa-database text-orange-400 mr-1" ></i><span x-text="u.level"></span></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                `
                    this.showUserProfile = true
                }).catch(e => {
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            closeUserProfile() {
                this.$refs.userProfileContent.innerHTML = ''
                this.showUserProfile = false
            },
            showLogoutDialog() {
                const html = `
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
                `
                this.showSmallModal(html)
            },
            logout() {
                axios.post('logout').then(res => {
                    location.reload()
                }).catch(e => {
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            changeAvatarDialog() {
                const html = `
            <div class="text-gray-700 text-center">
                <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                    <p class="text-md font-bold ">Change Avatar</p>
                    <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                </div> 
                <div class="p-4">
                    Select an image
                    <div class="w-full mt-1 mb-4 grid grid-cols-5 space-y-2 max-h-[150px] overflow-y-auto scrollbar">
                      <template x-for="(avatar, index) in avatars " :key="index">
                          <div class="w-[50px] h-[50px] relative">
                            <img @click="setAvatar(index)" class="w-full h-full rounded-full cursor-pointer" :src="avatar" alt=""> 
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
                this.showSmallModal(html)
            },
            setAvatar(index) {
                this.showLoader = true
                const data = new FormData()
                data.append('avatar', avatars[index])
                axios.post('/user/update-default-avatar', data).then(res => {
                    this.user.avatar = res.data.avatar
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg('Avatar has been changed.', 'success')
                }).catch(e => {
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            changeAvatar(el) {
                this.showLoader = true
                const formData = new FormData()
                const file = el.files[0]
                const pattern = /image-*/
                if (file == null || file.type === 'undefined') return
                if (!file.type.match(pattern)) {
                    this.showLoader = false
                    this.showAlertMsg('Invalid image format', 'error')
                    return
                }
                formData.append('avatar', file)
                axios.post('/user/update-avatar', formData).then(res => {
                    this.user.avatar = res.data.avatar
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg('Avatar has been changed.', 'success')
                }).catch(e => {
                    this.showLoader = false
                    this.closeSmallModal()
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            changeNameDialog() {
                const html = `
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
            `
                this.showSmallModal(html)
            },
            closeNameDialog() {
                this.user.name = name
                this.closeSmallModal()
            },
            changeName() {
                if (this.user.name.length < 4 || this.user.name.length > 12) {
                    this.showAlertMsg('Must have min 4 to max 12 letters', 'error')
                    return
                }
                const formData = new FormData()
                formData.append('name', this.user.name)
                axios.post('/user/update-name', formData).then(res => {
                    name = res.data.name
                    this.closeSmallModal()
                    this.showAlertMsg('Username has been changed', 'success')
                }).catch(e => {
                    this.user.name = name
                    this.closeSmallModal()
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            customizeNameDialog() {
                const html = `
            <div class="text-gray-700 text-center">
                <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                    <p class="text-md font-bold ">Customize Username</p>
                    <i @click="closeCustomizeNameDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                </div> 
                <div class="p-4">
                    <template x-if="user.nameFont"> 
                        <p class="w-full font-bold clip" :class="[user.nameFont, user.nameColor]" x-text="user.name"></p>
                    </template>    
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
                    <div class="w-full mb-4 grid grid-cols-7 space-y-1 space-x-1 max-h-[150px] overflow-y-auto scrollbar">
                      <template x-for="(color, index) in bgColors " :key="index">
                        <div @click="setNameColor(index)" class="h-6 w-10 cursor-pointer flex items-center justify-center" :class="color">
                         <template x-if="isShowTickForName(index)">
                            <i  class="fa-solid fa-check text-white text-center top-0 left-0"></i>
                         </template>
                        </div>
                      </template>
                    </div>   
                    <button @click="customizeName" class="w-36 btn btn-skin text-center">Change<button>
                </div>
            </div>
            `
                this.showSmallModal(html)
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
                axios.post('/user/customize-name', formData).then(res => {
                    nameColor = res.data.nameColor
                    nameFont = res.data.nameFont
                    this.closeSmallModal()
                    this.showAlertMsg('Name customized.', 'success')
                }).catch(e => {
                    this.user.nameColor = nameColor
                    this.user.nameFont = nameFont
                    this.closeSmallModal()
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            changeMoodDialog() {
                const html = `
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
                this.showSmallModal(html)
            },
            closeMoodDialog() {
                this.user.mood = mood
                this.closeSmallModal()
            },
            changeMood() {
                if (this.user.mood.length >= 40) {
                    this.showAlertMsg('Must have max 40 letters', 'error')
                    return
                }
                const formData = new FormData()
                formData.append('mood', this.user.mood)
                axios.post('/user/update-mood', formData).then(res => {
                    mood = res.data.mood
                    this.closeSmallModal()
                    this.showAlertMsg('Mood has been changed', 'success')
                }).catch(e => {
                    this.user.mood = mood
                    this.closeSmallModal()
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            changeAboutDialog() {
                const html = `
            <div class="text-gray-700 text-center">
                <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                    <p class="text-md font-bold ">Change About Me</p>
                    <i @click="closeAboutDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                </div> 
                <div class="p-4">
                    <div class="h-[100px] max-h-[150px] mb-4">
                        <textarea class="w-full input-text" x-model="user.about" type="text" maxlength="150" name="about" autofocus></textarea>
                    </div>
                    <button @click="changeAbout" class="w-36 btn btn-skin text-center">Change<button>
                </div>
            </div>
            `
                this.showSmallModal(html)
            },
            closeAboutDialog() {
                this.user.about = about
                this.closeSmallModal()
            },
            changeAbout() {
                const formData = new FormData()
                formData.append('about', this.user.about)
                axios.post('/user/update-about', formData).then(res => {
                    about = res.data.about
                    this.closeSmallModal()
                    this.showAlertMsg('About me has been changed', 'success')
                }).catch(e => {
                    this.user.about = about
                    this.closeSmallModal()
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            changePasswordDialog() {
                if (this.user.rankCode === 'guest') {
                    this.showAlertMsg('Guest does not have password', 'error')
                    return
                }
                const html = `
            <div x-data="{password:''}" class="text-gray-700 text-center">
                <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                    <p class="text-md font-bold ">Change Password</p>
                    <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                </div> 
                <div class="p-4">
                    <div class="h-10 mb-4">
                        <label class="h-full">
                            <input x-model="password" name="password" class="input-text" type="text" 
                            placeholder="New password" autocomplete="off" autofocus>
                        </label>
                    </div> 
                    <button @click="changePassword(password)" class="w-36 btn btn-skin text-center">Change<button>
                </div>   
            </div>
            `
                this.showSmallModal(html)
            },
            changePassword(password) {
                if (password.length < 8) {
                    this.showAlertMsg('Must have min 8 letters', 'error')
                    return
                }
                const formData = new FormData()
                formData.append('password', password)
                axios.post('/user/update-password', formData).then(res => {
                    this.showAlertMsg('Password has been changed', 'success')
                    this.closeSmallModal()
                }).catch(e => {
                    this.showAlertMsg(e.response.data, 'error')
                    this.closeSmallModal()
                })
            },
            changeStatusDialog() {
                const html = `
            <div x-data="{status:''}" class="text-gray-700 text-center">
                <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                    <p class="text-md font-bold ">Change Status</p>
                    <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                </div> 
                <div class="p-4">
                    <div class="w-full h-10 mb-4">
                        <select x-model="status" class="input-text">
                            <option value="-1" selected>Select Status</option>
                            <option value="0">Stay</option>
                            <option value="1">Online</option>
                            <option value="2">Away</option>
                            <option value="3">Busy</option>
                            <option value="4">Eating</option>
                            <option value="5">Gaming</option>
                            <option value="6">Singing</option>
                            <option value="7">Listening</option>
                        </select>
                    </div>
                    <button @click="changeStatus(status)" class="w-36 btn btn-skin text-center">Change<button>
                </div>
            </div>
            `
                this.showSmallModal(html)
            },
            changeStatus(status) {
                if (status === "" || status === "-1") return
                const formData = new FormData()
                formData.append('status', status)
                axios.post('/user/update-status', formData).then(res => {
                    this.showAlertMsg('Status has been changed', 'success')
                    this.user.status = res.data.status
                    this.setStatusColor()
                    this.closeSmallModal()
                }).catch(e => {
                    this.showAlertMsg(e.response.data, 'error')
                    this.closeSmallModal()
                })
            },
            changeGenderDialog() {
                const html = `
            <div x-data="{gender:''}" class="text-gray-700 text-center">
                <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                    <p class="text-md font-bold ">Change Gender</p>
                    <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                </div>
                <div class="p-4">
                    <div class="w-full h-10 mb-4">
                        <select x-model="gender" class="input-text">
                            <option value="" selected="">Select Gender</option>
                            <option value="0">Male</option>
                            <option value="1">Female</option>
                        </select>
                    </div>
                    <button @click="changeGender(gender)" class="w-36 btn btn-skin text-center">Change<button>
                </div>
            </div>
            `
                this.showSmallModal(html)
            },
            changeGender(gender) {
                if (gender === '') return
                const formData = new FormData()
                formData.append('gender', gender)
                axios.post('/user/update-gender', formData).then(res => {
                    this.user.gender = res.data.gender
                    this.closeSmallModal()
                    this.showAlertMsg('Gender has been changed', 'success')
                }).catch(e => {
                    this.closeSmallModal()
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            changeDobDialog() {
                const html = `
            <div class="text-gray-700 text-center">
                <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                    <p class="text-md font-bold ">Change Date of Birth</p>
                    <i @click="closeDobDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                </div>
                <div class="p-4">
                    <div class="w-full h-10 mb-4">
                        <input x-model="user.dob" class="input-text"  name="dob" max="2010-12-31" min="1970-12-31" type="date">
                    </div>
                    <button @click="changeDob(user.dob)" class="w-36 btn btn-skin text-center">Change<button>
                </div>
            </div>
            `
                this.showSmallModal(html)
            },
            closeDobDialog() {
                this.user.dob = dob
                this.closeSmallModal()
            },
            changeDob(dob) {
                if (dob === '') return
                const formData = new FormData()
                formData.append('dob', dob)
                axios.post('/user/update-dob', formData).then(res => {
                    this.showAlertMsg('DOB has been changed', 'success')
                    this.user.dob = res.data.dob
                    dob = res.data.dob
                    this.closeSmallModal()
                }).catch(e => {
                    this.user.dob = dob
                    this.showAlertMsg(e.response.data, 'error')
                    this.closeSmallModal()
                })
            },
            customizeTextDialog() {
                const html = `
                <div class="text-gray-700 text-center">
                    <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                        <p class="text-md font-bold ">Change Chat Option</p>
                        <i @click="closeCustomizeTextDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                    </div>
                    <div class="p-4">
                        <template x-if="user.textFont"> 
                            <p class="w-full clip" :class="[user.textFont, user.textColor, user.textBold === 'true' ? 'font-bold' : 'font-normal' ]">Sample Text</p>
                        </template>    
                        <div class="w-full h-10 mb-4">
                            <select x-model="user.textFont" class="input-text">
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
                             <template x-if="isShowTick(index)">
                                <i  class="fa-solid fa-check text-white text-center top-0 left-0"></i>
                             </template>
                            </div>
                          </template>
                        </div>
                        <button @click="customizeText" class="w-36 btn btn-skin text-center">Change<button>
                    </div>
                </div>
                `
                this.showSmallModal(html)
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
                if (textBold === this.user.textBold && textColor === this.user.textColor && textFont === this.user.textFont) {
                    return
                }
                const formData = new FormData()
                formData.append('textBold', this.user.textBold)
                formData.append('textColor', this.user.textColor)
                formData.append('textFont', this.user.textFont)
                axios.post('/user/customize-text', formData).then(res => {
                    textColor = res.data.textColor
                    textBold = res.data.textBold
                    textFont = res.data.textFont
                    this.closeSmallModal()
                    this.showAlertMsg('Chat options has been changed', 'success')
                }).catch(e => {
                    this.user.textColor = textColor
                    this.user.textBold = textBold
                    this.user.textFont = textFont
                    this.closeSmallModal()
                    this.showAlertMsg(e.response.data, 'error')
                })
            },
            removeTopic() {
                const topic = document.getElementById('topic')
                topic.remove()
            },
            welcomeMessage(name) {
                this.$refs.mainInput.value = `Welcome ${name}`
            },
            addMainEmo(emo) {
                const input = this.$refs.mainInput
                input.value === '' ? input.value = `${emo} ` : input.value += ` ${emo} `
                this.showEmo = false
                input.focus()
            },
            addPvtEmo(emo,) {
                const input = this.$refs.pvtInput
                input.value === '' ? input.value = `${emo} ` : input.value += ` ${emo} `
                input.focus()
            },
            appendUserName(el) {
                const username = el.innerText
                const input = this.$refs.mainInput
                input.value === '' ? input.value = `${username} ` : input.value += ` ${username} `
                input.focus()
            },
            sendToRoom(message) {
                this.roomSocket.send(JSON.stringify(message))
            },
            sendMessage() {
                const content = this.$refs.mainInput.value
                if (content === '') {
                    this.$refs.mainInput.focus()
                    return
                }
                this.roomSocket.send(JSON.stringify({content: content, type: MessageType.Chat}))
                this.$refs.mainInput.value = ''
                this.$refs.mainInput.focus()
            },
            recordMainAudio() {
                if (this.isRecording) {
                    this.showEmo = false
                    this.showOption = false
                    if (!(RECORDING_TIME - this.remainingTime > 10)) {
                        this.recorder.stop()
                        this.isRecording = false
                        this.remainingTime = RECORDING_TIME
                        clearInterval(this.mainInterval)
                        this.showAlertMsg('Record length at least 10 seconds', 'error')
                        return
                    }
                    this.recorder.stop().getMp3().then(([buffer, blob]) => {
                        const audioFile = new File(buffer, 'music.mp3', {type: blob.type, lastModified: Date.now()})
                        const formData = new FormData()
                        formData.append('audio', audioFile)
                        const content = this.$refs.mainInput.value
                        formData.append('content', content)
                        axios.post('/room/upload-audio', formData).then(res => {
                            this.sendToRoom(res.data)
                        }).catch(err => {
                            this.showAlertMsg('Audio upload failed', 'error')
                        })
                    }).catch((e) => {
                        this.showAlertMsg('Audio recording failed', 'error')
                    })
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
                        this.showAlertMsg('You haven\'t given mic permission', 'error')
                    })

                }
            },
            uploadImage(event) {
                this.showLoader = true
                const formData = new FormData()
                const file = event.target.files[0]
                const pattern = /image-*/
                const content = this.$refs.mainInput.value
                if (file == null || file.type === 'undefined') return
                if (!file.type.match(pattern)) {
                    this.showAlertMsg('Invalid image format', 'error')
                    this.showLoader = false
                    return
                }
                formData.append('image', file)
                formData.append('content', content)
                axios.post('/room/upload-image', formData).then(res => {
                    this.sendToRoom(res.data)
                    this.$refs.mainInput.value = ''
                    this.$refs.mainInput.focus()
                    this.showLoader = false
                }).catch(e => {
                    this.showLoader = false
                })
            },
            showImageDialog(el) {
                const image = el.src
                const html = `
                <div class="relative w-full mx-auto">
                    <img src="${image}" class="mx-auto" alt="">
                    <div class="bg-white rounded-full z-10 text-gray-700 absolute -top-2 -right-2 cursor-pointer px-1"> 
                        <i @click="closeImgModal" class="fas fa-times-circle text-2xl "></i>
                    </div>
                </div>
               
                `
                this.showImgModal(html)
            },
            renderMessage(message) {
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
                        location.replace('rooms')
                        return
                    }
                    chatMessages.insertAdjacentHTML("afterbegin", renderLeaveMessage(message))
                } else if (message.type === MessageType.Delete) {
                    const li = document.getElementById(`chat-${message.id}`)
                    li != null ? li.remove() : ''
                }
            },
            deleteChat(id) {
                if (canDelMsg) {
                    axios.delete(`/message/${id}/delete`).catch(e => {
                        if (e.response) {

                            this.showAlertMsg(e.response.data, 'error')
                            return
                        }
                        this.showAlertMsg('Deleting message failed.', 'error')
                    })
                } else this.showAlertMsg('Permission denied', 'error')
            },
            reportDialog(id, type) {
                const reportType = type === 1 ? ReportType.Chat : (type === 2) ? ReportType.PvtChat : ReportType.NewsFeed
                const html = `
                    <div x-data="{ id: ${id}, selectedReason :'', reasons:[
                    'Abusive Language','Spam Content','Inappropriate Content', 'Sexual Harashment'
                    ]}" class="text-gray-700 text-center">
                        <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                            <p class="text-md font-bold ">Report Chat</p>
                            <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                        </div> 
                        <div class="p-4">
                            <template x-for="(reason, index) in reasons" :key="index"> 
                                 <div class="flex gap-2 items-center text-[14px] mb-2">
                                    <i @click="selectedReason = reason" class="cursor-pointer text-[15px]" 
                                    :class="selectedReason === reason? 'fa-solid fa-circle-check text-green-500':'fa-regular fa-circle' "></i>
                                    <p x-text="reason"></p>
                                </div>
                            </template>
                            <button @click="report(id, selectedReason, '${reportType}')" class="w-36 btn btn-skin text-center mt-2">Report<button>
                        </div>
                    </div>
                `
                this.showSmallModal(html)
            },
            report(targetId, reason, type) {
                const formData = new FormData()
                formData.append('targetId', targetId)
                formData.append('reason', reason)
                formData.append('domainId', domainId)
                formData.append('roomId', roomId)
                formData.append('type', type)
                axios.post(`/reports/create`, formData).then(res => {
                    this.showAlertMsg('Message reported successfully', 'success')
                }).catch(e => {
                    this.showAlertMsg('Reporting message failed', 'error')
                })
                this.closeSmallModal()
            },
            openPvtDialog(id, name, avatar, nameColor, nameFont) {
                const user = {id, name, avatar, nameColor, nameFont}
                const exists = this.pvtUsers.find(user => user.id === id)
                if (exists != null && exists !== 'undefined') {
                    exists.minimize = false
                    exists.added = true
                    if (exists.unReadCount > 0) {
                        this.setAllSeen(exists.id)
                    }
                    this.closeUserProfile()
                    this.closeFullModal()
                    this.$nextTick(() => {
                        dragElement(document.getElementById(`draggable-${exists.id}`), exists.id)
                    })
                    return
                }
                axios.get(`message/pvt/${id}/messages`).then(res => {
                    user.messages = res.data
                    user.minimize = false
                    user.added = true
                    user.isRecording = false
                    user.remainingTime = RECORDING_TIME
                    user.recorder = new MicRecorder({bitrate: 80})
                    user.interval = null
                    this.pvtUsers.unshift(user)
                    this.showUserProfile = false
                }).catch(e => {
                    console.log(e)
                })
                this.setPvtNotificationCount()
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
                const content = input.value
                if (content === '') {
                    input.focus()
                    return
                }
                this.sendToUser({
                    sender: {id: userId}, receiver: {id: id}, content: content, type: MessageType.Chat
                })
                input.value = ''
                input.focus()
            },
            sendToUser(message) {
                this.userSocket.send(JSON.stringify(message))
            },
            recordPvtAudio(id) {
                let user = this.pvtUsers.find(user => user.id === id)
                console.log(user)
                if (!user.isRecording) {
                    user.recorder.start().then(() => {
                        user.interval = setInterval(() => {
                            if (user.remainingTime === 1) {
                                this.recordPvtAudio(id)
                            } else user.remainingTime--
                        }, 1000)
                        user.isRecording = true
                    }).catch((e) => {
                        this.showAlertMsg('You haven\'t given mic permission', 'error')
                    })
                } else {
                    if (!(RECORDING_TIME - user.remainingTime > 10)) {
                        user.recorder.stop()
                        user.isRecording = false
                        clearInterval(user.interval)
                        user.remainingTime = RECORDING_TIME
                        this.showAlertMsg('Record length at least 10 seconds', 'error')
                        return
                    }
                    user.recorder.stop().getMp3().then(([buffer, blob]) => {
                        const audioFile = new File(buffer, 'music.mp3', {type: blob.type, lastModified: Date.now()})
                        const formData = new FormData()
                        formData.append('audio', audioFile)
                        axios.post(`/message/pvt/${id}/upload-audio`, formData).then(res => {
                            this.sendToUser(res.data)
                        }).catch(err => {
                            this.showAlertMsg('Audio upload failed', 'error')
                        })
                    }).catch((e) => {
                        this.showAlertMsg('Audio recording failed', 'error')
                    })
                    user.isRecording = false
                    clearInterval(user.interval)
                    user.remainingTime = RECORDING_TIME
                }
            },
            uploadPvtImage(id, event, input) {
                this.showLoader = true
                const formData = new FormData()
                const file = event.target.files[0]
                const pattern = /image-*/
                if (file == null || file.type === 'undefined') return
                if (!file.type.match(pattern)) {
                    this.showAlertMsg('Invalid image format', 'error')
                    this.showLoader = false
                    return
                }
                formData.append("image", file)
                formData.append("content", input.value)
                axios.post(`/message/pvt/${id}/upload-image`, formData).then(res => {
                    this.sendToUser(res.data)
                    input.value = ''
                    input.focus()
                    this.showLoader = false
                }).catch(e => {
                    this.showLoader = false
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
                    }
                    user.messages.unshift(message)
                    this.setPvtNotificationCount()
                } else if (message.type === MessageType.Report || message.type === MessageType.ActionTaken) {
                    this.getReports()
                }
            },
            reCheckPvtMessages() {
                axios.get('message/pvt/users').then(res => {
                    this.pvtUsers = res.data
                    this.pvtUsers.forEach(user => {
                        user.minimize = false
                        user.added = false
                        user.isRecording = false
                        user.remainingTime = RECORDING_TIME
                        user.recorder = new MicRecorder({bitrate: 80})
                        user.interval = null
                    })
                    this.setPvtNotificationCount()
                }).catch(e => {
                })
            },
            openRoomsModal() {
                axios.get(`/${domainId}/rooms`).then(res => {
                    this.rooms = res.data
                    let html = `
                    <div class="text-skin-on-primary h-full">
                        <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                            <p class="text-md font-bold ">Room List</p>
                            <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
                        </div> 
                        <div class="p-[10px]">
                            <ul class="h-full">
                    `
                    this.rooms.forEach((room, index) => {
                        const submitBtn = room.id === roomId ?
                            '<p class="text-black text-[10px] font-bold">(Current Room)</p>' :
                            `<form class="flex-none" action="room/join" method="post">
                                <input type="hidden" name="id" :value="${room.id}">
                                <button type="submit" 
                                        class="text-[10px] text-center outline-none text-skin-on-primary font-bold rounded-md py-[3px] px-2 btn-skin">
                                    Join&nbsp&nbsp<i class="fa-solid fa-angles-right"></i>
                                </button>
                            </form>`
                        html += `
                        <li class="my-2 px-2 py-1 border border-gray-200 flex items-center rounded shadow-md shadow-black/5 ">
                            <i class="fa-solid fa-earth-americas text-3xl flex-none text-skin-hover"></i>
                            <div class="flex-1 text-left ml-2 text-black">
                                <p class="font-bold text-[12px]">${room.name}</p>
                                <div>
                                    <i class="fa-solid fa-user-group "></i>&nbsp&nbsp${room.onlineUsers}
                                </div>
                            </div>
                            ${submitBtn}
                        </li>`
                    })
                    html += `</ul></div></div>`
                    this.showFullModal(html)
                })
            },
            openMessageModal() {
                let html = `
                <div class="text-skin-on-primary h-full">
                    <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                        <p class="text-md font-bold ">Messages</p>
                        <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
                    </div> 
                    <div class="p-[10px]">
                        <ul class="h-full ">
                `
                if (this.pvtUsers.length > 0) {
                    this.pvtUsers.forEach((user, index) => {
                        let count = user.unReadCount > 0 ? `
                        <div class="shadow-md shadow-black/5 flex bg-red-500 rounded-full items-center justify-center my-auto text-[10px] w-6 h-6 flex-none">
                            <p class="font-bold text-[12px]" >${user.unReadCount}</p>
                        </div>` : ''
                        const message = user.messages[0]
                        const person = (message != null && message.sender.id === userId) ? 'You : ' : `${user.name} : `
                        let content = message != null ? user.messages[0].content : ''
                        content = content !== '' ? appendEmojis(content) : ''
                        content = content !== '' ? person + content : content
                        html += `
                        <li @click="openPvtDialog(${user.id},'${user.name}','${user.avatar}', '${user.nameColor}', '${user.nameFont}')" class="pvt-user-wrap">
                           <div class="w-full gap-2">
                                <div class="flex h-full w-full items-center">
                                    <img class="avatar flex-none mx-1" src="${user.avatar}">
                                    <div class="flex-1 px-1 whitespace-nowrap overflow-hidden flex flex-col justify-center">
                                        <p class="ellipsis username clip ${user.nameColor} ${user.nameFont}"> ${user.name}
                                        <p class="flex items-center clip ellipsis text-gray-500 text-[12px]">${content}</p>
                                    </div>
                                    ${count}
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

                html += `</ul></div></div>`
                this.showFullModal(html)
            },
            setAllSeen(sender) {
                axios.post(`message/pvt/${sender}/all-seen`).then(res => {
                    const user = this.pvtUsers.find(user => user.id === sender)
                    user.messages.forEach(message => message.seen = true)
                    this.setPvtNotificationCount()
                }).catch(e => {
                })
            },
            setPvtNotificationCount() {
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
                this.pvtNotificationCount = count
            },
            setPvtMessageSeen(id) {
                axios.post(`message/pvt/${id}/seen`).then(res => {
                }).catch(e => {
                })
            },
            makeItBefore(el) {
                el.style.zIndex = "60"
            },
            makeItBehind(el) {
                el.style.zIndex = "50"
            },
            openReportsModal() {
                let html = `
                <div class="text-skin-on-primary h-full">
                    <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                        <p class="text-md font-bold ">Reports</p>
                        <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
                    </div> 
                    <div class="p-[10px]">
                        <ul class="h-full ">
                `
                if (this.reports.length > 0) {
                    this.reports.forEach((report, index) => {
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
                        </li>`
                    })
                } else {
                    html += `
                        <li class="pvt-user-wrap">
                           <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                <i class="fa-solid fa-flag text-[40px]"></i>
                                <p class="text-[12px] font-bold" > No Reports</p>
                            </div>
                        </li>`
                }
                html += `</ul></div></div>`
                this.showFullModal(html)
            },
            openReportActionDialog(id, targetId, roomId, type) {
                this.closeFullModal()
                let html = `<div class="text-gray-700 text-center">
                    <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                        <p class="text-md font-bold ">Report Action</p>
                        <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
                    </div>`
                if (type === ReportType.Chat) {
                    axios.get(`/message/${targetId}`).then(res => {
                        html += renderReportChatMessage(res.data, id, targetId, roomId, type)
                        this.showSmallModal(html)
                    }).catch(e => {
                        if (e.response) {
                            if (e.response.status === 404) {
                                this.showAlertMsg(e.response.data, 'error')
                                const formData = new FormData()
                                formData.append('domainId', domainId)
                                axios.delete(`/reports/${id}/delete`, {data: formData})
                            }
                            return
                        }
                        this.showAlertMsg('Something went wrong', 'error')
                    })
                } else if (type === ReportType.PvtChat) {

                } else if (type === ReportType.NewsFeed) {

                }
            },
            takeAction(id, targetId, roomId, type) {
                const formData = new FormData()
                formData.append('targetId', targetId)
                formData.append('domainId', domainId)
                formData.append('roomId', roomId)
                formData.append('type', type)
                axios.post(`/reports/${id}/take-action`, formData).then(res => {
                    this.closeSmallModal()
                })
            },
            noAction(id, type) {
                const formData = new FormData()
                formData.append('domainId', domainId)
                formData.append('type', type)
                axios.post(`/reports/${id}/no-action`, formData).then(res => {
                    this.closeSmallModal()
                })
            },
        })
    )
})

Alpine.start()

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
                        <p class="chat clip">${message.content}</p>
                    </div>
                </div>
           </div>
        </li> 
        <button @click="takeAction(${id}, ${targetId},${roomId}, '${type}')" class="btn btn-skin text-center">Take Action<button>
        <button @click="noAction(${id}, '${type}')" class="btn btn-disabled text-center ml-2">No Action<button>
    </div></div>`
}

function renderWelcomeMessage() {
    const topic = roomTopic.replace(/%ROOM%/g, roomName)
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
    const image = message.image ? `<img @click="showImageDialog($el)" src="${message.image}" alt="" class="lobby-image">` : ''
    const audio = message.audio ? `<audio preload="auto" controls controlslist="nodownload noplaybackrate" class="w-[250px]">
                                        <source src="${message.audio}" type="audio/mpeg">
                                    </audio>` : ''
    const gender = message.user.gender === 'Male' ? 'male' : 'female'
    const bold = message.user.textBold ? ' font-bold' : ' font-normal'
    const reportIcon = message.user.id !== userId ? `<i @click="reportDialog(${message.id}, 1)" class="fa-solid fa-font-awesome icon-sm"></i>` : ''
    const delIcon = canDelMsg ? `<i @click="deleteChat(${message.id})" class="fa-solid fa-trash-can icon-sm"></i>` : ''
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
                        ${reportIcon} ${delIcon}
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

function appendEmojis(content) {
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






