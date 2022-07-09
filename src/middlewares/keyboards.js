const { Markup } = require('telegraf')
//const store = require('../LocalStorage/store')

exports.custom_bottom_keyboard = (ctx, bNames, columns = 2) => {

    let k=Markup.keyboard([
	], { columns: 2 }).resize()

	console.log(bNames)
	bNames = bNames.reduce((prev, cur, i)=>{
		if (i%columns===0) {prev.push([ctx.getTitle(cur)]); return prev}
		else { prev[prev.length-1].push(ctx.getTitle(cur)); return prev}
	}, [])

    bNames.forEach((name)=>{
        k.reply_markup.keyboard.push(name)
    })


    return k;
}

exports.custom_botkeyboard = (ctx, registered) => {

	const buttons = [
		[ 
			ctx.getTitle('BUTTON_ORDERS'),
			ctx.getTitle('BUTTON_CLIENTS')
		],
		[ 
			ctx.getTitle('BUTTON_AGENT_PROFILE'),
		],
		[ 
			ctx.getTitle('BUTTON_CHOOSE_ROLE'),
		],
	]

	return Markup.keyboard(buttons).resize()
}

exports.main_menu_bottom_keyboard = (ctx, isAdmin) => {

	const buttons = [
		[ 
			ctx.getTitle('BUTTON_CHANNELS'),
			ctx.getTitle('BUTTON_CHATS'),
			ctx.getTitle('BUTTON_BOTS'),
		],
		[ 
			ctx.getTitle('BUTTON_BACK_USER'),
		],
	]

	if (isAdmin) buttons.push([ctx.getTitle('ADMIN_SCENE_BUTTON')])

	return Markup.keyboard(buttons).resize()
}


exports.channels_menu_bottom_keyboard = (ctx, isAdmin) => {

	const buttons = [
		[ 
			ctx.getTitle('BUTTON_RANDOM_CHANNEL'),
		],
		[ 
			ctx.getTitle('BUTTON_CATEGORIES'),
		],
		[
			ctx.getTitle('BUTTON_CHATS'),
			ctx.getTitle('BUTTON_BOTS'),
		],
		[ 
			ctx.getTitle('BUTTON_BACK_USER'),
		],
	]

	if (isAdmin) buttons.push([ctx.getTitle('ADMIN_SCENE_BUTTON')])

	return Markup.keyboard(buttons).resize()
} 

exports.chats_menu_bottom_keyboard = (ctx, isAdmin) => {

	const buttons = [
		[ 
			ctx.getTitle('BUTTON_RANDOM_CHAT'),
		],
		[ 
			ctx.getTitle('BUTTON_CATEGORIES'),
		],
		[
			ctx.getTitle('BUTTON_CHANNELS'),			
			ctx.getTitle('BUTTON_BOTS'),
		],
		[ 
			ctx.getTitle('BUTTON_BACK_USER'),
		],
	]

	if (isAdmin) buttons.push([ctx.getTitle('ADMIN_SCENE_BUTTON')])

	return Markup.keyboard(buttons).resize()
} 

exports.bots_menu_bottom_keyboard = (ctx, isAdmin) => {

	const buttons = [
		[ 
			ctx.getTitle('BUTTON_RANDOM_BOT'),
		],
		[
			ctx.getTitle('BUTTON_CHANNELS'),			
			ctx.getTitle('BUTTON_CHATS'),
		],
		[ 
			ctx.getTitle('BUTTON_BACK_USER'),
		],
	]

	if (isAdmin) buttons.push([ctx.getTitle('ADMIN_SCENE_BUTTON')])

	return Markup.keyboard(buttons).resize()
} 



exports.categories_list_keyboard_bottom = (ctx, data, totalStr) => {

	

    const categoryButtons = data?.map((name) => {
       return [name];
   })

   categoryButtons?.push([totalStr])
    

   return Markup.keyboard(categoryButtons).resize()

}





exports.pay_agent_keyboard = (ctx) => Markup.keyboard([

	ctx.getTitle('BUTTON_PAY_AGENT_SUBSCRIPTION'),
	ctx.getTitle('BUTTON_CHOOSE_ROLE'),

], { columns: 1 }).resize()

exports.pay_alpinist_keyboard = (ctx) => Markup.keyboard([

	ctx.getTitle('BUTTON_PAY_ALPINIST_SUBSCRIPTION'),
	ctx.getTitle('BUTTON_CHOOSE_ROLE'),

], { columns: 1 }).resize()


exports.admin_main_keyboard = ctx=>Markup.keyboard([

	[ 
		ctx.getTitle('BUTTON_CHANNELS'),
		ctx.getTitle('BUTTON_CHATS'),
		ctx.getTitle('BUTTON_BOTS'),
	],
	[
		ctx.getTitle('BUTTON_CHANGE_TEXT'),
	],
	[ 
		ctx.getTitle('BUTTON_CLIENT_MENU'),
	],

]).resize();

exports.admin_main_keyboard_owner = ctx => 
 Markup.keyboard([

	[ 
		ctx.getTitle('BUTTON_CHANNELS'),
		ctx.getTitle('BUTTON_CHATS'),
		ctx.getTitle('BUTTON_BOTS'),
	],
	[
		ctx.getTitle('BUTTON_ADMINS')
	],
	[
		ctx.getTitle('BUTTON_CHANGE_TEXT'),
	],
	[ 
		ctx.getTitle('BUTTON_CLIENT_MENU'),
	]

]).resize();





exports.main_menu_goback_keyboard = (ctx) => Markup.keyboard([

	ctx.getTitle('BUTTON_GO_BACK'),
	ctx.getTitle('BUTTON_MAIN_MENU')

], { columns: 1 }).resize()



exports.main_menu_back_keyboard = (ctx) => Markup.keyboard([ ctx.getTitle('BUTTON_BACK_USER') ]).resize()

exports.alpinist_back_keyboard = (ctx) => Markup.keyboard([ ctx.getTitle('BUTTON_BACK_ALPINIST') ]).resize()

exports.admin_back_keyboard = (ctx) => Markup.keyboard([ ctx.getTitle('BUTTON_BACK_ADMIN') ]).resize()



exports.remove_keyboard = () => Markup.removeKeyboard()