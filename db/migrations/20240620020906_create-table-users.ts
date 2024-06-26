import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
   await knex.schema.createTable('users',function(table){
        table.uuid('id').primary()
        table.uuid('session_id').index()
        table.string('name').notNullable()
        table.string('email').notNullable()
        
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users')
}

