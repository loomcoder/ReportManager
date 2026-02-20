cube('Reports', {
    sql: `SELECT * FROM reports`,

    joins: {
        DataSources: {
            sql: `${CUBE}.sourceId = DataSources.id`,
            relationship: 'belongsTo'
        }
    },

    measures: {
        count: {
            type: 'count',
            title: 'Total Reports'
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
            title: 'Report Name'
        },

        description: {
            sql: 'description',
            type: 'string'
        },

        sourceId: {
            sql: 'sourceId',
            type: 'number'
        },

        config: {
            sql: 'config',
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

    preAggregations: {
        // main: {
        //     measures: [CUBE.count],
        //     timeDimension: CUBE.createdAt,
        //     granularity: 'day'
        // }
    }
});
