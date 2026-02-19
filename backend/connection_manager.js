const knex = require('knex');
const logger = require('./logger');

class ConnectionManager {
    constructor() {
        this.connections = new Map();
    }

    /**
     * Get or create a database connection
     * @param {Object} dataSource - The data source object from the database
     * @returns {Promise<import('knex').Knex>}
     */
    async getConnection(dataSource) {
        const cacheKey = `${dataSource.id}_${dataSource.updatedAt || dataSource.createdAt}`;

        if (this.connections.has(cacheKey)) {
            return this.connections.get(cacheKey);
        }

        const config = typeof dataSource.config === 'string' 
            ? JSON.parse(dataSource.config) 
            : dataSource.config;

        let knexConfig;

        if (dataSource.type === 'postgres') {
            knexConfig = {
                client: 'pg',
                connection: {
                    host: config.host,
                    port: config.port || 5432,
                    user: config.username,
                    password: config.password,
                    database: config.database,
                    ssl: config.ssl ? { rejectUnauthorized: false } : false
                },
                pool: { min: 0, max: 7 }
            };
        } else if (dataSource.type === 'mysql') {
            knexConfig = {
                client: 'mysql2',
                connection: {
                    host: config.host,
                    port: config.port || 3306,
                    user: config.username,
                    password: config.password,
                    database: config.database,
                    ssl: config.ssl ? { rejectUnauthorized: false } : false
                },
                pool: { min: 0, max: 7 }
            };
        } else {
            throw new Error(`Unsupported database type: ${dataSource.type}`);
        }

        try {
            const db = knex(knexConfig);
            
            // Test connection
            await db.raw('SELECT 1');
            
            this.connections.set(cacheKey, db);
            logger.info(`Successfully connected to ${dataSource.type} database: ${dataSource.name}`);
            return db;
        } catch (error) {
            logger.error(`Failed to connect to ${dataSource.type} database: ${dataSource.name}`, error);
            throw error;
        }
    }

    /**
     * Close a specific connection
     * @param {string} cacheKey 
     */
    async closeConnection(cacheKey) {
        if (this.connections.has(cacheKey)) {
            const db = this.connections.get(cacheKey);
            await db.destroy();
            this.connections.delete(cacheKey);
        }
    }

    /**
     * Close all connections
     */
    async cleanup() {
        for (const [key, db] of this.connections.entries()) {
            await db.destroy();
        }
        this.connections.clear();
    }
}

module.exports = new ConnectionManager();
