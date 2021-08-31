
//这里是默认的扩展类，执行前自动运行
console.log('这里是默认的扩展类，执行前自动运行')
global.ctestInit ? global.ctestInit(module) : null //实现自动加载主要模块
var CTest =  global.CTest || require('cute.test.js')
var D = CTest.DSON
var G = CTest.GContext.goto

//登录扩展，采用预执行方案
D.reg('$login', async (context) => {
    console.log('测试立马执行方法')
    // if(context && context._queue){
    //     context._queue.unshift({
    //         item: 'doNothing',
    //         params: [G("@Token") , G("@MemberId")],
    //         type: 'dson'
    //     })
    // }
})

// 登录扩展，篡改登录参数
global.ctestExts.apiPreInvokes = global.ctestExts.apiPreInvokes  || []
global.ctestExts.apiPreInvokes.push(async(invokeObj,context)=>{
    //篡改传入参数中的token
    // if(context && context.marks && invokeObj && invokeObj.data && typeof invokeObj.data == 'object'){
    //     if(invokeObj.data.MemberId && invokeObj.data.Token){
    //         if(context.marks['@Token'] && context.marks['@MemberId']){
    //             invokeObj.data.MemberId = context.marks['@MemberId']
    //             invokeObj.data.Token = context.marks['@Token'] 
    //         }
    //     }
    // }
})