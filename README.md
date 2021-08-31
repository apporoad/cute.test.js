# cute.test.js
ctest  short for cute.test , is really easy use test framework , and core is dson.js


## dev

```bash
npm i -g aok.js

aok test -p 20000
```


## how to exts

```js
// api add preInvokes
global.ctestExts.apiPreInvokes = global.ctestExts.apiPreInvokes  || []

global.ctestExts.apiPreInvokes.push(async(invokeObj,context)=>{
    
})

```