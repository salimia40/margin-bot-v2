const Bot = require('./bot')
const config = require('./config')

console.log(config.token)

Bot(config.token).then(bot => {
    bot.launch()
    console.info('bot started successfully')
})