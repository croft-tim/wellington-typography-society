export async function up(knex) {
  return knex.schema.createTable('exits', (table) => {
    table.increments('id')
    table.integer('from_location_id').notNullable().references('id').inTable('locations')
    table.integer('to_location_id').notNullable().references('id').inTable('locations')
    table.string('direction').notNullable() // 'north', 'south', 'east', 'west'
    table.boolean('is_locked').notNullable().defaultTo(false)
  })
}

export async function down(knex) {
  return knex.schema.dropTable('exits')
}
