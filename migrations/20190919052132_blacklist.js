
exports.up = function(knex) {
  return knex.schema.createTable('blacklist', tbl => {
      tbl.increments();
      tbl.string('token').notNullable().unique();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('blacklist');
};
