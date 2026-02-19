const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3025';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3050';

async function runTests() {
  console.log('🚀 Starting ReportManager Smoke Tests...');
  let exitCode = 0;

  // 1. Check Backend Health
  try {
    console.log(`Checking Backend Health: ${BACKEND_URL}/health`);
    const res = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    if (res.status === 200) {
      console.log('✅ Backend is healthy.');
    } else {
      console.error(`❌ Backend returned status ${res.status}`);
      exitCode = 1;
    }
  } catch (err) {
    console.error(`❌ Backend health check failed: ${err.message}`);
    exitCode = 1;
  }

  // 2. Check Frontend Responsive
  try {
    console.log(`Checking Frontend Responsive: ${FRONTEND_URL}`);
    const res = await axios.get(FRONTEND_URL, { timeout: 5000 });
    if (res.status === 200) {
      console.log('✅ Frontend is responsive.');
    } else {
      console.error(`❌ Frontend returned status ${res.status}`);
      exitCode = 1;
    }
  } catch (err) {
    console.error(`❌ Frontend responsive check failed: ${err.message}`);
    exitCode = 1;
  }

  // 3. Test Login Endpoint (Sanity Check)
  try {
    console.log('Checking Auth Endpoint (POST /login)...');
    // Using invalid creds to see if it responds correctly (401)
    await axios.post(`${BACKEND_URL}/login`, {
      email: 'nonexistent@example.com',
      password: 'wrong'
    }, { timeout: 5000 });
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('✅ Auth endpoint is responding (correctly rejected invalid login).');
    } else {
      console.error(`❌ Auth endpoint test failed: ${err.message}`);
      exitCode = 1;
    }
  }

  if (exitCode === 0) {
    console.log('\n✨ All smoke tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed.');
  }

  process.exit(exitCode);
}

runTests();
