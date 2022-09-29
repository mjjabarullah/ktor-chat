const mix = require('laravel-mix');
let WebPackObfuscator = require('webpack-obfuscator');

/*mix.webpackConfig({ // TODO:Uncomment this in production
    plugins: [
        new WebPackObfuscator ({
            rotateUnicodeArray: true
        }, ['excluded_bundle_name.js'])
    ],
});*/

mix.js(['dev/chat.js'], 'src/main/resources/static/js')
    .js(['dev/auth.js'], 'src/main/resources/static/js')
    .postCss('dev/styles.css', 'src/main/resources/static/css', [
        require("tailwindcss"),
    ]);
