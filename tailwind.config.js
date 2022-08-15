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
                    primary: withOpacity('--color-primary')
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
                'lato': ['Lato', 'Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'signika': ['Signika','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'grandstander': ['Grandstander','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'comic': ['Comic Neue','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'orbitron': ['Orbitron','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'quicksand': ['Quicksand','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'lemonada': ['Lemonada','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'grenze': ['Grenze Gotisch','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'kalam': ['Kalam','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'merienda': ['Merienda','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'amita': ['Amita','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'averia': ['Averia Libre','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'turret': ['Turret Road','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'sansita': ['Sansita','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'comfortaa': ['Comfortaa','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'charm': ['Charm','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
                'lobster': ['Lobster Two','Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
