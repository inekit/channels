const { Markup } = require('telegraf')
//const store = require('../LocalStorage/store')
//const moment = require('moment')
const { main_menu_back_keyboard } = require('./keyboards')

const callbackButton = Markup.button.callback
const urlButton = Markup.button.url
const { inlineKeyboard } = Markup



exports.offers_alp_list_keyboard = (ctx, offers) => {

    const keyboard = inlineKeyboard(offers.map(({ order_id, alpinist_id, header }) => callbackButton(header ?? "default", `order-${order_id}-${alpinist_id}`)), { columns: 2 })

    return keyboard
}

exports.shedle_keyboard = (ctx, shedle) => {

    const keyboard = inlineKeyboard(shedle.map(({ id, header, type }) => 
    callbackButton(header ?? "default", `${type}-${id}`)), { columns: 2 })

    keyboard.reply_markup.inline_keyboard.push(
        [callbackButton(ctx.getTitle('ADD_SHEDLE_ENTRY'), 'addShedleEntry')]
    )

    return keyboard
}





exports.city_keyboard = (ctx ) => {

    const keyboard = inlineKeyboard([
        callbackButton(ctx.getTitle("BUTTON_ADD_POINT"), 'add_point'),
        callbackButton(ctx.getTitle("BUTTON_POINTS"), 'points'),
        callbackButton(ctx.getTitle("BUTTON_DELETE"), 'delete'),
    ], { columns: 2 })

    keyboard.reply_markup.inline_keyboard.push(
        [callbackButton(ctx.getTitle('BUTTON_BACK'), 'back')]
    )

    return keyboard
}

exports.confirm_cert_keyboard = (ctx, cert_id) => {

    //console.log(ctx,cert_id)

    const keyboard = inlineKeyboard([
        callbackButton(ctx.getTitle('BUTTON_APPROVE'), 'approve-'+cert_id),
    callbackButton(ctx.getTitle('BUTTON_DELETE'), 'delete-'+cert_id),
    callbackButton(ctx.getTitle('BUTTON_SKIP'), 'skip-'+cert_id),
])

    return keyboard
}

exports.claim_keyboard = (ctx, claim_id) => {

    const keyboard = inlineKeyboard([
        callbackButton(ctx.getTitle('BUTTON_SEND_RES'), 'sendres-'+claim_id),
    callbackButton(ctx.getTitle('BUTTON_SKIP'), 'skip-'+claim_id),
])

    return keyboard
}


exports.alpinists_list_keyboard = (ctx, alpinists) => {

    const keyboard = inlineKeyboard(alpinists.map(({ alpinist_id, name }) => callbackButton(name ?? "default", alpinist_id)), { columns: 2 })

    return keyboard
}


exports.admins_actions_keyboard = (ctx ) => {

    const keyboard = inlineKeyboard([
        callbackButton(ctx.getTitle("BUTTON_ADD_ADMIN"), 'addAdmin'),
        callbackButton(ctx.getTitle("BUTTON_DELETE_ADMIN"), 'deleteAdmin')
    ], { columns: 2 })

    return keyboard
}

exports.change_text_actions_keyboard = (ctx ) => {

    const keyboard = inlineKeyboard([
        callbackButton(ctx.getTitle("BUTTON_CHANGE_GREETING"), 'change_GREETING'),
        callbackButton(ctx.getTitle("BUTTON_CHANGE_HELP"), 'change_HOME_MENU'),
        callbackButton(ctx.getTitle("BUTTON_CHANGE_CARD"), 'change_CATEGORY_ADD_TITLE'),
        callbackButton(ctx.getTitle("BUTTON_CHANGE_PHOTO"), 'change_photo'),
        callbackButton(ctx.getTitle("BUTTON_CHANGE_INFO"), 'change_BUTTON_BACK_USER')
    ], { columns: 1 })

    return keyboard
}


exports.admins_list_keyboard = (ctx, admins) => {

    const keyboard = inlineKeyboard(admins.map(({ userId }) => callbackButton(userId, "admin-"+userId)), { columns: 2 })

    return keyboard
}


exports.add_delete_keyboard = (ctx ) => {

    const keyboard = inlineKeyboard([
        callbackButton("ADD", 'add'),
        callbackButton("DELETE", 'delete')
    ], { columns: 2 })

    return keyboard
}


exports.clients_list_keyboard = (ctx, clients) => {

    const keyboard = inlineKeyboard(clients.map(({ client_id, name }) => callbackButton(name, "client-"+client_id)), { columns: 2 })

    keyboard.reply_markup.inline_keyboard.push(
        [callbackButton(ctx.getTitle('BUTTON_ADD_CLIENT'), 'addClient')]
    )

    return keyboard
}


exports.cities_list_admin_keyboard = (ctx, cities) => {

    const keyboard = inlineKeyboard(cities.map(({ name, id }) => 
     callbackButton(name, "city-"+id)), { columns: 2 })

     keyboard.reply_markup.inline_keyboard.push(
        [callbackButton(ctx.getTitle('BUTTON_ADD_CITY'), 'addCity')],
    )
    return keyboard
}

exports.points_list_admin_keyboard = (ctx, cities) => {

    const keyboard = inlineKeyboard(cities.map(({ name, id }) => 
     callbackButton(name, "point-"+id)), { columns: 2 })

     keyboard.reply_markup.inline_keyboard.push(
        [callbackButton(ctx.getTitle('BUTTON_ADD_POINT'), 'add_point')],
        [callbackButton(ctx.getTitle('BUTTON_BACK'), 'back')],
    )
    return keyboard
}


exports.custom_keyboard = (ctx, bNames, bLinks) => {

    let k=inlineKeyboard([])

    if (bNames.length!=bLinks.length) return k;

    bNames.forEach((name,id)=>{
        k.reply_markup.inline_keyboard.push([callbackButton(ctx.getTitle(name), bLinks[id])])
    })

    return k;
}

exports.custom_obj_keyboard = (ctx, bNamesObj) => {
    let k=inlineKeyboard([])

    Object.entries(bNamesObj)?.forEach(([name,link])=>{
       // console.log(name, link)
        k.reply_markup.inline_keyboard.push([callbackButton(ctx.getTitle(name), link)])
    })

    return k;
}



exports.ctype_keyboard = (ctx, cTypes) => {

    return this.dictionary_keyboard(cTypes, 'ctype')
}
exports.comm_type_keyboard = (ctx, commTypes) => {

    return this.dictionary_keyboard(commTypes, 'commtype')
}
exports.etype_keyboard = (ctx, eTypes) => {

    return this.dictionary_keyboard(eTypes, 'etype')
}
exports.add_works_keyboard = (ctx, works) => {

    let k = this.dictionary_keyboard(works, 'work')

    if (ctx.scene.state.input?.works) 
     k.reply_markup.inline_keyboard.push([callbackButton(ctx.getTitle("BUTTON_ENOUGH"), 'confirm')])

    return k
}
exports.dictionary_keyboard = (dictionary, tag)=> {
    let k=inlineKeyboard([], { columns: 2 })

    dictionary.forEach((type_name,id)=>{
        k.reply_markup.inline_keyboard.push([callbackButton(type_name, `${tag}-${id}`)])
    })

    return k;
}


exports.skip_keyboard = (ctx) => this.custom_keyboard(ctx,["SKIP"],["skip"])

exports.t_opportunity_keyboard = (ctx) => this.custom_keyboard(ctx,["BUTTON_CITY", "BUTTON_REGION", "NO"],["city","region", "0"])


exports.payment_type_keyboard= (ctx) => inlineKeyboard([
    
    callbackButton(ctx.getTitle('BUTTON_PAY_AGENT'), 'pay_agent'),
    callbackButton(ctx.getTitle('BUTTON_PAY_ALPINIST'), 'pay_alpinist'),


], { columns: 1 })

exports.template_keyboard= (ctx) => inlineKeyboard([
    
    callbackButton(ctx.getTitle('START_NEW'), 'start_new'),
    callbackButton(ctx.getTitle('CONTINUE'), 'continue'),


], { columns: 1 })


exports.choose_c_keyboard = (ctx) => inlineKeyboard([
        
        callbackButton(ctx.getTitle('BUTTON_CHANGE_REGION'), 'region'),
        callbackButton(ctx.getTitle('BUTTON_CHANGE_CITY'), 'city'),
        callbackButton(ctx.getTitle('BUTTON_CHANGE_DISTRICT'), 'district'),
        callbackButton(ctx.getTitle('BUTTON_CHANGE_ADDRESS'), 'address'),
        callbackButton(ctx.getTitle('BUTTON_CONFIRM'), 'confirm'),

    
    ], { columns: 1 })

exports.choose_city_keyboard = (ctx) => inlineKeyboard([
    
    callbackButton(ctx.getTitle('BUTTON_CHANGE_REGION'), 'region'),
    callbackButton(ctx.getTitle('BUTTON_CHANGE_CITY'), 'city'),
    callbackButton(ctx.getTitle('BUTTON_CONFIRM'), 'confirm'),


], { columns: 1 })

exports.rates_keyboard = (ctx) => this.custom_keyboard(ctx,
    ["BUTTON_5S", "BUTTON_4S", "BUTTON_3S","BUTTON_2S","BUTTON_1S"],
    ["rate-5","rate-4","rate-3","rate-2","rate-1"])


exports.previous_step_keyboard = (ctx) => this.custom_keyboard(ctx,["BUTTON_PREVIOUS"],["previous_step"])

exports.greetings_keyboard = (ctx) => this.custom_keyboard(ctx,["IUNDERSTOOD"],["confirm"])

exports.greetings_fin_keyboard = (ctx) => this.custom_keyboard(ctx,["FIN"],["fin"])

exports.skip_previous_keyboard = (ctx) => inlineKeyboard([
        
    callbackButton(ctx.getTitle('BUTTON_PREVIOUS'), 'previous_step'),
    callbackButton(ctx.getTitle('BUTTON_SKIP'), 'skip'),


], { columns: 2 })




 exports.client_settings_keyboard = (ctx) => this.custom_keyboard(ctx,["NAME", "CONTRACT_TYPE", "CONTACTS"],
 ["update_name","update_contract_type", "update_contacts"])

 exports.update_keyboard = (ctx) => this.custom_keyboard(ctx,["BUTTON_RELOAD"],
 ["reload"])

 

exports.confirm_cancel_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_CONFIRM'), 'confirm'),
    callbackButton(ctx.getTitle('BUTTON_CANCEL'), 'cancel')

], { columns: 1 })



exports.go_back_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_GO_BACK'), 'go_back')
])



exports.skip_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_SKIP'), 'skip')
])

exports.cancel_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_CANCEL'), 'cancel')
])

exports.confirm_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_CONFIRM'), 'confirm')
])




exports.main_menu_keyboard = (ctx) => {


//urlButton(ctx.getTitle(`BUTTON_RANDOM`), link)
    const keyboard = inlineKeyboard(
       // link ?
         [[callbackButton(ctx.getTitle('BUTTON_GET_RANDOM'), `random_link`)],[callbackButton(ctx.getTitle(`BUTTON_CATEGORIES`), `categories`)]]
        // [[callbackButton(ctx.getTitle(`BUTTON_CATEGORIES`), `categories`)]]
        )


    return keyboard
}

exports.categories_list_keyboard = (ctx, data, totalCount) => {



    const categoryButtons = Object.entries(data)?.sort(SortArray)?.map(([name, {link, count} ]) => {
       return callbackButton(`${name} ${count}`, `category-${name}`)
   })
    const keyboard = inlineKeyboard([callbackButton(ctx.getTitle(`BUTTON_ALL_CATEGORIES`,[totalCount]), `back_random`),...categoryButtons], { columns: 1 })


     keyboard.reply_markup.inline_keyboard.push(
        [callbackButton(ctx.getTitle(`BUTTON_ALL_CATEGORIES`,[totalCount]), `back_random`)],
        //[callbackButton(ctx.getTitle(`BUTTON_BACK`), `back`)],
        
    )

    return keyboard
}


exports.item_keyboard = (ctx, link, category_name) => {

    const keyboard = inlineKeyboard([[urlButton(ctx.getTitle(`GO_TO_URL`), link)]]);//,[callbackButton(ctx.getTitle(`BUTTON_GET_RANDOM_AGAIN_CATEGORY`,[`: ${category_name}`]), `random_link`)],[callbackButton(ctx.getTitle(`BUTTON_HIDE`), `hide`)]], { columns: 2 })

    return keyboard
}
exports.item_keyboard_main = (ctx, link) => {

    const keyboard = inlineKeyboard([[urlButton(ctx.getTitle(`GO_TO_URL`), link)]]);//,[callbackButton(ctx.getTitle(`BUTTON_GET_RANDOM_AGAIN`), `random_link`)],[callbackButton(ctx.getTitle(`BUTTON_HIDE`), `hide`),/*callbackButton(ctx.getTitle(`BUTTON_HIDE_TOTAL`), `hide`)*/]], { columns: 2 })

    return keyboard
}

function SortArray([name],[name2]){
    if (name < name2) {return -1;}
    if (name > name2) {return 1;}
    return 0;
}


exports.categories_list_admin_keyboard = (ctx, data) => {

    const keyboard = inlineKeyboard(data?.sort(SortArray)?.map((name) => 
     callbackButton(name, `category-${name}`)) ?? [], { columns: 2 })

    keyboard.reply_markup.inline_keyboard.push(
        
        [callbackButton(ctx.getTitle(`BUTTON_ADD_FILE`), `add-file`)],
        
    )

    if (data?.length) keyboard.reply_markup.inline_keyboard.push(
        
        [callbackButton(ctx.getTitle(`BUTTON_ADD_ZIP_FILE`), `add-zip-file`)] ,
        [callbackButton(ctx.getTitle(`BUTTON_ADD_CATEGORY`), `add-category`)],
    )

     
    
    return keyboard
}


exports.category_admin_keyboard = (ctx, name) => {

    const keyboard = inlineKeyboard([[callbackButton(ctx.getTitle(`BUTTON_ADD_FILE`), `add-file-${name}`)],[callbackButton(ctx.getTitle(`BUTTON_DELETE`), `delete-category-${name}`)],[callbackButton(ctx.getTitle(`BUTTON_BACK`), `back`)]])

    return keyboard
}
