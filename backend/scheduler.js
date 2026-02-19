const cron = require('node-cron');
const knex = require('./db-config');
const logger = require('./logger');

class SchedulerManager {
    constructor() {
        this.jobs = new Map();
    }

    async init() {
        logger.info('Initializing scheduler...');
        await this.reloadSchedules();
    }

    async reloadSchedules() {
        logger.info('Reloading active schedules from database...');
        
        // Stop all existing jobs
        for (const [id, job] of this.jobs.entries()) {
            job.stop();
            logger.debug(`Stopped job for schedule ID: ${id}`);
        }
        this.jobs.clear();

        try {
            const activeSchedules = await knex('schedules').where({ isActive: 1 });
            logger.info(`Found ${activeSchedules.length} active schedules.`);

            for (const schedule of activeSchedules) {
                this.scheduleTask(schedule);
            }
        } catch (error) {
            logger.error('Error loading schedules from database:', error);
        }
    }

    scheduleTask(schedule) {
        const { id, name, cronExpression, taskType, targetId } = schedule;

        if (!cron.validate(cronExpression)) {
            logger.error(`Invalid cron expression for schedule ${name} (ID: ${id}): ${cronExpression}`);
            return;
        }

        const job = cron.schedule(cronExpression, async () => {
            logger.info(`Executing scheduled task: ${name} (Type: ${taskType}, Target: ${targetId})`);
            try {
                await this.executeTask(schedule);
                logger.info(`Task executed successfully: ${name}`);
            } catch (error) {
                logger.error(`Error executing task ${name}:`, error);
            }
        });

        this.jobs.set(id.toString(), job);
        logger.debug(`Scheduled task: ${name} with expression: ${cronExpression}`);
    }

    async executeTask(schedule) {
        const { taskType, targetId, name } = schedule;

        switch (taskType) {
            case 'REPORT_GENERATION':
                await this.generateReport(targetId);
                break;
            case 'ALERT_CHECK':
                await this.checkAlert(targetId, name);
                break;
            case 'TEST_TASK':
                logger.info(`[TEST_TASK] Heartbeat for ${name} at ${new Date().toISOString()}`);
                break;
            default:
                logger.warn(`Unknown task type: ${taskType}`);
        }
    }

    async generateReport(reportId) {
        logger.info(`Generating report for ID: ${reportId}`);
        // This is a placeholder for actual report generation logic
        // In a real scenario, this would call the executeReportData helper
        // and perhaps save the result to a file or send it via email.
        const report = await knex('reports').where({ id: reportId }).first();
        if (!report) {
            throw new Error(`Report with ID ${reportId} not found`);
        }
        logger.info(`Successfully processed report: ${report.name}`);
    }

    async checkAlert(alertId, name) {
        logger.info(`Checking alert: ${name} (Target: ${alertId})`);
        // Placeholder for alert logic
    }

    // Call this whenever a schedule is added, updated, or deleted
    async notifyChange() {
        logger.info('Scheduler notified of changes, reloading...');
        await this.reloadSchedules();
    }
}

const schedulerManager = new SchedulerManager();
module.exports = schedulerManager;
