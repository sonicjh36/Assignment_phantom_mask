// Update with your config settings.

module.exports = {


  development: {
    client: 'pg',
    connection: {
      host : 'db' || 'localhost',
      user : 'root',
      password : 'root',
      database : 'phantom_mask'
    },
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/development'
    }
  }
};


