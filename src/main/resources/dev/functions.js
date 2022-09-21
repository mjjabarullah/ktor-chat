import {Defaults, Errors, ReactType} from './constant'
import {emojis} from './emojis'

export function renderWelcomeMessage() {
    const topic = room.topic.replace(/%ROOM%/g, room.name)
    return `
        <li id="topic" class="topic">
            <i @click="removeTopic" class="fa-solid fa-circle-xmark "></i>
            <div class="segment">
                <p class="ribbon label bg-gradient-to-r from-skin-primary to-skin-hover">Welcome ${user.name}</p>      
                <img  alt="" src="/images/defaults/welcome.svg">
                <p>${topic}</p>        
             </div>    
        </li>
    `
}

export function renderJoinMessage(message) {
    return `
         <li class="chat-wrap justify-center">
            <div class="p-1" @click="welcomeMessage(\'${message.user.name}\')">
               <p class="rounded-md px-4 py-1 text-white bg-skin-primary text-[12px]"><b class="cursor-pointer">${message.user.name}</b> has joined the room.</p>
            </div>
        </li>
    `
}

export function renderLeaveMessage(message) {
    return `
         <li class="chat-wrap justify-center">
            <div class="p-1">
               <p class="px-4 py-1 text-gray-800 text-[12px]">${message.user.name} has left the room.</p>
            </div>
        </li>
    `
}

export function renderClearMessage(message) {
    return `
         <li class="chat-wrap justify-center">
            <div class="p-1">
               <p class="rounded-md px-4 py-1 text-white bg-skin-primary text-[12px]">Room cleared by ${message.user.name}</p>
            </div>
        </li>
    `
}

export function renderChatMessage(message) {
    const image = message.image ? `<img @click="showImageDialog($el)" src="${message.image}" alt="" class="lobby-image">` : Defaults.EMPTY_STRING
    const audio = message.audio ? `<audio  preload="auto" controls controlslist="nodownload noplaybackrate" class="w-[250px]"><source src="${message.audio}" type="audio/mpeg"></audio>` : Defaults.EMPTY_STRING
    const youtube = message.ytFrame ? message.ytFrame : Defaults.EMPTY_STRING
    const gender = message.user.gender === 'Male' ? 'male' : 'female'
    const bold = message.user.textBold ? 'font-bold' : 'font-normal'
    const delIcon = permission.delMsg ? `<i @click="deleteChat(${message.id})" class="fa-solid fa-square-xmark icon-sm"></i>` : Defaults.EMPTY_STRING
    message.content = appendEmojis(message.content)
    message.content = message.content.replace(RegExp(`${user.name}`, 'gi'), `<span class="tag">${user.name}</span>`)
    let clip = message.user.textBg = ''
    if (message.highLighted) {
        message.user.textBg = `b-${message.user.textColor} highlighted`
        message.user.textColor = 'text-white'
    } else {
        clip = 'clip'
    }
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
                <div class=" px-1 pr-2">${image} ${audio} ${youtube}
                    <p class="chat ${clip} ${message.user.textColor} ${message.user.textBg} ${message.user.textFont} ${bold}">
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
        emos += `<div x-show="emoTab === ${index}"  class="emojis" >`
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

export function appendEmojis(content) {
    if (content === '') return content
    let result = ''
    const words = content.split(' ')
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
                <i @click="closeSmallModal; $nextTick(()=>$refs.mainInput.focus()) " class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="pb-4 px-4 text-center ">
               <img class="w-20 h-20 mx-auto" src="/images/defaults/happy.webp" alt=""> 
                <p class="mt-2 text-2xl font-bold">Welcome ${name}</p>
                <p class="mt-2 text-[13px] leading-[15px]">You are currently logged in as guest. Click here to register your account in order to access more features.</p>
                <div class="text-center flex gap-2 justify-center mt-2">
                    <button @click="closeSmallModal; $nextTick(()=>$refs.mainInput.focus())" class="px-2 btn-action bg-red-500">Close</button>
                    <button @click="showGuestRegisterDialog" class="px-2 btn-action bg-green-500">Register</button>          
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
                <p class="text-[14px] mb-2">Are you sure, want to log out?</p>  
                <div class="flex gap-2 justify-center">
                    <button @click="logout" class="btn-action bg-green-500">Yes</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">No</button>          
                </div>
            </div>
        </div>
    `
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
                        <img @click="setAvatar(index)" class="w-full h-full rounded-full cursor-pointer" :src="avatar"> 
                      </div>
                  </template>
                </div> 
                Or 
                <div class="mt-1">
                    <input x-ref='uploadAvatar' @change="changeAvatar($el)" class="input-image" type="file" accept="image/*">
                    <div class="flex gap-2 justify-center">
                        <button @click="$refs.uploadAvatar.click()" class="btn-action bg-green-500">Upload</button>          
                        <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                    </div>
                </div>  
            </div>
        </div>
    `
}

export function changeNameHtml() {
    return `
        <div x-data="{name:user.name}" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Username</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="h-10 mb-4">
                    <label class="h-full">
                        <input x-model="name" name="name" onkeypress="return /^[a-zA-Z\\d_-]*$/i.test(event.key)"
                               class="input-text" type="text" placeholder="Username"
                               autocomplete="off" required minlength="4" maxlength="12" autofocus>
                    </label> 
                </div>    
                 <div class="flex gap-2 justify-center">
                    <button @click="changeName(name)" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                </div>
            </div>
        </div>
    `;
}

export function customizeNameHtml() {
    return `
        <div x-data="customize" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Customize Username</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div>
            <div class="p-4">
                <template x-if="user.nameFont"> 
                    <p class="w-full font-bold clip" :class="[nameFont, nameColor]" x-text="user.name"></p>
                </template>
                <template x-if="permission.nameFont"> 
                    <div class="w-full h-10 mb-4">
                    <select x-model="nameFont" class="input-text">
                        <option value="">Select Font</option>
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
                 <div class="flex gap-2 justify-center">
                    <button @click="customizeName" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                </div>
            </div>
        </div>
    `
}

export function changeMoodHtml() {
    return `
        <div x-data="{mood:user.mood}" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Your Mood</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="h-10 mb-4">
                    <label class="h-full">
                        <input x-model="mood" name="mood" onkeypress="return /^[a-zA-Z\\d_-\\s]*$/i.test(event.key)"
                               class="input-text" type="text" placeholder="Type mood here"
                               autocomplete="off" required maxlength="40" autofocus>
                    </label>
                </div> 
                <div class="flex gap-2 justify-center">
                    <button @click="changeMood(mood)" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                </div>
            </div>
        </div>
    `
}

export function changeAboutHtml() {
    return `
        <div x-data="{about:user.about}" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change About Me</p>
                <i @click="closeAboutDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="mb-4">
                    <textarea @keyup="textArea($el, 60)" class="text-area" x-model="about" 
                        type="text" maxlength="150" name="about" autofocus></textarea>
                </div>
                 <div class="flex gap-2 justify-center">
                    <button @click="changeAbout(about)" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                </div>
            </div>
        </div>
    `
}

export function changePasswordHtml() {
    return `
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
                 <div class="flex gap-2 justify-center">
                    <button @click="changePassword(password)" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                </div>
            </div>   
        </div>
    `
}

export function changeStatusHtml() {
    return `
        <div x-data="{status:user.status}" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Status</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="w-full h-10 mb-4">
                    <select x-model="status" class="input-text">
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
                 <div class="flex gap-2 justify-center">
                    <button @click="changeStatus(status)" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                 </div>
            </div>
        </div>
   `
}

export function changeGenderHtml() {
    return `
        <div x-data="{gender:user.gender}" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Gender</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div>
            <div class="p-4">
                <div class="w-full h-10 mb-4">
                    <select x-model="gender" class="input-text">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div class="flex gap-2 justify-center">
                    <button @click="changeGender(gender)" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                 </div>
            </div>
        </div>
   `
}

export function changeDobHtml() {
    return `
        <div x-data="{dob:user.dob}" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Date of Birth</p>
                <i @click="closeDobDialog" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div>
            <div class="p-4">
                <div class="w-full h-10 mb-4">
                    <input x-model="dob" class="input-text"  name="dob" max="2010-12-31" min="1970-12-31" type="date">
                </div>
                <div class="flex gap-2 justify-center">
                    <button @click="changeDob(dob)" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                </div>
            </div>
        </div>
    `
}

export function customizeTextHtml() {
    return `
        <div x-data="customize" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Chat Option</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div>
            <div class="p-4">
                <template x-if="textFont"> 
                    <p class="w-full clip" :class="[textFont, textColor, textBold=='true' ? 'font-bold' : 'font-normal' ]">Sample Text</p>
                </template>    
                <div class="w-full h-10 mb-4">
                    <select x-model="textFont" class="input-text">
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
                    <select x-model="textBold" class="input-text">
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
                 <div class="flex gap-2 justify-center">
                    <button @click="customizeText" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                </div>
            </div>
        </div>
    `
}

export function messageModalHtml() {
    return `
        <div class="text-skin-on-primary h-full">
            <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                <p class="text-md font-bold ">Messages</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-[10px]">
                <ul class="h-full ">
                    <template x-if="pvtUsers.length>0" >
                        <template x-for="pvtUser in pvtUsers" :key="pvtUser.id">
                            <li @click="openPvtDialog(pvtUser.id)" class="pvt-user-wrap">
                               <div class="w-full gap-2">
                                    <div class="flex h-full w-full items-center">
                                        <img class="avatar flex-none mx-1" :src="pvtUser.avatar">
                                        <div class="flex-1 px-1 whitespace-nowrap overflow-hidden flex flex-col justify-center">
                                            <p class="ellipsis username clip" :class="[pvtUser.nameColor, pvtUser.nameFont]" x-text="pvtUser.name">
                                            <p class="flex items-center clip ellipsis text-gray-500 text-[12px]" x-text="getPvtMessage(pvtUser)"></p>
                                        </div>
                                       <p x-show="pvtUser.unReadCount>0" class="count-md" x-text="pvtUser.unReadCount"></p>
                                    </div>
                                </div>
                            </li> 
                        </template>
                    </template>
                    <template x-if="pvtUsers.length === 0"> 
                        <li class="pvt-user-wrap">
                           <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                <img class="w-[40px]" src="/images/defaults/topic.webp" alt="">
                                <p class="text-[12px] font-bold" > No Messages</p>
                            </div>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    `
}

export function changeUserNameHtml() {
    return `
        <div x-data="{name:u.user.name}" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change Username</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div>
            <div class="p-4">
                <div class="h-10 mb-4">
                    <label class="h-full">
                        <input x-model="name" name="name" onkeypress="return /^[a-zA-Z\\d_-]*$/i.test(event.key)"
                               class="input-text" type="text" placeholder="Username"
                               autocomplete="off" required minlength="4" maxlength="12" autofocus>
                    </label> 
                </div>    
                <div class="flex gap-2 justify-center">
                    <button @click="changeUserName(name)" class="btn-action bg-green-500">Change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                </div>
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
                    <div class="flex gap-2 justify-center">
                        <button @click="$refs.uploadUserAvatar.click()" class="btn-action bg-green-500">Upload</button>          
                        <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>          
                    </div> 
                </div>  
            </div>
        </div>
   `
}

export function changeUserRankHtml(ranks) {
    let options = ''
    ranks.forEach(rank => options += `<option value="${rank.id}">${rank.name}</option>`)
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold ">Change User Rank</p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <div class="w-full mb-4 h-10"> 
                    <select x-model="u.user.rank.id" class="input-text h-full">
                        ${options}
                    </select>
                </div>
                <div class="flex gap-2 justify-center">
                    <button @click="changeUserRank" class="btn-action bg-green-500">change</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button> 
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
            <div class="loader-wrap">
                <img class="w-full" src="/images/defaults/loader.gif"></img>
            </div>
        </div>
   `
}

export function roomModalHtml() {
    return `
        <div class="text-skin-on-primary h-full">
            <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                <p class="text-md font-bold ">Room List</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-[10px]">
                <ul class="h-full">
                    <template x-for="rm in rooms" :key="rm.id">
                       <li class="my-2 px-2 py-1 border border-gray-200 flex items-center rounded shadow-md shadow-black/5 ">
                            <i class="fa-solid fa-earth-americas text-3xl flex-none text-skin-hover"></i>
                            <div class="flex-1 text-left ml-2 text-black">
                                <p class="font-bold text-[12px]" x-text="rm.name"></p>
                                <div>
                                    <i class="fa-solid fa-user-group "></i><span class="ml-2" x-text="rm.onlineUsers"></span>
                                </div>
                            </div>
                            <template x-if="rm.id === room.id"> 
                                 <p class="text-black text-[10px] font-bold">(Current Room)</p>
                            </template>
                             <template x-if="rm.id !== room.id"> 
                                 <form class="flex-none" :action="'/${domain.id}/rooms/'+rm.id+'/join'" method="post">
                                    <button type="submit" class="btn-join">Join<i class="fa-solid fa-angles-right ml-2"></i></button>
                                 </form>
                            </template>
                       </li> 
                    </template>
                </ul> 
            </div>
        </div>
    `
}

export function newsModalHtml() {
    return `
        <div class="flex flex-col text-skin-on-primary h-full w-full text-center" >
            <div class="sticky px-4 py-1 flex justify-between items-center bg-skin-hover/90 flex-none">
                <p class="text-md font-bold ">Announcements</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div>
            <div class="p-[10px] flex-1 relative">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">
                    <template x-if="permission.writeNews">
                        <button @click="writeNewsDialog" class="flex-none mx-auto my-2 btn-sm btn-skin"> 
                            <i class="fa-solid fa-pen-to-square"></i>&nbsp;&nbsp;Add New 
                        </button> 
                    </template>
                    <ul>
                        <template x-if="news.posts.length>0">
                            <template x-for="post in news.posts" :key="post.id">
                                <li x-data="post" x-init="setData(1)" class="card-wrap" >
                                    <div class="flex flex-col w-full">
                                       <div class="flex items-center justify-between"> 
                                           <div class="flex items-center gap-2">
                                               <img @click="getUserProfile(post.user.id)" class="avatar flex-none cursor-pointer" :src="post.user.avatar" alt="">
                                               <div class="text-start">
                                                   <p class="username clip" :class="[post.user.nameColor, post.user.nameFont]" x-text="post.user.name"></p>
                                                   <p class="date" x-text="post.createdAt"></p>
                                               </div>
                                           </div> 
                                           <template x-if="permission.delNews">
                                              <i @click="delNews(post.id)" class="fa-solid fa-trash-can icon-sm"></i>
                                           </template>                       
                                       </div>
                                        <div class="card-content">
                                           <p class="chat clip" :class="[post.user.textColor, post.user.textFont, post.user.textBold?'font-bold':'font-normal' ]" x-text="post.content"></p> 
                                           <template x-if="post.image"> 
                                               <img @click="showImageDialog($el)" :src="post.image" alt="" class="post-image">
                                           </template>
                                        </div>  
                                    </div>
                                    <div class="flex flex-col">
                                        <div class="flex mt-4 mb-2 justify-between items-center px-1">
                                            <div class="flex items-center gap-2"> 
                                              <div @click="postReact(post.id, 1)" class="reaction" :class="post.liked?'reacted':''">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/like.webp"> 
                                                <p class="text-[12px]" x-text="post.likeCount"></p> 
                                              </div>  
                                              <div @click="postReact(post.id, 2)" class="reaction" :class="post.loved?'reacted':''">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/heart.webp"> 
                                                <p class="text-[12px]" x-text="post.loveCount"></p> 
                                              </div>  
                                              <div @click="postReact(post.id, 3)" class="reaction" :class="post.laughed?'reacted':''">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/lol.webp"> 
                                                <p class="text-[12px]" x-text="post.lolCount"></p> 
                                              </div>
                                              <div @click="postReact(post.id, 4)" class="reaction" :class="post.disliked?'reacted':''">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/dislike.webp"> 
                                                <p class="text-[12px]" x-text="post.dislikeCount"></p> 
                                              </div>
                                            </div>
                                            <div x-show="post.commentsCount >0" @click="getComments(post.id)" class="reaction">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/comment.webp"> 
                                                <p class="text-[12px]" x-text="post.commentsCount"></p> 
                                            </div>
                                        </div>
                                         <label class="h-10">
                                            <input x-ref="input" @keyup.enter="writeComment(post.id)" class="input-text" 
                                            type="text" placeholder="Type your comment here.." autocomplete="off" required maxlength="300">
                                        </label>
                                        <ul x-show="showComments">
                                            <template x-for="comment in post.comments" :key="comment.id">
                                                <li class="comment-wrap" >
                                                    <div class="flex justify-between "> 
                                                       <div class="flex gap-2 text-start">
                                                           <img @click="getUserProfile(comment.user.id)" class="avatar flex-none cursor-pointer" :src="comment.user.avatar" alt="">
                                                           <div>
                                                               <p class="username clip" :class="[comment.user.nameColor, comment.user.nameFont]" x-text="comment.user.name"></p>
                                                               <p class="date" x-text="comment.createdAt"></p>
                                                               <p class="chat clip mt-1" :class="[comment.user.textColor]" x-text="comment.content"></p>
                                                           </div>
                                                       </div> 
                                                       <template x-if="permission.delComment || post.user.id === userId">
                                                          <i @click="delComment(post.id, comment.id)" class="fa-solid fa-trash-can icon-sm"></i>
                                                       </template>                       
                                                    </div>  
                                                </li> 
                                            </template>
                                        </ul>
                                    </div>
                                </li>
                            </template>
                        </template>
                        <template x-if="news.posts.length==0">
                            <li class="pvt-user-wrap">
                               <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                    <img class="w-[40px]" src="/images/defaults/announcement.webp" alt="">
                                    <p class="text-[12px] font-bold" > No Announcements</p>
                                </div>
                            </li>
                        </template
                    </ul> 
                </div> 
            </div> 
        </div>
    `
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
                   <template x-if="image"> <img :src="image" class="mt-2 h-20" alt=""></template>
                   <input x-ref="input" @change="addImage($el)" type="file" name="image" class="hidden">
                </div>
                <div class="flex justify-end gap-2 items-center"> 
                 <img @click="$refs.input.click()" src="/images/defaults/picture.webp" class="w-6 h-6" alt=""> 
                 <button @click.once="writeNews" class="btn btn-skin text-center"><i class="fa-solid fa-paper-plane mr-2"></i>Post</button>
                </div>
            </div>
        </div>
    `
}

export function adminshipModalHtml() {
    return `
        <div class="flex flex-col text-skin-on-primary h-full w-full text-center" >
            <div class="sticky px-4 py-1 flex justify-between items-center bg-skin-hover/90 flex-none">
                <p class="text-md font-bold ">Adminship</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div>
            <div class="p-[10px] flex-1 relative">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">
                    <template x-if="user.canSeeAdminship">
                        <button @click="writeAdminshipDialog" class="flex-none mx-auto my-2 btn-sm btn-skin"> 
                            <i class="fa-solid fa-pen-to-square"></i>&nbsp;&nbsp;Add New 
                        </button> 
                    </template>
                    <ul>
                        <template x-if="adminship.posts.length>0">
                            <template x-for="post in adminship.posts" :key="post.id">
                                <li x-data="post" x-init="setData(3)" class="card-wrap">
                                    <div class="flex flex-col w-full">
                                       <div class="flex items-center justify-between"> 
                                           <div class="flex items-center gap-2">
                                               <img @click="getUserProfile(post.user.id)" class="avatar flex-none cursor-pointer" :src="post.user.avatar" alt="">
                                               <div class="text-start">
                                                   <p class="username clip" :class="[post.user.nameColor, post.user.nameFont]" x-text="post.user.name"></p>
                                                   <p class="date" x-text="post.createdAt"></p>
                                               </div>
                                           </div> 
                                           <template x-if="permission.delAS">
                                              <i @click="delAdminship(post.id)" class="fa-solid fa-trash-can icon-sm"></i>
                                           </template>                       
                                       </div>
                                        <div class="card-content">
                                           <p class="chat clip" :class="[post.user.textColor, post.user.textFont, post.user.textBold?'font-bold':'font-normal' ]" x-text="post.content"></p> 
                                           <template x-if="post.image"> 
                                               <img @click="showImageDialog($el)" :src="post.image" alt="" class="post-image">
                                           </template>
                                        </div>  
                                    </div>
                                    <div class="flex flex-col">
                                        <div class="flex mt-4 mb-2 justify-between items-center px-1">
                                            <div class="flex items-center gap-2"> 
                                              <div @click="postReact(post.id, 1)" class="reaction" :class="post.liked?'reacted':''">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/like.webp"> 
                                                <p class="text-[12px]" x-text="post.likeCount"></p> 
                                              </div>  
                                              <div @click="postReact(post.id, 2)" class="reaction" :class="post.loved?'reacted':''">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/heart.webp"> 
                                                <p class="text-[12px]" x-text="post.loveCount"></p> 
                                              </div>  
                                              <div @click="postReact(post.id, 3)" class="reaction" :class="post.laughed?'reacted':''">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/lol.webp"> 
                                                <p class="text-[12px]" x-text="post.lolCount"></p> 
                                              </div>
                                              <div @click="postReact(post.id, 4)" class="reaction" :class="post.disliked?'reacted':''">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/dislike.webp"> 
                                                <p class="text-[12px]" x-text="post.dislikeCount"></p> 
                                              </div>
                                            </div>
                                            <div x-show="post.commentsCount >0" @click="getComments(post.id)" class="reaction">
                                                <img class="w-[20px] h-[20px]" alt="" src="/images/defaults/comment.webp"> 
                                                <p class="text-[12px]" x-text="post.commentsCount"></p> 
                                            </div>
                                        </div>
                                         <label class="h-10">
                                            <input x-ref="input" @keyup.enter="writeComment(post.id)" class="input-text" 
                                            type="text" placeholder="Type your comment here.." autocomplete="off" required maxlength="300">
                                        </label>
                                        <ul x-show="showComments">
                                            <template x-for="comment in post.comments" :key="comment.id">
                                                <li class="comment-wrap" >
                                                    <div class="flex justify-between "> 
                                                       <div class="flex gap-2 text-start">
                                                           <img @click="getUserProfile(comment.user.id)" class="avatar flex-none cursor-pointer" :src="comment.user.avatar" alt="">
                                                           <div>
                                                               <p class="username clip" :class="[comment.user.nameColor, comment.user.nameFont]" x-text="comment.user.name"></p>
                                                               <p class="date" x-text="comment.createdAt"></p>
                                                               <p class="chat clip mt-1" :class="[comment.user.textColor]" x-text="comment.content"></p>
                                                           </div>
                                                       </div> 
                                                       <template x-if="permission.delComment || post.user.id === userId">
                                                          <i @click="delComment(post.id, comment.id)" class="fa-solid fa-trash-can icon-sm"></i>
                                                       </template>                       
                                                    </div>  
                                                </li> 
                                            </template>
                                        </ul>
                                    </div>
                                </li>
                            </template>
                        </template>
                        <template x-if="adminship.posts.length==0">
                            <li class="pvt-user-wrap">
                               <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                    <img class="w-[40px]" src="/images/defaults/adminship.webp" alt="">
                                    <p class="text-[12px] font-bold" > No Adminship Posts</p>
                                </div>
                            </li>
                        </template
                    </ul> 
                </div> 
            </div> 
        </div>
    `
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
                   <textarea x-ref="postInput" @keyup="textArea($el, 120)" class="text-area h-[120px]" x-model="content" type="text" 
                        maxlength="3000" placeholder="write announcement"></textarea>
                   <template x-if="image"> <img :src="image" class="mt-2 h-20" alt=""></template>
                   <input x-ref="input" @change="addImage($el)" type="file" name="image" class="hidden">
                </div>
                <div class="flex justify-end gap-2 items-center"> 
                 <img @click="$refs.input.click()" src="/images/defaults/picture.webp" class="w-6 h-6" alt=""> 
                 <button @click.once="writeAdminship" class="btn btn-skin text-center"><i class="fa-solid fa-paper-plane mr-2"></i>Post</button>
                </div>
            </div>
        </div>
    `
}

export function globalFeedModalHtml() {
    return `
        <div class="flex flex-col text-skin-on-primary h-full w-full text-center" >
            <div class="sticky px-4 py-1 flex justify-between items-center bg-skin-hover/90 flex-none">
                <p class="text-md font-bold ">Global Feed</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div>
            <div class="p-[10px] flex-1 relative">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">
                    <template x-if="rank.code !== 'guest'">
                        <button @click="writeGlobalFeedDialog" class="flex-none mx-auto my-2 btn-sm btn-skin"> 
                            <i class="fa-solid fa-pen-to-square"></i>&nbsp;&nbsp;Add New 
                        </button> 
                    </template>
                    <ul>
                        <template x-if="globalFeed.posts.length>0">
                            <template x-for="post in globalFeed.posts" :key="post.id">
                                <li x-data="post" x-init="setData(2)" class="card-wrap" >
                                    <div class="flex flex-col w-full">
                                       <div class="flex items-center justify-between"> 
                                           <div class="flex items-center gap-2">
                                               <img @click="getUserProfile(post.user.id)" class="avatar flex-none cursor-pointer" :src="post.user.avatar" alt="">
                                               <div class="text-start">
                                                   <p class="username clip" :class="[post.user.nameColor, post.user.nameFont]" x-text="post.user.name"></p>
                                                   <p class="date" x-text="post.createdAt"></p>
                                               </div>
                                           </div> 
                                           <template x-if="permission.delGF">
                                              <i @click="delGlobalFeed(post.id)" class="fa-solid fa-trash-can icon-sm"></i>
                                           </template>                       
                                       </div>
                                        <div class="card-content">
                                           <p class="chat clip" :class="[post.user.textColor, post.user.textFont, post.user.textBold?'font-bold':'font-normal' ]" x-text="post.content"></p> 
                                           <template x-if="post.image"> 
                                               <img @click="showImageDialog($el)" :src="post.image" alt="" class="post-image">
                                           </template>
                                        </div>  
                                    </div>
                                    <div  class="flex flex-col">
                                        <div class="flex m-2 justify-between items-center">
                                            <div class="flex items-center gap-1"> 
                                              <div @click="postReact(post.id, 1)" class="reaction" :class="post.liked?'reacted':''">
                                                <img class="w-4 h-4" alt="" src="/images/defaults/like.webp"> 
                                                <p class="text-[12px]" x-text="post.likeCount"></p> 
                                              </div>  
                                              <div @click="postReact(post.id, 2)" class="reaction" :class="post.loved?'reacted':''">
                                                <img class="w-4 h-4" alt="" src="/images/defaults/heart.webp"> 
                                                <p class="text-[12px]" x-text="post.loveCount"></p> 
                                              </div>  
                                              <div @click="postReact(post.id, 3)" class="reaction" :class="post.laughed?'reacted':''">
                                                <img class="w-4 h-4" alt="" src="/images/defaults/lol.webp"> 
                                                <p class="text-[12px]" x-text="post.lolCount"></p> 
                                              </div>
                                              <div @click="postReact(post.id, 4)" class="reaction" :class="post.disliked?'reacted':''">
                                                <img class="w-4 h-4" alt="" src="/images/defaults/dislike.webp"> 
                                                <p class="text-[12px]" x-text="post.dislikeCount"></p> 
                                              </div>
                                            </div>
                                            <div x-show="post.commentsCount >0" @click="getComments(post.id)" class="reaction">
                                                <img class="w-4 h-4" alt="" src="/images/defaults/comment.webp"> 
                                                <p class="text-[12px]" x-text="post.commentsCount"></p> 
                                            </div>
                                        </div>
                                         <label class="h-10">
                                            <input x-ref="input" @keyup.enter="writeComment(post.id)" class="input-text" 
                                            type="text" placeholder="Type your comment here.." autocomplete="off" required maxlength="300">
                                        </label>
                                        <ul x-show="showComments">
                                            <template x-for="comment in post.comments" :key="comment.id">
                                                <li class="comment-wrap" >
                                                    <div class="flex justify-between "> 
                                                       <div class="flex gap-2 text-start">
                                                          <img @click="getUserProfile(comment.user.id)" class="avatar flex-none cursor-pointer" :src="comment.user.avatar" alt="">
                                                           <div>
                                                               <p class="username clip" :class="[comment.user.nameColor, comment.user.nameFont]" x-text="comment.user.name"></p>
                                                               <p class="date" x-text="comment.createdAt"></p>
                                                               <p class="chat clip mt-1" :class="[comment.user.textColor]" x-text="comment.content"></p>
                                                           </div>
                                                       </div> 
                                                       <template x-if="permission.delComment || post.user.id === userId">
                                                          <i @click="delComment(post.id, comment.id)" class="fa-solid fa-trash-can icon-sm"></i>
                                                       </template>                       
                                                    </div>  
                                                </li> 
                                            </template>
                                        </ul>
                                    </div>
                                </li>
                            </template>
                        </template>
                        <template x-if="globalFeed.posts.length==0">
                            <li class="pvt-user-wrap">
                               <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                    <img class="w-[40px]" src="/images/defaults/global-feed.webp" alt="">
                                    <p class="text-[12px] font-bold" >No Global Feeds</p>
                                </div>
                            </li>
                        </template
                    </ul> 
                </div> 
            </div> 
        </div>
    `
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
                   <textarea x-ref="postInput" @keyup="textArea($el, 120)" class="text-area h-[120px]" x-model="content" type="text" 
                        maxlength="3000" placeholder="write announcement"></textarea>
                   <template x-if="image"> <img :src="image" class="mt-2 h-20" alt=""></template>
                   <input x-ref="input" @change="addImage($el)" type="file" name="image" class="hidden">
                </div>
                <div class="flex justify-end gap-2 items-center"> 
                 <img @click="$refs.input.click()" src="/images/defaults/picture.webp" class="w-6 h-6" alt=""> 
                 <button @click.once="writeGlobalFeed" class="btn btn-skin text-center"><i class="fa-solid fa-paper-plane mr-2"></i>Post</button>
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
                <img @click="getUserProfile(${message.user.id}); closeSmallModal()" 
                    class="w-[36px] h-[36px] rounded-full flex-none cursor-pointer" src="${message.user.avatar}">
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
        <button @click="takeAction(${id}, ${targetId},${roomId}, '${type}')" class="btn btn-skin text-center">Take Action</button>
        <button @click="noAction(${id}, '${type}')" class="btn btn-disabled text-center ml-2">No Action</button>
    </div> </div>`
}

export function reportModalHtml() {
    return `
        <div class="text-skin-on-primary h-full">
            <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                <p class="text-md font-bold ">Reports</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-[10px]">
                <ul class="h-full ">
                    <template x-if="reports.length>0">
                        <template x-for="report in reports" :key="report.id">
                           <li @click="openReportActionDialog(report.id,report.targetId,report.roomId,report.type)" class="report-user-wrap">
                               <div class="w-full gap-2">
                                    <div class="flex h-full w-full items-center">
                                        <img class="avatar flex-none mx-1" :src="report.avatar">
                                        <div class="flex-1 px-1 whitespace-nowrap overflow-hidden flex flex-col justify-center">
                                            <p class="ellipsis username clip text-black" x-text="report.name">
                                            <p class="date" x-text="report.createdAt"></p>
                                            <p class="flex items-center ellipsis text-gray-500 text-[13px]" x-text="'Reason : '+report.reason"></p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                         </template>
                    </template>
                    <template x-if="reports.length==0">
                       <li class="pvt-user-wrap">
                           <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                <img class="w-[40px]" src="/images/defaults/flag.webp" alt="">
                                <p class="text-[12px] font-bold" > No Reports</p>
                            </div>
                       </li>
                    </template
                </ul> 
            </div> 
        </div>
    `
}

export function reportDialogHtml(id, type) {
    return `
        <div x-data="{ id: ${id}, type: '${type}' }" class="text-gray-700 text-center">
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

export function notificationModalHtml() {
    return `
        <div class="flex flex-col text-skin-on-primary h-full w-full">
            <div class="px-4 py-1 flex justify-between items-center bg-skin-hover/90">
                <p class="text-md font-bold ">Notifications</p>
                <i @click="closeNotificationModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-[10px] flex-1 relative">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">
                    <ul >
                        <template x-if="notification.notifications.length>0">
                            <template x-for="notification in notification.notifications" :key="notification.id">
                               <li class="report-user-wrap">
                                   <div class="w-full gap-2">
                                        <div class="flex h-full w-full items-center">
                                            <img class="avatar flex-none mx-1" src="/images/defaults/bot.webp">
                                            <div class="flex-1 px-1 whitespace-nowrap overflow-hidden flex flex-col justify-center relative">
                                                <div x-show="!notification.seen" class="bg-red-500 absolute px-1 rounded right-1 top-1">
                                                    <p class="text-[10px] font-bold text-white">New</p> 
                                                </div>
                                                <p class="ellipsis username clip text-black">System</p>
                                                <p class="flex items-center clip ellipsis text-gray-500 text-[13px]" x-text="notification.content"></p>
                                                <p class="date" x-text="notification.createdAt"></p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                             </template>
                        </template>
                        <template x-if="notification.notifications.length==0">
                           <li class="pvt-user-wrap">
                               <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                    <img class="w-[40px]" src="/images/defaults/bell.webp" alt="">
                                    <p class="text-[12px] font-bold" >No Notifications</p>
                                </div>
                           </li>
                        </template
                    </ul> 
                </div>
            </div> 
        </div>
    `
}

export function blockedModalHtml() {
    return `
        <div class="flex flex-col text-skin-on-primary h-full w-full text-center">
            <div class="sticky px-4 py-1 flex justify-between items-center bg-skin-hover/90 flex-none">
                <p class="text-md font-bold ">Manage Blocked Users</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div>
            <div class="p-[10px] flex-1 relative">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">
                    <ul>
                        <template x-if="blockedUsers.length>0"> 
                            <template x-for="blockedUser in blockedUsers" :key="blockedUser.id"> 
                                <li class="card-wrap border border-gray-200 shadow-sm shadow-black/10 px-2 !py-2" >
                                   <div class="flex flex-col w-full">
                                       <div class="flex items-center justify-between"> 
                                           <div class="flex items-center gap-2">
                                               <img class="avatar flex-none cursor-pointer" :src="blockedUser.avatar" alt="">
                                               <p class="username clip" :class="blockedUser.nameColor, blockedUser.nameFont" x-text="blockedUser.name"></p>
                                           </div>  
                                           <i @click="unblock(blockedUser.id, blockedUser.name)" class="text-red-500 fas fa-times-circle text-xl cursor-pointer"></i> 
                                       </div> 
                                   </div>
                               </li>
                            </template>
                        </template>
                        <template x-if="blockedUsers.length==0">
                           <li class="pvt-user-wrap">
                               <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                    <img class="w-[40px]" src="/images/defaults/blocked.webp" alt="">
                                    <p class="text-[12px] font-bold" >No Blocked users</p>
                                </div>
                           </li>
                        </template>
                   </ul> 
               </div>
           </div>
       </div>
    `
}

export function searchModalHtml() {
    return `
        <div x-data="search" class="flex flex-col text-skin-on-primary h-full w-full text-center">
            <div class="sticky px-4 py-1 flex justify-between items-center bg-skin-hover/90 flex-none">
                <p class="text-md font-bold ">Search User</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div>
            <div class="p-[10px] flex-1 relative text-black">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">
                    <div class="h-10 my-4">
                        <label class="h-full">
                            <input @input.debounce.1000ms="searchUser" x-model="query" class="input-text" type="text"
                             placeholder="Search by username" autocomplete="off" required maxlength="40">
                        </label>
                    </div>
                    <ul>
                        <template x-for="sUser in searchedUsers" :key="sUser.id">
                            <template x-if="sUser.name">
                                <li @click="getUserProfile(sUser.id)" class="card-wrap border border-gray-200 shadow-sm shadow-black/10 px-2 !py-2" >
                                   <div class="flex flex-col w-full">
                                       <div class="flex items-center justify-between"> 
                                           <div class="flex items-center gap-2">
                                               <img class="avatar flex-none cursor-pointer" :src="sUser.avatar" alt="">
                                               <p class="username clip" :class="sUser.nameColor, sUser.nameFont" x-text="sUser.name"></p>
                                           </div>
                                       </div> 
                                   </div>
                                </li>
                           </template>
                        </template>
                        <template x-for="sUser in searchedUsers" :key="sUser.id">
                            <template x-if="sUser.empty">
                                    <li class="pvt-user-wrap">
                                       <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                            <img class="w-[40px]" src="/images/defaults/search.webp" alt="">
                                            <p class="text-[12px] font-bold" >No User Found</p>
                                        </div>
                                   </li>
                            </template>
                        </template>
                   </ul>               
               </div>
           </div>
       </div>
    `
}

export function investigationModalHtml() {
    return `
        <div x-data="investigation" class="flex flex-col text-skin-on-primary h-full w-full text-center">
            <div class="sticky px-4 py-1 flex justify-between items-center bg-skin-hover/90 flex-none">
                <p class="text-md font-bold ">Investigation</p>
                <i @click="closeFullModal" class="fas fa-times-circle top-0 right-[5px] text-2xl cursor-pointer"></i>
            </div>
            <div x-show="tab==0" class="p-[10px] flex-1 relative text-black">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">
                    <div class="h-10 my-4">
                        <label class="h-full">
                            <input @input.debounce.1000ms="searchUser" x-model="query" class="input-text" type="text"
                             placeholder="Search by username" autocomplete="off" required maxlength="40">
                        </label>
                    </div>
                    <div class="flex my-4 justify-center">
                        <button @click="investigateAll" class="btn-action bg-green-500">Investigate All</button>         
                    </div>
                    <ul>
                        <template x-for="sUser in searchedUsers" :key="sUser.id">
                            <template x-if="sUser.name">
                                <li @click="investigate(sUser)" class="card-wrap border border-gray-200 shadow-sm shadow-black/10 px-2 !py-2 rounded" >
                                   <div class="flex flex-col w-full">
                                       <div class="flex items-center justify-between"> 
                                           <div class="flex items-center gap-2">
                                               <img class="avatar flex-none cursor-pointer" :src="sUser.avatar" alt="">
                                               <p class="username clip" :class="sUser.nameColor, sUser.nameFont" x-text="sUser.name"></p>
                                           </div>
                                       </div> 
                                   </div>
                                </li>
                           </template>
                        </template>
                        <template x-for="sUser in searchedUsers" :key="sUser.id">
                            <template x-if="sUser.empty">
                                    <li class="pvt-user-wrap">
                                       <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                            <img class="w-[40px]" src="/images/defaults/search.webp" alt="">
                                            <p class="text-[12px] font-bold" >No User Found</p>
                                        </div>
                                   </li>
                            </template>
                        </template>
                   </ul>               
               </div>
            </div>
            <div x-show="tab==1" class="p-[10px] flex-1 relative text-black">
                <div class="h-full absolute inset-0 overflow-y-auto scrollbar px-2">
                    <div class="flex my-4 justify-center">
                        <button @click="goBack" class="text-center outline-none text-white font-bold rounded-md text-[12px] py-0.5 px-4 bg-green-500"><i class="fa-solid fa-arrow-left"></i> Go back</button>         
                    </div>
                    <ul>
                       <template x-if="pvtMessages.length>0"> 
                            <template x-for="pvtMessage in pvtMessages" :key="pvtMessage.id"> 
                                <li class="chat-wrap">
                                   <div class="flex py-1 px-2 w-full" >
                                        <img @click="getUserProfile(pvtMessage.sender.id)" class="avatar flex-none cursor-pointer" 
                                            :class="[pvtMessage.sender.gender=='Male'? 'male' : 'female']" :src="pvtMessage.sender.avatar">
                                        <div class="ml-2 flex-1 ">
                                            <div class="flex justify-between">
                                                <p>
                                                   <span class="username" :class="[pvtMessage.sender.name == victim.name? 'tag' :'']" x-text="pvtMessage.sender.name"></span> to 
                                                   <span class="username" :class="[pvtMessage.receiver.name == victim.name? 'tag' :'']" x-text="pvtMessage.receiver.name"></span>
                                                </p>
                                                <p class="date" x-text="pvtMessage.createdAt"></p>
                                            </div>
                                            <div class="px-1 pr-2">
                                                <template x-if="pvtMessage.image">
                                                    <img @click="showImageDialog($el)" :src="pvtMessage.image" alt="" class="lobby-image"> 
                                                </template>
                                                <template>
                                                    <audio  preload="auto" controls controlslist="nodownload noplaybackrate" class="w-[250px]">
                                                        <source :src="pvtMessage.audio" type="audio/mpeg">
                                                    </audio> 
                                                </template>
                                                <p class="chat text-start" x-text="pvtMessage.content ? pvtMessage.content:''"></p>
                                            </div>
                                        </div>
                                   </div>
                                </li>
                            </template>
                        </template>
                        <template x-if="pvtMessages.length == 0">
                           <li class="pvt-user-wrap">
                               <div class="flex flex-col w-full text-gray-600 gap-2 items-center ">
                                    <img class="w-[40px]" src="/images/defaults/topic.webp" alt="">
                                    <p class="text-[12px] font-bold" >No Messages Found</p>
                                </div>
                           </li>
                        </template> 
                   </ul>               
               </div>
            </div>
       </div>
    `
}

export function getErrorMsg(e) {
    return e.response ? e.response.data : Errors.SOMETHING_WENT_WRONG
}

export function makeReaction(post, reactType) {
    if (reactType === ReactType.Like) {
        post.likeCount++
        post.liked = true
    } else if (reactType === ReactType.Love) {
        post.loveCount++
        post.loved = true
    } else if (reactType === ReactType.Lol) {
        post.lolCount++
        post.laughed = true
    } else if (reactType === ReactType.Dislike) {
        post.dislikeCount++
        post.disliked = true
    }
}

export function updateReaction(post, oldReaction, newReaction) {
    removeReaction(post, oldReaction)
    makeReaction(post, newReaction)
}

export function removeReaction(post, reactType) {
    if (reactType === ReactType.Like) {
        post.likeCount--
        post.liked = false
    } else if (reactType === ReactType.Love) {
        post.loveCount--
        post.loved = false
    } else if (reactType === ReactType.Lol) {
        post.lolCount--
        post.laughed = false
    } else if (reactType === ReactType.Dislike) {
        post.dislikeCount--
        post.disliked = false
    }
}

export function muteDialogHtml() {
    return `
        <div x-data="actions" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
            <div class="inline-flex items-center"> 
                <i class="fa-regular fa-hand text-red-500 text-2xl"></i>  
                <p class="ml-2 text-md font-bold " x-text="'Mute '+u.user.name"></p>
            </div>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <p class="text-[13px] text-start leading-[14px] font-bold">Duration</p>
                <div class="w-full mb-4 h-10"> 
                    <select x-model="selectedTime" class="input-text h-full">
                        <option value="2">2 minutes</option>
                        <option value="5">5 minutes</option>
                        <option value="10">10 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="1440">1 day</option>
                        <option value="2880">2 days</option>
                        <option value="4320">3 days</option>
                        <option value="5760">4 days</option>
                        <option value="7200">5 days</option>
                        <option value="8640">6 days</option>
                        <option value="10080">7 days</option>
                        <option value="20160">14 days</option>
                        <option value="43200">30 days</option>
                    </select>
                </div>
                <p class="text-[13px] text-start leading-[14px] font-bold">Reason<span class="text-gray-500"> (optional)</span></p>
                <div class="mb-4"> 
                    <textarea @keyup="textArea($el, 60)" class="text-area" x-model="reason" type="text" maxlength="150" name="about"></textarea>
                </div>
                <div class="flex gap-2 justify-center">
                    <button @click="mute(selectedTime, reason)" class="btn-action bg-green-500">Mute</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button>
                </div>
            </div>
        </div>
    `
}

export function kickDialogHtml() {
    return `
        <div x-data="actions" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
            <div class="inline-flex items-center"> 
                <i class="fa-solid fa-user-slash text-red-500 text-2xl"></i>  
                <p class="ml-2 text-md font-bold " x-text="'Kick '+u.user.name"></p>
            </div>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <p class="text-[13px] text-start leading-[14px] font-bold">Duration</p>
                <div class="w-full mb-4 h-10"> 
                    <select x-model="selectedTime" class="input-text h-full">
                        <option value="2">2 minutes</option>
                        <option value="5">5 minutes</option>
                        <option value="10">10 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="1440">1 day</option>
                        <option value="2880">2 days</option>
                        <option value="4320">3 days</option>
                        <option value="5760">4 days</option>
                        <option value="7200">5 days</option>
                        <option value="8640">6 days</option>
                        <option value="10080">7 days</option>
                        <option value="20160">14 days</option>
                        <option value="43200">30 days</option>
                    </select>
                </div>
                <p class="text-[13px] text-start leading-[14px] font-bold">Reason<span class="text-gray-500"> (optional)</span></p>
                <div class="mb-4"> 
                    <textarea @keyup="textArea($el, 60)" class="text-area" x-model="reason" type="text" maxlength="150" name="about"></textarea>
                </div>
                <div class="flex gap-2 justify-center">
                    <button @click="kick(selectedTime, reason)" class="btn-action bg-green-500">Kick</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button> 
                </div> 
            </div>
        </div>
    `
}

export function banDialogHtml() {
    return `
        <div x-data="actions" class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
            <div class="inline-flex items-center"> 
                <i class="fa-solid fa-ban text-red-500 text-2xl"></i>  
                <p class="ml-2 text-md font-bold " x-text="'Ban '+u.user.name"></p>
            </div>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="p-4">
                <p class="text-[13px] text-start leading-[14px] font-bold">Reason<span class="text-gray-500"> (optional)</span></p>
                <div class="mb-4"> 
                    <textarea @keyup="textArea($el, 60)" class="text-area" x-model="reason" type="text" maxlength="150" name="about"></textarea>
                </div>
                <div class="flex gap-2 justify-center">
                    <button @click="ban(reason)" class="btn-action bg-green-500">Ban</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">Cancel</button> 
                </div> 
            </div>
        </div>
    `
}

export function delAcDialogHtml() {
    return `
        <div class="text-gray-700 text-center">
            <div class="px-4 py-1 flex justify-between items-center border-b border-gray-200">
                <p class="text-md font-bold" x-text="'Delete '+u.user.name"></p>
                <i @click="closeSmallModal" class="fas fa-times-circle text-2xl cursor-pointer"></i>
            </div> 
            <div class="px-4 py-2">
                <p class="text-[14px] mb-2" x-text="'Are you sure, want to delete '+u.user.name+'?'"></p>  
                <div class="flex gap-2 justify-center">
                    <button @click="delAccount" class="btn-action bg-green-500">Yes</button>          
                    <button @click="closeSmallModal" class="btn-action bg-red-500">No</button>          
                </div>
            </div>
        </div>
    `
}


