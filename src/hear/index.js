const Telegraf = require('telegraf')
const helpers = require('../helpers')
const moment = require('moment')
const config = require('../config')
const User = require('../model/User'),
    {
        keys
    } = config,
    Bill = require('../model/Bill'),
    Markup = require('telegraf/markup')

const {
    enter
} = require('telegraf/stage')

const OwnerOnlyMsg = 'این دستور تنها برای مالک ربات قابل اجرا می باشد'

const OwnerOnly = (fn) => Telegraf.branch(
    helpers.isOwner,
    fn,
    ctx => {
        console.log('not owner')
        ctx.telegram.sendMessage(ctx.message.from.id, OwnerOnlyMsg)
        ctx.deleteMessage()
    }
)

module.exports = {
    updateQuotation: OwnerOnly(
        async ctx => {
            var [t, v] = ctx.match[0].split(' ')
            await ctx.setting.setQuotation(+v)
            ctx.reply(`مظنه: ${v}`)
            /**
             * if user is loosing money make constant sell for em
             */

            ctx.deleteMessage()
        }
    ),
    updateBaseCharge: OwnerOnly(
        async ctx => {
            var [t, i, v] = ctx.match[0].split(' ')
            await ctx.setting.setBaseCharge(+v)
            ctx.reply(`وجه تضمین: ${v}`)
            ctx.deleteMessage()
        }
    ),
    updateCommition: OwnerOnly(
        async ctx => {
            var [t, v] = ctx.match[0].split(' ')
            await ctx.setting.setCommition(+v)
            ctx.reply(`کمیسیون: ${v}`)
            ctx.deleteMessage()
        }
    ),
    updateTolelrance: OwnerOnly(
        async ctx => {
            var [t, v] = ctx.match[0].split(' ')
            await ctx.setting.setTolerence(+v)
            ctx.reply(`تلورانس: ${v}`)
            ctx.deleteMessage()
        }
    ),
    openfacts: async (ctx) => {
        ctx.reply('درخواست با موفقیت ارسال شد لطفا منتظر بمانید')
        let opfs = await Bill.find({
            userId: ctx.user.userId,
            closed: true,
            left: {$gt: 0}
        })
        let p = await helpers.opfImage(ctx, opfs)
        ctx.replyWithPhoto({
            source: p
        })
    },
    monthlyReport: async (ctx) => {
        ctx.reply('درخواست با موفقیت ارسال شد لطفا منتظر بمانید')
        let rows = ''
        let index = 0
        for (var z = 30; z >= 0; z--) {
            let biggeningStr = moment().startOf('day').subtract(z, 'days').format('l')
            let biggening = moment().startOf('day').subtract(z, 'days').unix() * 1000
            let ending = moment().endOf('day').subtract(z, 'days').unix() * 1000
            let bills = await Bill.find({
                date: {
                    $gt: biggening,
                    $lt: ending
                }, closed: true,
                left: 0,
                userId: ctx.user.userId
            })
            if (bills.length > 0) {
                let total = 0,
                    profit = 0
                for (let x = 0; x < bills.length; x++) {
                    profit += bills[x].profit
                    total += bills[x].profit
                    total -= bills[x].commition
                }
                rows +=  config.templates.mrRow.replace("INDEX", ++index).replace("DATE", biggeningStr).replace("PROFIT", helpers.toman(profit)).replace('SUM', helpers.toman(total))
            }
        }
        let content = config.templates.mrTemp.replace('ROWS', rows).replace('NAME', ctx.user.name)
        let res = await helpers.printImage(content)
        ctx.replyWithPhoto({
            source: res
        })
    },
    sendUser: async (ctx) => {
        let msg = await helpers.userToString(ctx)
        ctx.reply(msg, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'ویرایش نام',
                        callback_data: 'name-view'
                    }],
                    [{
                        text: 'ویرایش شماره تماس',
                        callback_data: 'phone-view'
                    }]
                ]
            }
        })
    },
    chargeUser: Telegraf.branch(
        helpers.isPrivate,
        OwnerOnly(
            async (ctx) => {
                console.log('called')
                /**
                 * charge a user
                 * todo ask for confirm
                 */
                let [c, userId, charge] = ctx.match[0].split(' ')
                userId = +userId
                charge = +charge

                let user = await User.findOne({
                    userId
                })
                if (user == undefined) {
                    return ctx.reply('کاربر یافت نشد')
                }

                let res = await ctx.reply(`do you confirm to charge ${userId}:${user.name} with ${charge}?`,
                    Markup
                    .inlineKeyboard([
                        [{
                            text: 'تایید',
                            callback_data: 'confirm'
                        }, {
                            text: 'انصراف',
                            callback_data: 'cancel'
                        }]
                    ]).resize().extra()
                )
                ctx.session.state = JSON.stringify({
                    action: 'charge',
                    amount: charge,
                    userId: userId,
                    message_id: res.message_id
                })

            }
        ),
        (ctx) => {
            ctx.telegram.sendMessage(ctx.message.from.id, 'این دستور تنها در چت خصوصی قابل اجرا می باشد')
            ctx.deleteMessage()
        }
    ),
    sendEccountant: (ctx) => {
        ctx.telegram.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id)
        ctx.reply('عملیات مورد نظر را انتخاب کنید:', Markup
            .keyboard([
                [keys.summitResipt, keys.reqCash],
                [keys.reqCard, keys.cardInfo],
                [keys.transactions, keys.help, keys.contactManager],
                [keys.back]
            ])
            .resize()
            .extra()
        )

    },
    sendMainMenu: (ctx) => {
        console.log('called')
        ctx.reply('منوی اصلی:', Markup.keyboard([
            [keys.openfacts, keys.monthlyReport],
            [keys.postSettleReport, keys.semiSettle],
            [keys.packInv, keys.changeInv],
            [keys.userInfo, keys.contact]
        ]).resize().extra())
    },

    reqCash: Telegraf.branch(
        (ctx) => {
            //friday is 5
            return (moment().weekday() == 5 && moment().unix() >= moment().hour(9).minute(0) && moment().unix() >= moment().hour(20).minute(0))
            // return true
        }, enter('cashReq'), ctx => {
            ctx.reply(`❌درخواست وجه فقط در روزهای جمعه از ساعت 9 الی 20 امکان پذیر می باشد.`)
        }
    ),

    contact: (ctx) => {
        ctx.reply('معامله گر گرامی با توجه به نیاز خود یکی از بخش های زیر را برای دریافت خدمات و راهتمایی اتنخاب کنید', {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keys.support,
                        callback_data: keys.support
                    }],
                    [{
                        text: keys.eccountant,
                        callback_data: keys.eccountant
                    }]
                ]
            }
        })
    },

    cardInfo: (ctx) => {
        ctx.reply(`
        💳 شماره کارت شما ${ctx.user.bank.number}

        🏦 نام بانک: ${ctx.user.bank.name}
        `, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'ویرایش',
                        callback_data: 'bank-name-view'
                    }]
                ]
            }
        })
    },
    goldInv: async (ctx) => {
        let bills = await Bill.find({
            userId: ctx.message.from.id,
            isSell: false
        })
        let count = 0

        for (var i = 0; i < bills.length; i++) {
            count += bills[i].left
        }

        let msg = `${count} واحد طلا`
        ctx.reply(msg)
    },

    changeInv: (ctx) => {
        let msg = `${helpers.toman(ctx.user.charge)} تومان`
        ctx.reply(msg)
    }
}