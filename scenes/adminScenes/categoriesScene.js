const { Telegraf, Composer, Scenes: { WizardScene, BaseScene } } = require('telegraf')
const titles = require('telegraf-steps-engine/middlewares/titles')
const moment=require("moment")
const deleteHandler = new Composer(),
subCategoryHandler = new Composer(),
itemHandler = new Composer();
const { CustomWizardScene} = require('telegraf-steps-engine');
const tOrmCon = require("../../db/data-source");
const store = require('../../store');
const { confirm_keyboard } = require('telegraf-steps-engine/middlewares/inlineKeyboards');
const axios = require('axios')
const fs = require('fs')
const fsp = require("fs").promises;
const AdmZip = require("adm-zip");
const { type } = require('os');


class FilesHandler extends Composer{
    constructor(confirmCb){

        super()

        this.on('document', ctx=>inputFile(ctx))
        
        this.action('confirm', async ctx => confirmCb(ctx))
    }
}

const scene = new CustomWizardScene('categoriesScene')
.enter(async ctx => {

    const { edit, category_id, category_name, type} = ctx.scene.state
    let keyboard;
    let title;

    console.log(type?.toLowerCase() ?? ctx.scene.state.fileStore ?? 'channels')
    ctx.scene.state.fileStore = type?.toLowerCase() ?? ctx.scene.state.fileStore ?? 'channels';

    
    if (category_name) {

        keyboard = {name: 'category_admin_keyboard', args: [category_name]};
        title = ctx.getTitle("CATEGORY_ACTIONS",[category_name])

    } else {


        if (type !=='BOTS') ctx.scene.state.categories = store[ctx.scene.state.fileStore].getCategories()

        keyboard = {name: 'categories_list_admin_keyboard', args: [ctx.scene.state.categories]}
        title = ctx.getTitle("CHOOSE_CATEGORY")

    }
 
    if (edit) return ctx.editMenu(title, keyboard)

    await ctx.replyWithKeyboard('⚙️', 'admin_back_keyboard')
    ctx.replyWithKeyboard(title, keyboard)
})
.addStep({variable:"adding_name", confines:["string45"], type: 'confirm', cb: async ctx=>{
    ctx.answerCbQuery().catch(console.log);
    const {adding_name} = ctx.scene.state?.input;
    store[ctx.scene.state.fileStore].addCategory(adding_name);
    ctx.scene.reenter({edit: true, type: ctx.scene.state.fileStore?.toUpperCase()})
}})
.addStep({header: 'CONFIRM_DELETE_CATEGORY', keyboard: 'confirm_keyboard', type: 'action', 
 handler: deleteHandler.action('confirm',async ctx=>{

    ctx.answerCbQuery().catch(console.log);

    const {selected_item} = ctx.scene.state;

    console.log(ctx.scene.state.fileStore)

    store[ctx.scene.state.fileStore].deleteCategory(selected_item);
    delete ctx.scene.state.selected_item; delete ctx.scene.state.category_name;
    ctx.scene.reenter({edit: true, type: ctx.scene.state.fileStore?.toUpperCase()})

})})
.addStep({
    variable: 'file', 
    type: 'action',
    handler: new FilesHandler(async ctx=>{
        ctx.answerCbQuery().catch(console.log);

        const fileId = ctx.scene.state?.input?.file_id;
        const {selected_item}  = ctx.scene.state
        console.log(fileId)

        ctx.telegram.getFileLink(fileId).then(url => {    
            axios({url: url.toString(), responseType: 'stream'}).then(response => {
                return new Promise((resolve, reject) => {
                    response.data.pipe(fs.createWriteStream(`temp.txt`))
                        .on('finish', () => {
                            fs.readFile(`temp.txt`,(e, data)=>{
                                if (e) {return }
                                console.log(data.toString('utf-8').split('\n'))

                                switch (ctx.scene.state.type) {
                                    case  'CHANNELS': {
                                        store.channels.importCategoryArray(selected_item,data.toString('utf-8').split('\n'))

                                        break;
                                    }
                                    case  'CHATS': {
                                        store.chats.importCategoryArray(selected_item,data.toString('utf-8').split('\n'))

                                        break;
                                    }
                                    case  'BOTS': {
                                        store.bots.importArray(null,data.toString('utf-8').split('\n'))

                                        break;
                                    }
                                }
                            })
                        })
                        .on('error', e => {/* An error has occured */})
                });
            })
        })

        delete ctx.scene.state.selected_item; delete ctx.scene.state.category_name;
         ctx.scene.reenter({edit: true, type: ctx.scene.state.fileStore?.toUpperCase()})
    })     
})
.addStep({
    variable: 'file', 
    type: 'action',
    handler: new FilesHandler(async ctx=>{
        ctx.answerCbQuery().catch(console.log);

        const fileId = ctx.scene.state?.input?.file_id;
        const {selected_item}  = ctx.scene.state
        console.log(fileId)

        ctx.telegram.getFileLink(fileId).then(url => {    
            axios({url: url.toString(), responseType: 'stream'}).then(response => {
                return new Promise((resolve, reject) => {
                    response.data.pipe(fs.createWriteStream(`temp.zip`))
                        .on('finish', async () => {
                            await ctx.replyWithTitle('FILE_RESPONSED')
                            async function readZipArchive(filepath) {
                                await ctx.replyWithTitle('PARSING_STARTED')

                                try {
                                  const zip = new AdmZip(filepath);
                              
                                  ctx.scene.state.importing = {};

                                  for (const zipEntry of zip.getEntries()) {
                                    
                                    const name = store[ctx.scene.state.fileStore].getCategories().find(el=>
                                        zipEntry?.name?.includes(el)
                                        )

                                        switch (ctx.scene.state.type) {
                                            case 'CHANNELS': {
                                                if (name) store.channels.importCategoryArray(name,zipEntry.getData('utf-8').toString().split('\n'))
                                                else if (zipEntry?.name?.includes('Все каналы'))
                                                    store.channels.importCategoryArray(null,zipEntry.getData('utf-8').toString().split('\n'))
                                                break;
                                            }
                                            case 'CHATS': {
                                                if (name) store.chats.importCategoryArray(name,zipEntry.getData('utf-8').toString().split('\n'))
                                                else if (zipEntry?.name?.includes('1ВСЕ ЧАТЫ'))
                                                    store.chats.importCategoryArray(null,zipEntry.getData('utf-8').toString().split('\n'))
                                                break;
                                            }
                                        }
                                    
                                  }

                                  await ctx.replyWithTitle('PARSING_FINISHED');
                                  await ctx.scene.reenter({edit: false, type: ctx.scene.state.fileStore?.toUpperCase()})

                                } catch (e) {
                                    await ctx.replyWithTitle('PARSING_ERROR');
                                    await ctx.scene.reenter({edit: false, type: ctx.scene.state.fileStore?.toUpperCase()})


                                }
                              }

                            await readZipArchive("temp.zip");

                        })
                        .on('error', e => {/* An error has occured */})
                });
            })
        })

        delete ctx.scene.state.selected_item; delete ctx.scene.state.category_name;
         ctx.scene.reenter({edit: true, type: ctx.scene.state.fileStore?.toUpperCase()})
    })     
})

  

scene.action(/^category\-(.+)$/g, async ctx => {
    ctx.answerCbQuery().catch(console.log);
    const category_name = ctx.match[1];

    ctx.scene.enter('categoriesScene',{edit: true, category_name, categories: ctx.scene.state.categories, type: ctx.scene.state.fileStore?.toUpperCase() })
})



scene.action('add-category',ctx=>{
    ctx.answerCbQuery().catch(console.log);

    ctx.replyStep(0)
})



scene.action(/^delete\-category\-(.+)$/g,ctx=>{
    ctx.answerCbQuery().catch(console.log);

    ctx.scene.state.selected_item = ctx.match[1];

    console.log(11, ctx.match,ctx.scene.state.selected_item)
    ctx.replyStep(1)

})


scene.action(/^add\-file\-(.+)$/g,ctx=>{
    ctx.answerCbQuery().catch(console.log);

    ctx.scene.state.selected_item = ctx.match[1];

    ctx.replyStep(2)

})
scene.action('add-file',ctx=>{
    ctx.answerCbQuery().catch(console.log);

    ctx.replyStep(2)

})

scene.action('add-zip-file',ctx=>{
    ctx.answerCbQuery().catch(console.log);

    ctx.replyStep(3)

})






function inputFile(ctx){

    const file_id = ctx.message?.document?.[0]?.file_id ?? ctx.message?.document?.file_id

    if (!file_id) return ctx.replyWithTitle("TRY_AGAIN")

    if (!ctx.scene?.state?.input) ctx.scene.state.input = {}

    ctx.scene.state.input.file_id = file_id;
    console.log(file_id)


    ctx.replyWithKeyboard('CONFIRM','confirm_keyboard')
    
}

function answerAffectCb(ctx, res){
    if (!res?.affectedRows) {
        ctx.answerCbQuery(ctx.getTitle("NOT_AFFECTED")).catch(console.log);
        return ctx.scene.reenter({edit: true, type: ctx.scene.state.fileStore?.toUpperCase()})
    }


    ctx.answerCbQuery(ctx.getTitle("AFFECTED")).catch(console.log);
    return ctx.scene.reenter({edit: true, type: ctx.scene.state.fileStore?.toUpperCase()})
}



scene.action('back', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    delete ctx.scene.state.selected_item; delete ctx.scene.state.category_name
    ctx.scene.reenter({edit: true, type: ctx.scene.state.fileStore?.toUpperCase()})
})




module.exports = scene