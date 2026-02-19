const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const xlsx = require('xlsx');
const axios = require('axios');
const knex = require('./db-config'); // Initialize Knex
const { initializeAndSeed } = require('./database'); // Import DB init function
const logger = require('./logger');
const { getProjectContext } = require('./project_context');
const connectionManager = require('./connection_manager');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.xlsx', '.xls', '.csv'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
        }
    }
});

const app = express();
const PORT = process.env.PORT || 3025;
const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(bodyParser.json());

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ==================== HELPERS ====================

async function executeReportData(dataSource, reportConfig) {
    let columns = [];
    let rows = [];
    const selectedColumns = reportConfig.selectedColumns || [];
    const aggregates = reportConfig.aggregates || {};

    if (dataSource.type === 'excel' || dataSource.type === 'csv') {
        const fileMetadata = typeof dataSource.fileMetadata === 'string' ? JSON.parse(dataSource.fileMetadata) : dataSource.fileMetadata;
        if (!fileMetadata || !fileMetadata.filePath) {
            throw new Error("File source missing file path");
        }

        const filePath = fileMetadata.filePath;
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found on server");
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = reportConfig.sheetName || fileMetadata.sheetName || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
            columns = jsonData[0];
            const dataRows = jsonData.slice(1);
            rows = dataRows.map(row => {
                const rowObj = {};
                columns.forEach((col, index) => {
                    rowObj[col] = row[index];
                });
                return rowObj;
            });
        }
    } else if (['postgres', 'mysql'].includes(dataSource.type)) {
        // REAL DB EXECUTION
        const db = await connectionManager.getConnection(dataSource);
        const query = reportConfig.query;
        
        if (!query) {
            throw new Error("No SQL query provided for database source");
        }

        const result = await db.raw(query);
        
        // Knex result format varies by driver
        if (dataSource.type === 'postgres') {
            rows = result.rows;
            columns = result.fields.map(f => f.name);
        } else if (dataSource.type === 'mysql') {
            rows = result[0];
            columns = result[1].map(f => f.name);
        }
    } else if (['sqlserver', 'mongodb', 'oracle'].includes(dataSource.type)) {
        // Fallback for types not yet implemented with real drivers
        const query = reportConfig.query || "";
        let mockColumns = ['id', 'name', 'value', 'date', 'category'];
        if (query.toLowerCase().includes('select')) {
            const selectMatch = query.match(/select\s+(.*?)\s+from/i);
            if (selectMatch && selectMatch[1] !== '*') {
                mockColumns = selectMatch[1].split(',').map(col => col.trim().split(' ').pop());
            }
        }
        if (reportConfig.xAxis && !mockColumns.includes(reportConfig.xAxis)) {
            mockColumns.push(reportConfig.xAxis);
        }
        if (reportConfig.yAxis && !mockColumns.includes(reportConfig.yAxis)) {
            mockColumns.push(reportConfig.yAxis);
        }
        columns = mockColumns;
        rows = Array.from({ length: 25 }, (_, i) => {
            const row = {};
            mockColumns.forEach(col => {
                if (col === 'id') {
                    row[col] = i + 1;
                } else if (col.toLowerCase().includes('date') || col === reportConfig.xAxis) {
                    row[col] = new Date(Date.now() - i * 86400000 * 30).toISOString().split('T')[0];
                } else if (col.toLowerCase().includes('name') || col.toLowerCase().includes('category') || col === 'month') {
                    const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    row[col] = names[i % names.length];
                } else if (col.toLowerCase().includes('revenue') || col.toLowerCase().includes('amount') || col.toLowerCase().includes('value') || col === reportConfig.yAxis) {
                    row[col] = Math.floor(Math.random() * 50000) + 10000;
                } else {
                    row[col] = `${col}_${i + 1}`;
                }
            });
            return row;
        });
    } else {
        columns = ['metric', 'value'];
        rows = [
            { metric: 'Revenue', value: 50000 },
            { metric: 'Cost', value: 30000 },
            { metric: 'Profit', value: 20000 }
        ];
    }

    // 1. Filter Columns
    if (selectedColumns && selectedColumns.length > 0) {
        rows = rows.map(row => {
            const newRow = {};
            selectedColumns.forEach(col => {
                if (row.hasOwnProperty(col)) {
                    newRow[col] = row[col];
                }
            });
            return newRow;
        });
        columns = selectedColumns;
    }

    // 2. Apply Aggregation
    const aggregateKeys = Object.keys(aggregates);
    if (aggregateKeys.length > 0) {
        const groupByColumns = columns.filter(col => !aggregateKeys.includes(col));

        if (groupByColumns.length > 0) {
            const groups = {};

            rows.forEach(row => {
                const groupKey = groupByColumns.map(col => row[col]).join('|||');
                if (!groups[groupKey]) {
                    groups[groupKey] = {
                        _count: 0,
                        _data: {},
                        _firstRow: row
                    };
                    aggregateKeys.forEach(key => {
                        groups[groupKey]._data[key] = [];
                    });
                }
                groups[groupKey]._count++;
                aggregateKeys.forEach(key => {
                    groups[groupKey]._data[key].push(row[key]);
                });
            });

            rows = Object.keys(groups).map(groupKey => {
                const group = groups[groupKey];
                const resultRow = {};
                groupByColumns.forEach(col => {
                    resultRow[col] = group._firstRow[col];
                });

                aggregateKeys.forEach(key => {
                    const values = group._data[key];
                    const type = aggregates[key];
                    let result = 0;

                    if (type === 'SUM') {
                        result = values.reduce((a, b) => a + (Number(b) || 0), 0);
                    } else if (type === 'AVG') {
                        const sum = values.reduce((a, b) => a + (Number(b) || 0), 0);
                        result = values.length ? sum / values.length : 0;
                    } else if (type === 'COUNT') {
                        result = values.length;
                    } else if (type === 'MIN') {
                        result = Math.min(...values.map(v => Number(v) || 0));
                    } else if (type === 'MAX') {
                        result = Math.max(...values.map(v => Number(v) || 0));
                    }

                    resultRow[key] = result;
                });
                return resultRow;
            });
        } else {
            const resultRow = {};
            aggregateKeys.forEach(key => {
                const values = rows.map(r => r[key]);
                const type = aggregates[key];
                let result = 0;

                if (type === 'SUM') {
                    result = values.reduce((a, b) => a + (Number(b) || 0), 0);
                } else if (type === 'AVG') {
                    const sum = values.reduce((a, b) => a + (Number(b) || 0), 0);
                    result = values.length ? sum / values.length : 0;
                } else if (type === 'COUNT') {
                    result = values.length;
                } else if (type === 'MIN') {
                    result = Math.min(...values.map(v => Number(v) || 0));
                } else if (type === 'MAX') {
                    result = Math.max(...values.map(v => Number(v) || 0));
                }

                resultRow[key] = result;
            });
            rows = [resultRow];
            columns = aggregateKeys;
        }
    }

    return { columns, rows };
}

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date(), uptime: process.uptime() });
});

app.get('/', (req, res) => {
    res.status(200).send('Report Manager Backend API is running.');
});

// ==================== LOGGING ====================
app.post('/logs', (req, res) => {
    const { level, message, ...meta } = req.body;
    const logLevel = level || 'info';

    // Safety check for valid log levels
    const validLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLevels.includes(logLevel)) {
        return res.status(400).send('Invalid log level');
    }

    logger.log({
        level: logLevel,
        message: `[Frontend] ${message}`,
        ...meta
    });

    res.sendStatus(200);
});

// ==================== AUTH ROUTES ====================

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await knex('users').where({ email, password }).first();

        if (user) {
            const roles = JSON.parse(user.roles);
            const permissions = JSON.parse(user.permissions);
            const token = jwt.sign({ id: user.id, email: user.email, roles }, SECRET_KEY, { expiresIn: '1h' });
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles,
                    permissions
                }
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        logger.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const existing = await knex('users').where({ email }).first();
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        const roles = JSON.stringify(["USER"]);
        const permissions = JSON.stringify(["VIEW_REPORTS"]);

        const [id] = await knex('users').insert({
            email,
            password,
            firstName,
            lastName,
            roles,
            permissions
        }).returning('id'); // Returning ID for Postgres compatibility

        // For SQLite compatibility (knex .insert returns [id] for sqlite too usually, but let's be safe)
        const userId = typeof id === 'object' ? id.id : id;

        const token = jwt.sign({ id: userId, email, roles: ["USER"] }, SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({
            token,
            user: {
                id: userId,
                email,
                firstName,
                lastName,
                roles: ["USER"]
            }
        });
    } catch (err) {
        logger.error("Register error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await knex('users').where({ id: req.user.id }).first();
        if (user) {
            res.json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: JSON.parse(user.roles),
                permissions: JSON.parse(user.permissions)
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        logger.error("Me error:", err);
        res.sendStatus(500);
    }
});

// ==================== REPORTS ROUTES ====================

app.get('/reports', authenticateToken, async (req, res) => {
    try {
        const reports = await knex('reports').select('*');
        res.json(reports.map(r => ({
            ...r,
            config: JSON.parse(r.config)
        })));
    } catch (err) {
        logger.error("Get reports error:", err);
        res.sendStatus(500);
    }
});

app.get('/reports/:id', authenticateToken, async (req, res) => {
    try {
        const report = await knex('reports').where({ id: req.params.id }).first();
        if (!report) return res.sendStatus(404);
        res.json({
            ...report,
            config: JSON.parse(report.config)
        });
    } catch (err) {
        logger.error("Get report error:", err);
        res.sendStatus(500);
    }
});

app.post('/reports', authenticateToken, async (req, res) => {
    try {
        const { name, description, sourceId, config } = req.body;
        const [id] = await knex('reports').insert({
            name,
            description,
            sourceId,
            config: JSON.stringify(config)
        }).returning('id');

        const reportId = typeof id === 'object' ? id.id : id;

        const newReport = await knex('reports').where({ id: reportId }).first();
        res.status(201).json({
            ...newReport,
            config: JSON.parse(newReport.config)
        });
    } catch (err) {
        logger.error("Create report error:", err);
        res.sendStatus(500);
    }
});

app.put('/reports/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description, sourceId, config } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (sourceId) updateData.sourceId = sourceId;
        if (config) updateData.config = JSON.stringify(config);
        updateData.updatedAt = knex.fn.now();

        await knex('reports').where({ id: req.params.id }).update(updateData);

        const report = await knex('reports').where({ id: req.params.id }).first();
        if (!report) return res.sendStatus(404);

        res.json({
            ...report,
            config: JSON.parse(report.config)
        });
    } catch (err) {
        logger.error("Update report error:", err);
        res.sendStatus(500);
    }
});

app.delete('/reports/:id', authenticateToken, async (req, res) => {
    try {
        await knex('reports').where({ id: req.params.id }).del();
        res.sendStatus(204);
    } catch (err) {
        logger.error("Delete report error:", err);
        res.sendStatus(500);
    }
});

app.post('/reports/import', authenticateToken, async (req, res) => {
    try {
        const { reports } = req.body;

        if (!reports || !Array.isArray(reports)) {
            return res.status(400).json({ message: "Invalid request. Expected 'reports' array." });
        }

        let imported = 0;
        let updated = 0;
        let skipped = 0;
        const errors = [];

        for (const report of reports) {
            try {
                // Validate required fields
                if (!report.name || !report.sourceId) {
                    errors.push(`Skipped report: Missing required fields (name or sourceId)`);
                    skipped++;
                    continue;
                }

                // Check if data source exists
                const sourceExists = await knex('data_sources').where({ id: report.sourceId }).first();
                if (!sourceExists) {
                    errors.push(`Skipped report "${report.name}": Data source ${report.sourceId} not found`);
                    skipped++;
                    continue;
                }

                const reportData = {
                    name: report.name,
                    description: report.description || null,
                    sourceId: report.sourceId,
                    config: typeof report.config === 'string' ? report.config : JSON.stringify(report.config)
                };

                // Check if report exists by ID (if provided) or by name + sourceId
                let existingReport = null;
                if (report.id) {
                    existingReport = await knex('reports').where({ id: report.id }).first();
                }

                // If not found by ID, try to find by name and sourceId
                if (!existingReport) {
                    existingReport = await knex('reports')
                        .where({ name: report.name, sourceId: report.sourceId })
                        .first();
                }

                if (existingReport) {
                    // Update existing report
                    await knex('reports')
                        .where({ id: existingReport.id })
                        .update(reportData);
                    updated++;
                } else {
                    // Insert new report
                    await knex('reports').insert(reportData);
                    imported++;
                }

            } catch (err) {
                logger.error(`Error importing report "${report.name}":`, err);
                errors.push(`Failed to import report "${report.name}": ${err.message}`);
                skipped++;
            }
        }

        res.json({
            imported,
            updated,
            skipped,
            total: reports.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        logger.error("Import reports error:", err);
        res.status(500).json({ message: "Failed to import reports", error: err.message });
    }
});

app.post('/reports/:id/run', authenticateToken, async (req, res) => {
    try {
        const report = await knex('reports').where({ id: req.params.id }).first();
        if (!report) return res.sendStatus(404);

        const dataSource = await knex('data_sources').where({ id: report.sourceId }).first();
        if (!dataSource) return res.status(400).json({ message: "Data source not found" });

        const reportConfig = JSON.parse(report.config);
        const { columns, rows } = await executeReportData(dataSource, reportConfig);

        res.json({
            report: {
                ...report,
                config: reportConfig
            },
            data: { columns, rows }
        });

    } catch (err) {
        logger.error("Report run error:", err);
        res.status(500).json({ message: "Failed to run report", error: err.message });
    }
});

app.post('/reports/preview', authenticateToken, async (req, res) => {
    const { sourceId, config } = req.body;

    try {
        const dataSource = await knex('data_sources').where({ id: sourceId }).first();
        if (!dataSource) return res.status(400).json({ message: "Data source not found" });

        const { columns, rows } = await executeReportData(dataSource, config);

        res.json({
            data: { columns, rows }
        });
    } catch (err) {
        logger.error("Preview error:", err);
        res.status(500).json({ message: "Failed to preview report", error: err.message });
    }
});

// ==================== DATA SOURCES ROUTES ====================

app.get('/data-sources', authenticateToken, async (req, res) => {
    try {
        const dataSources = await knex('data_sources').select('*');
        res.json(dataSources.map(ds => ({
            ...ds,
            config: ds.config ? JSON.parse(ds.config) : null,
            fileMetadata: ds.fileMetadata ? JSON.parse(ds.fileMetadata) : null
        })));
    } catch (err) {
        logger.error("Get data sources error:", err);
        res.sendStatus(500);
    }
});

app.post('/data-sources', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { name, type, connectionType } = req.body;
        let config = null;
        let fileMetadata = null;
        let status = 'pending';

        if ((type === 'excel' || type === 'csv') && req.file) {
            fileMetadata = JSON.stringify({
                fileName: req.file.originalname,
                filePath: req.file.path,
                fileSize: req.file.size,
                sheetName: req.body.sheetName || null,
                delimiter: req.body.delimiter || ',',
                hasHeader: req.body.hasHeader === 'true'
            });
            status = 'active';
        } else if (['postgres', 'mysql', 'sqlserver', 'mongodb', 'oracle'].includes(type)) {
            try {
                const configData = req.body.config ? JSON.parse(req.body.config) : {};
                config = JSON.stringify({
                    host: configData.host || 'localhost',
                    port: configData.port || 5432,
                    database: configData.database || '',
                    username: configData.username || '',
                    password: configData.password || '',
                    ssl: configData.ssl || false,
                    query: req.body.query || null,
                    tableName: req.body.tableName || null,
                    procedureName: req.body.procedureName || null,
                    procedureParams: req.body.procedureParams ? JSON.parse(req.body.procedureParams) : null
                });
            } catch (e) {
                return res.status(400).json({ message: "Invalid configuration format" });
            }
        } else if (type === 'api') {
            try {
                const configData = req.body.config ? JSON.parse(req.body.config) : {};
                config = JSON.stringify({
                    url: configData.url || '',
                    method: configData.method || 'GET',
                    headers: configData.headers || {},
                    authType: configData.authType || 'none',
                    apiKey: configData.apiKey || ''
                });
            } catch (e) {
                return res.status(400).json({ message: "Invalid configuration format" });
            }
        }

        const [id] = await knex('data_sources').insert({
            name,
            type,
            connectionType,
            config,
            fileMetadata,
            status
        }).returning('id');

        const dsId = typeof id === 'object' ? id.id : id;

        const newDataSource = await knex('data_sources').where({ id: dsId }).first();
        res.status(201).json({
            ...newDataSource,
            config: newDataSource.config ? JSON.parse(newDataSource.config) : null,
            fileMetadata: newDataSource.fileMetadata ? JSON.parse(newDataSource.fileMetadata) : null
        });
    } catch (err) {
        logger.error('Error creating data source:', err);
        res.status(500).json({ message: "Failed to create data source", error: err.message });
    }
});

app.put('/data-sources/:id', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const dataSource = await knex('data_sources').where({ id: req.params.id }).first();
        if (!dataSource) return res.sendStatus(404);

        const { name, type, connectionType } = req.body;
        let config = dataSource.config;
        let fileMetadata = dataSource.fileMetadata;
        let status = dataSource.status;

        if ((type === 'excel' || type === 'csv') && req.file) {
            if (dataSource.fileMetadata) {
                const oldMetadata = JSON.parse(dataSource.fileMetadata);
                if (oldMetadata.filePath && fs.existsSync(oldMetadata.filePath)) {
                    fs.unlinkSync(oldMetadata.filePath);
                }
            }
            fileMetadata = JSON.stringify({
                fileName: req.file.originalname,
                filePath: req.file.path,
                fileSize: req.file.size,
                sheetName: req.body.sheetName || null,
                delimiter: req.body.delimiter || ',',
                hasHeader: req.body.hasHeader === 'true'
            });
            status = 'active';
        } else if (['postgres', 'mysql', 'sqlserver', 'mongodb', 'oracle'].includes(type) && req.body.config) {
            try {
                const configData = JSON.parse(req.body.config);
                const existingConfig = dataSource.config ? JSON.parse(dataSource.config) : {};
                config = JSON.stringify({
                    ...existingConfig,
                    ...configData,
                    query: req.body.query || existingConfig.query || null,
                    tableName: req.body.tableName || existingConfig.tableName || null,
                    procedureName: req.body.procedureName || existingConfig.procedureName || null,
                    procedureParams: req.body.procedureParams ? JSON.parse(req.body.procedureParams) : existingConfig.procedureParams || null
                });
            } catch (e) {
                return res.status(400).json({ message: "Invalid configuration format" });
            }
        }

        await knex('data_sources').where({ id: req.params.id }).update({
            name: name || dataSource.name, // COALESCE logic
            type: type || dataSource.type,
            connectionType: connectionType || dataSource.connectionType,
            config: config || dataSource.config,
            fileMetadata: fileMetadata || dataSource.fileMetadata,
            status: status || dataSource.status,
            updatedAt: knex.fn.now()
        });

        const updated = await knex('data_sources').where({ id: req.params.id }).first();
        res.json({
            ...updated,
            config: updated.config ? JSON.parse(updated.config) : null,
            fileMetadata: updated.fileMetadata ? JSON.parse(updated.fileMetadata) : null
        });
    } catch (err) {
        logger.error('Error updating data source:', err);
        res.status(500).json({ message: "Failed to update data source", error: err.message });
    }
});

app.delete('/data-sources/:id', authenticateToken, async (req, res) => {
    try {
        const dataSource = await knex('data_sources').where({ id: req.params.id }).first();

        if (dataSource && dataSource.fileMetadata) {
            const metadata = JSON.parse(dataSource.fileMetadata);
            if (metadata.filePath && fs.existsSync(metadata.filePath)) {
                fs.unlinkSync(metadata.filePath);
            }
        }

        await knex('data_sources').where({ id: req.params.id }).del();
        res.sendStatus(204);
    } catch (err) {
        logger.error("Delete data source error:", err);
        res.sendStatus(500);
    }
});

app.post('/data-sources/preview', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { type, connectionType } = req.body;
        let columns = [];
        let rows = [];

        if (type === 'excel' || type === 'csv') {
            // Handle file preview
            let filePath = null;
            let shouldCleanup = false;

            if (req.file) {
                // New file uploaded for preview
                filePath = req.file.path;
                shouldCleanup = true;
            } else if (req.body.filePath) {
                // Existing file path provided
                filePath = req.body.filePath;
                shouldCleanup = false;
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: "No file provided for preview"
                });
            }

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    status: 'error',
                    message: "File not found"
                });
            }

            try {
                const workbook = xlsx.readFile(filePath);
                const sheetName = req.body.sheetName || workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length > 0) {
                    const hasHeader = req.body.hasHeader === 'true' || req.body.hasHeader === true;

                    if (hasHeader) {
                        columns = jsonData[0];
                        const dataRows = jsonData.slice(1, 11); // First 10 rows
                        rows = dataRows.map(row => {
                            const rowObj = {};
                            columns.forEach((col, index) => {
                                rowObj[col] = row[index];
                            });
                            return rowObj;
                        });
                    } else {
                        // Generate column names if no header
                        const firstRow = jsonData[0];
                        columns = firstRow.map((_, idx) => `Column ${idx + 1}`);
                        const dataRows = jsonData.slice(0, 10); // First 10 rows
                        rows = dataRows.map(row => {
                            const rowObj = {};
                            columns.forEach((col, index) => {
                                rowObj[col] = row[index];
                            });
                            return rowObj;
                        });
                    }
                }

                // Clean up temporary file if it was uploaded for preview
                if (shouldCleanup && req.file) {
                    fs.unlinkSync(filePath);
                }

                res.json({
                    status: 'success',
                    data: { columns, rows }
                });
            } catch (fileErr) {
                logger.error('File processing error:', fileErr);
                if (shouldCleanup && req.file && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                res.status(500).json({
                    status: 'error',
                    message: "Failed to process file: " + fileErr.message
                });
            }
        } else if (['postgres', 'mysql'].includes(type)) {
            try {
                // REAL DB PREVIEW
                const db = await connectionManager.getConnection({
                    type,
                    config: req.body.config,
                    name: 'Preview Connection'
                });
                
                let query = req.body.query;
                if (!query) {
                    if (req.body.tableName) {
                        query = `SELECT * FROM ${req.body.tableName} LIMIT 10`;
                    } else {
                        return res.status(400).json({ status: 'error', message: "Query or Table Name is required for database preview" });
                    }
                }

                const result = await db.raw(query);
                if (type === 'postgres') {
                    rows = result.rows.slice(0, 10);
                    columns = result.fields.map(f => f.name);
                } else if (type === 'mysql') {
                    rows = result[0].slice(0, 10);
                    columns = result[1].map(f => f.name);
                }

                res.json({
                    status: 'success',
                    data: { columns, rows }
                });
            } catch (dbErr) {
                logger.error('DB Preview error:', dbErr);
                res.status(500).json({ status: 'error', message: "Failed to fetch DB preview: " + dbErr.message });
            }
        } else if (['sqlserver', 'mongodb', 'oracle'].includes(type)) {
            // Generate mock data for database preview (fallback)
            const mockColumns = ['id', 'name', 'value', 'date', 'category'];
            columns = mockColumns;
            rows = Array.from({ length: 10 }, (_, i) => ({
                id: i + 1,
                name: `Sample ${i + 1}`,
                value: Math.floor(Math.random() * 1000),
                date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
                category: ['A', 'B', 'C'][i % 3]
            }));

            res.json({
                status: 'success',
                data: { columns, rows }
            });
        } else if (type === 'api') {
            // Mock API preview
            columns = ['id', 'data'];
            rows = [
                { id: 1, data: 'Sample API Response 1' },
                { id: 2, data: 'Sample API Response 2' }
            ];

            res.json({
                status: 'success',
                data: { columns, rows }
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: "Unsupported data source type"
            });
        }
    } catch (err) {
        logger.error('Data source preview error:', err);
        res.status(500).json({
            status: 'error',
            message: "Failed to generate preview: " + err.message
        });
    }
});

app.post('/data-sources/columns', authenticateToken, async (req, res) => {
    try {
        const { sourceId, config } = req.body;

        if (!sourceId) {
            return res.status(400).json({ message: "sourceId is required" });
        }

        const dataSource = await knex('data_sources').where({ id: sourceId }).first();
        if (!dataSource) {
            return res.status(404).json({ message: "Data source not found" });
        }

        let columns = [];

        if (dataSource.type === 'excel' || dataSource.type === 'csv') {
            const fileMetadata = JSON.parse(dataSource.fileMetadata);
            if (!fileMetadata || !fileMetadata.filePath) {
                return res.status(400).json({ message: "File source missing file path" });
            }

            const filePath = fileMetadata.filePath;
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: "File not found on server" });
            }

            const workbook = xlsx.readFile(filePath);
            const sheetName = config?.sheetName || fileMetadata.sheetName || workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 0) {
                columns = jsonData[0]; // First row as headers
            }
        } else if (['postgres', 'mysql'].includes(dataSource.type)) {
            try {
                // REAL DB COLUMNS FETCH
                const db = await connectionManager.getConnection(dataSource);
                let query = config?.query;
                
                if (!query && dataSource.config) {
                    const dsConfig = typeof dataSource.config === 'string' ? JSON.parse(dataSource.config) : dataSource.config;
                    if (dsConfig.tableName) {
                        query = `SELECT * FROM ${dsConfig.tableName} LIMIT 1`;
                    }
                }

                if (query) {
                    const result = await db.raw(query + (query.toLowerCase().includes('limit') ? '' : ' LIMIT 1'));
                    if (dataSource.type === 'postgres') {
                        columns = result.fields.map(f => f.name);
                    } else if (dataSource.type === 'mysql') {
                        columns = result[1].map(f => f.name);
                    }
                } else {
                    // Fallback to mock if no query/table found
                    columns = ['id', 'name', 'value', 'date', 'category'];
                }
            } catch (dbErr) {
                logger.error('Error fetching DB columns:', dbErr);
                columns = ['id', 'name', 'value', 'date', 'category']; // Fallback
            }
        } else if (['sqlserver', 'mongodb', 'oracle'].includes(dataSource.type)) {
            // For database sources, return mock columns
            // In a real implementation, you would execute the query and get actual column names
            columns = ['id', 'name', 'value', 'date', 'category'];

            // If a query is provided, try to extract column names from it
            if (config?.query) {
                const query = config.query.toLowerCase();
                if (query.includes('select')) {
                    const selectMatch = query.match(/select\s+(.*?)\s+from/i);
                    if (selectMatch && selectMatch[1] !== '*') {
                        columns = selectMatch[1].split(',').map(col => col.trim().split(' ').pop());
                    }
                }
            }
        } else {
            columns = ['column1', 'column2', 'column3'];
        }

        res.json({ columns });
    } catch (err) {
        logger.error('Get columns error:', err);
        res.status(500).json({ message: "Failed to get columns", error: err.message });
    }
});

// ==================== DASHBOARD ROUTES ====================

app.get('/dashboards', authenticateToken, async (req, res) => {
    try {
        const dashboards = await knex('dashboards').select('*');
        res.json(dashboards.map(d => ({
            ...d,
            layout: JSON.parse(d.layout)
        })));
    } catch (err) {
        logger.error("Get dashboards error:", err);
        res.sendStatus(500);
    }
});

app.get('/dashboards/:id', authenticateToken, async (req, res) => {
    try {
        const dashboard = await knex('dashboards').where({ id: req.params.id }).first();
        if (!dashboard) return res.sendStatus(404);
        res.json({
            ...dashboard,
            layout: JSON.parse(dashboard.layout)
        });
    } catch (err) {
        logger.error("Get dashboard error:", err);
        res.sendStatus(500);
    }
});

app.post('/dashboards', authenticateToken, async (req, res) => {
    try {
        const { name, description, layout } = req.body;
        const [id] = await knex('dashboards').insert({
            name,
            description,
            layout: JSON.stringify(layout || [])
        }).returning('id');

        const dashboardId = typeof id === 'object' ? id.id : id;
        const newDashboard = await knex('dashboards').where({ id: dashboardId }).first();

        res.status(201).json({
            ...newDashboard,
            layout: JSON.parse(newDashboard.layout)
        });
    } catch (err) {
        logger.error("Create dashboard error:", err);
        res.sendStatus(500);
    }
});

app.put('/dashboards/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description, layout } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (layout) updateData.layout = JSON.stringify(layout);
        updateData.updatedAt = knex.fn.now();

        await knex('dashboards').where({ id: req.params.id }).update(updateData);

        const dashboard = await knex('dashboards').where({ id: req.params.id }).first();
        if (!dashboard) return res.sendStatus(404);

        res.json({
            ...dashboard,
            layout: JSON.parse(dashboard.layout)
        });
    } catch (err) {
        logger.error("Update dashboard error:", err);
        res.sendStatus(500);
    }
});

app.delete('/dashboards/:id', authenticateToken, async (req, res) => {
    try {
        await knex('dashboards').where({ id: req.params.id }).del();
        res.sendStatus(204);
    } catch (err) {
        logger.error("Delete dashboard error:", err);
        res.sendStatus(500);
    }
});


// ==================== SETTINGS ROUTES ====================

app.get('/settings', authenticateToken, async (req, res) => {
    try {
        const settings = await knex('settings').select('*');
        const settingsObj = {};
        settings.forEach(s => {
            try {
                settingsObj[s.key] = JSON.parse(s.value);
            } catch (e) {
                settingsObj[s.key] = s.value;
            }
        });
        res.json(settingsObj);
    } catch (err) {
        logger.error("Get settings error:", err);
        res.sendStatus(500);
    }
});

app.put('/settings', authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

            // Check if key exists
            const existing = await knex('settings').where({ key }).first();
            if (existing) {
                await knex('settings').where({ key }).update({ value: valStr, updatedAt: knex.fn.now() });
            } else {
                await knex('settings').insert({ key, value: valStr });
            }
        }

        // Return updated settings
        const settings = await knex('settings').select('*');
        const settingsObj = {};
        settings.forEach(s => {
            try {
                settingsObj[s.key] = JSON.parse(s.value);
            } catch (e) {
                settingsObj[s.key] = s.value;
            }
        });
        res.json(settingsObj);
    } catch (err) {
        logger.error("Update settings error:", err);
        res.sendStatus(500);
    }
});


// ==================== USERS & ROLES (ADMIN) ====================

app.get('/users', authenticateToken, async (req, res) => {
    // Basic Admin Check (Simplistic)
    if (!req.user.roles.includes('ADMIN')) return res.sendStatus(403);

    try {
        const users = await knex('users').select('id', 'email', 'firstName', 'lastName', 'roles', 'createdAt');
        res.json(users.map(u => ({
            ...u,
            roles: JSON.parse(u.roles)
        })));
    } catch (err) {
        logger.error("Get users error:", err);
        res.sendStatus(500);
    }
});

// ... (Other admin routes follow similar pattern) ...

// ==================== LLM MANAGEMENT ROUTES ====================
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'ollama';
const OLLAMA_PORT = process.env.OLLAMA_PORT || '11434';
const OLLAMA_URL = `http://${OLLAMA_HOST}:${OLLAMA_PORT}`;

logger.logActivity('LLM Management initialized', {
    ollamaHost: OLLAMA_HOST,
    ollamaPort: OLLAMA_PORT,
    ollamaUrl: OLLAMA_URL
});

// GET /llm/models - List all models
app.get('/llm/models', authenticateToken, async (req, res) => {
    const startTime = Date.now();
    logger.logActivity('Fetching LLM models');

    try {
        // Get models from database
        logger.logDebug('Fetching models from database');
        const dbModels = await knex('llm_models').select('*');
        logger.logDebug('Database models retrieved', { count: dbModels.length });

        // Try to get models from Ollama
        try {
            logger.logOllama('Connecting to Ollama', { url: `${OLLAMA_URL}/api/tags` });
            const ollamaResponse = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
            const ollamaModels = ollamaResponse.data.models || [];
            logger.logOllama('Successfully retrieved models from Ollama', { count: ollamaModels.length });

            // Deduplicate models - Ollama sometimes returns both 'model' and 'model:latest'
            // We normalize by ensuring all models have explicit tags and remove duplicates
            const modelMap = new Map();
            for (const model of ollamaModels) {
                // Normalize the name - if no tag, add :latest
                const normalizedName = model.name.includes(':') ? model.name : `${model.name}:latest`;

                // Only keep the model if we haven't seen it or if this one is more recent
                if (!modelMap.has(normalizedName) ||
                    new Date(model.modified_at) > new Date(modelMap.get(normalizedName).modified_at)) {
                    modelMap.set(normalizedName, {
                        ...model,
                        name: normalizedName
                    });
                }
            }

            const uniqueModels = Array.from(modelMap.values());
            logger.logActivity('Deduplicated models from Ollama', {
                original: ollamaModels.length,
                unique: uniqueModels.length
            });

            // Sync with database
            let syncedCount = 0;
            for (const model of uniqueModels) {
                const existing = await knex('llm_models').where({ name: model.name }).first();
                if (!existing) {
                    await knex('llm_models').insert({
                        name: model.name,
                        size: model.size ? `${(model.size / 1024 / 1024 / 1024).toFixed(2)}GB` : 'Unknown',
                        status: 'DOWNLOADED',
                        progress: 100,
                        modified_at: model.modified_at || new Date()
                    });
                    syncedCount++;
                    logger.logDatabase('Synced new model from Ollama', { modelName: model.name });
                }
            }

            // Clean up any duplicate entries in the database
            // Remove models without :latest tag if a :latest version exists
            const allDbModels = await knex('llm_models').select('*');
            const dbModelMap = new Map();
            const toDelete = [];

            for (const dbModel of allDbModels) {
                const baseName = dbModel.name.split(':')[0];
                const hasTag = dbModel.name.includes(':');

                if (!dbModelMap.has(baseName)) {
                    dbModelMap.set(baseName, [dbModel]);
                } else {
                    dbModelMap.get(baseName).push(dbModel);
                }
            }

            // For each base name, keep only the :latest version
            for (const [baseName, models] of dbModelMap.entries()) {
                if (models.length > 1) {
                    // Find the :latest version
                    const latestModel = models.find(m => m.name.endsWith(':latest'));
                    if (latestModel) {
                        // Mark all others for deletion
                        models.forEach(m => {
                            if (m.name !== latestModel.name) {
                                toDelete.push(m.name);
                            }
                        });
                    }
                }
            }

            // Delete duplicates
            if (toDelete.length > 0) {
                logger.logActivity('Removing duplicate models from database', { duplicates: toDelete });
                await knex('llm_models').whereIn('name', toDelete).del();
            }

            if (syncedCount > 0) {
                logger.logActivity('Synced models from Ollama to database', { syncedCount });
            }

            // Get updated list from database
            const updatedModels = await knex('llm_models').select('*');
            const duration = Date.now() - startTime;
            logger.logResponse('GET', '/llm/models', 200, duration, { modelCount: updatedModels.length });
            res.json(updatedModels);
        } catch (ollamaError) {
            logger.logError(ollamaError, {
                context: 'Ollama connection failed',
                url: OLLAMA_URL,
                host: OLLAMA_HOST,
                port: OLLAMA_PORT,
                errorCode: ollamaError.code,
                errorMessage: ollamaError.message
            });

            // Return database models if Ollama is not available
            const duration = Date.now() - startTime;
            logger.logResponse('GET', '/llm/models', 200, duration, {
                modelCount: dbModels.length,
                source: 'database-only',
                ollamaUnavailable: true
            });
            res.json(dbModels);
        }
    } catch (err) {
        const duration = Date.now() - startTime;
        logger.logError(err, { context: 'Failed to fetch models', endpoint: '/llm/models' });
        logger.logResponse('GET', '/llm/models', 500, duration);
        res.status(500).json({ message: 'Failed to fetch models', error: err.message });
    }
});



// POST /llm/models/pull - Pull/download a model
app.post('/llm/models/pull', authenticateToken, async (req, res) => {
    const { name, size } = req.body;
    const startTime = Date.now();

    logger.logActivity('Model download requested', { modelName: name, modelSize: size });

    if (!name) {
        logger.logDebug('Model download rejected: missing name');
        return res.status(400).json({ message: 'Model name is required' });
    }

    try {
        // Check if model already exists in DB
        logger.logDebug('Checking if model exists in database', { modelName: name });
        const existing = await knex('llm_models').where({ name }).first();

        if (existing && existing.status === 'DOWNLOADED') {
            logger.logActivity('Model download rejected: already downloaded', { modelName: name });
            return res.status(400).json({ message: 'Model already downloaded' });
        }

        // Insert or update model in database with DOWNLOADING status
        if (existing) {
            logger.logDatabase('Updating existing model status to DOWNLOADING', { modelName: name });
            await knex('llm_models').where({ name }).update({
                status: 'DOWNLOADING',
                progress: 0
            });
        } else {
            logger.logDatabase('Inserting new model with DOWNLOADING status', { modelName: name, size });
            await knex('llm_models').insert({
                name,
                size: size || 'Unknown',
                status: 'DOWNLOADING',
                progress: 0
            });
        }

        // Start pulling model from Ollama (async, don't wait)
        logger.logActivity('Starting async model download', { modelName: name });
        pullModelAsync(name);

        const duration = Date.now() - startTime;
        logger.logResponse('POST', '/llm/models/pull', 200, duration, { modelName: name });
        res.json({ message: `Started downloading ${name}`, name });
    } catch (err) {
        const duration = Date.now() - startTime;
        logger.logError(err, { context: 'Failed to start model download', modelName: name });
        logger.logResponse('POST', '/llm/models/pull', 500, duration);
        res.status(500).json({ message: 'Failed to start model download', error: err.message });
    }
});

// Async function to pull model and update progress
async function pullModelAsync(modelName) {
    try {
        logger.logActivity(`Starting model pull from Ollama`, { modelName, url: `${OLLAMA_URL}/api/pull` });

        const response = await axios.post(
            `${OLLAMA_URL}/api/pull`,
            { name: modelName },
            {
                responseType: 'stream',
                timeout: 3600000 // 1 hour timeout
            }
        );

        logger.logOllama('Model pull stream established', { modelName });
        let lastProgress = 0;

        response.data.on('data', async (chunk) => {
            try {
                const lines = chunk.toString().split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);

                        logger.logDebug('Ollama pull status', {
                            modelName,
                            status: data.status,
                            completed: data.completed,
                            total: data.total
                        });

                        if (data.status === 'downloading' && data.completed && data.total) {
                            const progress = Math.round((data.completed / data.total) * 100);

                            // Only update if progress changed significantly
                            if (progress !== lastProgress && progress % 5 === 0) {
                                await knex('llm_models').where({ name: modelName }).update({
                                    progress,
                                    status: 'DOWNLOADING'
                                });
                                lastProgress = progress;
                                logger.logActivity(`Model download progress`, {
                                    modelName,
                                    progress: `${progress}%`,
                                    downloaded: `${(data.completed / 1024 / 1024).toFixed(2)}MB`,
                                    total: `${(data.total / 1024 / 1024).toFixed(2)}MB`
                                });
                            }
                        }

                        if (data.status === 'success') {
                            await knex('llm_models').where({ name: modelName }).update({
                                status: 'DOWNLOADED',
                                progress: 100,
                                modified_at: new Date()
                            });
                            logger.logActivity(`Model downloaded successfully`, { modelName });
                        }
                    } catch (parseError) {
                        // Ignore JSON parse errors for incomplete chunks
                        logger.logDebug('JSON parse error in chunk (expected for incomplete data)', { modelName });
                    }
                }
            } catch (chunkError) {
                logger.logError(chunkError, { context: 'Error processing chunk', modelName });
            }
        });

        response.data.on('end', async () => {
            // Ensure model is marked as downloaded
            const model = await knex('llm_models').where({ name: modelName }).first();
            if (model && model.status === 'DOWNLOADING') {
                await knex('llm_models').where({ name: modelName }).update({
                    status: 'DOWNLOADED',
                    progress: 100,
                    modified_at: new Date()
                });
                logger.logActivity('Model pull stream ended, marked as DOWNLOADED', { modelName });
            } else {
                logger.logDebug('Model pull stream ended', { modelName, currentStatus: model?.status });
            }
        });

        response.data.on('error', async (error) => {
            logger.logError(error, { context: 'Stream error during model pull', modelName });
            await knex('llm_models').where({ name: modelName }).update({
                status: 'ERROR',
                progress: 0
            });
        });

    } catch (err) {
        logger.logError(err, {
            context: 'Failed to initiate model pull',
            modelName,
            url: `${OLLAMA_URL}/api/pull`,
            errorCode: err.code,
            errorMessage: err.message
        });
        await knex('llm_models').where({ name: modelName }).update({
            status: 'ERROR',
            progress: 0
        });
    }
}


// DELETE /llm/models/:name - Delete a model
app.delete('/llm/models/:name', authenticateToken, async (req, res) => {
    const modelName = decodeURIComponent(req.params.name);
    const startTime = Date.now();

    logger.logActivity('Model deletion requested', { modelName });

    try {
        // Delete from Ollama
        try {
            logger.logOllama('Deleting model from Ollama', { modelName, url: `${OLLAMA_URL}/api/delete` });
            await axios.delete(`${OLLAMA_URL}/api/delete`, {
                data: { name: modelName },
                timeout: 30000
            });
            logger.logOllama('Model deleted from Ollama successfully', { modelName });
        } catch (ollamaError) {
            logger.logError(ollamaError, {
                context: 'Error deleting from Ollama (continuing with database deletion)',
                modelName,
                errorCode: ollamaError.code
            });
            // Continue to delete from database even if Ollama delete fails
        }

        // Delete from database
        logger.logDatabase('Deleting model from database', { modelName });
        await knex('llm_models').where({ name: modelName }).del();
        logger.logDatabase('Model deleted from database successfully', { modelName });

        const duration = Date.now() - startTime;
        logger.logActivity('Model deleted successfully', { modelName });
        logger.logResponse('DELETE', `/llm/models/${modelName}`, 200, duration);
        res.json({ message: `Model ${modelName} deleted successfully` });
    } catch (err) {
        const duration = Date.now() - startTime;
        logger.logError(err, { context: 'Failed to delete model', modelName });
        logger.logResponse('DELETE', `/llm/models/${modelName}`, 500, duration);
        res.status(500).json({ message: 'Failed to delete model', error: err.message });
    }
});
// ==================== CHAT ROUTES ====================

// GET /chat/conversations - List all conversations
app.get('/chat/conversations', authenticateToken, async (req, res) => {
    try {
        const conversations = await knex('chat_conversations')
            .orderBy('createdAt', 'desc');
        res.json(conversations);
    } catch (err) {
        logger.error("Get conversations error:", err);
        res.sendStatus(500);
    }
});

// POST /chat/conversations - Create a new conversation
app.post('/chat/conversations', authenticateToken, async (req, res) => {
    try {
        const { title, model } = req.body;
        const [id] = await knex('chat_conversations').insert({
            title: title || 'New Chat',
            model: model || 'tinyllama:latest',
            createdAt: knex.fn.now()
        }).returning('id'); // SQLite/Postgres compatibility

        // Handle SQLite returning [id] or {id}
        const conversationId = typeof id === 'object' ? id.id : id;

        const newConversation = await knex('chat_conversations').where({ id: conversationId }).first();
        res.status(201).json(newConversation);
    } catch (err) {
        logger.error("Create conversation error:", err);
        res.sendStatus(500);
    }
});

// DELETE /chat/conversations/:id - Delete a conversation
app.delete('/chat/conversations/:id', authenticateToken, async (req, res) => {
    try {
        await knex('chat_conversations').where({ id: req.params.id }).del();
        res.sendStatus(204);
    } catch (err) {
        logger.error("Delete conversation error:", err);
        res.sendStatus(500);
    }
});

// GET /chat/conversations/:id - Get messages for a conversation
app.get('/chat/conversations/:id', authenticateToken, async (req, res) => {
    try {
        const conversation = await knex('chat_conversations').where({ id: req.params.id }).first();
        if (!conversation) return res.sendStatus(404);

        const messages = await knex('chat_messages')
            .where({ conversationId: req.params.id })
            .orderBy('createdAt', 'asc');

        res.json({
            ...conversation,
            messages
        });
    } catch (err) {
        logger.error("Get conversation details error:", err);
        res.sendStatus(500);
    }
});

// PATCH /chat/conversations/:id - Update conversation (e.g. model)
app.patch('/chat/conversations/:id', authenticateToken, async (req, res) => {
    try {
        const { model, title } = req.body;
        const updateData = {};
        if (model) updateData.model = model;
        if (title) updateData.title = title;

        await knex('chat_conversations')
            .where({ id: req.params.id })
            .update(updateData);

        res.sendStatus(200);
    } catch (err) {
        logger.error("Update conversation error:", err);
        res.sendStatus(500);
    }
});

// POST /chat/conversations/:id/messages - Send a message
app.post('/chat/conversations/:id/messages', authenticateToken, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const { content, imageUrl, fileUrl } = req.body;

        const conversation = await knex('chat_conversations').where({ id: conversationId }).first();
        if (!conversation) return res.sendStatus(404);

        // 1. Save User Message
        await knex('chat_messages').insert({
            conversationId,
            role: 'user',
            content,
            imageUrl,
            fileUrl,
            createdAt: knex.fn.now()
        });

        // 2. Prepare Context for Ollama
        const history = await knex('chat_messages')
            .where({ conversationId })
            .orderBy('createdAt', 'asc');



        const messagesForOllama = history.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Inject Project Context (System Prompt) and Dynamic Data
        // We inject this at the beginning of the context window.
        // Context Retrieval & Construction (Simulated RAG)
        try {
            const queryLower = content.toLowerCase();
            let relevantReports = [];
            let relevantDashboards = [];
            let relevantDataSources = [];
            let intent = 'general';

            // 1. Intent Classification (Keyword-based)
            const reportKeywords = ['report', 'chart', 'graph', 'visualization', 'analysis', 'sales', 'growth', 'pie'];
            const dashboardKeywords = ['dashboard', 'overview', 'summary', 'layout', 'widget'];
            const sourceKeywords = ['data', 'source', 'connection', 'database', 'excel', 'csv', 'upload', 'sql'];

            // Project-related keywords (specific to this application)
            const projectKeywords = [
                // Core features
                'report', 'dashboard', 'data', 'source', 'chart', 'graph', 'visualization',
                'analytics', 'insight', 'metric', 'kpi', 'analysis',
                // Technical
                'api', 'endpoint', 'route', 'component', 'function', 'code', 'implementation',
                'backend', 'frontend', 'server', 'database', 'table', 'query',
                // Data operations
                'upload', 'download', 'import', 'export', 'connect', 'fetch', 'create', 'update', 'delete',
                // File types
                'excel', 'csv', 'json', 'sql', 'postgres', 'mysql', 'mongodb',
                // UI/UX
                'page', 'layout', 'widget', 'button', 'form', 'input', 'display',
                // User management
                'user', 'admin', 'role', 'permission', 'auth', 'login', 'register',
                // LLM/AI features
                'llm', 'model', 'chat', 'ollama', 'ai', 'generate',
                // Scheduling
                'schedule', 'cron', 'automation', 'task',
                // Project-specific terms
                'project', 'application', 'system', 'platform', 'manager', 'tool',
                'cube', 'schema', 'dimension', 'measure'
            ];

            // Check if query is project-related
            const isProjectRelated = projectKeywords.some(keyword => queryLower.includes(keyword));

            // Additional check: if query contains generic question words but no project keywords,
            // it's likely out of scope (e.g., "Who is X?", "What is the capital of Y?")
            const genericQuestionPatterns = [
                /^who (is|was|are|were)/i,
                /^what (is|was|are|were) (the|a|an) (capital|president|king|queen|leader)/i,
                /tell me (a|an|about) (joke|story|riddle)/i,
                /weather (today|tomorrow|forecast)/i,
                /(explain|describe|define) (quantum|physics|chemistry|biology|history|geography)/i
            ];

            const matchesGenericPattern = genericQuestionPatterns.some(pattern => pattern.test(content));
            const finallyProjectRelated = isProjectRelated && !matchesGenericPattern;

            // If query is completely out of scope, return early with polite decline
            if (!finallyProjectRelated) {
                logger.logDebug('Out-of-scope query detected', { query: content.substring(0, 100) });

                // Create polite decline response (user message already saved above)
                const declineMessage = "I apologize, but I'm specifically designed to assist with questions about this Report Manager application, including reports, dashboards, data sources, and related features. I cannot answer questions outside this scope. Is there anything about the project I can help you with?";

                const [assistantMsgId] = await knex('chat_messages').insert({
                    conversationId,
                    role: 'assistant',
                    content: declineMessage,
                    createdAt: knex.fn.now()
                }).returning('id');

                const msgId = typeof assistantMsgId === 'object' ? assistantMsgId.id : assistantMsgId;
                const assistantMessage = await knex('chat_messages').where({ id: msgId }).first();

                return res.json(assistantMessage);
            }

            const isReportIntent = reportKeywords.some(k => queryLower.includes(k));
            const isDashboardIntent = dashboardKeywords.some(k => queryLower.includes(k));
            const isSourceIntent = sourceKeywords.some(k => queryLower.includes(k));

            if (isReportIntent) intent = 'report';
            else if (isDashboardIntent) intent = 'dashboard';
            else if (isSourceIntent) intent = 'datasource';

            logger.logDebug('Determined query intent', { intent, isProjectRelated });

            // 2. Retrieval (Targeted SQL Search)
            // Fetch relevant items based on query + generic items if intent matches
            if (isReportIntent || intent === 'general') {
                relevantReports = await knex('reports')
                    .where('name', 'like', `%${content}%`)
                    .orWhere('description', 'like', `%${content}%`)
                    .orWhereRaw('? LIKE ?', ['1', '1']) // Fallback to include all if query is generic? No, let's limit.
                    // Actually, for better UX, if no specific keyword match, maybe fetch top 5 recent?
                    .limit(10);

                // If specific search yielded nothing, and intent is explicit, fetch all (small scale)
                if (relevantReports.length === 0 && isReportIntent) {
                    relevantReports = await knex('reports').limit(20);
                }
            }

            if (isDashboardIntent || intent === 'general') {
                relevantDashboards = await knex('dashboards')
                    .where('name', 'like', `%${content}%`)
                    .orWhere('description', 'like', `%${content}%`)
                    .limit(10);
                if (relevantDashboards.length === 0 && isDashboardIntent) {
                    relevantDashboards = await knex('dashboards').limit(20);
                }
            }

            if (isSourceIntent || intent === 'general') {
                relevantDataSources = await knex('data_sources')
                    .where('name', 'like', `%${content}%`)
                    .orWhere('type', 'like', `%${content}%`)
                    .limit(10);
                if (relevantDataSources.length === 0 && isSourceIntent) {
                    relevantDataSources = await knex('data_sources').limit(20);
                }
            }

            // If general query (e.g. "what do I have?"), fetch a summary of everything
            if (intent === 'general') {
                const [allReports, allDashboards, allSources] = await Promise.all([
                    knex('reports').select('name', 'description').limit(10),
                    knex('dashboards').select('name', 'description').limit(10),
                    knex('data_sources').select('name', 'type').limit(10)
                ]);
                relevantReports = allReports;
                relevantDashboards = allDashboards;
                relevantDataSources = allSources;
            }

            // 3. Context Construction
            let dynamicContext = "# LIVE SYSTEM DATA (Authoritative)\n";
            dynamicContext += "Use this data to answer questions about existing reports, dashboards, and data sources.\n";
            dynamicContext += "Rules:\n";
            dynamicContext += "- ONLY answer based on this provided data and the attached code context.\n";
            dynamicContext += "- If the information is not here, state that it is not available in the current context.\n\n";

            if (relevantReports.length > 0) {
                dynamicContext += "## matching Reports:\n";
                relevantReports.forEach(r => dynamicContext += `- ${r.name}: ${r.description || 'No description'}\n`);
            }

            if (relevantDashboards.length > 0) {
                dynamicContext += "\n## Matching Dashboards:\n";
                relevantDashboards.forEach(d => dynamicContext += `- ${d.name}: ${d.description || 'No description'}\n`);
            }

            if (relevantDataSources.length > 0) {
                dynamicContext += "\n## Matching Data Sources:\n";
                relevantDataSources.forEach(ds => dynamicContext += `- ${ds.name} (${ds.type})\n`);
            }

            dynamicContext += "\n";

            // 4. Code Context (Already filtered by Intent in getProjectContext)
            const projectContext = getProjectContext(content);
            const fullSystemContext = dynamicContext + projectContext;

            messagesForOllama.unshift({
                role: 'system',
                content: fullSystemContext
            });

            logger.logDebug('Injected RAG context', {
                intent,
                reportsFound: relevantReports.length,
                dashboardsFound: relevantDashboards.length,
                sourcesFound: relevantDataSources.length,
                totalContextLength: fullSystemContext.length
            });

        } catch (ctxErr) {
            logger.error('Failed to inject RAG context', ctxErr);
        }

        // 3. Call Ollama
        let modelName = conversation.model || 'tinyllama:latest';

        // Handle "auto" model selection
        if (modelName === 'auto') {
            try {
                // Try to get available models
                const tagsResponse = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
                const availableModels = tagsResponse.data.models?.map(m => m.name) || [];

                // Prioritize better models
                if (availableModels.includes('mistral:latest')) {
                    modelName = 'mistral:latest';
                } else if (availableModels.includes('llama3:latest')) {
                    modelName = 'llama3:latest';
                } else if (availableModels.includes('tinyllama:latest')) {
                    modelName = 'tinyllama:latest';
                } else if (availableModels.length > 0) {
                    modelName = availableModels[0];
                } else {
                    modelName = 'tinyllama:latest'; // Fallback
                }
                logger.logActivity('Auto-selected model', { selectedModel: modelName });
            } catch (e) {
                logger.warn('Failed to auto-select model, falling back to tinyllama', e);
                modelName = 'tinyllama:latest';
            }
        }

        logger.logActivity('Sending request to Ollama', { modelName, messageCount: messagesForOllama.length });

        let assistantContent = "";

        try {
            const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
                model: modelName,
                messages: messagesForOllama,
                stream: false
            }, { timeout: 300000 }); // 5 minute timeout for long responses

            assistantContent = response.data.message.content;
        } catch (ollamaErr) {
            logger.logError(ollamaErr, { context: "Ollama chat request failed", modelName });
            if (ollamaErr.code === 'ECONNABORTED') {
                assistantContent = "Error: The AI model took too long to respond. Please try again or use a smaller model.";
            } else if (ollamaErr.response && ollamaErr.response.status === 404) {
                assistantContent = `Error: Model '${modelName}' not found. Please ensure it is downloaded in the LLM Management page.`;
            } else {
                assistantContent = `Error: Failed to get response from AI model (${ollamaErr.message}). ensure Ollama is running.`;
            }
        }

        // 4. Save Assistant Message
        const [newMsgId] = await knex('chat_messages').insert({
            conversationId,
            role: 'assistant',
            content: assistantContent,
            createdAt: knex.fn.now()
        }).returning('id');

        const msgId = typeof newMsgId === 'object' ? newMsgId.id : newMsgId;
        const assistantMessage = await knex('chat_messages').where({ id: msgId }).first();

        // 5. Auto-generate title if this is the first message in a "New Chat"
        if (conversation.title === 'New Chat') {
            try {
                logger.logActivity('Generating title for new chat', { conversationId });

                // Use the LLM to generate a concise title
                const titlePrompt = `Based on this user message, generate a short, descriptive title (maximum 6 words, no quotes or punctuation at the end). Just respond with the title text only, nothing else.\n\nUser message: "${content}"`;

                const titleResponse = await axios.post(`${OLLAMA_URL}/api/chat`, {
                    model: modelName,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that generates concise, descriptive titles for chat conversations. Respond only with the title text, maximum 6 words, no quotes or extra punctuation.'
                        },
                        {
                            role: 'user',
                            content: titlePrompt
                        }
                    ],
                    stream: false
                }, { timeout: 30000 });

                let generatedTitle = titleResponse.data.message.content.trim();

                // Clean up the title - remove quotes if present
                generatedTitle = generatedTitle.replace(/^["']|["']$/g, '');

                // Remove common prefixes that LLMs might add
                generatedTitle = generatedTitle.replace(/^(Title:\s*|Title\s*-\s*|Chat:\s*|Chat\s*-\s*)/i, '');

                // Remove any remaining quotes after prefix removal
                generatedTitle = generatedTitle.replace(/^["']|["']$/g, '').trim();

                // Limit to 60 characters max
                if (generatedTitle.length > 60) {
                    generatedTitle = generatedTitle.substring(0, 57) + '...';
                }

                // Update the conversation title
                await knex('chat_conversations')
                    .where({ id: conversationId })
                    .update({ title: generatedTitle });

                logger.logActivity('Generated title for chat', { conversationId, title: generatedTitle });
            } catch (titleErr) {
                logger.logError(titleErr, { context: 'Failed to generate chat title', conversationId });
                // Don't fail the whole request if title generation fails
            }
        }

        res.json(assistantMessage);

    } catch (err) {
        logger.error("Send message error:", err);
        res.status(500).json({ message: "Failed to send message", error: err.message });
    }
});

initializeAndSeed().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
});
