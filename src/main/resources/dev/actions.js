"use strict"

import Alpine from 'alpinejs'
import {MessageType} from "./constant";

window.axios = require('axios')
window.Alpine = Alpine

Object.freeze(domain)
document.addEventListener('alpine:init', () => {

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
                this.userSocket = new WebSocket(`wss://${location.host}/${domain.id}/member/${userId}`)
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
                    axios.get(`/${domain.id}/users/check-kick`).then(() => location.reload())
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
                this.userSocket = new WebSocket(`wss://${location.host}/${domain.id}/member/${userId}`)
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