const { Composer, Scenes: { BaseScene } } = require('telegraf')
const titles = require('../src/middlewares/titles')
const main_menu_button = 'admin_back_keyboard'
const tOrmCon = require("../db/data-source");

const adminScene = new BaseScene('adminScene')

adminScene.enter(async ctx=>{
    const connection = await tOrmCon

    connection.getRepository("Admin")
    .findOne({where: {userId: ctx.from?.id}})
    .then((res) => {
        if (!res)  return ctx.scene.enter('clientScene');
        if (!res.canUpdateAdmins) return ctx.replyWithKeyboard('ADMIN_MENU_ACTIONS', 'admin_main_keyboard')
        return ctx.replyWithKeyboard('ADMIN_MENU_ACTIONS', 'admin_main_keyboard_owner')
    })
    .catch((e)=>{
        console.log(e)
        ctx.replyWithTitle("DB_ERROR")
    })

})


adminScene.hears(titles.getValues('BUTTON_CHANGE_TEXT'), ctx => ctx.scene.enter('changeTextScene', { main_menu_button }))


adminScene.hears(titles.getValues('BUTTON_CATEGORIES'), ctx => ctx.scene.enter('categoriesScene', { main_menu_button }))

adminScene.hears(titles.getValues('BUTTON_ADMINS'), ctx => ctx.scene.enter('adminsScene', { main_menu_button }))

//adminScene.hears(titles.getValues('BUTTON_POINTS'), ctx => ctx.scene.enter('pointAddingScene', { main_menu_button }))

function formatDate(date) {
    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
      }

    return [
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1)
    ].join('.');
  }

adminScene.hears(titles.getValues('BUTTON_STATISTICS'),async ctx => {
    const connection =await tOrmCon
    connection.query(`SELECT date, users_per_day, cart_per_day, users_per_week, cart_per_week from 
	(SELECT date, users_per_day, cart_per_day FROM channels.statistics
	WHERE DATEDIFF(now(), date) < 7) day,
    (SELECT sum(users_per_day) users_per_week, sum(cart_per_day) cart_per_week FROM channels.statistics
	WHERE DATEDIFF(now(), date) < 7 GROUP BY date) week`)
    .then((res) => {
        if (!res || !res.length)  return ctx.replyWithTitle('THERE_IS_NO_STAT')

        let statStr = res.reduce((prev,cur,i)=>{

            return prev+`${formatDate(cur?.date)}: запусков: ${cur?.users_per_day}, Выдач: ${cur?.cart_per_day}\n`
        },"")
        statStr+=`\nЗа неделю:\nЗапусков: ${res?.[0]?.users_per_week}, Выдач: ${res?.[0]?.cart_per_week}`
        
        console.log(statStr)

        return ctx.replyWithTitle('STAT',[statStr])
    })
    .catch((e)=>{
        console.log(e)

        ctx.replyWithTitle("DB_ERROR")
    })
    
})


adminScene.hears(titles.getValues('BUTTON_CLIENT_MENU'), ctx => ctx.scene.enter('clientScene'))



module.exports = adminScene