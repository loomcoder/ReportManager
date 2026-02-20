const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Get configuration from environment
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE || '20m';
const LOG_MAX_FILES = process.env.LOG_MAX_FILES || '14d';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Ensure logs directory exists
const logDir = path.resolve(__dirname, LOG_DIR);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for console output (human-readable)
const consoleFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
});

// Custom format for file output (JSON for parsing)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: fileFormat,
    defaultMeta: { service: 'report-manager-backend' },
    transports: [
        // Error log - only errors
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: parseSize(LOG_MAX_SIZE),
            maxFiles: LOG_MAX_FILES,
            tailable: true
        }),

        // Combined log - all levels
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: parseSize(LOG_MAX_SIZE),
            maxFiles: LOG_MAX_FILES,
            tailable: true
        }),

        // Activity log - info and above (main activities)
        new winston.transports.File({
            filename: path.join(logDir, 'activity.log'),
            level: 'info',
            maxsize: parseSize(LOG_MAX_SIZE),
            maxFiles: LOG_MAX_FILES,
            tailable: true
        }),

        // Debug log - debug and above (detailed debugging)
        new winston.transports.File({
            filename: path.join(logDir, 'debug.log'),
            level: 'debug',
            maxsize: parseSize(LOG_MAX_SIZE),
            maxFiles: LOG_MAX_FILES,
            tailable: true
        }),
    ],
});

// Add console transport for non-production environments
if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            consoleFormat
        ),
    }));
}

// Helper function to parse size strings like "20m" or "100k"
function parseSize(sizeStr) {
    const units = {
        'k': 1024,
        'm': 1024 * 1024,
        'g': 1024 * 1024 * 1024
    };

    const match = sizeStr.toLowerCase().match(/^(\d+)([kmg])?$/);
    if (!match) return 20 * 1024 * 1024; // Default 20MB

    const value = parseInt(match[1]);
    const unit = match[2] || '';

    return value * (units[unit] || 1);
}

// Add helper methods for structured logging
logger.logActivity = function (activity, details = {}) {
    this.info(`[ACTIVITY] ${activity}`, details);
};

logger.logAudit = function (userId, action, details = {}) {
    this.info(`[AUDIT] User ${userId}: ${action}`, {
        userId,
        action,
        ...details,
        timestamp: new Date().toISOString()
    });
};

logger.logDebug = function (message, details = {}) {
    this.debug(`[DEBUG] ${message}`, details);
};

logger.logError = function (error, context = {}) {
    if (error instanceof Error) {
        this.error(`[ERROR] ${error.message}`, {
            stack: error.stack,
            ...context
        });
    } else {
        this.error(`[ERROR] ${error}`, context);
    }
};

logger.logRequest = function (method, url, details = {}) {
    this.info(`[REQUEST] ${method} ${url}`, details);
};

logger.logResponse = function (method, url, statusCode, duration, details = {}) {
    this.info(`[RESPONSE] ${method} ${url} - ${statusCode} (${duration}ms)`, details);
};

logger.logOllama = function (action, details = {}) {
    this.info(`[OLLAMA] ${action}`, details);
};

logger.logDatabase = function (action, details = {}) {
    this.debug(`[DATABASE] ${action}`, details);
};

// Log startup information
logger.info('='.repeat(80));
logger.info('Logger initialized', {
    level: LOG_LEVEL,
    logDir: logDir,
    maxSize: LOG_MAX_SIZE,
    maxFiles: LOG_MAX_FILES,
    environment: NODE_ENV
});
logger.info('='.repeat(80));

module.exports = logger;
