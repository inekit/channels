const cron = require("node-cron");
const postChannel = require("../Utils/poster");
module.exports = class Cron {
  constructor(ctx) {
    this.ctx = ctx;
    this.ttlJob = cron.schedule(`*/30 * * * *`, () => postChannel(ctx));

    //postChannel(ctx);
  }
};
