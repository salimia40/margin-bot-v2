const mongoose = require("./_db");
const config = require("../config");
const Schema = mongoose.Schema;

const billSchema = new Schema({
    userId: {
        type: Number,
        required: true
    },
    isSell: {
        type: Boolean,
        default: true
    },
    settled: {
        type: Boolean,
        default: false
    },
    expired: {
        type: Boolean,
        default: false
    },
    code: {
        type: Number,
        default: Date.now()
    },
    profit: {
        type: Number,
        default: 0
    },
    commition: {
        type: Number,
        default: 0
    },
    awkwardness: {
        awk: Number,
        sellprice: Number
    },
    closed: {
        type: Boolean,
        default: false
    },
    date: {
        type: Number,
        default: Date.now()
    },
    sellerId: {
        type: Number
    },
    buyerId: {
        type: Number
    },
    amount: {
        type: Number,
        required: true
    },
    sells: [{
        price: Number,
        amount: Number,
    }],
    left: {
        type: Number,
        default: 0
    },
    avrage: {
        type: Number,
        default: 0
    },
    messageId: {
        type: Number
    },
    price: {
        type: Number,
        required: true
    }
})

const Bill = mongoose.model( "Bill", billSchema)

module.exports = Bill