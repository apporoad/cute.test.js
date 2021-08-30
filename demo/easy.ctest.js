var CTest = require('../index')
var SD = CTest.DSON
var G = CTest.GContext.goto


var sd = SD()

sd.module('测试模块easy', '仅用于测试easy')

sd.api(
    'http://localhost:20000/easy',
    {"name": "apporoad" , 'like' : ['LiSA'] , gender : '1' , Code : '0000'}
)

sd.mark('apiResponse')
sd.get('params')
// .print()
//here to test
sd.test({
    "Code" : "='0000'",
    "like" : "!!"
} , '验证实体结构')
sd.goto('apiResponse')
// 导出参数
sd.find('like').first().mark('@like')

module.exports = sd