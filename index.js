var D = require('dson.js').DSON
var JVD = require('dson.js').JVD
var ccurl = require('cute.curl.core')
var Url = require('url-parse');

global.ctestExts = {}

global.ctestConfig = global.ctestConfig  || {}

//全局设置默认请求方法
global.ctestConfig.defaultMethod = global.ctestConfig.defaultMethod || 'post'

exports.exts = global.ctestExts

//替换baseUrl
var defaultPreInvoke = async (invokeObj,context) =>{
    if(context.marks && context.marks.baseUrl){
        var originUrl = Url(invokeObj.url)
        var baseUrl = Url(context.marks.baseUrl)

        originUrl.set('host' , baseUrl.host)
        originUrl.set('protocol',baseUrl.protocol)
        
        invokeObj.url = originUrl.toString()
    }
}


D.reg('api', async (...params) => {
    var ps = params.slice(1)
    var context = params[0]
    // context.currentData = context.tempData = `${context.tempData},hello ${yourParam1} ${yourParam2}`

    if(ps.length==0){
        context.currentData = context.tempData = null
    }else{
        //参数模式
        if(ps[0] instanceof Array  && (ps.length == 0 || typeof ps[1] == 'object')){
            var options = ps[1]
            if(options.preInvoke){
                var tempInvoke = options.preInvoke
                options.preInvoke = async (invokeObj)=>{
                    await defaultPreInvoke(invokeObj,context)
                    await tempInvoke(invokeObj,context)
                }
            }else{
                options.preInvoke =  async (invokeObj)=>{
                    await defaultPreInvoke(invokeObj,context)
                }
            }
            options.defaultMethod = global.ctestConfig.defaultMethod
            options.slient = options.silent = true
            context.currentData = context.tempData = await ccurl.invoke(ps[0] ,ps[1])
        }else{
            context.currentData = context.tempData = await ccurl.invoke(ps, {
                preInvoke : async (invokeObj)=>{
                    await defaultPreInvoke(invokeObj,context)
                },
                defaultMethod : global.ctestConfig.defaultMethod,
                slient : true,
                silent : true
            })
        }
    }
})

D.reg( 'module' , async()=>{})

function GContext (){}

GContext.jump = GContext.goto = (markName)=>{
    var ad = D().goto(markName)
    ad.isCtestInput = true
    return ad
}


exports.DSON = D
exports.JVD = JVD
exports.GContext = GContext


