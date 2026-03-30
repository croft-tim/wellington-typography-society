export async function up(knex) {
  return knex.schema.createTable('location_tokens', (table) => {
    table.increments('id')
    table.integer('location_id').notNullable().references('id').inTable('locations')
    table.string('token').notNullable().unique()
  })
}

export async function down(knex) {
  return knex.schema.dropTable('location_tokens')
}
