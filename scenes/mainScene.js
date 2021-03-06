const { Telegraf, Composer, Scenes: { WizardScene } } = require('telegraf')

const { CustomWizardScene, titles} = require('telegraf-steps-engine');
const { confirmDialog } = require('telegraf-steps-engine/replyTemplates');
const tOrmCon = require("../db/data-source");
const store = require('../store')
const stat = require("../Utils/statistics")

const clientScene = new CustomWizardScene('clientScene')
.enter(async ctx=>{

    const { edit } = ctx.scene.state

    const connection = await tOrmCon

    let userObj = (await connection.query(
            "SELECT id, DATEDIFF(now(),u.lastUse) loginAgo,userId FROM channels.users u left join channels.admins a on a.userId = u.id where u.id = ? limit 1", 
            [ctx.from?.id])
        .catch((e)=>{
            console.log(e)
            ctx.replyWithTitle("DB_ERROR")
        }))

        ctx.scene.state.userObj = userObj = userObj?.[0]


    if (!userObj) {

        await ctx.replyWithTitle("GREETING");

        /*await ctx.replyWithPhoto(ctx.getTitle('GREETING_PHOTO'), {caption: ctx.getTitle("GREETING")}).catch(async e=>{
            console.log('no photo to send');
            
        })*/
        
        userObj = await connection.getRepository("User")
        .save({id: ctx.from.id})
        .catch((e)=>{
            console.log(e)
            ctx.replyWithTitle("DB_ERROR")
        })
    }

    if (userObj?.userId) {}// await ctx.replyWithKeyboard("#", {name: 'main_menu_bottom_keyboard', args: [true]})
    
    if (userObj?.loginAgo!=="0") {
        await connection.query(
            "UPDATE channels.users u SET lastUse = now(), username = ?, is_arabic = ?, language_code = ? WHERE id = ?", 
            [ctx.from?.username, /[\u0621-\u064A]/.test(ctx.from?.first_name), ctx.from?.language_code ,ctx.from?.id])
        .catch((e)=>{
            console.log(e)
            ctx.replyWithTitle("DB_ERROR")
        })

        await stat.increaseUse(ctx.from?.id).catch(e=>{ctx.replyWithTitle(e.message)})

    }
    //console.log(store.getAllRandomLink())
    const keyboard =  'main_menu_keyboard'//{name: 'main_menu_keyboard', args: [store.getAllRandomLink(),userObj?.userId]};
    if (edit && !userObj?.userId) return ctx.editMenu("HOME_MENU",{name: 'main_menu_bottom_keyboard', args: [userObj?.userId]})
    await ctx.replyWithKeyboard("HOME_MENU",{name: 'main_menu_bottom_keyboard', args: [userObj?.userId]})
    
    
})	



clientScene.action('hide', async ctx => {
    ctx.answerCbQuery().catch(console.log);
    ctx.scene.reenter({edit: true})
})


clientScene.hears(titles.getTitle('CATALOG_BUTTON','ru'), ctx=>{
    
    ctx.scene.enter('catalogScene', )//.catch(e=>ctx.replyWithTitle(`?????? ?????????? ??????????`));
})

clientScene.action('categories',ctx=>{
    ctx.answerCbQuery().catch(console.log);

    ctx.scene.enter('catalogScene', {edit: true});
})
clientScene.action('admin_menu',ctx=>{
    ctx.answerCbQuery().catch(console.log);

    ctx.scene.enter('adminScene', {edit: true});
})

clientScene.hears(titles.getTitle('BUTTON_CHANNELS','ru'), ctx=>{
    ctx.scene.enter('catalogScene', {edit: false, random: true,forceInitKB: true});
})
clientScene.hears(titles.getTitle('BUTTON_CHATS','ru'), ctx=>{
    ctx.scene.enter('chatsScene', {edit: false, random: true, forceInitKB: true});
})
clientScene.hears(titles.getTitle('BUTTON_BOTS','ru'), ctx=>{
    ctx.scene.enter('botsScene', {edit: false});
})
/*clientScene.hears(titles.getTitle('BUTTON_RANDOM','ru'), ctx=>{
    ctx.scene.enter('catalogScene', {edit: false, random: true});
})

*/

clientScene.hears(titles.getTitle('ADMIN_SCENE_BUTTON','ru'), ctx=>{
    ctx.scene.enter('adminScene')//.catch(e=>ctx.replyWithTitle(`?????? ?????????? ??????????`));
})

module.exports = [clientScene]
