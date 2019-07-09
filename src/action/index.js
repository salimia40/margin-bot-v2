const User = require('../model/User')
const Transaction = require('../model/Transaction')

module.exports = {
    confirm: async (ctx) => {
        let state = JSON.parse(ctx.session.state)
        console.log(state)
        let user = await User.findOne({
            userId: state.userId
        })
        /**todo: send a reply dud */
        switch (state.action) {
            case 'charge':
                if (user.charge == undefined) user.charge = state.amount
                else user.charge += state.amount
                break
            case 'discharge':
                if (user.charge == undefined) user.charge = (0 - state.amount)
                else user.charge -= state.amount
                break
        }
        await user.save()
        ctx.reply('انجام شد...')
        delete ctx.session.state
        ctx.telegram.deleteMessage(ctx.chat.id, state.message_id)
    },
    cancel: async (ctx) => {
        let state = JSON.parse(ctx.state.user.state)
        delete ctx.session.state
        ctx.telegram.deleteMessage(ctx.chat.id, state.message_id)
    },
    confirmtransaction: async (ctx) => {
        const parts = ctx.callbackQuery.data.split(':')
        let transaction = await Transaction.findOne({
            code: +parts[1]
        })
        if (transaction.ischarge) {

            let user = await User.findOne({
                userId: transaction.userId
            })
            user.charge += transaction.charge / 1000
            await user.save()
            transaction.confirmed = true
            await transaction.save()
            ctx.telegram.sendMessage(transaction.userId, `
            درخواست تراکنش شما به شماره ${transaction.code} تایید و اکانت شما شارژ شد
            موجودی فعلی شما : ${toman(user.charge)} تومان می باشد
            `)
            ctx.deleteMessage()
        } else {
            transaction.confirmed = true
            await transaction.save()
            ctx.telegram.sendMessage(transaction.userId, `🤵🏻 مسئول امور مالی:
            معامله گر گرامی درخواست شما به شماره : ${transaction.code} تایید شد و برای انجام در اختیار مسئول حسابداری قرار گرفت.`)
            ctx.editMessageReplyMarkup({
                inline_keyboard: [
                    [{
                        text: 'انجام شد',
                        callback_data: `donetransaction:${transaction.code}`
                    }]
                ]
            })
        }
    },
    rejecttransaction:  async (ctx) => {
        const parts = ctx.callbackQuery.data.split(':')
        let transaction = await Transaction.findOne({
            code: +parts[1]
        })
        ctx.telegram.sendMessage(transaction.userId, `
        درخواست تراکنش شما به شماره ${transaction.code} رد شد
        لطفا دوباره امتحان کنید
        `)
        ctx.deleteMessage()
    },

    donetransaction:  async (ctx) => {
        const parts = ctx.callbackQuery.data.split(':')
        let transaction = await Transaction.findOne({
            code: +parts[1]
        })
        let user = await User.findOne({
            userId: transaction.userId
        })
        user.charge -= transaction.charge / 1000
        transaction.done = true
        await user.save()
        await transaction.save()
        ctx.telegram.sendMessage(transaction.userId, `
        درخواست تراکنش شما به شماره ${transaction.code} انجام شد
        `)
        ctx.deleteMessage()
    },
    askName:(ctx, next) => {
        ctx.reply("لطفا نام خود را ارسال کنید")
        ctx.user.stage = 'nameAsked'
        ctx.user.save()
        next()
    },
    askPhone: (ctx, next) => {
        ctx.reply("لطفا شماره تماس خود را وارد کنید")
        ctx.user.stage = 'phoneAsked'
        ctx.user.save()

        next()
    },
    askBank: (ctx, next) => {
        ctx.reply("please enter your bank name")
        ctx.user.stage = 'bankNameAsked'
        ctx.user.save()
        next()
    },

}