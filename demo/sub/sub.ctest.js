var CTest = require('../../index')
var SD = CTest.DSON
var G = CTest.GContext.goto

var sd = SD()

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
sd.goto('apiResponse')
// 导出参数


module.exports = sd
