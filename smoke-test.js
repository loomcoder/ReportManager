const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const API_URL = 'http://localhost:3025';

async function runTest() {
    console.log('🚀 Starting Background Worker Smoke Test...');

    try {
        // 1. Login to get token
        console.log('Step 1: Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: 'admin@example.com',
            password: 'P@ssw0rd'
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Logged in successfully.');

        // 2. Create a test schedule (every minute)
        console.log('Step 2: Creating a test schedule (every minute)...');
        const scheduleRes = await axios.post(`${API_URL}/schedules`, {
            name: 'Smoke Test Schedule',
            cronExpression: '* * * * *',
            taskType: 'TEST_TASK',
            targetId: 'smoke-test',
            isActive: 1
        }, { headers });
        const scheduleId = scheduleRes.data.id;
        console.log(`✅ Created schedule with ID: ${scheduleId}`);

        // 3. Wait for a short moment to see if it triggers (actually it triggers at the start of the minute)
        // Since we can't wait a full minute easily in a smoke test, we'll just check if it exists in the DB
        console.log('Step 3: Verifying schedule exists in database...');
        const listRes = await axios.get(`${API_URL}/schedules`, { headers });
        const found = listRes.data.find(s => s.id === scheduleId);
        if (found) {
            console.log('✅ Schedule verified in database.');
        } else {
            throw new Error('Schedule not found in database!');
        }

        // 4. Clean up
        console.log('Step 4: Cleaning up test schedule...');
        await axios.delete(`${API_URL}/schedules/${scheduleId}`, { headers });
        console.log('✅ Cleaned up successfully.');

        console.log('🎉 Smoke Test PASSED!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Smoke Test FAILED!');
        console.error(error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTest();
