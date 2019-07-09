const config = require('../config')
const {keys} = config
const helpers = require('../helpers')
const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')
const {
    leave
} = require('telegraf/stage')

const singnupScene = new Scene('singnupScene')

const inputHandler = async (ctx, next) => {
    let user = ctx.user
    /**update user information based on user stage */
    switch (user.stage) {
        case "justJoined":
            break
        case "nameAsked":
            user.name = ctx.message.text
            user = await user.save()
            await ctx.reply(`نام شما به :${user.name} تغییر کرد`)
            break
        case "phoneAsked":
            user.phone = ctx.message.text
            user = await user.save()
            await ctx.reply(`شماره تماس شما :${user.phone}`)
            break
        case "bankNameAsked":
            if (user.bank == undefined) {
                user.bank = {
                    name: ctx.message.text
                }
            } else {
                user.bank.name = ctx.message.text
            }
            await ctx.reply(`بانک شما به :${user.bank.name}\n `)
            await ctx.reply("لطفا شماره حساب خود را وارد کنید")
            user.stage = 'bankNumberAsked'
            user = await user.save()
            break
        case "bankNumberAsked":
            user.bank.number = ctx.message.text
            await ctx.reply(`شماره حساب شما:${user.bank.number}`)
            user = await user.save()
            break

    }
    /**ask for eccount information */
    if (user.name == undefined) {
        ctx.reply("لطفا نام و نام خانوادگی خود را وارد کنید")
        user.stage = 'nameAsked'
        await user.save()
    } else if (user.phone == undefined) {
        ctx.reply("لطفا شماره تماس خود را وارد کنید")
        user.stage = 'phoneAsked'
        await user.save()
    } else if (user.bank.name == undefined || user.bank.number == undefined) {
        if (user.stage != 'bankNumberAsked') {
            ctx.reply("لطفا نام بانک خود را وارد کنید")
            user.stage = 'bankNameAsked'
            await user.save()
        }
    } else if (!user.acceptedTerms) {
        await helpers.asyncForEach(config.contract, async (c) => {
            await ctx.reply(c)
        })
        await ctx.reply("آیا با شرایط و قوانین ما موافقط دارید؟", {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'قبول میکنم',
                        callback_data: "terms-accept"
                    }],
                    [{
                        text: 'خیر',
                        callback_data: "terms-decline"
                    }]
                ]
            }
        })
    } else {
        /**user eccount is complete */
        await ctx.reply(await helpers.userToString(ctx))
        user.stage = 'completed'
        await user.save()
        next()
    }
}

singnupScene.action("terms-accept", async (ctx,next) => {
    ctx.user.stage = 'completed'
    ctx.user.acceptedTerms = true
    ctx.user.save()
    ctx.deleteMessage()
    ctx.reply("شما با شرایط گروه موافقط کردید",Markup.keyboard([
        [keys.openfacts, keys.monthlyReport],
        [keys.postSettleReport, keys.semiSettle],
        [keys.packInv, keys.changeInv],
        [keys.userInfo, keys.contact]
    ]).resize().extra())
    
    next()
},leave())

singnupScene.action("terms-declined", (ctx) => {
    ctx.reply("برای فعالیت دار گروه نیاز است شما با شرایط گروه موافقط کنید!!")
})

singnupScene.enter(async (ctx) => {
    if (ctx.user.name == undefined) {
        ctx.reply("لطفا نام و نام خانوادگی خود را وارد کنید")
        ctx.user.stage = 'nameAsked'
        await ctx.user.save()
    }
})
singnupScene.on('text', inputHandler, leave())


module.exports = singnupScene