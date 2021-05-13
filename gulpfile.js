const { src, dest, series, parallel, watch } = require('gulp')
const browserSync = require('browser-sync').create()
const fileInclude = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const gulpConcat = require('gulp-concat')
const gulpUglify = require('gulp-uglify-es').default
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const gcmq = require('gulp-group-css-media-queries')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')
const imagemin = require('gulp-imagemin')
const webp = require('gulp-webp')
const ttf2woff = require('gulp-ttf2woff')
const ttf2woff2 = require('gulp-ttf2woff2')
const del = require('del')

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// TASKS

// Определяем логику работы Browsersync
function browsersync() {
    browserSync.init({ // Инициализация Browsersync
        server: {
            baseDir: 'dist/' // Указываем папку сервера
        },
        // port: 3000,
        notify: false, // Отключаем уведомления
        online: true
    })
}

function html() {
    return src('src/index.html')
        .pipe(fileInclude())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('dist/'))
        .pipe(browserSync.stream())
}

function styles() {
    return src('src/sass/*.scss')
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(gcmq())
        .pipe(autoprefixer({ // Создадим префиксы с помощью Autoprefixer
            overrideBrowserslist: ["last 5 versions"],
            cascade: true
        }))
        .pipe(cleanCSS({
            level: { 1: { specialComments: 0 } }
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest('dist/css/'))
        .pipe(browserSync.stream())
}

function script () {
    return src('src/scripts/*.js')
        .pipe(gulpConcat('main.min.js')) // Конкатенируем в один файл
        .pipe(gulpUglify()) // Сжимаем JavaScript
        .pipe(dest('dist/scripts/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream())  // Триггерим Browsersync для обновления страницы
}

function image () {
    return src('src/img/**/*')
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest('dist/img'))
        .pipe(src('src/img/**/*'))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3 // 0 to 7
        }))
        .pipe(dest('dist/img'))
        .pipe(browserSync.stream())
}

function font () {
    src('src/fonts/*.ttf')
        .pipe(ttf2woff())
        .pipe(dest('dist/fonts'))
    return src('src/fonts/*.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('dist/fonts'))
}

function watchFiles() {
    watch(['src/**/*.html'], html)
    watch(['src/sass/**/*.scss'], styles)
    watch(['src/scripts/**/*.js'], script)
    watch(['src/img/**/*'], image)
}

function clean() {
    return del('dist/')
}

let build = series(clean, parallel(html, styles, script, image, font)) // ???
let parallelAssembly = parallel(build, watchFiles, browsersync)

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// EXPORT

exports.html = html
exports.styles = styles
exports.script = script
exports.image = image
exports.font = font

exports.build = build
exports.parallelAssembly = parallelAssembly
exports.default = parallelAssembly
