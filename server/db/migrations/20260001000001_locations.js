export async function up(knex) {
  return knex.schema.createTable('locations', (table) => {
    table.increments('id')
    table.string('slug').notNullable().unique()
    table.string('name').notNullable()
    table.text('description').notNullable()
    table.integer('grid_x').notNullable()
    table.integer('grid_y').notNullable()
  })
}

export async function down(knex) {
  return knex.schema.dropTable('locations')
}
