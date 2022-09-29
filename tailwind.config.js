function withOpacity(variableName) {
    return ({opacityValue}) => {
        if (opacityValue !== undefined) {
            return `rgba(var(${variableName}), ${opacityValue})`
        }
        return `rgb(var(${variableName}))`
    }
}

module.exports = {
    content: [
        "./src/**/*.{html,js}",
        "./dev/**/*.{js}"
    ],
    theme: {
        extend: {
            textColor: {
                skin: {
                    primary: withOpacity('--color-primary'),
                    hover: withOpacity('--color-primary-hover'),
                    'on-primary': withOpacity('--color-on-primary'),
                },
            },
            backgroundColor: {
                skin: {
                    primary: withOpacity('--color-primary'),
                    hover: withOpacity('--color-primary-hover')
                },
            },
            gradientColorStops: {
                skin: {
                    primary: withOpacity('--color-primary'),
                    hover: withOpacity('--color-primary-hover')
                }
            },
            borderColor: {
                skin: {
                    primary: withOpacity('--color-primary'),
                    hover: withOpacity('--color-primary-hover')
                },
            },
            ringColor: {
                skin: {
                    primary: withOpacity('--color-primary')
                },
            },
            boxShadowColor: {
                skin: {
                    primary: withOpacity('--color-primary')
                },
            },
            fontFamily: {
                'lato': ['Lato', 'sans-serif'],
                'signika': ['Signika', 'sans-serif'],
                'grandstander': ['Grandstander', 'cursive'],
                'comic': ['Comic Neue', 'cursive'],
                'orbitron': ['Orbitron', 'sans-serif'],
                'quicksand': ['Quicksand', 'sans-serif'],
                'lemonada': ['Lemonada', 'sans-serif'],
                'grenze': ['Grenze Gotisch', 'cursive'],
                'kalam': ['kalam', 'cursive'],
                'merienda': ['Merienda', 'cursive'],
                'amita': ['Amita', 'cursive'],
                'averia': ['Averia Libre', 'cursive'],
                'turret': ['Turret Road', 'cursive'],
                'sansita': ['Sansita', 'sans-serif'],
                'comfortaa': ['Comfortaa', 'cursive'],
                'charm': ['Charm', 'cursive'],
                'lobster': ['Lobster Two', 'cursive'],
            }
        },
    },
    plugins: [],
}
