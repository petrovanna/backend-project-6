/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = (knex) => knex.schema.table('users', (table) => {
  table.string('first_name').notNullable().defaultTo('');
  table.string('last_name').notNullable().defaultTo('');
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = (knex) => knex.schema.table('users', (table) => {
  table.dropColumns('first_name', 'last_name');
});
