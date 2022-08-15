// noinspection JSUnresolvedFunction

import Fingerprint2 from 'fingerprintjs2'

window.axios = require('axios')

const FIND_IP_URL = 'https://geolocation-db.com/json/'

document.addEventListener("DOMContentLoaded", function () {

    getClientDetails().then((details) => {
        const form = document.getElementsByTagName('form')[0]
        form.innerHTML += `
                    <input type="hidden" name="deviceId" value="${details.deviceId}">
                    <input type="hidden" name="ip" value="${details.ip}">
                    <input type="hidden" name="country" value="${details.country}">
                    <input type="hidden" name="timezone" value="${details.timezone}">`
    }).catch(() => {
    })
}, false)


const getClientDetails = async () => {
    const res = await axios.get(FIND_IP_URL, {})
    const components = await Fingerprint2.getPromise({})
    const values = components.map(component => component.value)
    const deviceId = Fingerprint2.x64hash128(values.join(""), 31)
    const ip = res.data.IPv4
    const country = res.data.country_name
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return {deviceId, ip, country, timezone}
}
