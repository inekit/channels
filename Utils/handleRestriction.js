const tOrmCon = require("../db/data-source")

module.exports =  (e) => {
    console.log(e)

    const connection = await tOrmCon;

    connection.query("update users set is_alive = false where id = ?", [])
}