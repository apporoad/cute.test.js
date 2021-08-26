var run = require('../run')


it('test filterAndReorderToRunApis', async () => {
    var apis = [
        { meta : { name : 'test1' , desc : 'desc1' , isTarget : true , inputs : ['@2' , '@3'] , outputs : ["@1"]}},
        { meta : { name : 'test2' , desc : 'desc2' , isTarget : true , inputs : [ '@4' , '@5'] , outputs : ["@2"]}},
        { meta : { name : 'test3' , desc : 'desc3' , isTarget : false , inputs : [ '@5' , '@6'] , outputs : ["@3"]}},
        { meta : { name : 'test4' , desc : 'desc4' , isTarget : false , inputs : [] , outputs : ["@4"]}},
        { meta : { name : 'test5' , desc : 'desc5' , isTarget : false , inputs : [] , outputs : ["@5"]}},
        { meta : { name : 'test6' , desc : 'desc6' , isTarget : false , inputs : [] , outputs : ["@6"]}},
    ]
    var allVars = []
    var all =  await run.filterAndReorderToRunApis(apis ,allVars)
	//console.log(all.length)
    expect(all[0].meta.name == 'test4').toBe(true)
    expect(all[1].meta.name == 'test5').toBe(true)
    expect(all[2].meta.name == 'test2').toBe(true)
    expect(all[3].meta.name == 'test6').toBe(true)
    expect(all[4].meta.name == 'test3').toBe(true)
    expect(all[5].meta.name == 'test1').toBe(true)
})

it('test filterAndReorderToRunApis2', () => {
    var apis = [
        { meta : { name : 'test1' , desc : 'desc1' , isTarget : true , inputs : ['@2' , '@3'] , outputs : ["@1"]}},
        { meta : { name : 'test2' , desc : 'desc2' , isTarget : true , inputs : [ '@3' , '@4' , '@5'] , outputs : ["@2"]}},
        { meta : { name : 'test3' , desc : 'desc3' , isTarget : false , inputs : [ '@4' , '@5' , '@6'] , outputs : ["@3"]}},
        { meta : { name : 'test4' , desc : 'desc4' , isTarget : false , inputs : ['@5'] , outputs : ["@4"]}},
        { meta : { name : 'test5' , desc : 'desc5' , isTarget : false , inputs : [] , outputs : ["@5"]}},
        { meta : { name : 'test6' , desc : 'desc6' , isTarget : false , inputs : [] , outputs : ["@6"]}},
    ]
    var allVars = []
    var all =  run.filterAndReorderToRunApis(apis ,allVars)
	//console.log(all.length)
    expect(all[0].meta.name == 'test5').toBe(true)
    expect(all[1].meta.name == 'test4').toBe(true)
    expect(all[2].meta.name == 'test6').toBe(true)
    expect(all[3].meta.name == 'test3').toBe(true)
    expect(all[4].meta.name == 'test2').toBe(true)
    expect(all[5].meta.name == 'test1').toBe(true)
})

it('test filterAndReorderToRunApis3', () => {
    var apis = [
        { meta : { name : 'test1' , desc : 'desc1' , isTarget : true , inputs : ['@2' , '@3'] , outputs : ["@1"]}},
        { meta : { name : 'test2' , desc : 'desc2' , isTarget : true , inputs : [ '@3' , '@4' , '@5'] , outputs : ["@2"]}},
        { meta : { name : 'test3' , desc : 'desc3' , isTarget : false , inputs : [ '@4' , '@5' , '@6'] , outputs : ["@3"]}},
        { meta : { name : 'test4' , desc : 'desc4' , isTarget : false , inputs : ['@5'] , outputs : ["@4"]}},
        { meta : { name : 'test5' , desc : 'desc5' , isTarget : false , inputs : [] , outputs : ["@5"]}},
        { meta : { name : 'test6' , desc : 'desc6' , isTarget : false , inputs : ['@1'] , outputs : ["@6"]}},
    ]
    var allVars = []
    var isException = false
    try{
        run.filterAndReorderToRunApis(apis ,allVars)
    }catch(ex){
        console.log(ex)
        isException = true
    }
    
    expect(isException).toBe(true)
})


it2('test filterAndReorderToRunApis  过滤掉不需要调用的接口', () => {
    var apis = [
        { meta : { name : 'test1' , desc : 'desc1' , isTarget : true , inputs : ['@2' , '@3'] , outputs : ["@1"]}},
        { meta : { name : 'test2' , desc : 'desc2' , isTarget : true , inputs : [ '@3' , '@4' , '@5'] , outputs : ["@2"]}},
        { meta : { name : 'test3' , desc : 'desc3' , isTarget : false , inputs : [ '@4' , '@5' ] , outputs : ["@3"]}},
        { meta : { name : 'test4' , desc : 'desc4' , isTarget : false , inputs : ['@5'] , outputs : ["@4"]}},
        { meta : { name : 'test5' , desc : 'desc5' , isTarget : false , inputs : [] , outputs : ["@5"]}},
        { meta : { name : 'test6' , desc : 'desc6' , isTarget : false , inputs : ['@1'] , outputs : ["@6"]}},
    ]
    var allVars = []
    var all =  run.filterAndReorderToRunApis(apis ,allVars)
    
    expect(all.length).toBe(5)
})