#! /usr/bin/env node

const path = require('path')
const fs = require('fs')
const program = require('commander')
var curl = require('./index')
const find = require('find')

program.version(require('./package.json').version)
    .usage(' [workdirOrFilePath]'
    + '\r\n [file] [file] [file]')
    .option('-U --baseUrl [baseUrl]','你访问的站点目录，如： http://localhost:8000/')
    .option('-e --encoding [encoding]' , ' encoding of your file ,default is utf8')
    .option('-o --output [output]', '输出文件')
    .option('-v --verbose' , '打印多余内容')
    .option('-c --config' , '配置文件')
    .option('-w --workspace  [workspace]' , 'ctest文件的工作目录， 默认为命令执行当前目录')
    .parse(process.argv)

const optionsOut = program.opts();
var options = {}
options.workspace = path.resolve(process.cwd() ,optionsOut.workspace || '.')


var list = async function(options){
    find.file(/ctest\.js$/, options.workspace, function(files) {
        if(files.length ==0){
            console.log('no *ctest.js file found: ' + options.workspace)
            return
        }
        console.log('to test list:')
        files.forEach(f=>{
            console.log(path.relative(process.cwd() , f))
        })
      })
}

var getCtestFiles =async function(dir){
    
    return new Promise((r,j)=>{
        find.file(/ctest\.js$/, dir, function(ffs) {
            var files = []
            if(ffs.length ==0){
                r([])
            }
            ffs.forEach(f=>{
                files.push(f)
            })
            r(files)
        })
    })
}

var getFiles = async (pathes , baseDir)=>{
    var files = []
    for(var i =0;i<pathes.length;i++){
        var p = pathes[i]
        var ap = path.resolve(baseDir , p)
        // console.log(ap)
        if(fs.existsSync(ap)){
            if(fs.statSync(ap).isFile()){
                files.push(ap)
            }else{
                var ffs = await getCtestFiles(ap)
               files = files.concat(ffs)
            }
        }
    }
    return files.filter((v, i, a) => a.indexOf(v) === i)
}

var args = program.args

// args = ["test", "index.d.ts"]

var main = async ()=>{
    if(args.length == 0 ){
        list(options)
    }else{
        // console.log(program.args)
        var targetFiles = await getFiles(args ,process.cwd())
        if(targetFiles.length==0){
            console.log('cannot find test file....')
            return 
        }
        var allFiles = await getFiles([options.workspace] , path.resolve(process.cwd(), options.workspace))
        allFiles = (targetFiles.concat(allFiles)).filter((v, i, a) => a.indexOf(v) === i)

        console.log(targetFiles)
        console.log(allFiles)
    }
}

main()