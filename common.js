const path = require('path')
const fs = require('fs')
global.ctestInit = global.ctestInit ||
  function(module){
    if(module && module.paths){
        var iJudgeDir = dir=>{
            var node_modules = path.join(dir, "node_modules")
            if(fs.existsSync(node_modules)){
                return true
            }
            return false
        }
        var currentDir = __dirname
        while(true){
            if(iJudgeDir(currentDir)){
                // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' + currentDir)
                module.paths.push(path.join(currentDir , 'node_modules').replace(/\\/g , '/'))
            }
            if(currentDir == path.dirname(currentDir)){
                break
            }
            currentDir = path.dirname(currentDir)
        }
    }
}

global.CTest =  global.CTest || require('./')