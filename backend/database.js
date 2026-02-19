const knex = require('./db-config');

// Initialize database
async function initializeDatabase() {
    try {
        console.log('🔄 Checking database schema...');

        // Users table
        if (!(await knex.schema.hasTable('users'))) {
            await knex.schema.createTable('users', (table) => {
                table.increments('id').primary();
                table.string('email').unique().notNullable();
                table.string('password').notNullable();
                table.string('firstName');
                table.string('lastName');
                table.text('roles').notNullable().defaultTo(JSON.stringify(["USER"]));
                table.text('permissions').notNullable().defaultTo(JSON.stringify([]));
                table.timestamp('createdAt').defaultTo(knex.fn.now());
            });
            console.log('✅ Created users table');
        }

        // Roles table
        if (!(await knex.schema.hasTable('roles'))) {
            await knex.schema.createTable('roles', (table) => {
                table.increments('id').primary();
                table.string('name').unique().notNullable();
                table.text('description');
                table.text('permissions').notNullable().defaultTo(JSON.stringify([]));
            });
            console.log('✅ Created roles table');
        }

        // Data Sources table
        if (!(await knex.schema.hasTable('data_sources'))) {
            await knex.schema.createTable('data_sources', (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('type').notNullable();
                table.string('connectionType');
                table.text('config');
                table.text('fileMetadata');
                table.string('status').defaultTo('pending');
                table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
                table.timestamp('updatedAt');
            });
            console.log('✅ Created data_sources table');
        }

        // Reports table
        if (!(await knex.schema.hasTable('reports'))) {
            await knex.schema.createTable('reports', (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.text('description');
                table.integer('sourceId').references('id').inTable('data_sources').onDelete('SET NULL');
                table.text('config').notNullable();
                table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
                table.timestamp('updatedAt');
            });
            console.log('✅ Created reports table');
        }

        // Dashboards table
        if (!(await knex.schema.hasTable('dashboards'))) {
            await knex.schema.createTable('dashboards', (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.text('description');
                table.text('layout').notNullable().defaultTo(JSON.stringify([]));
                table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
                table.timestamp('updatedAt');
            });
            console.log('✅ Created dashboards table');
        }

        // Schedules table
        if (!(await knex.schema.hasTable('schedules'))) {
            await knex.schema.createTable('schedules', (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('cronExpression').notNullable();
                table.string('taskType').notNullable();
                table.string('targetId');
                table.integer('isActive').defaultTo(1);
                table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
            });
            console.log('✅ Created schedules table');
        }

        // Settings table
        if (!(await knex.schema.hasTable('settings'))) {
            await knex.schema.createTable('settings', (table) => {
                table.increments('id').primary();
                table.integer('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
                table.integer('defaultDashboardId').references('id').inTable('dashboards').onDelete('SET NULL');
                table.string('theme').defaultTo('light');
                table.integer('emailNotifications').defaultTo(1);
            });
            console.log('✅ Created settings table');
        }

        // LLM Models table
        if (!(await knex.schema.hasTable('llm_models'))) {
            await knex.schema.createTable('llm_models', (table) => {
                table.string('name').primary();
                table.string('size');
                table.string('status').defaultTo('DOWNLOADED');
                table.integer('progress').defaultTo(100);
                table.timestamp('modified_at').defaultTo(knex.fn.now());
            });
            console.log('✅ Created llm_models table');
        }

        // Chat Conversations table
        if (!(await knex.schema.hasTable('chat_conversations'))) {
            await knex.schema.createTable('chat_conversations', (table) => {
                table.increments('id').primary();
                table.string('title');
                table.string('model');
                table.timestamp('createdAt').defaultTo(knex.fn.now());
            });
            console.log('✅ Created chat_conversations table');
        }

        // Chat Messages table
        if (!(await knex.schema.hasTable('chat_messages'))) {
            await knex.schema.createTable('chat_messages', (table) => {
                table.increments('id').primary();
                table.integer('conversationId').references('id').inTable('chat_conversations').onDelete('CASCADE');
                table.string('role');
                table.text('content');
                table.text('imageUrl');
                table.text('fileUrl');
                table.timestamp('createdAt').defaultTo(knex.fn.now());
            });
            console.log('✅ Created chat_messages table');
        }

        console.log('✨ Database schema initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database schema:', error);
        throw error;
    }
}

// Seed initial data
async function seedDatabase() {
    try {
        const userCountResult = await knex('users').count('* as count').first();
        const userCount = parseInt(userCountResult.count);

        if (userCount > 0) {
            console.log('✅ Database already seeded with', userCount, 'users. Skipping seed...');
            return;
        }

        console.log('🌱 Seeding database with initial data...');

        // Insert users
        const users = [
            {
                email: 'admin@example.com',
                password: 'P@ssw0rd',
                firstName: 'Admin',
                lastName: 'User',
                roles: JSON.stringify(['ADMIN']),
                permissions: JSON.stringify([
                    'VIEW_REPORTS', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_MODULES',
                    'VIEW_DASHBOARD', 'VIEW_DATA_SOURCES', 'VIEW_SCHEDULES',
                    'VIEW_LLM', 'VIEW_CHAT', 'VIEW_AI_INSIGHTS'
                ])
            },
            {
                email: 'user@example.com',
                password: 'P@ssw0rd',
                firstName: 'Regular',
                lastName: 'User',
                roles: JSON.stringify(['USER']),
                permissions: JSON.stringify(['VIEW_REPORTS', 'VIEW_DASHBOARD'])
            },
            {
                email: 'manager@example.com',
                password: 'P@ssw0rd',
                firstName: 'Sarah',
                lastName: 'Manager',
                roles: JSON.stringify(['MANAGER']),
                permissions: JSON.stringify(['VIEW_REPORTS', 'VIEW_DASHBOARD', 'VIEW_DATA_SOURCES', 'VIEW_SCHEDULES'])
            }
        ];

        await knex('users').insert(users);

        // Insert roles
        const roles = [
            {
                name: 'ADMIN',
                description: 'Administrator with full access',
                permissions: JSON.stringify([
                    'VIEW_REPORTS', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_MODULES',
                    'VIEW_DASHBOARD', 'VIEW_DATA_SOURCES', 'VIEW_SCHEDULES',
                    'VIEW_LLM', 'VIEW_CHAT', 'VIEW_AI_INSIGHTS'
                ])
            },
            {
                name: 'USER',
                description: 'Regular user with basic access',
                permissions: JSON.stringify(['VIEW_REPORTS', 'VIEW_DASHBOARD'])
            },
            {
                name: 'MANAGER',
                description: 'Manager with extended access',
                permissions: JSON.stringify(['VIEW_REPORTS', 'VIEW_DASHBOARD', 'VIEW_DATA_SOURCES', 'VIEW_SCHEDULES'])
            }
        ];

        await knex('roles').insert(roles);

        // Insert sample data sources
        const dataSources = [
            {
                name: 'Production DB',
                type: 'postgres',
                connectionType: 'table',
                config: JSON.stringify({
                    host: 'localhost',
                    port: 5432,
                    database: 'production',
                    username: 'admin',
                    password: 'password',
                    ssl: false
                }),
                fileMetadata: null,
                status: 'connected'
            },
            {
                name: 'Marketing Sheet',
                type: 'excel',
                connectionType: 'file',
                config: null,
                fileMetadata: JSON.stringify({
                    fileName: 'marketing_data.xlsx',
                    filePath: 'uploads/marketing_data.xlsx',
                    fileSize: 245678,
                    sheetName: 'Q4 Data'
                }),
                status: 'active'
            }
        ];

        await knex('data_sources').insert(dataSources);

        // Insert sample reports
        const reports = [
            {
                name: 'Sales Report',
                description: 'Monthly sales data',
                sourceId: 1,
                config: JSON.stringify({
                    type: 'bar',
                    sourceType: 'postgres',
                    query: 'SELECT * FROM sales_data',
                    xAxis: 'month',
                    yAxis: 'amount'
                })
            },
            {
                name: 'User Growth',
                description: 'New user signups',
                sourceId: 2,
                config: JSON.stringify({
                    type: 'line',
                    sourceType: 'excel',
                    sheetName: 'Sheet1',
                    xAxis: 'date',
                    yAxis: 'users'
                })
            }
        ];

        await knex('reports').insert(reports);

        // Insert sample dashboards
        const dashboards = [
            {
                name: 'Executive Overview',
                description: 'High-level metrics',
                layout: JSON.stringify([])
            },
            {
                name: 'Sales Performance',
                description: 'Detailed sales analysis',
                layout: JSON.stringify([])
            }
        ];

        await knex('dashboards').insert(dashboards);

        console.log('🎉 Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

// Initialize and seed (async wrapper)
async function initializeAndSeed() {
    try {
        await initializeDatabase();
        await seedDatabase();
    } catch (err) {
        console.error('Fatal database initialization error:', err);
        process.exit(1);
    }
}

module.exports = { ...knex, initializeAndSeed };
