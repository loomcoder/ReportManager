const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbType = process.env.DB_TYPE || 'sqlite'; // 'sqlite' or 'postgres'

const config = {
    client: dbType === 'postgres' ? 'pg' : 'better-sqlite3',
    connection: dbType === 'postgres' ? {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'admin',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'production',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    } : {
        filename: path.join(__dirname, 'database/report-manager-backend.sqlite')
    },
    useNullAsDefault: true, // Required for SQLite
    migrations: {
        directory: path.join(__dirname, 'migrations')
    },
    seeds: {
        directory: path.join(__dirname, 'seeds')
    }
};

const knex = require('knex')(config);

module.exports = knex;
