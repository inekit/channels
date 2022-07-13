const { PrimaryGeneratedColumn, Generated } = require("typeorm");

var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "User", 
    tableName: "users", 
    columns: {
        id: {
            primary: true,
            type: "bigint",
        },
        lastUse: {
            type: "date",
            nullable: true
        },
        date_register: {
            type: "datetime",
            createDate: true,
        },
        is_alive: {
            type: "tinyint",
            nullable: false,
            default: true,
        },
        language_code: {
            type: "varchar",
            nullable: true,
        },
        username: {
            type: "varchar",
            nullable: true,
        },
        is_arabic: {
            type: "tinyint",
            nullable: true,
        }
        
    }
});