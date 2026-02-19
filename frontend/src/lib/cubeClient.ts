import cubejs from '@cubejs-client/core';

const API_URL = 'http://localhost:4000';

export const cubeClient = cubejs(
    async () => {
        // Get JWT token from localStorage
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token') || '';
        }
        return '';
    },
    {
        apiUrl: `${API_URL}/cubejs-api/v1`
    }
);

export default cubeClient;
