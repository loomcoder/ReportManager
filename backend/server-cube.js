const CubejsServer = require('@cubejs-backend/server');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbType = process.env.DB_TYPE || 'sqlite';

console.log('Server-cube starting...');
console.log('Current directory:', __dirname);
if (fs.existsSync(path.join(__dirname, 'schema'))) {
    console.log('Schema directory contents:', fs.readdirSync(path.join(__dirname, 'schema')));
    if (fs.existsSync(path.join(__dirname, 'schema/cubes'))) {
        console.log('Schema/cubes directory contents:', fs.readdirSync(path.join(__dirname, 'schema/cubes')));
    }
} else {
    console.log('Schema directory NOT found at', path.join(__dirname, 'schema'));
}

const server = new CubejsServer({
    schemaPath: 'schema',
    // Database type
    dbType: dbType,

    // Database Driver Factory
    driverFactory: () => {
        // Log current directory and schema path check
        console.log('Current __dirname:', __dirname);
        const schemaDir = path.join(__dirname, 'schema');
        console.log('Checking schema dir:', schemaDir);
        if (fs.existsSync(schemaDir)) {
            console.log('Schema dir exists. Contents:', fs.readdirSync(schemaDir));
            const cubesDir = path.join(schemaDir, 'cubes');
            if (fs.existsSync(cubesDir)) {
                console.log('Cubes dir exists. Contents:', fs.readdirSync(cubesDir));
            } else {
                console.log('Cubes dir DOES NOT exist');
            }
        } else {
            console.log('Schema dir DOES NOT exist');
        }

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
    apiSecret: process.env.CUBEJS_API_SECRET || process.env.SECRET_KEY || 'supersecretkey',

    // Logging
    logger: (msg, params) => {
        console.log(`${msg}: ${JSON.stringify(params)}`);
        if (msg.toLowerCase().includes('error') || msg.toLowerCase().includes('compiler') || msg.toLowerCase().includes('schema')) {
            try {
                fs.appendFileSync(path.join(__dirname, 'cube-error.log'), `${new Date().toISOString()} - ${msg}: ${JSON.stringify(params)}\n`);
            } catch (e) { }
        }
    },

    // Use default CubeJS auth

    // Development mode settings
    devServer: true, // Force dev server
});

server.listen({ port: 4000 }).then(async ({ port, app }) => {
    console.log(`🚀 Cube.js server is listening on http://localhost:${port}`);
    console.log(`📊 Cube.js Playground: http://localhost:${port}/#/build`);
    try {
        const meta = await server.compilerApi().metaConfig();
        console.log(`BOOT META:`, JSON.stringify(meta));
    } catch (e) {
        console.log(`BOOT META ERR:`, e.stack);
    }
}).catch(err => {
    console.error('Fatal error during server start:', err);
    process.exit(1);
});
