var SD = require('../index').DSON

var sd = SD()

sd.api(
    'http://localhost:20000/easy',
    {"name": "apporoad" , 'like' : ['LiSA'] , gender : '1' , Code : '0000'}
)

sd.mark('apiResponse')
//here to test
sd.test({
    "Code" : "='0000'",
    "like" : "!!"
})
sd.goto('apiResponse')
// 导出参数
sd.find('like').first().mark('@like')

module.exports = sd