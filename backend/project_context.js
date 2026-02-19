const fs = require('fs');
const path = require('path');

// Component mappings: Keywords -> File Patterns
const COMPONENTS = {
    reports: {
        keywords: ['report', 'chart', 'visualization', 'graph', 'axis', 'dimension', 'measure'],
        paths: [
            'frontend/src/app/reports',
            'frontend/src/components/reports',
            'backend/schema/cubes/Reports.js'
        ]
    },
    dashboards: {
        keywords: ['dashboard', 'layout', 'widget', 'grid'],
        paths: [
            'frontend/src/app/dashboards',
            'backend/schema/cubes/Dashboards.js'
        ]
    },
    datasources: {
        keywords: ['data', 'source', 'connection', 'database', 'sql', 'upload', 'csv', 'excel', 'connector'],
        paths: [
            'frontend/src/app/data-sources',
            'frontend/src/components/data-sources',
            'backend/schema/cubes/DataSources.js'
        ]
    },
    ai: {
        keywords: ['ai', 'llm', 'model', 'chat', 'bot', 'intelligence', 'insight', 'ollama', 'generate'],
        paths: [
            'frontend/src/app/ai-insights',
            'frontend/src/app/llm',
            'frontend/src/app/chat'
        ]
    },
    admin: {
        keywords: ['admin', 'user', 'role', 'permission', 'auth', 'login', 'register', 'profile'],
        paths: [
            'frontend/src/app/admin',
            'frontend/src/context/auth-context.tsx',
            'backend/schema/cubes/Users.js'
        ]
    }
};

// Core files included in EVERY request
const CORE_FILES = [
    'backend/server.js',
    'backend/database.js',
    'backend/db-config.js',
    'frontend/src/lib/api.ts',
    'frontend/src/types/index.ts',
    'backend/schema/cubes/data_sources.yml'
];

const CONFIG = {
    projectRoot: path.resolve(__dirname, '../'),
    maxFileSize: 100 * 1024,
    allowedExtensions: ['.js', '.ts', '.tsx', '.jsx', '.css', '.sql', '.yaml', '.yml']
};

/**
 * Generates context relevant to the specific user query.
 * @param {string} query The user's question or message.
 * @returns {string} The formatted context string.
 */
function getProjectContext(query = "") {
    let context = "# Project Context\n\n";
    context += "The following source code is relevant to your query:\n\n";

    const includedPaths = new Set();
    const queryLower = query.toLowerCase();

    // 1. Identify relevant components
    const relevantComponents = [];
    Object.keys(COMPONENTS).forEach(key => {
        const component = COMPONENTS[key];
        if (component.keywords.some(k => queryLower.includes(k))) {
            relevantComponents.push(key);
        }
    });

    // 2. Collect files
    // Always add Core files
    CORE_FILES.forEach(relPath => {
        const fullPath = path.join(CONFIG.projectRoot, relPath);
        if (fs.existsSync(fullPath)) {
            includedPaths.add(fullPath);
        }
    });

    // Add component files
    relevantComponents.forEach(key => {
        COMPONENTS[key].paths.forEach(relPath => {
            const fullPath = path.join(CONFIG.projectRoot, relPath);
            if (fs.existsSync(fullPath)) {
                // If directory, get all files recursively
                if (fs.statSync(fullPath).isDirectory()) {
                    const files = getAllFiles(fullPath);
                    files.forEach(f => includedPaths.add(f));
                } else {
                    includedPaths.add(fullPath);
                }
            }
        });
    });

    // 3. Read and format content
    for (const filePath of includedPaths) {
        if (!shouldIncludeFile(filePath)) continue;

        const relativePath = path.relative(CONFIG.projectRoot, filePath);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            context += `## File: ${relativePath}\n`;
            context += "```" + getFileLanguage(filePath) + "\n";
            context += content + "\n";
            context += "```\n\n";
        } catch (err) {
            // Ignore read errors
        }
    }

    return context;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(function (file) {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        });
    } catch (e) { } // Ignore missing dirs
    return arrayOfFiles;
}

function shouldIncludeFile(fullPath) {
    const ext = path.extname(fullPath).toLowerCase();
    if (!CONFIG.allowedExtensions.includes(ext)) return false;
    try {
        if (fs.statSync(fullPath).size > CONFIG.maxFileSize) return false;
    } catch (e) { return false; }
    return true;
}

function getFileLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.js': return 'javascript';
        case '.ts': case '.tsx': return 'typescript';
        case '.sql': return 'sql';
        case '.yaml': case '.yml': return 'yaml';
        default: return '';
    }
}

module.exports = { getProjectContext };
