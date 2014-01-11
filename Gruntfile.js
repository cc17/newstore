module.exports = function(grunt){
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		transport: {
			options:{
				debug:false,
				idleading:'src/js/',
				alias: '<%= pkg.spm.alias %>',
				paths:['.']
			},
			index:{
				files:[{
					expand:true,
					cwd:'src/js',
					src:['**/*','!sea-debug.js'],
					dest:'.temp/js',
					filter:'isFile'
				}]
			}
		},
		concat:{
			index:{
				options: {
					alias: '<%= pkg.spm.alias %>',
					//all 跟relative有什么差别
					include:'relative'
				},
				files:{
                    'dist/js/common.js':['.temp/js/libs/**/*.js'],
                    'dist/js/index.js':['.temp/js/index/*.js'],
                    'dist/js/search.js':['.temp/js/search/*.js'],
                    'dist/js/top.js':['.temp/js/top/*.js'],
                    'dist/js/cat.js':['.temp/js/cat/*.js'],
                    'dist/js/subject.js':['.temp/js/subject/*.js']
                }
			}
		},
		uglify : {
			index: {
		      // Because these src-dest file mappings are manually specified, every
		      // time a new file is added or removed, the Gruntfile has to be updated.
		      files: [
                {src: 'dist/js/common.js', dest: 'dist/js/common.min.js'},
		        {src: 'dist/js/index.js', dest: 'dist/js/index.min.js'},
                {src: 'dist/js/search.js', dest: 'dist/js/search.min.js'},
                {src: 'dist/js/top.js', dest: 'dist/js/top.min.js'},
                {src: 'dist/js/cat.js', dest: 'dist/js/cat.min.js'},
                {src: 'dist/js/subject.js', dest: 'dist/js/subject.min.js'}
		      ]
		    }
		},
		qunit:{
			all:['test/*.html']
		},
		cssmin: {
	         options: {
	             keepSpecialComments: 0
	         },
	         compress: {
	             files: {
	                 'src/css/base.min.css': ["src/css/base.css"],
	                 'src/css/cat/cat.min.css': ["src/css/cat/cat.css"],
	                 'src/css/index/index.min.css': ["src/css/index/index.css"],
	                 'src/css/search/search.min.css': ["src/css/search/search.css"],
	                 'src/css/subject/subject.min.css': ["src/css/subject/subject.css"],
	                 'src/css/top/top.min.css': ["src/css/top/top.css"]
	             }
	         }
	    },
        htmlclean: {
            options: {
                protect: /<\!--%fooTemplate\b.*?%-->/g,
                edit: function(html) { return html.replace(/\begg(s?)\b/ig, 'omelet$1'); }
            },
            deploy: [
                {
                    src: 'index-dev.html',
                    dest: 'index.html'
                },
                {
                    src: 'cat-dev.html',
                    dest: 'cat.html'
                },{
                    src: 'search-dev.html',
                    dest: 'search.html'
                },
                {
                    src: 'top-dev.html',
                    dest: 'top.html'
                },
                {
                    src: 'subject-dev.html',
                    dest: 'subject.html'
                }

            ]
        },
		clean:['.temp']
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	//grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-cmd-transport');
	grunt.loadNpmTasks('grunt-cmd-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
    //grunt.loadNpmTasks('grunt-htmlclean');
	//grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.registerTask('build',['transport','concat','cssmin','uglify'/*,'clean'*/]);
	//grunt.registerTask('build',['transport','concat']);

};