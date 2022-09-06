import {Defaults, Errors} from './constant'
import {emojis} from './emojis'


export function renderWelcomeMessage() {
    const topic = room.topic.replace(/%ROOM%/g, room.name)
    return `
        <li id="topic" class="topic">
            <i @click="removeTopic" class="fa-solid fa-circle-xmark "></i>
            <div class="segment">
                <a class="ribbon label">Welcome Jafa</a>      
                <img  alt="" src="/images/defaults/welcome.svg">
                <p>${topic}</p>        
             </div>    
        </li>
    `
}

export function renderJoinMessage(message) {
    return `
         <li class="w-full flex justify-center border-t border-gray-200">
            <div class="p-1" @click="welcomeMessage(\'${message.user.name}\')">
               <p class="rounded-md px-4 py-1 text-white bg-skin-primary text-[12px]"><b class="cursor-pointer">${message.user.name}</b> has joined the room.</p>
            </div>
        </li>
    `
}

export function renderLeaveMessage(message) {
    return `
         <li class="w-full flex justify-center border-t border-gray-200">
            <div class="p-1">
               <p class="px-4 py-1 text-gray-800 text-[12px]">${message.user.name} has left the room.</p>
            </div>
        </li>
    `
}

export function renderChatMessage(message) {
    const image = message.image ? `<img @click="showImageDialog($el)" src="${message.image}" alt="" class="lobby-image">` : Defaults.EMPTY_STRING
    const audio = message.audio ? `<audio preload="auto" controls controlslist="nodownload noplaybackrate" class="w-[250px]"><source src="${message.audio}" type="audio/mpeg"></audio>` : Defaults.EMPTY_STRING
    const gender = message.user.gender === 'Male' ? 'male' : 'female'
    const bold = message.user.textBold ? ' font-bold' : ' font-normal'
    const delIcon = permission.delMsg ? `<i @click="deleteChat(${message.id})" class="fa-solid fa-square-xmark icon-sm"></i>` : Defaults.EMPTY_STRING
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

export function getEmojisHtml() {
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

export function pvtEmojisHtml() {
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
        Object.keys(emoji).forEach(key => {
            if (key === name) src = emoji[key]
        })
    })
    return src
}

export function dragElement(el, id) {
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

export function ucgPolicyHtml() {
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

export function guestDialogHtml() {
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

export function guestRegisterHtml() {
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

export function logoutHtml() {
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

export function changeAvatarHtml() {
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

export function changeNameHtml() {
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

export function customizeNameHtml() {
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

export function changeMoodHtml() {
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

export function changeAboutHtml() {
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

export function changePasswordHtml() {
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

export function changeStatusHtml() {
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

export function changeGenderHtml() {
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

export function changeDobHtml() {
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

export function customizeTextHtml() {
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

export function reportDialogHtml(id, type) {
    return `
        <div x-data="{ id: ${id}, type: '${type}' }"
         class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
            <div class="inline-flex items-center"> 
                <i class="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
                <p class="ml-2 text-md font-bold ">Report This Content</p>
            </div>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div x-data="report" class="p-4">
                <p class="mb-4 text-[13px] text-start leading-[16px]">Please only submit actionable offences. Abuse or false reporting may lead to action taken against your own account. Select the reason to report this content.</p>
                <template x-for="(reason, index) in reasons" :key="index"> 
                     <div class="flex gap-2 items-center text-[13px] font-bold">
                        <i @click="selectedReason = reason" class="cursor-pointer text-[15px]" :class="selectedReason === reason? 'fa-solid fa-circle-check text-green-500':'fa-regular fa-circle' "></i>
                        <p x-text="reason"></p>
                    </div>
                </template>
                <button @click="report(id, type)" class="w-36 btn btn-skin text-center mt-2">Report<button>
            </div>
        </div>
    `
}

export function messageModalHtml(pvtUsers) {
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
            let count = user.unReadCount > 0 ? `<p class="count-md">${user.unReadCount}</p>` : Defaults.EMPTY_STRING
            const message = user.messages[0]
            const person = (message != null && message.sender.id === userId) ? 'You : ' : `${user.name} : `
            let content = message != null ? appendEmojis(message.content) : Defaults.EMPTY_STRING
            if (message.image && content === Defaults.EMPTY_STRING) content += '(Image)'
            if (message.audio && content === Defaults.EMPTY_STRING) content += '(Audio)'
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
                    <img class="w-[40px]" src="/images/defaults/topic.webp" alt="">
                    <p class="text-[12px] font-bold" > No Messages</p>
                </div>
            </li>
        `
    }
    html += '</ul></div></div>'
    return html
}

export function changeUserNameHtml() {
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

export function changeUserAvatarHtml() {
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

export function roomModalLoadingHtml() {
    return `
        <div class="text-skin-on-primary h-full">
            <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                <p class="text-md font-bold ">Room List</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-[10px] flex items-center justify-center">
                <div class="loader"></div>   
            </div> 
        </div>
   `
}

export function roomModalHtml(rooms) {
    let html = `
        <div class="text-skin-on-primary h-full">
            <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                <p class="text-md font-bold ">Room List</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-[10px]">
                <ul class="h-full">
    `
    rooms.forEach(rm => {
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

export function newsModalHtml(news) {
    let addNew = permission.writeNews ?
        '<button @click="writeNewsDialog" class="flex-none mx-auto my-2 btn-sm btn-skin"><i class="fa-solid fa-pen-to-square"></i>&nbsp;&nbsp;Add New</button>' : Defaults.EMPTY_STRING
    let html = `
        <div class="flex flex-col text-skin-on-primary h-full w-full text-center">
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
            let image = news.image != null ? `<img @click="showImageDialog($el)" src="${news.image}" alt="" class="w-full mt-2 cursor-pointer">` : Defaults.EMPTY_STRING
            let content = news.content.replaceAll('\r\n', '<br>')
            let delNews = permission.delNews ? `<i @click="delNews(${news.id})" class="fa-solid fa-trash-can icon-sm"></i>` : Defaults.EMPTY_STRING
            html += `
                <li class="card-wrap" xmlns="http://www.w3.org/1999/html">
                   <div class="flex flex-col w-full">
                       <div class="flex items-center justify-between"> 
                           <div class="flex items-center gap-2">
                               <img @click="getUserProfile(${user.id})" class="avatar flex-none cursor-pointer" src="${user.avatar}" alt="">
                               <p class="username clip ${user.nameColor} ${user.nameFont}">${user.name}</p>
                           </div>  
                           <div class="flex items-center gap-2">
                                <p class="date">${news.createdAt}</p>${delNews}
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

export function writeNewsDialogHtml() {
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

export function adminshipModalHtml(adminships) {
    let addNew = permission.adminship ?
        '<button @click="writeAdminShipDialog" class="flex-none mx-auto my-2 btn-sm btn-skin"><i class="fa-solid fa-pen-to-square"></i>&nbsp;&nbsp;Add New</button>' : Defaults.EMPTY_STRING
    let html = `
        <div class="flex flex-col text-skin-on-primary h-full w-full text-center">
            <div class="sticky px-4 py-1 flex justify-between items-center bg-skin-hover/90 flex-none">
                <p class="text-md font-bold ">Adminship</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div>
            <div class="p-[10px] flex-1 relative">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">${addNew}
                    <ul>
        `
    if (adminships.length > 0) {
        adminships.forEach(adminship => {
            let user = adminship.user
            let fontStyle = user.textBold ? 'font-bold' : 'font-normal'
            let image = adminship.image != null ? `<img @click="showImageDialog($el)" src="${adminship.image}" alt="" class="w-full mt-2 cursor-pointer">` : Defaults.EMPTY_STRING
            let content = adminship.content.replaceAll('\r\n', '<br>')
            let delAdminship = permission.delAdminship ? `<i @click="delAdminship(${adminship.id})" class="fa-solid fa-trash-can icon-sm"></i>` : Defaults.EMPTY_STRING
            html += `
                <li class="card-wrap" xmlns="http://www.w3.org/1999/html">
                   <div class="flex flex-col w-full">
                       <div class="flex items-center justify-between"> 
                           <div class="flex items-center gap-2">
                               <img @click="getUserProfile(${user.id})" class="avatar flex-none cursor-pointer" src="${user.avatar}" alt="">
                               <p class="username clip ${user.nameColor} ${user.nameFont}">${user.name}</p>
                           </div>  
                           <div class="flex items-center gap-2">
                                <p class="date">${adminship.createdAt}</p>${delAdminship}
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
                    <img class="w-[40px]" src="/images/defaults/adminship.webp" alt="">
                    <p class="text-[12px] font-bold" > No AdminShip Posts</p>
                </div>
            </li>
       `
    }
    html += `</ul></div></div></div>`
    return html
}

export function writeAdminshipDialogHtml() {
    return `
        <div x-data="adminship" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Write Adminship Post</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="mb-4">
                   <textarea x-ref="adminshipInput" @keyup="textArea($el, 120)" class="text-area h-[120px]" x-model="content" type="text" 
                        maxlength="3000" placeholder="write announcement"></textarea>
                   <template x-if="image"> <img :src="image" class="h-20" alt=""></template>
                   <input x-ref="input" @change="addImage($el)" type="file" name="image" class="hidden">
                </div>
                <div class="flex justify-end gap-2 items-center"> 
                 <img @click="$refs.input.click()" src="/images/defaults/picture.webp" class="w-6 h-6" alt=""> 
                 <button @click.once="writeAdminship" class="btn btn-skin text-center">Post<button>
                </div>
            </div>
        </div>
    `
}

export function globalFeedModalHtml(feeds) {
    let addNew = rank.code !== Defaults.GUEST ?
        '<button @click="writeGlobalFeedDialog" class="flex-none mx-auto my-2 btn-sm btn-skin"><i class="fa-solid fa-pen-to-square"></i>&nbsp;&nbsp;Add New</button>' : Defaults.EMPTY_STRING
    let html = `
        <div class="flex flex-col text-skin-on-primary h-full w-full text-center">
            <div class="sticky px-4 py-1 flex justify-between items-center bg-skin-hover/90 flex-none">
                <p class="text-md font-bold ">Global Feed</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div>
            <div class="p-[10px] flex-1 relative">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">${addNew}
                    <ul>
        `
    if (feeds.length > 0) {
        feeds.forEach(feed => {
            let user = feed.user
            let fontStyle = user.textBold ? 'font-bold' : 'font-normal'
            let image = feed.image != null ? `<img @click="showImageDialog($el)" src="${feed.image}" alt="" class="w-full mt-2 cursor-pointer">` : Defaults.EMPTY_STRING
            let content = feed.content.replaceAll('\r\n', '<br>')
            let delFeed = permission.delGlobalFeed ? `<i @click="delGlobalFeed(${feed.id})" class="fa-solid fa-trash-can icon-sm"></i>` : Defaults.EMPTY_STRING
            html += `
                <li class="card-wrap" xmlns="http://www.w3.org/1999/html">
                   <div class="flex flex-col w-full">
                       <div class="flex items-center justify-between"> 
                           <div class="flex items-center gap-2">
                               <img @click="getUserProfile(${user.id})" class="avatar flex-none cursor-pointer" src="${user.avatar}" alt="">
                               <p class="username clip ${user.nameColor} ${user.nameFont}">${user.name}</p>
                           </div>  
                           <div class="flex items-center gap-2">
                                <p class="date">${feed.createdAt}</p>${delFeed}
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
                    <img class="w-[40px]" src="/images/defaults/global-feed.webp" alt="">
                    <p class="text-[12px] font-bold" > No Global Feeds</p>
                </div>
            </li>
       `
    }
    html += `</ul></div></div></div>`
    return html
}

export function writeGlobalFeedDialogHtml() {
    return `
        <div x-data="globalFeed" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Write Global Feed </p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="mb-4">
                   <textarea x-ref="feedInput" @keyup="textArea($el, 120)" class="text-area h-[120px]" x-model="content" type="text" 
                        maxlength="3000" placeholder="write announcement"></textarea>
                   <template x-if="image"> <img :src="image" class="h-20" alt=""></template>
                   <input x-ref="input" @change="addImage($el)" type="file" name="image" class="hidden">
                </div>
                <div class="flex justify-end gap-2 items-center"> 
                 <img @click="$refs.input.click()" src="/images/defaults/picture.webp" class="w-6 h-6" alt=""> 
                 <button @click.once="writeGlobalFeed" class="btn btn-skin text-center">Post<button>
                </div>
            </div>
        </div>
    `
}

export function renderReportChatMessage(message, id, targetId, roomId, type) {
    const image = message.image ? `<img @click="showImageDialog($el)" src="${message.image}" alt="" class="lobby-image">` : Defaults.EMPTY_STRING
    const audio = message.audio ? `<audio preload="auto" controls controlslist="nodownload noplaybackrate" class="w-[250px]"> <source src="${message.audio}" type="audio/mpeg"></audio>` : Defaults.EMPTY_STRING
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

export function reportModalHtml(reports) {
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
        reports.forEach(rpt => {
            html += `
                <li @click="openReportActionDialog(${rpt.id}, ${rpt.targetId}, ${rpt.roomId}, '${rpt.type}')" class="report-user-wrap">
                   <div class="w-full gap-2">
                        <div class="flex h-full w-full items-center">
                            <img class="avatar flex-none mx-1" src="${rpt.avatar}">
                            <div class="flex-1 px-1 whitespace-nowrap overflow-hidden flex flex-col justify-center">
                                <p class="ellipsis username clip text-black"> ${rpt.name}
                                <p class="flex items-center clip ellipsis text-gray-500 text-[13px]">Reason : ${rpt.reason}</p>
                                <p class="date">${rpt.createdAt}</p>
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
                    <img class="w-[40px]" src="/images/defaults/flag.webp" alt="">
                    <p class="text-[12px] font-bold" > No Reports</p>
                </div>
            </li>
        `
    }
    html += '</ul></div></div>'
    return html
}

/**
 * Utility Functions
 * */
export function getErrorMsg(e) {
    return e.response ? e.response.data : Errors.SOMETHING_WENT_WRONG
}