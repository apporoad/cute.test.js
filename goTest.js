
it = (title, fn) => {
    // if (fn)
    //   fn()
  }
  expect = (result) => {
    //console.log(result)
    return {
      toBe: () => { },
      toBeTruthy: () => { }
    }
  }
  
  it2 = (title,fn)=>{
    if(fn)
      fn()
  }
  
  global.debug = global.debug || it2

  require('./jestTest/1.test')
  require('./jestTest/2.test')