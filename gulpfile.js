var gulp = require('gulp'),/*从node获取gulp对象*/
	sass = require('gulp-sass'),/*获取gulp-sass编译源,编译scss文件为css文件*/
	dest = require('gulp-dest'),/*获取dest输出源*/
	_concat = require('gulp-concat'),/*合并文件后将输出的xxx文件*/
	minifycss = require('gulp-minify-css'),/*压缩css代码*/
	rename = require('gulp-rename'),/*重命名文件名*/
	watch  = require('gulp-watch'),/*监听事件*/	
	fs = require('fs'),
	path = require('path'),
	connect = require('gulp-connect');/*使用websocket实时监听文件刷新浏览器*/

const yargs = require('yargs');
var argv = yargs.argv,
	type = argv._[0],
    pageName = argv.page||'',
    pluginName = argv.plugin,
    fileName = argv.file;

var _public = {
	staticPath:"./static-dev/",
	devPath:"./dev/",
	// 获取指定目录下，子级文件夹名字集合
	getDirNameList: function(dirPath) {
		return fs.readdirSync(dirPath).filter(function(file) {
			return fs.statSync(path.join(dirPath, file)).isDirectory();
		});
	}
}
//根节点下面的所有子目录，如果static-dev目录存在则不是第一次创建，否则第一次创建
var parentNode = _public.getDirNameList('./'),
	fileList = [];
if(parentNode.indexOf('static-dev')==-1){
	fileList = [];
}else{
	var dirArr = _public.getDirNameList(_public.staticPath);
	if(Array.isArray(dirArr)){/*是数组进行组合*/
		fileList = dirArr;
	}else{/*不是数组进行push*/
		fileList.push(dirArr);
	}
}

gulp.task('con',function(){
	try{
		console.log('type:'+type);
		console.log('pageName:'+pageName);
		console.log('pluginName:'+pluginName);
		console.log('fileName:'+fileName);
		console.log('fileList:'+fileList);
	}catch(e){
		console.log(e.name+':'+e.message);
	}
});

/*创建静态html目录结构*/
gulp.task('static-html',function(){
	if(fileList.indexOf(pageName)!=-1){/*已存在文件夹不在创建且提示*/
		throw ('该'+pageName+'文件名已经被占用，请重新输入');
	}else if(fileList.indexOf(pageName)==-1){
		gulp.src('./template/css/*.scss').pipe(gulp.dest(_public.staticPath+pageName+'/css')).pipe(connect.reload());
		gulp.src('./template/js/*.js').pipe(gulp.dest(_public.staticPath+pageName+'/js')).pipe(connect.reload());
		gulp.src('./template/img/*.*').pipe(gulp.dest(_public.staticPath+pageName+'/img')).pipe(connect.reload());
		gulp.src('./template/index.html').pipe(gulp.dest(_public.staticPath+pageName+'/')).pipe(connect.reload());			
	}else{
		throw ('指令不正确,gulp new --page "xxx"');
	}
});

gulp.task('dev-html',['gulp-scss'],function(){
	if(fileList.indexOf(pageName)!=-1){/*已存在文件夹不在创建且提示*/
		
	}else if(fileList.indexOf(pageName)==-1){
		/*生成编译后的html文件夹*/
		setTimeout(function(){		
			gulp.src(_public.staticPath+pageName+'/js/*.js').pipe(gulp.dest(_public.devPath+pageName+'/js')).pipe(connect.reload());
			gulp.src(_public.staticPath+pageName+'/img/*.*').pipe(gulp.dest(_public.devPath+pageName+'/img')).pipe(connect.reload());
			gulp.src(_public.staticPath+pageName+'/index.html').pipe(gulp.dest(_public.devPath+pageName+'/')).pipe(connect.reload());
		},100);
	}else{
		
	}
});

/*编译*/
gulp.task('gulp-scss',function(){	
	setTimeout(function(){
		gulp.src(_public.staticPath+pageName+'/css/*.scss')
		.pipe(sass())
		.pipe(gulp.dest(_public.devPath+pageName+'/css'))
		.pipe(connect.reload());
	},50);
});

/*监听事件*/
gulp.task('static-hot-html',['dev-hot-html'],function(){
	console.log('dev下文件编译成功!!!');
});

gulp.task('dev-hot-html',function(){
	gulp.src(_public.staticPath+pageName+'/css/*.scss').pipe(sass()).pipe(gulp.dest(_public.devPath+pageName+'/css')).pipe(connect.reload());
	gulp.src(_public.staticPath+pageName+'/js/*.js').pipe(gulp.dest(_public.devPath+pageName+'/js')).pipe(connect.reload());
	gulp.src(_public.staticPath+pageName+'/img/*.*').pipe(gulp.dest(_public.devPath+pageName+'/img')).pipe(connect.reload());
	gulp.src(_public.staticPath+pageName+'/index.html').pipe(gulp.dest(_public.devPath+pageName+'/')).pipe(connect.reload());
});

gulp.task('watch', function () {
	gulp.watch(_public.staticPath+pageName+'/css/*.scss', ['static-hot-html']);
	gulp.watch(_public.staticPath+pageName+'/js/*.js', ['static-hot-html']);
	gulp.watch(_public.staticPath+pageName+'/img/*.*', ['static-hot-html']);
	gulp.watch(_public.staticPath+pageName+'/*.html', ['static-hot-html']);
})

/*启动服务*/
gulp.task('webserver', function(){
	connect.server({
		livereload: true,
		port: 8888
	});
});

/*执行入口*/
gulp.task('new',['static-html','dev-html'],function(){
	console.log('----执行完毕----');
});

gulp.task('hot',['dev-hot-html','watch','webserver'],function(){
	console.log('----执行完毕----');
});