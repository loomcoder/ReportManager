console.log('Loading Users cube definition...');
cube('Users', {
    sql: `SELECT * FROM users`,

    measures: {
        count: {
            type: 'count',
            title: 'Total Users'
        },

        adminCount: {
            type: 'count',
            title: 'Admin Users',
            filters: [
                { sql: `${CUBE}.roles LIKE '%ADMIN%'` }
            ]
        },

        regularUserCount: {
            type: 'count',
            title: 'Regular Users',
            filters: [
                { sql: `${CUBE}.roles LIKE '%USER%' AND ${CUBE}.roles NOT LIKE '%ADMIN%'` }
            ]
        },

        managerCount: {
            type: 'count',
            title: 'Managers',
            filters: [
                { sql: `${CUBE}.roles LIKE '%MANAGER%'` }
            ]
        }
    },

    dimensions: {
        id: {
            sql: 'id',
            type: 'number',
            primaryKey: true
        },

        email: {
            sql: 'email',
            type: 'string'
        },

        firstName: {
            sql: 'firstName',
            type: 'string',
            title: 'First Name'
        },

        lastName: {
            sql: 'lastName',
            type: 'string',
            title: 'Last Name'
        },

        fullName: {
            sql: `${CUBE}.firstName || ' ' || ${CUBE}.lastName`,
            type: 'string',
            title: 'Full Name'
        },

        roles: {
            sql: 'roles',
            type: 'string'
        },

        permissions: {
            sql: 'permissions',
            type: 'string'
        },

        createdAt: {
            sql: 'createdAt',
            type: 'time'
        }
    },

    segments: {
        admins: {
            sql: `${CUBE}.roles LIKE '%ADMIN%'`
        },

        regularUsers: {
            sql: `${CUBE}.roles LIKE '%USER%' AND ${CUBE}.roles NOT LIKE '%ADMIN%'`
        },

        managers: {
            sql: `${CUBE}.roles LIKE '%MANAGER%'`
        }
    },

    // preAggregations: {
    //     roleBreakdown: {
    //         measures: [CUBE.count, CUBE.adminCount, CUBE.regularUserCount, CUBE.managerCount],
    //         timeDimension: CUBE.createdAt,
    //         granularity: 'day'
    //     }
    // }
});
