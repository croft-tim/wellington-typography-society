export async function up(knex) {
  return knex.schema.createTable('player_visited_locations', (table) => {
    table.increments('id')
    table.integer('user_id').notNullable().references('id').inTable('users')
    table.integer('location_id').notNullable().references('id').inTable('locations')
    table.timestamp('scanned_at').defaultTo(knex.fn.now())
    table.string('token_used').notNullable()
  })
}

export async function down(knex) {
  return knex.schema.dropTable('player_visited_locations')
}
