const { Telegraf, Scenes: { Stage }, Composer} = require('telegraf')
const { titles} = require('telegraf-steps-engine')
const tOrmCon = require("./db/data-source");
const stat = require("./Utils/statistics")


const mainStage = new Stage([ 
	...require('./scenes/mainScene'),
	require('./scenes/adminScene'),

	require('./scenes/userScenes/botsScene'),
	require('./scenes/userScenes/chatsScene'),
	require('./scenes/userScenes/channelsScene'),

	require('./scenes/adminScenes/adminsScene'),
	require('./scenes/adminScenes/categoriesScene'),
	require('./scenes/adminScenes/changeTextScene'),

	
], {default: 'clientScene'})


/*mainStage.on('photo',ctx=>{
	console.log(ctx.message.photo)
})*/

mainStage.start(async ctx => {
	stat.increaseUse(ctx.from?.id).catch(e=>{ctx.replyWithTitle(e.message)})

	ctx.scene.enter('clientScene')
})

mainStage.hears(titles.getValues('BUTTON_BACK_ADMIN'), ctx => ctx.scene.enter('adminScene',))
mainStage.hears(titles.getValues('BUTTON_ADMIN_MENU'), ctx => ctx.scene.enter('adminScene',))
mainStage.hears(titles.getValues('BUTTON_BACK_USER'), ctx => ctx.scene.enter('clientScene',))
mainStage.hears(titles.getValues('BUTTON_ABOUT'), ctx => ctx.replyWithKeyboard("HOME_MENU"))



const stages = new Composer()
stages.use(mainStage.middleware())

module.exports = stages
