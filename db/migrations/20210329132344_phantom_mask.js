
exports.up = async function(knex) {
    await knex.schema.createTable('users', (table) =>{
        table.increments('id').primary();
        table.string('name').notNullable();
        table.decimal('cashBalance', 14,2).notNullable();
    });
    await knex.schema.createTable('pharmacies', (table) =>{
            table.increments('id').primary();
            table.string('name').notNullable();
            table.decimal('cashBalance', 14,2).notNullable();
    });

    await knex.schema.createTable('masks', (table) =>{
        table.increments('id').primary();
        table.string('name').notNullable();
        table.decimal('price', 14,2).notNullable();
        table.integer('amount').notNullable();
        table.integer('pharmacy_id').unsigned()
        .references('pharmacies.id');
    });
    await knex.schema.createTable('purchase_histories', (table) =>{
        table.integer('pharmacy_id').unsigned()
        .references('pharmacies.id');

        table.integer('user_id').unsigned()
        .references('users.id');

        table.integer('mask_id').unsigned()
        .references('masks.id');
        table.decimal('transaction_amount',14,2).notNullable();
        table.date('transaction_date').notNullable();
        table.time('transaction_time').notNullable();
    });
    await knex.schema.createTable('open_hours', (table) =>{
        table.integer('pharmacy_id').unsigned()
        .references('pharmacies.id');
        table.string('dayofweek').notNullable();
        table.time('begin_time').notNullable();
        table.time('end_time').notNullable();


    })
};

exports.down = async function(knex) {
    await knex.schema.dropTable('open_hours');
    await knex.schema.dropTable('purchase_histories');
    await knex.schema.dropTable('masks');
    await knex.schema.dropTable('pharmacies');
    await knex.schema.dropTable('users');
};