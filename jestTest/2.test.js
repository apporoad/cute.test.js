var run = require('../run')

var apis = [
    { meta : { name : 'test1' , desc : 'desc1' , isTarget : true , inputs : [] , outputs : []}},
]

it('test filterAndReorderToRunApis', async () => {

    apis.forEach(api=>{
        api.meta = api.meta || {}
        api.meta.isTarget = true
    })
	await run.drawInputAndOutput(apis)

    var allVars = {
        "@noInput1" : ""
    }
    var all =  await run.checkNoInputApis(apis ,allVars)

	console.log(all.length)

    expect(all.length).toBe(1)
    if(all.length>0){
        //console.log(all[0])
        expect(all[0].name).toBe("test3")
    }

})