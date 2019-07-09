const mongoose = require("./_db");
const Schema = mongoose.Schema;

const config = require("../config");

const settingSchema = new Schema({
    quotation: {
        type: Number,
        default: 1800
    },
    tolerence: {
        type: Number,
        default: 5
    },
    commition: {
        type: Number,
        default: 10
    },
    baseCharge: {
        type: Number,
        default: 1150
    },
    code: {
        type: Number,
        default: 100000
    }
})

const Setting = mongoose.model("Setting" , settingSchema)

module.exports = (async () => {
    let s = await Setting.findOne()
    if (s == undefined) {
        s = new Setting()
        await s.save()
    }
    return {
        getCode: async ()=> {
            let setting = await Setting.findOne()
            let c = setting.code++
            setting = await setting.save()
            return c
        },
        getQuotation:  async ()=> {
            let setting = await Setting.findOne()
            return setting.quotation
        },
        setQuotation:  async (v)=> {
            let setting = await Setting.findOne()
            setting.quotation = v
            setting = await setting.save()
        },
        getTolerance:  async ()=> {
            let setting = await Setting.findOne()
            return setting.tolerence
        },
        setTolerence:  async (v)=> {
            let setting = await Setting.findOne()
            setting.tolerence = v
            setting = await setting.save()
        },
        getCommition: async ()=> {
            let setting = await Setting.findOne()
            return setting.commition
        },
        setCommition: async (v) => {
            let setting = await Setting.findOne()
            setting.commition = v
            setting = await setting.save()
        },
        getBaseCharge: async () => {
            let setting = await Setting.findOne()
            return setting.baseCharge
        },
        setBaseCharge: async (v) => {
            let setting = await Setting.findOne()
            setting.baseCharge = v
            setting = await setting.save()
        },
    }
})