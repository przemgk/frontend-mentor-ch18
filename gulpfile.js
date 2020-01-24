const { src, dest, parallel, watch: gulpWatch } = require("gulp");
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const path = require("path").join;
const browserSync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const runSequence = require("gulp4-run-sequence");

sass.compiler = require("node-sass");

const buildPath = destination => path(__dirname, destination);

const html = () => src(buildPath("src/*.html")).pipe(dest(buildPath("build/")));

const scss = mode =>
  src(buildPath("src/scss/**/*.scss"))
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(mode === "build" ? buildPath("build/css") : buildPath("src/css")))
    .pipe(browserSync.stream());

const assets = () =>
  src(buildPath("src/assets/**/*.+(png|jpg|gif|svg)"))
    .pipe(
      imagemin(
        [
          imagemin.gifsicle({ interlaced: true, optimizationLevel: 3 }),
          imagemin.jpegtran({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 7 }),
          imagemin.svgo({
            plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
          })
        ],
        { verbose: true }
      )
    )
    .pipe(dest(buildPath("build/assets")));

const watch = () => {
  browserSync.init({ server: { baseDir: "src" } });

  gulpWatch(buildPath("src/*.html")).on("change", browserSync.reload);
  gulpWatch(buildPath("src/scss/**/*.scss"), scss);
};

const build = callback => runSequence(html, scss("build"), assets, callback);

module.exports = { scss, watch, build };
