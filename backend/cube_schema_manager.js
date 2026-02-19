const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const SCHEMA_DIR = path.resolve(__dirname, 'schema/cubes');

/**
 * Ensures the schema directory exists
 */
function ensureSchemaDir() {
    if (!fs.existsSync(SCHEMA_DIR)) {
        fs.mkdirSync(SCHEMA_DIR, { recursive: true });
        logger.info(`Created Cube.js schema directory: ${SCHEMA_DIR}`);
    }
}

/**
 * Maps a generic type to a Cube.js dimension type
 */
function mapToCubeType(type) {
    switch (type) {
        case 'number':
            return 'number';
        case 'date':
            return 'time';
        case 'boolean':
            return 'boolean';
        case 'string':
        default:
            return 'string';
    }
}

/**
 * Sanitizes a string to be used as a JavaScript identifier
 */
function sanitizeIdentifier(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[0-9]/, '_$&');
}

/**
 * Generates a Cube.js schema for a given Data Source
 */
async function generateCubeSchema(dataSource) {
    try {
        ensureSchemaDir();

        const cubeName = sanitizeIdentifier(dataSource.name);
        const fileName = `${cubeName}.js`;
        const filePath = path.join(SCHEMA_DIR, fileName);

        let sql = '';
        let dimensions = [];
        let measures = [];

        // Determine SQL and extract columns based on source type
        if (['postgres', 'mysql'].includes(dataSource.type)) {
            const config = typeof dataSource.config === 'string' ? JSON.parse(dataSource.config) : dataSource.config;
            if (config.tableName) {
                sql = `SELECT * FROM ${config.tableName}`;
                // For DB sources, we might not have the columns yet if this is just creation.
                // Ideally, we'd fetch columns here or have them passed in.
                // For now, if we don't have columns, we'll create a minimal cube.
            } else if (config.query) {
                sql = config.query;
            }
        } else if (['excel', 'csv'].includes(dataSource.type)) {
            const metadata = typeof dataSource.fileMetadata === 'string' ? JSON.parse(dataSource.fileMetadata) : dataSource.fileMetadata;
            // For file sources, we rely on detecting columns during preview or using provided metadata.
            // If schema is not present, we can't generate specific dimensions yet.
            sql = `SELECT * FROM ${cubeName}_file`; // Placeholder if we use a specific loader
        }

        // Build dimensions and measures if columns are available
        // Note: In a more advanced version, we'd fetch columns from DB if not provided.
        // For this task, we'll generate basic dimensions and a count measure.

        let dimensionsStr = '';
        if (dataSource.columns && Array.isArray(dataSource.columns)) {
            dataSource.columns.forEach(col => {
                const colName = typeof col === 'string' ? col : col.name;
                const colType = typeof col === 'string' ? 'string' : (col.type || 'string');
                const sanitizedCol = sanitizeIdentifier(colName);
                const cubeType = mapToCubeType(colType);

                dimensionsStr += `
    ${sanitizedCol}: {
      sql: \`\${CUBE}."${colName}"\`,
      type: '${cubeType}'
    },`;
            });
        } else {
            // Default dimension if no columns known
            dimensionsStr = `
    id: {
      sql: \`id\`,
      type: \`number\`,
      primaryKey: true
    },`;
        }

        const cubeContent = `
cube(\`${cubeName}\`, {
  sql: \`${sql}\`,

  measures: {
    count: {
      type: \`count\`,
      drillMembers: []
    }
  },

  dimensions: {${dimensionsStr}
  },

  dataSource: \`default\`
});
`;

        fs.writeFileSync(filePath, cubeContent);
        logger.info(`Generated Cube.js schema file: ${fileName}`);
        return true;
    } catch (error) {
        logger.error(`Error generating Cube.js schema for ${dataSource.name}:`, error);
        return false;
    }
}

/**
 * Removes a Cube.js schema file
 */
function deleteCubeSchema(dataSourceName) {
    try {
        const cubeName = sanitizeIdentifier(dataSourceName);
        const filePath = path.join(SCHEMA_DIR, `${cubeName}.js`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Deleted Cube.js schema file: ${cubeName}.js`);
        }
    } catch (error) {
        logger.error(`Error deleting Cube.js schema for ${dataSourceName}:`, error);
    }
}

module.exports = {
    generateCubeSchema,
    deleteCubeSchema
};
