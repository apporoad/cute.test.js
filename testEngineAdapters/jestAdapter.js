require('../common')
var GCH = require('lisa.gache.js')
var gch = GCH('ctest.json')
var utils = require('lisa.utils')

exports.exec = async(ctestPlan) =>{
    ctestPlan = ctestPlan || {}
    ctestPlan.options = ctestPlan.options || {}
    if(ctestPlan.options.ext){
        require(ctestPlan.options.ext)
    }
    var dsonOptions = {
        context : {
            marks : null
        }
    }
    /* {"vars":{},"apis":[{"meta":{"path":"D:\\lxy\\cute.test.js\\demo\\easy.ctest.js","isTarget":true,"name":"测试模块easy","desc":"仅用于测试easy","inputs":[],"outputs":["@like"]}},
    {"meta":{"path":"D:\\lxy\\cute.test.js\\demo\\sub\\sub.ctest.js","isTarget":true,"name":"测试模块easy","desc":"仅用于测试模块easy","inputs":["@like"],"outputs":["@abc"]}}]}*/
    if(ctestPlan.apis && ctestPlan.apis.length> 0){
        var globalMarks = Object.assign({} , ctestPlan.vars)
        ctestPlan.apis.forEach(api => {
            if(api.meta){
                var dson = require(api.meta.path)
                describe(api.meta.name || 'default', function () {
                    it(api.meta.desc || 'default desc', async () => {
                        var tempDsonOptions = { context : { marks :  Object.assign({} ,globalMarks)}}
                        var context = await dson.do({}, tempDsonOptions)
                        if(api.meta.isTarget){
                            var result = null
                            var c = context
                            for(var i =0;i<c.test.length;i++){
                                if(c.test[i] == null || c.test[i] == undefined){
                                    continue
                                }
                                if(!c.test[i]){
                                    result = false
                                    break
                                }else{
                                    result = true
                                }
                            }
                            if(result!=null){
                                //todo log
                                expect(result).toBe(true)
                            }else{
                                if(ctestPlan.options.verbose){
                                    console.log('Ctest runner : no test item in testObj : ' +api.meta.name)
                                }
                            }
                        }
                        for(var key in tempDsonOptions.context.marks){
                            if(utils.startWith(key , '@')){
                                var value = tempDsonOptions.context.marks[key]
                                gch.set(key,value)
                                globalMarks[key] = value
                            }
                        }
                    },ctestPlan.options.timeout || 10000);
                })
            }
        });
    }
}