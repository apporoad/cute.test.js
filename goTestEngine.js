it = (title, fn) => {
  if (fn)
    fn()
}
expect = (result) => {
  //console.log(result)
  return {
    toBe: () => {},
    toBeTruthy: () => {}
  }
}

it2 = (title, fn) => {
  if (fn)
    fn()
}

describe = (title, fn) => {
  if (fn)
    fn()
}

global.debug = global.debug || it2

var plan = {
  "vars": {},
  "apis": [{
    "meta": {
      "path": "D:\\lxy\\cute.test.js\\demo\\easy.ctest.js",
      "isTarget": true,
      "name": "测试模块easy",
      "desc": "仅用于测试easy",
      "inputs": [],
      "outputs": ["@like"]
    }
  }, {
    "meta": {
      "path": "D:\\lxy\\cute.test.js\\demo\\sub\\sub.ctest.js",
      "isTarget": true,
      "name": "测试模块easy",
      "desc": "仅用于测试模块easy",
      "inputs": ["@like"],
      "outputs": ["@abc"]
    }
  }]
}

require('./testEngineAdapters/jestAdapter').exec(plan)