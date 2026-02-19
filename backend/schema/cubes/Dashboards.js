cube('Dashboards', {
    sql: `SELECT * FROM dashboards`,

    measures: {
        count: {
            type: 'count',
            title: 'Total Dashboards'
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
            title: 'Dashboard Name'
        },

        description: {
            sql: 'description',
            type: 'string'
        },

        layout: {
            sql: 'layout',
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

    // preAggregations: {
    //     main: {
    //         measures: [CUBE.count],
    //         timeDimension: CUBE.createdAt,
    //         granularity: 'day'
    //     }
    // }
});
