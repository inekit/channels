const { Telegraf, Composer, Scenes: { WizardScene, BaseScene } } = require('telegraf')
const titles = require('telegraf-steps-engine/middlewares/titles')
const moment=require("moment")
const categoryHandler = new Composer(),
subCategoryHandler = new Composer(),
itemHandler = new Composer();
const tOrmCon = require("../../db/data-source");
const { CustomWizardScene} = require('telegraf-steps-engine');
const store = require('../../store')
const totalStr = 'Все каналы '+ store.getCount();



const scene = new CustomWizardScene('catalogScene')
.enter(async ctx => {

    const { edit, category_id, category_name,random, userObj} = ctx.scene.state
    let keyboard;
    let title;

    const countTotal = store.getCount();
    
    if (random) {

        const link = category_name ? store.getRandomLink(category_name) : store.getAllRandomLink();

        const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

        const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

        ctx.scene.state.temp_post = await ctx.replyWithKeyboard(
            ctx.getTitle('ITEM_CARD_CATEGORY', [cTitle, category_name ?? "Все каналы",store.getCount(category_name)]), 
            category_name ? {name:  'item_keyboard', args: [link, category_name]}
            : {name: 'item_keyboard_main', args: [link]})

        return delete ctx.scene.state.random;
    }

    ctx.scene.state.categories = store.getCategoriesWithCountKbStr()

    if (!ctx.scene.state.categories) {ctx.replyWithTitle('NO_CATEGORIES'); ctx.scene.enter('clientScene')}

    keyboard = {name: 'categories_list_keyboard_bottom', args: [ctx.scene.state.categories, totalStr]}
    title = ctx.getTitle("CHOOSE_CATEGORY")

 
    if (edit) return ctx.editMenu(title, keyboard)

    //await ctx.replyWithKeyboard('⚙️', 'admin_back_keyboard')
    ctx.replyWithKeyboard(title, keyboard)
})



scene.action(/^category\-(.+)$/g, async ctx => {
    
    const category_name = ctx.scene.state.category_name = ctx.match[1];

    const link = store.getRandomLink(category_name)

    if (!link) return await ctx.answerCbQuery('NO_ITEMS_YET').catch(console.log);

    await ctx.answerCbQuery().catch(console.log);

    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link
    ctx.scene.state.temp_post = await ctx.replyWithKeyboard(ctx.getTitle('ITEM_CARD_CATEGORY', [cTitle, category_name ?? "Все каналы",store.getCount(category_name)]), {name: 'item_keyboard', args: [link, category_name]})
    //ctx.scene.reenter({edit: true});
})

scene.hears(store.getCategoriesWithCountStr(), async ctx=>{

    let category_name = ctx.message.text?.substring(0, ctx.message.text.lastIndexOf(' '))

    if (category_name === "Все каналы") category_name = undefined;

    ctx.scene.state.category_name = category_name
    const link = store.getRandomLink(category_name)

    if (!link) return await ctx.replyWithTitle('NO_ITEMS_YET').catch(console.log);

    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

    await ctx.replyWithKeyboard("...",{name: 'main_menu_bottom_keyboard', args: [ctx.scene.state?.userObj?.userId]})

    ctx.scene.state.temp_post = await ctx.replyWithKeyboard(ctx.getTitle('ITEM_CARD_CATEGORY', [cTitle, category_name ?? "Все каналы",store.getCount(category_name)]), {name: 'item_keyboard', args: [link, category_name]})
    
})

scene.action('random_link', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    const category_name = ctx.scene.state.category_name 

    const link = category_name ? store.getRandomLink(category_name) : store.getAllRandomLink();


    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

    ctx.scene.state.temp_post = await ctx.replyWithKeyboard(
        ctx.getTitle('ITEM_CARD_CATEGORY', [cTitle, category_name ?? "Все каналы",store.getCount(category_name)]), 
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

    const link = store.getAllRandomLink();

    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

    await ctx.editMenu(ctx.getTitle('ITEM_CARD_CATEGORY', [cTitle, "Все каналы",store.getCount()]), {name: 'item_keyboard_main', args: [link]})
    
})

scene.action('back', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    ctx.scene.enter('clientScene',{edit: true})
})

scene.hears(titles.getTitle('BUTTON_RANDOM','ru'), ctx=>{
    ctx.scene.enter('catalogScene',{edit: false, random: true, category_name: ctx.scene.state.category_name});
})

scene.hears(titles.getTitle('BUTTON_CATEGORIES','ru'), ctx=>{
    ctx.scene.reenter({edit: false, random: false});
})


module.exports = scene