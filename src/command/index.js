const User = require('../model/User')

module.exports = {
    init : async (ctx) => {
        let role = 'bot-owner'
       var count = await User.countDocuments({
           role
       })
       /**
        * first one to call init is manager of bot
        */
       if (count == 0) {
           ctx.user.role = role
           await ctx.user.save()
           ctx.reply('تبریک شما مالک ربات هستید')
       }
   }
}