
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, username: 'user1', password: 'test', department: 'math'},
        {id: 2, username: 'user2', password: 'test', department: 'science'},
        {id: 3, username: 'user3', password: 'test', department: 'history'}
      ]);
    });
};
