var SD = require('dson.js').DSON

var sd = SD()

sd.api(
    'http://localhost/b2b/Hotel/Search',
    {"GetTimes":1,"DestCode":"5_292","ArrivalDate":"2021-09-04",
"DepartureDate":"2021-09-05","Rank":1,"Page":{"Index":1,"Size":10},
"FilterList":[],"MemberId":"7PfzLlXs+9HqzMwCLX8EdQ==","Token":"277bbb015e0c1cef105708e4e419c1a7",
"PlatId":1020,"RefId":"0","Version":"5.1.1"}
)


sd.mark('apiResponse')
//here to test
sd.test({
    "Code" : "='0000'",
    "Data" : "!!"
})
sd.goto('apiResponse')
// 导出参数
sd.find('HotelId').first().mark('@hotelId')

module.exports = sd