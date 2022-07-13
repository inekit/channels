const cron = require('node-cron')
const tOrmCon = require("../db/data-source.js");
const broadCast = require('../Utils/broadCast')

module.exports = class Cron {

	constructor(ctx) {

		this.ctx = ctx
		//this.ttlJob = cron.schedule(`0 2 * * *`, ()=>this.broadCastCaptcha(ctx))

		//this.broadCastCaptcha(ctx)
		
	}

	async broadCastCaptcha(ctx) {

		const connection = await tOrmCon;

		let usersIds = (await connection.query(
			`SELECT u.id FROM users u`)
		.catch((e)=>{
			console.log(e)
		}))?.map(el=>el.id)

		if (!usersIds) return;

		broadCast({users: usersIds, callback: async (userId)=>{
			const userInfo = await ctx.telegram.getChatMember(userId, userId).catch(e=>{});
			console.log(userInfo?.language_code, username)
		}})

	}

}