import Fingerprint2 from 'fingerprintjs2'
import Alpine from "alpinejs";

window.axios = require('axios')
window.Alpine = Alpine

document.addEventListener('alpine:init', () => {

    Alpine.data('auth', () => {
        return {
            FIND_IP_URL: 'https://geolocation-db.com/json/',
            formData: new FormData(),
            errors: {},
            success: '',
            init() {
                localStorage.clear()
                this.getClientDetails().then((details) => {
                    this.formData.append('deviceId', details.deviceId)
                    this.formData.append('ip', details.ip)
                    this.formData.append('country', details.country)
                    this.formData.append('timezone', details.timezone)
                })

            },
            async getClientDetails() {
                const res = await axios.get(this.FIND_IP_URL, {})
                const components = await Fingerprint2.getPromise({})
                const values = components.map(component => component.value)
                const deviceId = Fingerprint2.x64hash128(values.join(""), 31)
                const ip = res.data.IPv4
                const country = res.data.country_name
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
                return {deviceId, ip, country, timezone}
            }
        }
    })

    Alpine.data('register', () => {
        return {
            name: '',
            email: '',
            password: '',
            gender:'',
            init() {
                this.$refs.name.focus()
            },
            register() {
                this.formData.append('name', this.name)
                this.formData.append('email', this.email)
                this.formData.append('password', this.password)
                this.formData.append('gender', this.gender)
                axios.post('/register', this.formData).then(() => {
                    this.success = 'Register Successful'
                    setTimeout(() => location.reload(), 1000)
                }).catch(e => {
                    if (e.response) this.errors = e.response.data
                })
            },
        }
    })


    Alpine.data('guest', () => {
        return {
            name: '',
            password: 'password',
            gender: '',
            init() {
                this.$refs.name.focus()
            },
            guestRegister() {
                this.formData.append('name', this.name)
                this.formData.append('password', this.password)
                this.formData.append('gender', this.gender)
                axios.post('/guest', this.formData).then(() => {
                    this.success = 'Guest Registration Successful'
                    setTimeout(() => location.reload(), 1000)
                }).catch(e => {
                    if (e.response) this.errors = e.response.data
                })
            },
        }
    })

    Alpine.data('login', () => {
        return {
            name: '',
            password: '',
            init() {
                this.$refs.name.focus()
            },
            login() {
                this.formData.append('name', this.name)
                this.formData.append('password', this.password)
                axios.post('/login', this.formData).then(() => {
                    this.success = 'Login Successful'
                    setTimeout(() => location.reload(), 1000)
                }).catch(e => {
                    if (e.response) this.errors = e.response.data
                })
            },
        }
    })
})

Alpine.start()

