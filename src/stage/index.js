const Stage = require('telegraf/stage')

const stage = new Stage(
    [
        require('./signup'),
        require('./summitFish'),
        require('./cashReq'),
    ], {
        ttl: 31104000
    }
)


module.exports = stage