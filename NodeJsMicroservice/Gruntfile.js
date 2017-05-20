/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        compress: {
            main: {
                options: {
                    archive: 'build/distributions/accs/NodeJsMicroservice.zip'
                },
                files: [
                    {src: ['bin/**/*'], dest: '/'},
                    {src: ['node_modules/**/*'], dest: '/'},
                    {src: ['public/**/*'], dest: '/'},
                    {src: ['routes/**/*'], dest: '/'},
                    {src: ['views/**/*'], dest: '/'},
                    {src: ['*.js','*.json'], dest: '/'}
                ]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-compress');
};
