var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "Bot", 
    tableName: "bots",
    columns: {
        id: {
            type: "bigint",
            primary: true,
            generated:true
        },
        link: {
            type: "varchar",
            length: 45,
            nullable: false,
        },
        categoryId: {
            type: "int",
            nullable: true,
        },
    },
    relations: {
        category: {
            target: "Category",
            type: "many-to-one",
            cascade: true,
            joinColumn: true,
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
    }
});