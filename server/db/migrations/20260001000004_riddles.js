export async function up(knex) {
  return knex.schema.createTable('riddles', (table) => {
    table.increments('id')
    table.integer('exit_id').notNullable().unique().references('id').inTable('exits')
    table.text('question').notNullable()
    table.string('answer').notNullable()
    table.text('hint').nullable()
    table.text('failure_message').notNullable()
  })
}

export async function down(knex) {
  return knex.schema.dropTable('riddles')
}
