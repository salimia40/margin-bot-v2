const mongoose = require("./_db");
const Schema = mongoose.Schema;

const config = require("../config");

const userSchema = new Schema({
    stage: {
        type: String,
        default: 'justJoined'
    },
    role: {
        type: String,
        default: 'bot-member'
    },
    charge: {
        type: Number,
        default: 0
    },
    userId: {
        type: Number,
        required: true
    },
    phone: String,
    state: String,
    name: String,
    bank: {
        name: String,
        number: String
    },
    acceptedTerms: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model("User" ,userSchema)

module.exports = User