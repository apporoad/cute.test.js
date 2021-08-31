#! /usr/bin/env node

require('./common')

const path = require('path')
const fs = require('fs')
const program = require('commander')
const find = require('find')
const Fuse = require('fuse.js')
const runner = require('./run')
const os = require('os')
const utils = require('lisa.utils')


program.version(require('./package.json').version)
    .usage(' [workdirOrFilePath]'
    + '\r\n [file] [file] [file]')
    .option('-U --baseUrl [baseUrl]','你访问的站点目录，如： http://localhost:8000/')
    // .option('-e --encoding [encoding]' , ' encoding of your file ,default is utf8')
    // .option('-o --output [output]', '输出文件')
    
    .option('-c --config' , '配置文件')

    .option('-v --verbose' , '打印多余内容')
    .option('-w --workspace  [workspace]' , 'ctest文件的工作目录， 默认为命令执行当前目录')
    .option('-p --plan [plan]', '生成执行计划，默认会生成到os临时目录 ：  abc =>  tmpdir/ctest/abc.ctest.json   ./abc => 当前目录下abc.ctest.json  , 当然也支持绝对路径')
    .option('-H --host [host]', '访问接口需要替换的host  如： "http://www.lxixsxa.com/"')
    .option('-x --execute [execute]' , '执行执行计划')
    .option('-n --new [new]' , '创建模板')
    .option('-e --ext [ext]', '扩展js路径,默认加载工作目录下ctest.exts.js文件')
    .option('-t --timeout <timout>' , '接口调用超时时间，默认10000（10秒）', parseInt)
    .option('-a --cache <cache>' , '数据缓存时间，当设置时，优先加载缓存变量' , parseInt)
    .parse(process.argv)

const optionsOut = program.opts();
var options = {}
options.workspace = path.resolve(process.cwd() ,optionsOut.workspace || '.')
options.host = optionsOut.host
options.verbose = optionsOut.verbose
options.new = optionsOut.new
options.baseUrl = optionsOut.baseUrl
options.ext = optionsOut.ext
options.timeout = optionsOut.timeout
options.cache = options.cacheTime = optionsOut.cache

if(options.ext){
    var realPath = path.resolve(options.workspace ,options.ext)
    if(fs.existsSync(realPath)){
        options.ext = realPath
    }else{
        options.ext = null
    }
}
if(!options.ext){
    var realPath = path.resolve(options.workspace , 'ctest.exts.js')
    if(fs.existsSync(realPath)){
        options.ext = realPath
    }
}

var dir = path.join(os.tmpdir() , 'ctest')
if(!fs.existsSync(dir)){
    fs.mkdirSync(dir)
}
//执行计划目录
if(optionsOut.plan){
    if(optionsOut.plan.indexOf('.') == 0){
        options.plan = path.resolve(process.cwd(), optionsOut.plan)
        var name = path.basename(options.plan)
        options.plan = path.join(path.dirname(options.plan) ,  name + '.ctest.json')
        // console.log(options.plan)
    }else{
        options.plan = path.resolve(dir,optionsOut.plan)
        var name = path.basename(options.plan)
        options.plan = path.join(path.dirname(options.plan) ,  name + '.ctest.json')
        // console.log(options.plan)
    }
}
//运行执行计划
if(optionsOut.execute){
    if(optionsOut.execute.indexOf('.') == 0){
        options.execute = path.resolve(process.cwd(), optionsOut.execute)
        var name = path.basename(options.execute)
        options.execute = path.join(path.dirname(options.execute) ,  name + '.ctest.json')
    }else{
        
        options.execute = path.resolve(dir,optionsOut.execute)
        var name = path.basename(options.execute)
        options.execute = path.join(path.dirname(options.execute) ,  name + '.ctest.json')
    }
}


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
        //console.log(ap)
        if(fs.existsSync(ap)){
            //console.log(ap)
            if(fs.statSync(ap).isFile()){
                files.push(ap)
            }else{
                var ffs = await getCtestFiles(ap)
                // console.log(ap)
               files = files.concat(ffs)
            }
        }else{
            // 模糊匹配
            var allFiles = await getCtestFiles(baseDir)
            var toMatchFileNames = []
            allFiles.forEach(f=>{
                toMatchFileNames.push(path.relative(baseDir, f))
            })
            const  ops = {includeScore: true}
            const fuse = new Fuse(toMatchFileNames, ops)
            var rfs = fuse.search(p)
            // console.log('pppppppppp:' + p)
            // console.log(rfs)
            rfs.forEach(match=>{
                if(p.length<=2){
                    if(match.item.indexOf(p) > -1){
                        files.push(path.join(baseDir , match.item))
                    }
                }else{
                    // 不使用模糊匹配
                    if(match.item.indexOf(p) > -1){
                        files.push(path.join(baseDir , match.item))
                    }
                    // files.push(path.join(baseDir , match.item))
                }
                
            })
        }
    }
    return files.filter((v, i, a) => a.indexOf(v) === i)
}

var args = program.args

// args = ["demo"]

var main = async ()=>{
    if(options.new){
        var newFile = null
        if(utils.endWith(options.new , '.ctest.js')){
            newFile = path.resolve(process.cwd(), options.new)
        }else{
            newFile = path.resolve(process.cwd(), options.new + '.ctest.js')
        }
        if(fs.existsSync(newFile)){
            console.log('Ctest : file already exists : ' + newFile)
            return
        }
        fs.copyFileSync(path.join(__dirname,'demo/example.js') , newFile)
        console.log('new file : ' + newFile)
        return 
    }

    if(options.execute){
        if(fs.existsSync(options.execute)){
            runner.exec(options.execute)
        }else{
            console.log('CTest: planFile is useless : ' + options.execute )
        }
        return
    }


    if(args.length == 0 ){
        list(options)
    }else{
        // console.log(program.args)
        var targetFiles = await getFiles(args ,process.cwd())

        // console.log(targetFiles)
        if(targetFiles.length==0){
            console.log('cannot find test file....')
            return 
        }

        var allFiles = await getFiles([options.workspace] , path.resolve(process.cwd(), options.workspace))
        allFiles = (targetFiles.concat(allFiles)).filter((v, i, a) => a.indexOf(v) === i)

        // console.log(targetFiles)
        // console.log(allFiles)

        if(options.ext){
            if(options.verbose){
                console.log('CTest loading ext file : ' + options.ext)
            }
            require(options.ext)
        }

        var apis = []
        allFiles.forEach(tf =>{
            var one  = require(tf)
            one.meta = one.meta || {}
            one.meta.path = tf
            one.meta.isTarget = targetFiles.indexOf(tf) > -1 
            apis.push(one)
        })

        if(options.plan){
            runner.generatePlanFile(apis, options, options.plan)
        }
        else{
            var planPath = path.resolve(dir, Date.now() + '.ctest.json')
            //临时文件
            var success = await runner.generatePlanFile(apis, options , planPath)
            //执行
            if(success){
                runner.exec(planPath ,options)
            }
            
        }
        
    }
}

main()