const { Composer, Scenes: { BaseScene } } = require('telegraf')
const titles = require('../src/middlewares/titles')
const main_menu_button = 'admin_back_keyboard'
const tOrmCon = require("../db/data-source");
const moment = require("moment")
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


adminScene.hears(titles.getValues('BUTTON_CHANNELS'), ctx => ctx.scene.enter('categoriesScene', { main_menu_button, type: "CHANNELS" }))

adminScene.hears(titles.getValues('BUTTON_CHATS'), ctx => ctx.scene.enter('categoriesScene', { main_menu_button, type: "CHATS" }))


adminScene.hears(titles.getValues('BUTTON_BOTS'), ctx => ctx.scene.enter('categoriesScene', { main_menu_button, type: "BOTS"}))


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
    const res = await connection.query(`SELECT day.date, users_per_day, users_per_week from 
        (SELECT date, users_per_day FROM channels.statistics
        WHERE DATEDIFF(now(), date) < 7) day right join
        (SELECT sum(users_per_day) users_per_week FROM channels.statistics
        WHERE DATEDIFF(now(), date) < 7 GROUP BY DATEDIFF(now(), date) < 7) week
    on 1=1`)
    .catch((e)=>{
        console.log(e)
        ctx.replyWithTitle("DB_ERROR")
    })

    const register_info = await connection.query(`SELECT day.date, registered_per_day, registered_per_week from 
        (SELECT DATE(date_register) date, count(date_register) registered_per_day FROM channels.users
        WHERE DATEDIFF(now(), date_register) < 7 GROUP BY DATE(date_register)) day right join
        (SELECT count(date_register) registered_per_week FROM channels.users
        WHERE DATEDIFF(now(), date_register) < 7 GROUP BY DATEDIFF(now(), date_register) < 7)  week
    on 1=1`)
    .catch((e)=>{
        console.log(e)
        ctx.replyWithTitle("DB_ERROR")
    })

    const { total_count, count_alive, count_active,count_aliens, count_arabs } = (await connection.query(`select count(id) total_count, sum(is_alive) count_alive, count(DATEDIFF(now(), lastUse) < 7) count_active, sum(language_code<>'ru') count_aliens, sum(is_arabic) count_arabs from channels.users`)
    .catch((e)=>{
        console.log(e)
        ctx.replyWithTitle("DB_ERROR")
    }))?.[0] ?? {}

    

    if (!res || !res.length)  return ctx.replyWithTitle('THERE_IS_NO_STAT')

    let statStr = `<u><b>Пользователи</b></u>\n\nВсего: ${total_count}\nДоступных: ${count_alive}\nАктивных за неделю: ${count_active}\nИностранцев: ${count_aliens}\nАрабов: ${count_arabs}\n\n<u><b>Статистика использования</b></u>\n\n`

    function getDates(startDate, stopDate) {
        var dateArray = [];
        var currentDate = moment(startDate);
        var stopDate = moment(stopDate);
        while (currentDate <= stopDate) {
            dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
            currentDate = moment(currentDate).add(1, 'days');
        }
        return dateArray.reverse();
    }

    

    let sd = new Date()
    sd = sd.setDate(sd.getDate() - 7);

    const dates = getDates(sd, Date.now())


    dates.forEach((cur)=>{

        const useInfo = res.find(el=>moment(el.date).format('YYYY-MM-DD') === cur)

        const regInfo = register_info.find(el=>moment(el.date).format('YYYY-MM-DD') === cur)

        if (useInfo?.users_per_day || regInfo?.registered_per_day) 
         statStr+=`<b>${cur?.substr(8)}ое: ${useInfo?.users_per_day ?? 0}</b> уникальных запусков, <b>${regInfo?.registered_per_day ?? 0}</b> новых пользователей\n`
    })

    statStr+=`\n<b>За неделю: ${res?.[0]?.users_per_week ?? 0}</b> запусков, <b>${register_info?.[0]?.registered_per_week ?? 0}</b> новых пользователей`
    
    console.log(statStr)

    return ctx.replyWithTitle('STAT',[statStr])
    


    
})


adminScene.hears(titles.getValues('BUTTON_CLIENT_MENU'), ctx => ctx.scene.enter('clientScene'))



module.exports = adminScene