export async function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id')
    table.string('username').notNullable().unique()
    table.string('email').notNullable().unique()
    table.string('password_hash').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  return knex.schema.dropTable('users')
}
