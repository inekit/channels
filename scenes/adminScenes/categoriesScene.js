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


class FilesHandler extends Composer{
    constructor(confirmCb){

        super()

        this.on('document', ctx=>inputFile(ctx))
        
        this.action('confirm', async ctx => confirmCb(ctx))
    }
}

const scene = new CustomWizardScene('categoriesScene')
.enter(async ctx => {

    const { edit, category_id, category_name} = ctx.scene.state
    let keyboard;
    let title;

    console.log(category_name)
    if (category_name) {

        keyboard = {name: 'category_admin_keyboard', args: [category_name]};
        title = ctx.getTitle("CATEGORY_ACTIONS",[category_name])

    } else {

        ctx.scene.state.categories = store.getCategories()

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
    store.addCategory(adding_name);
    ctx.scene.reenter({edit: true})
}})
.addStep({header: 'CONFIRM_DELETE_CATEGORY', keyboard: 'confirm_keyboard', type: 'action', 
 handler: deleteHandler.action('confirm',async ctx=>{

    ctx.answerCbQuery().catch(console.log);

    const {selected_item} = ctx.scene.state;

    store.deleteCategory(selected_item);
    delete ctx.scene.state.selected_item; delete ctx.scene.state.category_name;
    ctx.scene.reenter({edit: true})

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
                                store.importCategoryArray(selected_item,data.toString('utf-8').split('\n'))
                            })
                        })
                        .on('error', e => {/* An error has occured */})
                });
            })
        })

        delete ctx.scene.state.selected_item; delete ctx.scene.state.category_name;
         ctx.scene.reenter({edit: true})
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
                                    
                                    const name = store.getCategories().find(el=>
                                        zipEntry?.name?.includes(el)
                                        )

                                    if (name) store.importCategoryArray(name,zipEntry.getData('utf-8').toString().split('\n'))
                                    else if (zipEntry?.name?.includes('Все каналы'))
                                        store.importCategoryArray(null,zipEntry.getData('utf-8').toString().split('\n'))
                                  }

                                  await ctx.replyWithTitle('PARSING_FINISHED');
                                  await ctx.scene.reenter({edit: false})

                                } catch (e) {
                                    await ctx.replyWithTitle('PARSING_ERROR');
                                    await ctx.scene.reenter({edit: false})


                                }
                              }

                            await readZipArchive("temp.zip");

                        })
                        .on('error', e => {/* An error has occured */})
                });
            })
        })

        delete ctx.scene.state.selected_item; delete ctx.scene.state.category_name;
         ctx.scene.reenter({edit: true})
    })     
})


  

scene.action(/^category\-(.+)$/g, async ctx => {
    ctx.answerCbQuery().catch(console.log);
    const category_name = ctx.match[1];

    ctx.scene.enter('categoriesScene',{edit: true, category_name, categories: ctx.scene.state.categories })
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
        return ctx.scene.reenter({edit: true})
    }


    ctx.answerCbQuery(ctx.getTitle("AFFECTED")).catch(console.log);
    return ctx.scene.reenter({edit: true})
}



scene.action('back', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    delete ctx.scene.state.selected_item; delete ctx.scene.state.category_name
    ctx.scene.reenter({edit: true})
})




module.exports = scene