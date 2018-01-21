module.exports = function (grunt) {
    //编写任务
    grunt.initConfig({
        watch: {
            jade: {
                files: ['views/**'],
                options: {
                    livereload: true//当文件出现改动时重启服务器
                }
            },
            js: {
                files: ['public/js/**', 'models/**/*.js', 'schemas/**/*.js'],
                options: {
                    livereload: true
                }
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'app.js',//入口文件
                    args: [],
                    ingoredFiles: ['README.md', 'node_modules/**'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['./'],
                    debug: true,
                    delayTime: 1,//如果有大批量文件要改动时，则等待x ms再重启服务器
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname//目录
                }
            }
        },
        //可以重新执行nodemon和watch
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    })
    grunt.loadNpmTasks('grunt-contrib-watch');//只要有文件删改，则会重新执行加载的任务
    grunt.loadNpmTasks('grunt-nodemon');//实行监听入口文件app.js，若其改动，则会自动重启app.js
    grunt.loadNpmTasks('grunt-concurrent');//针对慢任务开发的插件

    grunt.option('force', true);//不要因为语法的错误和警告而中断来整个grunt的服务
    grunt.registerTask('default',['concurrent']);//注册default任务
}