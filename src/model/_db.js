module.exports = db = (() => {
    const mongoose = require('mongoose')
    const config = require('../config')
    mongoose.connect(config.db_url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        authSource: 'admin',
        reconnectTries: 30, // Retry up to 30 times
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 10, // Maintain up to 10 socket connections
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0
    }).then(console.log('connected')).catch(console.error)
    return mongoose
})()