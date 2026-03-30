export async function up(knex) {
  return knex.schema.createTable('player_unlocked_exits', (table) => {
    table.increments('id')
    table.integer('user_id').notNullable().references('id').inTable('users')
    table.integer('exit_id').notNullable().references('id').inTable('exits')
    table.timestamp('unlocked_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  return knex.schema.dropTable('player_unlocked_exits')
}
