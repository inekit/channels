const tOrmCon = require("../db/data-source");

class Statistics {
    
    async increaseCart(userId){
        (await tOrmCon).query(
            `INSERT INTO channels.statistics (date,users_per_day,cart_per_day) 
            SELECT CAST(now() AS DATE), 0,0 FROM channels.users u WHERE (CAST(now() AS DATE)<>lastUse OR lastUse IS NULL) and id = 1 LIMIT 1
            ON DUPLICATE KEY UPDATE cart_per_day = cart_per_day+1`, 
            [userId])
        .catch((e)=>{
            console.log(e)
            throw new Error("DB_ERROR")
        })
    }

    async increaseUse(userId){
        (await tOrmCon).query(
            `INSERT INTO channels.statistics (date,users_per_day,cart_per_day) 
            SELECT CAST(now() AS DATE), 0,0 FROM channels.users u WHERE (CAST(now() AS DATE)<>lastUse OR lastUse IS NULL) and id = ? LIMIT 1
            ON DUPLICATE KEY UPDATE users_per_day = users_per_day+1`, 
            [userId])
        .catch((e)=>{
            console.log(e)
            //throw new Error("DB_ERROR")
        })
    }
}

module.exports = new Statistics()
