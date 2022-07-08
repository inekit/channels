const { Middleware, Context, Composer, Telegraf } =  require("telegraf");
const replyTemplates = require('./replyTemplates')
const actions = require('./middlewares/actions');
const { stringify } = require("querystring");

class Step {
    constructor(obj){
        if (typeof obj === 'function') return Object.assign(this,{type: 'handler', handler_template: obj})
        
        const { variable, header, keyboard, type, handler, confines, next, confirm_header, skipTo, skipText, cb, options } = obj

        Object.assign(this,{
            variable,
            header: header ?? `ENTER_${variable?.toUpperCase()}`,
            keyboard: skipTo ? {name: 'custom_keyboard', args: [[skipText ?? 'BUTTON_SKIP'],['skip']]} : keyboard,
            type: type ?? "input",
            handler_template: handler,
            confines,
            confirm_header,
            next,
            cb,
            options: type === 'select' || type === 'menu' ? options : undefined,
            //cursor: this.getLength() + this.startFrom,
            skipTo, skipText
    
        })
    }
}


class Steps{

    constructor(steps){
        this.stepsArray = []
        //this.currentStep = 0;
        steps.forEach(step=>{
            this.addStep(step);
        })
    }

    getHandlers = ()=>{
        let array = this.stepsArray
        //console.log('arr:', array)
        return array
        .filter((step)=>step.type === 'input' || step.type === 'action' || step.type === 'select'|| step.type === 'confirm' || step.type === 'confirm_next' || step.type === 'service' || step.type === 'menu' || step.type === 'handler')
        .map((step, i) => 
            //console.log("st:"+step.type +createH(step.type, step, array[i + 1], this.scene))
         createH(step.type, step, array[i + 1], this.scene, this.previousStepData(i), this.nextStepData(i))
         )
    }

    addStep(obj){
        this.stepsArray.push(new Step(obj));
    }

    addSelect =   ({ variable, header, options, prefix, cb, confines,skipTo, skipText }) => {
        this.addStep({type: 'select',
            variable,
            header,
            keyboard: {name: 'custom_obj_keyboard', args: [options]},
            options:  formatSelectOptions(options),
            cb,skipTo, skipText
        })
  
        return this
    }

    addMenu =  ({ variable, header, options, prefix, cb, confines,skipTo, skipText }, sceneName) => {
        (async ()=>{
            const fo = await formatMenuOptions(options, sceneName)
            this.addStep({type: 'menu',
                header,
                keyboard: {name: 'custom_bottom_keyboard', args: [Object.keys(fo)]},
                options: fo,
                skipTo, skipText
            })
        })()
        return this
    }
  
    getStepToInfo = (step, skipToVariable) => {
        if (!skipToVariable) return step
  
        let skipToInfo = this.getByVariable(skipToVariable)
  
        if (!skipToInfo) return step
  
        //console.log(skipToInfo?.variable, 1, skipToInfo?.cursor)
  
        return Object.assign(step, {skipToInfo})
  
    }
  
    getStepDataById = (id) => this.stepsArray[id]
  
    getStepIdByVariable = (variable) => this.stepsArray.findIndex((el, i) => el.variable === variable ? el : undefined)
  
    getStepDataByVariable = (variable) => {
        if (!variable) return;
        const stepId = this.getStepIdByVariable(variable)
        const stepInfo = this.stepsArray[stepId]
        if (!stepInfo) return;
        return Object.assign(stepInfo, {id: stepId})
    }

    previousStepData = (id) => this.stepsArray[id - 1]
  
    nextStepData = (id) => this.stepsArray[id + 1]
  
    previousByVariable = (variable) => this.stepsArray.find((el, i) => el.variable === variable ? this.stepsArray[i - 1] : false)
  
}

function selectKeyboardOpt (soArray, prefix) {

    if (!Array.isArray(soArray)) throw new Error('sel opt is not Array')
    if (soArray[0] && Array.isArray(soArray[0])){
        if (!soArray[1] || !Array.isArray(soArray[1]) || soArray[0].length !==soArray[1].length) throw new Error('sel opt is wrong')
        if(soArray[0].find(so=>typeof so !== 'string') || soArray[1].find(so=>typeof so !== 'string')) throw new Error('all sel opt should be a string')
        else return soArray
    } 
    else if(soArray.find(so=>typeof so !== 'string')) throw new Error('all sel opt should be a string')
    else {
        if (!prefix || typeof prefix !== 'string') prefix = ""
        return [soArray.map(so=>prefix.toUpperCase()+ so.toUpperCase()), soArray]
    }
}

function formatOptions(soArray) {
    if (!Array.isArray(soArray)) throw new Error('sel opt is not Array')
    if (soArray[0] && Array.isArray(soArray[0])){
        if (!soArray[1] || !Array.isArray(soArray[1]) || soArray[0].length !==soArray[1].length) throw new Error('sel opt is wrong')
        if(soArray[0].find(so=>typeof so !== 'string') || soArray[1].find(so=>typeof so !== 'string')) throw new Error('all sel opt should be a string')
        else return soArray[1]
    } 
    else if(soArray.find(so=>typeof so !== 'string')) throw new Error('all sel opt should be a string')
    else return soArray
}

function formatSelectOptions(soArray){

    if (!(
        typeof soArray === 'object' &&
        !Array.isArray(soArray) &&
        soArray !== null
    ))  throw new Error('menu opt should be an obj')
     

    return Object.values(soArray)
}

async function formatMenuOptions(soArray, sceneName) {
    console.log(111, sceneName, await soArray)
    soArray = await soArray
    if (!(
        typeof soArray === 'object' &&
        soArray !== null
    ))  throw new Error('menu opt should be an obj')
     "ff".concat('_BUTTON')
    if (Array.isArray(soArray)) return soArray.reduce((prev,cur,i)=>{
        cur=cur.toString()

        const formattedSN = sceneName ? `${sceneName?.replace(/([A-Z])/g, '_$1')?.trim()?.toUpperCase()}_BUTTON_` : 'BUTTON_';
        const autoNaming = formattedSN + cur?.replace(/([A-Z])/g, '_$1')?.trim()?.toUpperCase()

        prev[autoNaming] = cur;
        return prev
    },{})
    return soArray
}




function  createH (type, stepInfo, nextStepInfo, scene){

    //console.log(type, stepInfo.variable, stepInfo?.handler, stepInfo?.handler_template, stepInfo?.skipToInfo)

    const cursor = stepInfo?.skipToInfo?.cursor
    const handler = stepInfo?.handler_template ?? stepInfo?.handler ?? new Composer()
    console.log(stepInfo?.handler_template)
    //console.log('stinfo',stepInfo?.skipTo)

    if (stepInfo?.skipTo) handler.action('skip', async ctx=>{
        await ctx.answerCbQuery().catch(console.log)
        ctx.replyStepByVariable(stepInfo?.skipTo)
        /*console.log('skipping to', ctx.steps.getByVariable(skipToInfo?.variable))

        const {header, keyboard} = stepInfo?.skipToInfo

        if (header && cursor) {
            const {kbBottom, kbTop} = middlewares.initKeyboards(keyboard)
            if (keyboard) ctx.replyWithKeyboard(header, kbBottom ?? kbTop)
            else ctx.replyWithTitle(header)
            ctx.wizard.selectStep(1)
        }  */
        
    });
    if (type==="select") { 
        console.log(stepInfo.options)
        if (stepInfo.options && !stepInfo.cb) handler.action(stepInfo.options, ctx=>actions.addInput(ctx, stepInfo?.variable, nextStepInfo?.header, null, nextStepInfo?.keyboard));
        else if (stepInfo.options && stepInfo.cb) handler.action(stepInfo.options, ctx=>stepInfo?.cb(ctx)); 
        else throw new Error('no opt or cb'); 
        return handler
    }

    if (type==="menu") { 
        
        handler.hears(Object.keys(stepInfo.options), ctx=>{
            ctx.scene.enter(stepInfo.options[ctx.message?.text]).catch(e=>ctx.replyWithTitle(`Нет такой сцены ${stepInfo.options[ctx.message?.text]}`));
        })
        return handler
    }

    if (type==="action") { return handler}

    else if (type==="input")
        handler.on('text', async ctx => 
        replyTemplates.addSceneInput(
            ctx, {stepName: stepInfo.variable, 
                header: nextStepInfo?.header ?? `ENTER_${nextStepInfo?.variable?.toUpperCase()}`, 
                kbName: nextStepInfo?.keyboard, 
                confineNames: stepInfo.confines, 
                sceneName: null
            }))

    else {
        //console.log('cb',stepInfo?.cb)
        if ( type === 'confirm' && stepInfo?.cb) handler.action('confirm', async ctx => {stepInfo?.cb(ctx)})
        else if (type === 'confirm_next' || type === 'confirm') handler.action('confirm', async ctx => {

            //console.log(stepInfo,stepInfo.next)


            const status = await updateDialogPart(ctx, stepInfo.next, scene)
    
            if (status) {
                if (scene !== 'ordersScene') return await ctx.scene.enter('alpinistScene')

                delete ctx.scene.state.input
            } else {
                delete ctx.scene.state.input
                return await ctx.scene.reenter()
            }

            
        
        })
        if (type === 'confirm') {
            
            if (!stepInfo?.handler_template) handler.on('text', async ctx => 
            replyTemplates.addSceneInput(
                ctx, {stepName: stepInfo.variable, 
                    header: 'Подтвердите добавление', 
                    kbName: {name: 'custom_keyboard', args: 
                    [['BUTTON_CONFIRM'],['confirm']]}, 
                    confineNames: stepInfo.confines, 
                    sceneName: null,
                    isLast: true
                }))

            
        } 
        if (type === 'confirm_next'){

            if (!stepInfo?.handler_template) handler.on('text', async ctx => 
            replyTemplates.addSceneInput(
                ctx, {stepName: stepInfo.variable, 
                    header: stepInfo?.confirm_header ?? `ENTER_${nextStepInfo?.variable?.toUpperCase()}`, 
                    kbName: {name: 'custom_keyboard', args: 
                        [['BUTTON_ENOUGH', nextStepInfo?.next ?? 'Продолжить'],['confirm', 'next']]}, 
                    confineNames: stepInfo.confines, 
                    sceneName: null,
                    isLast: true
                }))

            handler.action('next', async ctx => {

                await updateDialogPart(ctx, stepInfo.next)
            
                ctx.wizard.state.input={}
            
                ctx.wizard.next()
            
                return replyTemplates.startDialog(ctx,nextStepInfo?.header ?? '.', nextStepInfo?.keyboard)
            
            })
        }
    }
    
    return handler
}


module.exports = {Step, Steps}
