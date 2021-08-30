var ljson = require('lisa.json')
var utils = require('lisa.utils')
var GCH = require('lisa.gache.js')
var fs = require('fs')
var Path = require('path')


var drawInputAndOutput = async function(apis){
    for(var i=0;i<apis.length;i++){
        var api = apis[i]
        api.meta = api.meta || {}
        api.meta.name = api.meta.name || 'default'

        //get outputs 
        var outputs = []
        var inputs = []
        for(var j =0 ;j< api._queue.length ;j++){
            var one = api._queue[j]
            if(one.item == 'mark' && one.params && one.params.length>0 ){
                var params1 = one.params[0]
                if(params1 && typeof(params1) == 'string' && params1.indexOf('@') == 0){
                    outputs.push(params1)
                }
            }
            if(one.item == 'api'){
                var matches = await ljson(one).find((k,v)=>{ 
                    return utils.Type.isObject(v) && v.isCtestInput
                })
                matches.forEach(m=>{
                    var input = m.value._queue[0].params[0]
                    inputs.push(input)
                })
            }
            if(one.item == 'module'){
                var p1 = one.params[0]
                var p2 =  one.params[1]
                api.meta.name = p1 || api.meta.name
                api.meta.desc = p2 || api.meta.desc
            }
        }
        outputs = utils.ArrayDistinct(outputs)
        inputs = utils.ArrayDistinct(inputs)
        // console.log(outputs)
        // console.log(inputs)
        
        api.meta.inputs = inputs
        api.meta.outputs = outputs
    }
}

exports.drawInputAndOutput = drawInputAndOutput

/**
 * 检测没有输入的apis
 * @param {*} apis 
 * @param {*} allVars 
 * @returns 
 */
var checkNoInputApis = function(apis,allVars){
    allVars = allVars || {}
    var alloutputs = []
    apis.forEach(api=>{
        if(api.meta && api.meta.outputs && api.meta.outputs.length>0 ){
            alloutputs = alloutputs.concat(api.meta.outputs)
        }
    })
    var noInputApis = []
    apis.forEach(api=>{
        if(api.meta && api.meta.isTarget && api.meta.inputs && api.meta.inputs.length>0 ){
            var noInputs = []
            for(var i =0;i<api.meta.inputs.length ;i++){
                var input = api.meta.inputs[i]
                if(allVars.hasOwnProperty(input)){
                    continue
                }
                if(alloutputs.indexOf(input) > -1){
                    continue
                }
                noInputs.push(input)
            }
            if(noInputs.length>0){
                noInputApis.push({
                    name : api.meta.name,
                    desc : api.meta.desc,
                    noInputs : noInputs,
                    raw : api
                })
            }
        }
    })
    return noInputApis
}

exports.checkNoInputApis = checkNoInputApis


// var ArrayContains = function(arr1, arr2){
//     for(var i =0;i<arr1.length;i++){
//         var one = arr1[i]
//         if(utils.ArrayContains(arr2, one)){
//             return true
//         }
//     }
//     return false
// }

var ArrayDistinct = function(arr){
    var index = 0
    while(index < arr.length){
        var current = arr[index]

        var index2 = arr.indexOf(current , index + 1)
        if( index2> -1){
            arr.splice(index2,1)
        }else{
            index ++
        }
    }
}
var getSuitableApi = function(apis, need){
    var index = -1 
    for(var i =0;i<apis.length;i++){
        var one = apis[i]
        if(utils.ArrayContains(one.meta.outputs , need)){
            index = i
            break
        }
    }
    if(index>-1){
        var ones = apis.splice(index,1)
        return ones[0]
    }
    return null
}

/**
 * 过滤并重排要跑的接口 （ps ， isTarget的 接口必须放前面）
 * @param {*} apis 
 * @param {*} allOutputs 
 * @param {*} needs 
 * @returns 
 */
var filterAndReorderToRunApis = function(apis, allOutputs ,needs){
    var orderedApis = []
    needs = needs || []
    allOutputs = allOutputs || []

    //空apis时特殊处理
    if(apis.length ==0){
        var tempNeeds = utils.ArrayRemove( needs , allOutputs)
        if(tempNeeds.length>0){
            throw new Error('CTEST: cannot resolve params : ' + tempNeeds.join(','))
        }
        return []
    }
    needs = utils.ArrayRemove(needs, allOutputs)
    if(needs.length == 0){
        var first = apis.shift()
        if(!first.meta.isTarget){
            return []
        }
        //找到为满足输入要求的需求
        var tempNeeds = utils.ArrayRemove( first.meta.inputs || [] , allOutputs)
        if(tempNeeds.length>0){
            orderedApis = filterAndReorderToRunApis(apis, allOutputs,tempNeeds).concat([first])
            orderedApis.forEach(a=>{  
                a.meta.outputs.forEach(oo=> {
                    allOutputs.push(oo)
                })
            })
        }else{
            orderedApis.push(first)
            first.meta.outputs.forEach(oo=> {
                allOutputs.push(oo)
            })
        }
        ArrayDistinct(allOutputs)
        return orderedApis.concat(filterAndReorderToRunApis(apis,allOutputs ,null))
    }else{
        var oneNeed = needs.shift()
        while(oneNeed){
            //如果已经满足跳过
            if(utils.ArrayContains(allOutputs,oneNeed)){
                oneNeed = needs.shift()
                continue
            }
            var api = getSuitableApi(apis,oneNeed)
            if(api){
                var tempNeeds = utils.ArrayRemove( api.meta.inputs || [] , allOutputs)
                if(tempNeeds.length>0){
                    orderedApis = orderedApis.concat(filterAndReorderToRunApis(apis, allOutputs,tempNeeds)).concat([api])
                }else{
                    orderedApis.push(api)
                }
            }else{
                throw new Error('CTEST: cannot resolve param : ' + oneNeed)
            }
            orderedApis.forEach(a=>{  
                a.meta.outputs.forEach(oo=> {
                    allOutputs.push(oo)
                })
            })
            ArrayDistinct(allOutputs)
            oneNeed = needs.shift()
        }
        return orderedApis
    }
}

exports.filterAndReorderToRunApis = filterAndReorderToRunApis

/**
 * 生成执行计划
 * @param {*} apis  接口
 * @param {*} options 
 * @returns 
 */
exports.plan = async (apis, options)=>{
    options = options || {}
    //vars 参数列表
    options.vars = options.vars || {}
    options.cacheTime = options.cacheTime || options.timeout || null
    //抽取输入输出
    await drawInputAndOutput(apis)

    //获取所有预有参数
    var cacheVars = {} 
    if(options.cacheTime){
        cacheVars = GCH('ctest.json').getAll({timeout : options.cacheTime})
    }
    var allVars = Object.assign({},cacheVars,options.vars)

    //检查没有输入的接口，并提示
    var noInputApis = await checkNoInputApis(apis,allVars)
    if(noInputApis && noInputApis.length >0 ){
        //todo
        console.log('todo no input apis')
        return
    }

    //接口重排
    var reorderedApis = filterAndReorderToRunApis( apis, Object.keys(allVars))

    return {
        vars : allVars,
        apis : reorderedApis
    }
}

/**
 * 生成执行计划文件
 * @param {*} apis 
 * @param {*} options 
 * @param {*} path 
 */
exports.generatePlanFile = async (apis, options , path) => {
    options = options || {}
    
    var plan = await exports.plan(apis, options)
    if(!plan)
        return false
    var thinPlan = {}
    thinPlan.vars = plan.vars
    thinPlan.apis = []
    plan.apis.forEach(one =>{
        thinPlan.apis.push({
            meta : one.meta
        })
    })
    fs.writeFileSync(path , JSON.stringify(thinPlan))
    if(options.verbose){
        console.log('CTest :  generatePlanFile :' + path)
    }
    return true
}


exports.exec = async(planPath ,options) =>{
    options = options || {}
    var testFile = Path.join(__dirname , "testEngineAdapters/").replace(/\\/g,'/')
    // console.log(testFile)
    // var ctestPorcess = exec('set ctestPlan="' + planPath +'" && jest ' + testFile, { cwd: process.cwd() }, (err, stdout, stderr) => {
    //     if(err) {
    //         console.log(err);
    //         return;
    //     }
    //     // console.log(`stdout: ${stdout}`);
    // });

    // ctestPorcess.stdout.on('data', function (data) {
    //     console.log(data);
    // })
    // ctestPorcess.stderr.on('data', function (data) {
    //     console.log(data);
    // })

    if(options.verbose){
        console.log('CTest: exec ctestPlan : ' + planPath)
    }
    planPath = planPath.replace(/\\/g , '/')
    var spawn = require('child_process').spawn
    spawn('cmd', ['/s', '/c', 'set ctestPlan=' + planPath +' && jest ' + testFile] , {stdio: "inherit"} );
}