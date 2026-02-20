const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const API_URL = 'http://localhost:3025';
const FRONTEND_URL = 'http://localhost:3050';

async function runTest() {
    console.log('🚀 Starting Full System Smoke Test...');
    let exitCode = 0;

    // --- Frontend Check ---
    try {
        console.log(`Checking Frontend (${FRONTEND_URL})...`);
        const feRes = await axios.get(FRONTEND_URL);
        if (feRes.status === 200) {
            console.log('✅ Frontend is responsive.');
        } else {
            console.error(`❌ Frontend returned status ${feRes.status}`);
            exitCode = 1;
        }
    } catch (err) {
        console.error(`❌ Frontend check failed: ${err.message}`);
        exitCode = 1;
    }

    // --- Backend & Scheduler Check ---
    try {
        // 1. Login to get token
        console.log('Step 1: Logging in to Backend...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: 'admin@example.com',
            password: 'P@ssw0rd'
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Logged in successfully.');

        // 2. Create a test schedule (every minute)
        console.log('Step 2: Creating a test schedule...');
        const scheduleRes = await axios.post(`${API_URL}/schedules`, {
            name: 'Smoke Test Schedule',
            cronExpression: '* * * * *',
            taskType: 'TEST_TASK',
            targetId: 'smoke-test',
            isActive: 1
        }, { headers });
        const scheduleId = scheduleRes.data.id;
        console.log(`✅ Created schedule with ID: ${scheduleId}`);

        // 3. Verify
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

    } catch (error) {
        console.error('❌ Backend/Scheduler Test FAILED!');
        console.error(error.response ? error.response.data : error.message);
        exitCode = 1;
    }

    if (exitCode === 0) {
        console.log('\n✨ ALL SYSTEMS GO! Smoke Test PASSED! 🎉');
    } else {
        console.log('\n⚠️ Some tests failed. Check logs above.');
    }
    process.exit(exitCode);
}

runTest();
