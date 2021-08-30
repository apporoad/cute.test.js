// const os = require('os')
// const path = require('path')

require('../common')


var main = async ()=>{
    const fs = require('fs')
    const utils = require('lisa.utils')
    const jestA = require('./jestAdapter')
    const path = require('path')

    var ctestPlanPath = process.env.ctestPlan
    if(!ctestPlanPath){
        console.log('CTest runner :  cannot load Ctest path ， please set ENV : ctestPlan')
        return
    }
    ctestPlanPath = utils.startTrim(utils.endTrim(ctestPlanPath))
    if(!fs.existsSync(ctestPlanPath)){
        console.log('CTest runner :  cannot load Ctest plan file :' + ctestPlanPath)
        return
    }
    var ctestPlan = require(ctestPlanPath)
    ctestPlan.options = ctestPlan.options || {}
    // console.log(JSON.stringify(ctestPlan))
    jestA.exec(ctestPlan)
}

main()


