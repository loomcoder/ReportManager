const knex = require('./db-config');
const xlsx = require('xlsx');
const fs = require('fs');
const logger = require('./logger');

/**
 * Executes report data logic (extracted from server.js for reuse)
 */
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
        const connectionManager = require('./connection_manager');
        const db = await connectionManager.getConnection(dataSource);
        const query = reportConfig.query;
        
        if (!query) {
            throw new Error("No SQL query provided for database source");
        }

        const result = await db.raw(query);
        
        if (dataSource.type === 'postgres') {
            rows = result.rows;
            columns = result.fields.map(f => f.name);
        } else if (dataSource.type === 'mysql') {
            rows = result[0];
            columns = result[1].map(f => f.name);
        }
    } else {
        // Mock data for other types
        columns = ['metric', 'value'];
        rows = [
            { metric: 'Revenue', value: 50000 },
            { metric: 'Cost', value: 30000 },
            { metric: 'Profit', value: 20000 }
        ];
    }

    // Filter Columns
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

    // Apply Aggregation (Omitted full logic for brevity in this utility, but keeping simple SUM if needed)
    // Actually, for AI context, we want raw sample data mostly.
    
    return { columns, rows };
}

/**
 * Fetches data for a given report ID and returns a summary for LLM context.
 */
async function getReportDataForAI(reportId, rowLimit = 50) {
    try {
        const report = await knex('reports').where({ id: reportId }).first();
        if (!report) return null;

        const dataSource = await knex('data_sources').where({ id: report.sourceId }).first();
        if (!dataSource) return null;

        const reportConfig = JSON.parse(report.config);
        const { columns, rows } = await executeReportData(dataSource, reportConfig);

        // Limit rows for context
        const sampleRows = rows.slice(0, rowLimit);
        
        return {
            reportName: report.name,
            columns,
            rows: sampleRows,
            totalRows: rows.length
        };
    } catch (err) {
        logger.error(`Error extracting AI data for report ${reportId}:`, err);
        return null;
    }
}

/**
 * Summarizes JSON data into a text format for LLM context.
 */
function summarizeDataForAI(data) {
    if (!data) return "No data available for this report.";

    let summary = `### DATA FROM REPORT: ${data.reportName}\n`;
    summary += `Total rows in report: ${data.totalRows}\n`;
    summary += `Showing first ${data.rows.length} rows.\n\n`;
    
    // Create Markdown Table
    if (data.columns && data.columns.length > 0) {
        summary += `| ${data.columns.join(' | ')} |\n`;
        summary += `| ${data.columns.map(() => '---').join(' | ')} |\n`;
        
        data.rows.forEach(row => {
            const values = data.columns.map(col => {
                const val = row[col];
                return val === null || val === undefined ? '' : String(val).replace(/\|/g, '\\|');
            });
            summary += `| ${values.join(' | ')} |\n`;
        });
    } else {
        summary += "No columns found.\n";
    }

    return summary;
}

module.exports = {
    getReportDataForAI,
    summarizeDataForAI
};
