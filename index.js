const { Telegraf, session } = require("telegraf");
const { readFileSync } = require("fs");
const stages = require("./stages");
const shortcuts = require("telegraf-steps-engine/shortcuts/shortcuts");
const middlewares = require("telegraf-steps-engine/middlewares/middlewares");
require("dotenv").config();
//const LocalSession = require('telegraf-session-local')
const Cron = require("./Cron/Cron");
const allowed_updates = ["message", "callback_query", "chat_member"];
const TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(TOKEN);

console.log("started");

(async () => {
  Object.assign(bot.context, shortcuts, middlewares);

  const ctx = { ...bot.context, telegram: bot.telegram };

  bot.use(
    session(),
    /*(new LocalSession({ 
           database: 'PublicStorage/sessions.json',
           storage: LocalSession.storageFileAsync,
           
         })).middleware(),*/
    stages
  );

  if ("process.env.NODE_ENV']" === "production") {
    bot.catch(console.error);

    await bot.startWebhook(
      `/bot`,
      `/${TOKEN}`,
      {
        key: readFileSync("./key.pem"),
        cert: readFileSync("./cert.pem"),
      },
      8443
    );
    console.log("webhook is started");

    /*const r = await bot.telegram.setWebhook(
           `https://${process.env.SERVER_IP}:8443/${TOKEN}`,
           {
             certificate: { source: "./cert.pem" },
             ip_address: process.env.SERVER_IP,
             allowed_updates,
             drop_pending_updates: true,
           }
         );
         console.log('webhook is set')'*/
  } else {
    await bot.launch({
      allowedUpdates: allowed_updates,
      dropPendingUpdates: true,
    });
  }

  const cron = new Cron(ctx);
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
