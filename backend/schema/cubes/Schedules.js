cube('Schedules', {
    sql: `SELECT * FROM schedules`,

    measures: {
        count: {
            type: 'count',
            title: 'Total Schedules'
        },

        activeCount: {
            type: 'count',
            title: 'Active Schedules',
            filters: [
                { sql: `${CUBE}.isActive = 1` }
            ]
        },

        inactiveCount: {
            type: 'count',
            title: 'Inactive Schedules',
            filters: [
                { sql: `${CUBE}.isActive = 0` }
            ]
        }
    },

    dimensions: {
        id: {
            sql: 'id',
            type: 'number',
            primaryKey: true
        },

        name: {
            sql: 'name',
            type: 'string',
            title: 'Schedule Name'
        },

        cronExpression: {
            sql: 'cronExpression',
            type: 'string',
            title: 'Cron Expression'
        },

        taskType: {
            sql: 'taskType',
            type: 'string',
            title: 'Task Type'
        },

        targetId: {
            sql: 'targetId',
            type: 'string'
        },

        isActive: {
            sql: 'isActive',
            type: 'number',
            title: 'Active Status'
        },

        createdAt: {
            sql: 'createdAt',
            type: 'time'
        }
    },

    segments: {
        active: {
            sql: `${CUBE}.isActive = 1`
        },

        inactive: {
            sql: `${CUBE}.isActive = 0`
        }
    },

    preAggregations: {
        taskTypeBreakdown: {
            measures: [CUBE.count, CUBE.activeCount],
            dimensions: [CUBE.taskType]
        }
    }
});
