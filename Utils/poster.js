const fs = require("fs").promises;
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
require("dotenv").config();

const apiId = parseInt(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH;
const phoneNumber = process.env.TG_PHONE;

const input = require("input");
const store = require("../store");

let parser;

async function initParser(ctx) {
  async function delay(ms) {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  }
  const getCode = async () => {
    store.poster.enableCodeInput();
    const mId = await ctx.telegram.sendMessage(
      296846972,
      ctx.getTitle("ENTER_CODE")
    );

    let i = 0;
    while (i < 30) {
      i++;
      const code = store.poster.getCode();
      if (code) {
        store.poster.setCode(null);

        return code;
      }
      console.log(2, code);
      await delay(30000);
    }

    await ctx.telegram.deleteMessage(296846972, mId).catch(console.error);
    store.poster.disableCodeInput();
    store.poster.setCode(null);
  };

  const stringSession = new StringSession(
    (await fs.readFile("./session.txt").catch((e) => {}))?.toString() ?? ""
  );

  client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.start({
      phoneNumber,
      password: async () => await input.text("Please enter your password: "),
      phoneCode: getCode,
      onError: (err) => {},
    });

    fs.writeFile("./session.txt", client.session.save());

    parser = client;
    return client;
  } catch (e) {
    console.error(e);
    return;
  }
}

async function postChannel(ctx) {
  const client = parser ?? (await initParser(ctx));

  if (!client) return;
  while (1 === 1) {
    const link = store.channels.getRandomLink();

    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    const cName = cNameExec[1];

    if (!cName) continue;

    const mes = await client
      .getMessages(cName, { limit: 1 })
      .catch(console.error);

    if (!mes?.[0]?.id) continue;

    const to = await client.getMessages("ffhbbch", { limit: 1 });

    const toPeer = to?.[0]?.peerId;

    if (!toPeer) continue;

    try {
      await client.invoke(
        new Api.messages.ForwardMessages({
          fromPeer: mes[0].peerId,
          id: [mes?.[0]?.id],
          randomId: [store.poster.getNewPostId()],
          toPeer: toPeer,
        })
      );
      break;
    } catch (e) {
      continue;
    }
  }
}

module.exports = postChannel;
