import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals',function(table){
        table.uuid('id').primary()
        table.string('name').notNullable()
        table.string('description').notNullable()
        table.string('date').notNullable()
        table.boolean('diet').notNullable()
        table.string('user_id').references('users.id').notNullable()
        table.timestamps(true, true)

        
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('meals')
}

