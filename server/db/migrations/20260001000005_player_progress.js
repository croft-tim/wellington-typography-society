export async function up(knex) {
  return knex.schema.createTable('player_progress', (table) => {
    table.increments('id')
    table.integer('user_id').notNullable().unique().references('id').inTable('users')
    table.integer('current_location_id').notNullable().references('id').inTable('locations')
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  return knex.schema.dropTable('player_progress')
}
