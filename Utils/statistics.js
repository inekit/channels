const tOrmCon = require("../db/data-source");

class Statistics {

    async increaseUse(userId){
        (await tOrmCon).query(
            `INSERT INTO channels.statistics (date,users_per_day,cart_per_day) 
            (SELECT CAST(now() AS DATE), 1,0 FROM channels.users u WHERE id = ? LIMIT 1)
            ON DUPLICATE KEY UPDATE users_per_day = users_per_day+1`, 
            [userId])
        .catch((e)=>{
            console.log(e)
            throw new Error("DB_ERROR")
        })
    }
}

module.exports = new Statistics()
