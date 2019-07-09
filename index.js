let path = require('path')
console.log(require('dotenv').config({path: path.join(__dirname,'base.env')}))
// if(process.env.MONGO_URI == undefined) process.env.MONGO_URI = 'mongodb://root:VyD4h5LcmaYfpPCc69muIuFy@s7.liara.ir:30770/mrbottest'
// if(process.env.TOKEN == undefined) process.env.TOKEN = '882220621:AAEbh2pgLrq99WDKn35d7eSvymMLW1eGysM'

Object.assign(process.env,require('dotenv').config({path: path.join(__dirname,'base.env')}))
console.log(process.env.TOKEN)

// process.env.MONGO_URI = 'mongodb://mongodb:27017/isawyou'

require('./src/app')

