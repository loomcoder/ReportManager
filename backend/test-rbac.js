#!/usr/bin/env node

/**
 * RBAC Test Script
 * Tests the Role-Based Access Control system with various user roles and permissions
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3025';

// Test users
const testUsers = [
    { email: 'admin@example.com', password: 'P@ssw0rd', expectedRole: 'ADMIN', name: 'Admin' },
    { email: 'user@example.com', password: 'P@ssw0rd', expectedRole: 'USER', name: 'Regular User' },
    { email: 'manager@example.com', password: 'P@ssw0rd', expectedRole: 'MANAGER', name: 'Manager' },
    { email: 'analyst@example.com', password: 'P@ssw0rd', expectedRole: 'ANALYST', name: 'Analyst' },
    { email: 'viewer@example.com', password: 'P@ssw0rd', expectedRole: 'VIEWER', name: 'Viewer' },
    { email: 'multi.role@example.com', password: 'P@ssw0rd', expectedRole: 'MANAGER+ANALYST', name: 'Multi-Role' },
    { email: 'no.permissions@example.com', password: 'P@ssw0rd', expectedRole: 'NONE', name: 'No Permissions' },
    { email: 'custom@example.com', password: 'P@ssw0rd', expectedRole: 'USER', name: 'Custom User' }
];

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

let passedTests = 0;
let failedTests = 0;

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✓ ${message}`, colors.green);
    passedTests++;
}

function logError(message) {
    log(`✗ ${message}`, colors.red);
    failedTests++;
}

function logInfo(message) {
    log(`ℹ ${message}`, colors.cyan);
}

function logSection(message) {
    log(`\n${colors.bold}${message}${colors.reset}`, colors.blue);
}

async function testLogin(user) {
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: user.email,
            password: user.password
        });

        if (response.data.token && response.data.user) {
            logSuccess(`Login successful for ${user.name} (${user.email})`);
            logInfo(`  Roles: ${response.data.user.roles.join(', ') || 'None'}`);
            logInfo(`  Permissions: ${response.data.user.permissions.length} permissions`);
            return { token: response.data.token, user: response.data.user };
        } else {
            logError(`Login failed for ${user.name}: No token or user data`);
            return null;
        }
    } catch (error) {
        logError(`Login failed for ${user.name}: ${error.message}`);
        return null;
    }
}

async function testGetProfile(token, userName) {
    try {
        const response = await axios.get(`${BASE_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.email) {
            logSuccess(`Profile retrieval successful for ${userName}`);
            return true;
        } else {
            logError(`Profile retrieval failed for ${userName}: No user data`);
            return false;
        }
    } catch (error) {
        logError(`Profile retrieval failed for ${userName}: ${error.message}`);
        return false;
    }
}

async function testAdminAccess(token, userName, shouldHaveAccess) {
    try {
        const response = await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (shouldHaveAccess) {
            logSuccess(`${userName} has admin access (as expected)`);
            logInfo(`  Retrieved ${response.data.length} users`);
            return true;
        } else {
            logError(`${userName} has admin access (should NOT have access)`);
            return false;
        }
    } catch (error) {
        if (error.response && error.response.status === 403) {
            if (!shouldHaveAccess) {
                logSuccess(`${userName} denied admin access (as expected)`);
                return true;
            } else {
                logError(`${userName} denied admin access (should have access)`);
                return false;
            }
        } else {
            logError(`Admin access test failed for ${userName}: ${error.message}`);
            return false;
        }
    }
}

async function testReportsAccess(token, userName, shouldHaveAccess) {
    try {
        const response = await axios.get(`${BASE_URL}/reports`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (shouldHaveAccess) {
            logSuccess(`${userName} can access reports (as expected)`);
            logInfo(`  Retrieved ${response.data.length} reports`);
            return true;
        } else {
            logError(`${userName} can access reports (should NOT have access)`);
            return false;
        }
    } catch (error) {
        if (error.response && error.response.status === 403) {
            if (!shouldHaveAccess) {
                logSuccess(`${userName} denied reports access (as expected)`);
                return true;
            } else {
                logError(`${userName} denied reports access (should have access)`);
                return false;
            }
        } else {
            logError(`Reports access test failed for ${userName}: ${error.message}`);
            return false;
        }
    }
}

async function testRolesAccess(token, userName, shouldHaveAccess) {
    try {
        const response = await axios.get(`${BASE_URL}/roles`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (shouldHaveAccess) {
            logSuccess(`${userName} can access roles (as expected)`);
            logInfo(`  Retrieved ${response.data.length} roles`);
            return true;
        } else {
            logError(`${userName} can access roles (should NOT have access)`);
            return false;
        }
    } catch (error) {
        if (error.response && error.response.status === 403) {
            if (!shouldHaveAccess) {
                logSuccess(`${userName} denied roles access (as expected)`);
                return true;
            } else {
                logError(`${userName} denied roles access (should have access)`);
                return false;
            }
        } else {
            logError(`Roles access test failed for ${userName}: ${error.message}`);
            return false;
        }
    }
}

async function runTests() {
    log(`${colors.bold}${colors.blue}========================================${colors.reset}`);
    log(`${colors.bold}${colors.blue}   RBAC System Test Suite${colors.reset}`);
    log(`${colors.bold}${colors.blue}========================================${colors.reset}\n`);

    logInfo(`Testing ${testUsers.length} users with various roles and permissions\n`);

    // Test 1: Authentication
    logSection('TEST 1: Authentication');
    const userTokens = [];
    for (const user of testUsers) {
        const result = await testLogin(user);
        if (result) {
            userTokens.push({ ...user, token: result.token, userData: result.user });
        }
    }

    // Test 2: Profile Retrieval
    logSection('TEST 2: Profile Retrieval');
    for (const user of userTokens) {
        await testGetProfile(user.token, user.name);
    }

    // Test 3: Admin Access Control
    logSection('TEST 3: Admin Access Control');
    for (const user of userTokens) {
        const shouldHaveAccess = user.userData.roles.includes('ADMIN');
        await testAdminAccess(user.token, user.name, shouldHaveAccess);
    }

    // Test 4: Reports Access
    logSection('TEST 4: Reports Access');
    for (const user of userTokens) {
        const shouldHaveAccess = user.userData.permissions.includes('VIEW_REPORTS');
        await testReportsAccess(user.token, user.name, shouldHaveAccess);
    }

    // Test 5: Roles Management Access
    logSection('TEST 5: Roles Management Access');
    for (const user of userTokens) {
        const shouldHaveAccess = user.userData.permissions.includes('MANAGE_ROLES');
        await testRolesAccess(user.token, user.name, shouldHaveAccess);
    }

    // Summary
    logSection('TEST SUMMARY');
    const total = passedTests + failedTests;
    log(`Total Tests: ${total}`);
    logSuccess(`Passed: ${passedTests}`);
    if (failedTests > 0) {
        logError(`Failed: ${failedTests}`);
    } else {
        log(`Failed: ${failedTests}`, colors.green);
    }

    const successRate = ((passedTests / total) * 100).toFixed(2);
    log(`\nSuccess Rate: ${successRate}%`, successRate === '100.00' ? colors.green : colors.yellow);

    if (failedTests === 0) {
        log(`\n${colors.bold}${colors.green}🎉 All tests passed! RBAC system is working correctly.${colors.reset}`);
    } else {
        log(`\n${colors.bold}${colors.yellow}⚠️  Some tests failed. Please review the errors above.${colors.reset}`);
    }

    process.exit(failedTests > 0 ? 1 : 0);
}

// Check if backend is running
async function checkBackend() {
    try {
        await axios.get(`${BASE_URL}/reports`);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            logError('Backend server is not running!');
            logInfo('Please start the backend server first:');
            logInfo('  cd backend && npm start');
            process.exit(1);
        }
    }
}

// Main execution
(async () => {
    await checkBackend();
    await runTests();
})();
