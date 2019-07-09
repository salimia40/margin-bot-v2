const groupsThatImAdmin = []
const Bill = require('../model/Bill')
const puppeteer = require('puppeteer')
const config = require('../config')

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const printImage = async (content) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1280,
        height: 800
    })
    await page.setContent(content)
    let res = await page.screenshot({
        fullPage: true
    })
    await browser.close()
    return res
}


const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
};
const formatter = new Intl.DateTimeFormat([], options);

const opfImage = async (ctx, opfs) => {
    let rows = ''
    let i = 0
    for (var z = 0; z < opfs.length; ++z) {
        let bill = opfs[z]
        let style, deal
        if (bill.isSell) {
            style = 'bg-danger'
            deal = 'فروش'

        } else {
            style = 'bg-primary'
            deal = 'خرید'

        }

        rows += config.templates.opfRow.replace("INDEX", ++i)
            .replace("DEAL-STYLE", style)
            .replace("DEAL", deal)
            .replace('AMOUNT', bill.left)
            .replace('PRICE', toman(bill.price))
            .replace('CODE', bill.code)

    }

    let content = config.templates.opfTemp.replace('ROWS', rows)
        .replace('NAME', ctx.user.name)
        .replace('DATE', formatter.format(Date.now()))

    let res = await printImage(content)
    return res

}


const toman = (v) => {
        if (v == undefined) v = 0
        return formatNumber(Math.round(v * 10) * 100)
    },
    formatNumber = (v) => {
        return v.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

module.exports = {
    asyncForEach,
    printImage,
    formatNumber,
    opfImage,
    toman,
    maxCanBuy: async (ctx) => {
        let bc = await ctx.setting.getBaseCharge()
        let mx = Math.round(ctx.user.charge / bc)
        let bills = await Bill.find({
            closed: true,
            userId: ctx.user.userId,
            isSell: false,
            left : {$gt: 0}
        })
        let am = 0
        for (var i = 0; i < bills.length; i++) {
            am += bills[i].left
        }
        mx -= am
        if (mx < 0) mx = 0
        return mx
    },
    maxCanSell : async (ctx) => {
        let bc = await ctx.setting.getBaseCharge()
        let mx = Math.round(ctx.user.charge / bc)
        let bills = await Bill.find({
            closed: true,
            userId: ctx.user.userId,
            isSell: true,
            left : {$gt: 0}
        })
        let am = 0
        for (var i = 0; i < bills.length; i++) {
            am += bills[i].left
        }
        mx -= am
        if (mx < 0) mx = 0
        return mx
    },
    matchTolerance: async (ctx, price) => {
        let tol = await ctx.setting.getTolerance()
        let q = await ctx.setting.getQuotation()
        return (price >= (q - tol) && price <= (q + tol))
    },
    maxGold: async (ctx) => {
        let bc = await ctx.setting.getBaseCharge()
        return Math.round(ctx.user.charge / bc)
    },
    countProfit: (buyPrice, sellPrice) => {
        let diff = sellPrice - buyPrice
        return diff * 23.08
    },
    parseLafz: l => {
        let a, b, isSell
        isSell = l.includes('ف')
        if (isSell) {
            [a, b] = l.split('ف')
        } else {
            [a, b] = l.split('خ')
        }
        a = +a
        b = +b
        return [a, isSell, b]
    },
    isOwner: (ctx) => {
        return ctx.user.role == config.role_owner
    },
    isAdmin: (ctx) => {
        return ctx.user.role == config.role_owner || ctx.user.role == config.role_admin
    },
    isComplete: (ctx) => {
        return ctx.user.stage == 'completed'
    },
    isReply: (ctx) => {
        return ctx.message.reply_to_message != undefined
    },
    isPrivate: (ctx) => {
        return ctx.chat.type == 'private'
    },
    isGroup: (ctx) => {
        return ctx.chat.type == 'group' || ctx.chat.type == "supergroup"
    },
    buyAvg: async (userId) => {
        let mgs = await Bill.find({
            userId,
            isSell: false,
            left: {$gt: 0}
        })

        let avg = 0
        if (mgs.length > 0) {
            let sum = 0
            let am = 0
            await asyncForEach(mgs, mg => {
                sum += mg.price * mg.left //don't forget to add the base
                am += mg.left
            })
            avg = sum / am
        }
        return avg
    },
    sellAvg: async (userId) => {
        let mgs = await Bill.find({
            userId,
            isSell: true,
            left: {$gt: 0}
        })

        let avg = 0
        if (mgs.length > 0) {
            let sum = 0
            let am = 0
            await asyncForEach(mgs, mg => {
                sum += mg.price * mg.left //don't forget to add the base
                am += mg.left
            })
            avg = sum / am
        }
        return avg
    },
    isGroupAdmin: async (ctx, botUser) => {
        let isBdmin = false
        if (groupsThatImAdmin.includes(ctx.chat.id)) isBdmin = true
        if (isBdmin) return isBdmin
        var mems = await ctx.telegram.getChatAdministrators(ctx.chat.id)

        await asyncForEach(mems, mem => {
            if (mem.user.id == botUser.id) {
                groupsThatImAdmin.push(ctx.chat.id)
                isBdmin = true
            }
        })
        return isBdmin
    },
    countAwkwardness: async (ctx, bill) => {
        let q = await ctx.setting.getQuotation()
        let awk
        awk = ctx.user.charge * 4.3318 / 100
        awk *= 0.85
        if (bill.isSell) {
            awk = q + awk
        } else {
            awk = q - awk
        }
        let sellprice = awk
        if (bill.isSell) {
            sellprice += 3
        } else {
            sellprice -= 3
        }

        return {
            awk,
            sellprice
        }
    },
    userToString: async (ctx) => {
        let user = ctx.user
        let chat = await ctx.getChat()
        let res = `شماره کاربری : ${user.userId}
نام : ${user.name}
تلفن: ${user.phone} \n`
        if (!chat.username)
            res += `آیدی تلگرام : ${chat.username} \n`
        res += `مقدار پس انداز : ${toman(user.charge)} تومان
شماره کارت : ${user.bank.number}
        `
        return res;

    }
}