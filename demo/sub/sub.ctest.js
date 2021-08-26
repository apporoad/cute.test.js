var CTest = require('../../index')
var SD = CTest.DSON
var G = CTest.GContext.goto

var sd = SD()

sd.module("测试模块easy", "仅用于测试模块easy")

sd.api(
    'http://localhost:20000/sub',
    {"like": G("@like") , Code : '0000'},
)

sd.mark('apiResponse')
//here to test
sd.test({
    "Code" : "='0000'",
    "like" : "!!"
})
sd.goto('apiResponse').mark('@abc')
// 导出参数


module.exports = sd
