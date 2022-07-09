const { Telegraf, Composer, Scenes: { WizardScene, BaseScene } } = require('telegraf')
const titles = require('telegraf-steps-engine/middlewares/titles')
const moment=require("moment")
const categoryHandler = new Composer(),
subCategoryHandler = new Composer(),
itemHandler = new Composer();
const tOrmCon = require("../../db/data-source");
const { CustomWizardScene} = require('telegraf-steps-engine');
const store = require('../../store')
const totalStr = 'Все боты '+ store.bots.getCount();

const scene = new CustomWizardScene('botsScene')
.enter(async ctx => {

    const { edit, category_id, category_name,random, userObj} = ctx.scene.state

    const link = store.bots.getRandomLink(category_name)

    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

    const isAdmin = await require('../../Utils/authAdmin')(ctx.from.id, true)
    .catch(()=>{ })

    await ctx.replyWithKeyboard("CATEGORY_ADD_TITLE",{name: 'bots_menu_bottom_keyboard', args: [isAdmin]})

    ctx.scene.state.temp_post = await ctx.replyWithKeyboard(
        ctx.getTitle('ITEM_CARD_CATEGORY_BOT', [cTitle, category_name ?? "Все боты",store.bots.getCount(category_name)]), 
        category_name ? {name:  'item_keyboard', args: [link, category_name]}
        : {name: 'item_keyboard_main', args: [link]})

    return delete ctx.scene.state.random;
})


scene.action('random_link', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    const category_name = ctx.scene.state.category_name 

    const link = store.bots.getRandomLink(category_name)


    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

    ctx.scene.state.temp_post = await ctx.replyWithKeyboard(
        ctx.getTitle('ITEM_CARD_CATEGORY_BOT', [cTitle, category_name ?? "Все боты",store.bots.getCount(category_name)]), 
        category_name ? {name:  'item_keyboard', args: [link, category_name]}
        : {name: 'item_keyboard_main', args: [link]})
    
})

scene.action('hide', async ctx => {
    ctx.answerCbQuery().catch(console.log);
    ctx.scene.reenter({edit: true})
})


scene.action('next', async ctx => {
    ctx.answerCbQuery().catch(console.log);
    ctx.scene.reenter({edit: true})
})


scene.action('back_random', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    delete ctx.scene.state.category_name;

    const link = store.bots.getRandomLink();

    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

    await ctx.editMenu(ctx.getTitle('ITEM_CARD_CATEGORY_BOT', [cTitle, "Все боты",store.bots.getCount()]), {name: 'item_keyboard_main', args: [link]})
    
})

scene.action('back', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    ctx.scene.enter('clientScene',{edit: true})
})

scene.hears(titles.getTitle('BUTTON_RANDOM_BOT','ru'), ctx=>{
    ctx.scene.enter('botsScene',{edit: false, random: true, category_name: ctx.scene.state.category_name});
})

scene.hears(titles.getTitle('BUTTON_CATEGORIES','ru'), ctx=>{
    ctx.scene.reenter({edit: false, random: false,random: true, forceInitKB: true});
})

scene.hears(titles.getTitle('BUTTON_CHANNELS','ru'), ctx=>{
    ctx.scene.enter('catalogScene', {edit: false,random: true, forceInitKB: true});
})

scene.hears(titles.getTitle('BUTTON_CHATS','ru'), ctx=>{
    ctx.scene.enter('chatsScene', {edit: false,random: true, forceInitKB: true});
})
scene.hears(titles.getTitle('BUTTON_BOTS','ru'), ctx=>{
    ctx.scene.enter('botsScene', {edit: false});
})


module.exports = scene