var run = require('../run')
var SD = require('../index').DSON
var G = require('../index').GContext.goto

var sd1= SD()
.module('test1', 'test1 desc')
.api(
    'http://localhost:20000/test1',
    {"name": "apporoad" , 'like' : ['LiSA'] , gender : G("@hello") , Code : '0000'}
)
.mark('apiResponse')
.test({
    "Code" : "='0000'",
    "like" : "!!"
}).goto('apiResponse').find('like').first().mark('@like')

var sd2= SD().module('test2', 'test2 desc')
.api(
    'http://localhost:20000/tes2',
    {"name": "LiSA" , 'like' : ['LiSA'] , gender : '1' , Code : '0000'}
)
.mark('apiResponse')
.test({
    "Code" : "='0000'",
    "like" : "!!"
}).goto('apiResponse').find('name').mark('@name')


var sd3= SD().module('test3', 'test3 desc')
.api(
    'http://localhost:20000/tes3',
    {"hello": "world" , Code : '0000' , haha : G('@noInput')}
)
.mark('apiResponse')
.test({
    "Code" : "='0000'",
    "like" : "!!"
}).goto('apiResponse').find('name').mark('@hello')

var apis = [sd1,sd2,sd3]

it('test checkNoInputApis', async () => {

    apis.forEach(api=>{
        api.meta = api.meta || {}
        api.meta.isTarget = true
    })
	await run.drawInputAndOutput(apis)

    var allVars = {
        "@noInput1" : ""
    }
    var all =  await run.checkNoInputApis(apis ,allVars)

	// console.log(all.length)

    expect(all.length).toBe(1)
    if(all.length>0){
        //console.log(all[0])
        expect(all[0].name).toBe("test3")
    }

})