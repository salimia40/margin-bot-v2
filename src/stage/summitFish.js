const Scene = require('telegraf/scenes/base')
const Transaction = require('../model/Transaction')
const {
    leave
} = require('telegraf/stage')
const User = require('../model/User')

const summitFishScene = new Scene('summitFish')
// summitFishScene.use(session())
summitFishScene.enter((ctx) => {
    ctx.reply('لطفا مبلغ مد نظر خود را به تومان به صورت عددی وارد نمایید.')
    ctx.session.state = 'numeric asked'
})

summitFishScene.hears('خروج',
    leave()
)

summitFishScene.on('text', async (ctx) => {
    switch (ctx.session.state) {
        case 'numeric asked':
            if (isNaN(ctx.message.text)) {
                ctx.reply('فرمت وارد شده صحیح نیست دوباره امتحان کنید')
            } else {
                ctx.reply(`لطفا مبلغ مد نظر خود را به تومان و حروف وارد نمایید.
                برای مثال:  پنج میلیون تومان`)
                ctx.session.num = +(ctx.message.text)
                ctx.session.state = 'alphebetic asked'
            }
            break
        case 'alphebetic asked':
            ctx.session.alph = ctx.message.text
            ctx.reply('لطفا عکس فیش واریزی را ارسال نمایید')
            ctx.session.state = 'image asked'
            break
    }
})


summitFishScene.on('photo', async (ctx, next) => {
    let photo
    ctx.message.photo.forEach(p => {
        if (photo == undefined || photo.file_size < p.file_size) photo = p
    });
    ctx.session.photo_id = photo.file_id
    console.log(ctx.session)
    let c = await Code()
    let transaction = new Transaction({
        code: c,
        userId: ctx.message.from.id,
        charge: ctx.session.num,
        chargeStr: ctx.session.alph,
        photo_id: ctx.session.photo_id,
        ischarge: true
    })

    delete ctx.session.num
    delete ctx.session.alph
    delete ctx.session.photo_id

    transaction = await transaction.save()
    ctx.reply('درخواست شما ثبت و به حسابداری ارسال گردید \n شماره پیگیری شما : ' + transaction.code)
    /**
     * todo save and send for owner
     */
    let caption = 'درخواست تراکنش\n'
    caption += `مقدار به عدد: ${transaction.charge} \n`
    caption += `مقدار به حروف: ${transaction.chargeStr}\n`
    caption += ``
    let owner = await User.findOne({
        role: 'bot-owner'
    })
    ctx.telegram.sendPhoto(owner.userId, transaction.photo_id, {
        caption,
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
                ]
            ]
        }
    })
    next()
}, leave())

module.exports = summitFishScene