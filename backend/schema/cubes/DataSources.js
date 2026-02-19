cube('DataSources', {
    sql: `SELECT * FROM data_sources`,

    measures: {
        count: {
            type: 'count',
            title: 'Total Data Sources'
        },

        activeCount: {
            type: 'count',
            title: 'Active Data Sources',
            filters: [
                { sql: `${CUBE}.status IN ('connected', 'active')` }
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
            title: 'Data Source Name'
        },

        type: {
            sql: 'type',
            type: 'string',
            title: 'Type'
        },

        connectionType: {
            sql: 'connectionType',
            type: 'string',
            title: 'Connection Type'
        },

        status: {
            sql: 'status',
            type: 'string'
        },

        config: {
            sql: 'config',
            type: 'string'
        },

        fileMetadata: {
            sql: 'fileMetadata',
            type: 'string'
        },

        createdAt: {
            sql: 'createdAt',
            type: 'time'
        },

        updatedAt: {
            sql: 'updatedAt',
            type: 'time'
        }
    },

    segments: {
        postgres: {
            sql: `${CUBE}.type = 'postgres'`
        },

        excel: {
            sql: `${CUBE}.type = 'excel'`
        },

        mysql: {
            sql: `${CUBE}.type = 'mysql'`
        },

        active: {
            sql: `${CUBE}.status IN ('connected', 'active')`
        }
    },

    preAggregations: {
        typeBreakdown: {
            measures: [CUBE.count],
            dimensions: [CUBE.type]
        }
    }
});
