const CubejsServer = require('@cubejs-backend/server');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbType = process.env.DB_TYPE || 'sqlite';

const server = new CubejsServer({
    // Database type
    dbType: dbType,

    // Database Driver Factory
    driverFactory: () => {
        if (dbType === 'postgres') {
            const PostgresDriver = require('@cubejs-backend/postgres-driver');
            return new PostgresDriver({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'production',
                user: process.env.DB_USER || 'admin',
                password: process.env.DB_PASSWORD || 'password',
                ssl: process.env.DB_SSL === 'true',
            });
        } else {
            const SqliteDriver = require('@cubejs-backend/sqlite-driver');
            return new SqliteDriver({
                database: path.join(__dirname, 'database/report-manager-backend.sqlite')
            });
        }
    },

    // API configuration
    apiSecret: process.env.CUBEJS_API_SECRET || 'supersecretkey',

    // Allow CORS
    checkAuth: (req, auth) => { },

    // Development mode settings
    devServer: process.env.NODE_ENV !== 'production',
});

server.listen({ port: 4000 }).then(({ port, app }) => {
    console.log(`🚀 Cube.js server is listening on http://localhost:${port}`);
    console.log(`📊 Cube.js Playground: http://localhost:${port}/#/build`);
}).catch(err => {
    console.error('Fatal error during server start:', err);
    process.exit(1);
});
