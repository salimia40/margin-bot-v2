
const Scene = require('telegraf/scenes/base')
const Transaction = require('../model/Transaction')
const {
    leave
} = require('telegraf/stage')
const User = require('../model/User')

const cashReqScene = new Scene('cashReq')
cashReqScene.enter((ctx) => {
    ctx.reply('لطفا مبلغ مد نظر خود را به تومان به صورت عددی وارد نمایید.')
    ctx.session.state = 'numeric asked'
})
cashReqScene.hears('خروج',
    leave()
)
cashReqScene.on('text', async (ctx,next) => {
    let done = false
    switch (ctx.session.state) {
        case 'numeric asked':
            if (isNaN(ctx.message.text)) {
                ctx.reply('فرمت وارد شده صحیح نیست دوباره امتحان کنید')
            } else {
                ctx.reply(`لطفا مبلغ مد نظر خود را به تومان و حروف وارد نمایید.
                برای مثال:  پنج میلیون تومان`)
                let num = +(ctx.message.text)
                if (num / 1000 > ctx.state.user.charge) {
                    ctx.reply('مبلغ وارد شده بیشتر از وجه تضمیت شماست لطفا دوباره امتحان کنیدو جهت انصراف کلمه خروج را ارسال کنید.')
                } else {
                    ctx.session.num = num
                    ctx.session.state = 'alphebetic asked'
                }
            }
            break
        case 'alphebetic asked':
            ctx.session.alph = ctx.message.text
            ctx.reply('در صورتی که توضیحاتی برای درخواست خود دارید وارد نمایید در غیر اینصورت کلمه تایید را وارد نمایید.')
            ctx.session.state = 'explaines asked'
            break
        case 'explaines asked':
            if (ctx.message != 'تایید') {
                ctx.session.exp = ctx.message.text
            }
            let c = await ctx.setting.getCode()
            let transaction = new Transaction({
                code: c,
                userId: ctx.message.from.id,
                charge: ctx.session.num,
                chargeStr: ctx.session.alph,
                ischarge: false,
                explain: ctx.session.exp
            })

            delete ctx.session.num
            delete ctx.session.alph
            delete ctx.session.exp

            transaction = await transaction.save()

            ctx.reply(`درخواست شما با موفقیت ثبت گردید و نتیجه ی درخواست پس از بررسی به حضورتان اعلام می گردد.

            📃 شماره درخواست : ${transaction.code}
            
            📣 توجه داشته باشید درخواست حسابداری شما به دلیل محدودیت های بانکی و یا زمانبر بودن پیگیری تراکنش ها ممکن است تا 24 ساعت به طول بیانجامد لذا در طول این مدت از مراجعه به خصوصی مدیران جدا خودداری نمایید. از صبر و شکیبایی شما سپاسگذاریم.`)

            /** 
             * todo user information is also needed 
             */
            let caption = 'درخواست وجه\n'
            caption += `مقدار به عدد: ${transaction.charge} \n`
            caption += `مقدار به حروف: ${transaction.chargeStr}\n`
            caption += `توضیحات کاربر: ${transaction.explain}\n`
            caption += ``
            let owner = await User.findOne({
                role: 'bot-owner'
            })
            ctx.telegram.sendMessage(owner.userId, caption, {
                reply_markup: {
                    inline_keyboard: [
                        [{
                                text: 'تایید',
                                callback_data: `confirmtransaction:${transaction.code}`
                            },
                            {
                                text: 'رد',
                                callback_data: `rejecttransaction:${transaction.code}`
                            }
                        ], [
                            {
                                text: 'انجام شد',
                                callback_data: `donetransaction:${transaction.code}`
                            }   
                        ]
                    ]
                }
            })
            done = true

            break
    }
    if(done) next()
}, leave())

module.exports = cashReqScene