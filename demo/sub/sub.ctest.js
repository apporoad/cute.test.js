var CTest = require('../../index')
var SD = CTest.DSON
var G = CTest.GContext.goto

var sd = SD()

sd.module("测试模块sub", "仅用于测试模块sub")

sd.api(
    'http://localhost:20000/sub',
    {"like": G("@like"), Code : '0000'},
)

sd.mark('apiResponse')
sd.get('params')
//here to test

sd.test({
    "Code" : "='0000'",
    "like" : "!!"
}, '验证实体结构2')
// .print()
sd.goto('apiResponse').mark('@abc')
// 导出参数


module.exports = sd
