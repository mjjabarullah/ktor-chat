const mix = require('laravel-mix');
let JavaScriptObfuscator = require('webpack-obfuscator');

/*mix.webpackConfig({ // TODO:Uncomment this in production
    plugins: [
        new JavaScriptObfuscator ({
            rotateUnicodeArray: true
        }, ['excluded_bundle_name.js'])
    ],
});*/

mix.js(['src/main/resources/dev/chat.js'], 'src/main/resources/static/js')
    .js(['src/main/resources/dev/auth.js'], 'src/main/resources/static/js')
    .js(['src/main/resources/dev/actions.js'], 'src/main/resources/static/js')
    .postCss('src/main/resources/dev/styles.css', 'src/main/resources/static/css', [
        require("tailwindcss"),
    ]);
