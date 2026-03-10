const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
const testResults = [];

// Helper function to log test results
const logTest = (testName, passed, details = '') => {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status}: ${testName}`);
    if (details) console.log(`   └─ ${details}`);
    testResults.push({ testName, passed, details });
};

const runComprehensiveTests = async () => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  COMPREHENSIVE BACKEND API TEST SUITE');
    console.log('═══════════════════════════════════════════════════════════\n');

    let studentToken, parentToken, adminToken, testUserId;
    const timestamp = Date.now();
    const testStudent = {
        username: `test_student_${timestamp}`,
        email: `student_${timestamp}@test.com`,
        password: 'TestPass123',
        role: 'student'
    };
    const testParent = {
        username: `test_parent_${timestamp}`,
        email: `parent_${timestamp}@test.com`,
        password: 'TestPass123',
        role: 'parent'
    };

    try {
        // ─────────────────────────────────────────────────────────────
        // TEST 1: AUTHENTICATION ENDPOINTS
        // ─────────────────────────────────────────────────────────────
        console.log('\n📋 TEST SUITE 1: AUTHENTICATION');
        console.log('─────────────────────────────────────────────────────────\n');

        // Test 1.1: Register Student
        try {
            const response = await axios.post(`${API_URL}/auth/register`, testStudent);
            logTest('1.1 - Register Student User', 
                response.status === 201 && response.data.token, 
                `User: ${testStudent.username}`);
            studentToken = response.data.token;
            testUserId = response.data._id;
        } catch (e) {
            logTest('1.1 - Register Student User', false, e.response?.data?.message || e.message);
        }

        // Test 1.2: Register Parent
        try {
            const response = await axios.post(`${API_URL}/auth/register`, testParent);
            logTest('1.2 - Register Parent User', 
                response.status === 201 && response.data.token, 
                `User: ${testParent.username}`);
            parentToken = response.data.token;
        } catch (e) {
            logTest('1.2 - Register Parent User', false, e.response?.data?.message || e.message);
        }

        // Test 1.3: Login with Valid Credentials
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username: testStudent.username,
                password: testStudent.password
            });
            logTest('1.3 - Login with Valid Credentials', 
                response.status === 200 && response.data.token, 
                `Role: ${response.data.role}`);
        } catch (e) {
            logTest('1.3 - Login with Valid Credentials', false, e.response?.data?.message || e.message);
        }

        // Test 1.4: Login with Invalid Password
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username: testStudent.username,
                password: 'WrongPassword123'
            });
            logTest('1.4 - Login with Invalid Password (Should Fail)', false, 'Should have returned 401');
        } catch (e) {
            logTest('1.4 - Login with Invalid Password (Should Fail)', 
                e.response?.status === 401, 
                e.response?.data?.message);
        }

        // Test 1.5: Register Duplicate Email
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username: `duplicate_user_${timestamp}`,
                email: testStudent.email, // Duplicate email
                password: 'TestPass123',
                role: 'student'
            });
            logTest('1.5 - Register Duplicate Email (Should Fail)', false, 'Should have returned 400');
        } catch (e) {
            logTest('1.5 - Register Duplicate Email (Should Fail)', 
                e.response?.status === 400, 
                e.response?.data?.message);
        }

        // Test 1.6: Get User Profile with Valid Token
        if (studentToken) {
            try {
                const response = await axios.get(`${API_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${studentToken}` }
                });
                logTest('1.6 - Get User Profile', 
                    response.status === 200 && response.data.username === testStudent.username, 
                    `Username: ${response.data.username}`);
            } catch (e) {
                logTest('1.6 - Get User Profile', false, e.response?.data?.message || e.message);
            }
        }

        // Test 1.7: Get User Profile with Invalid Token
        try {
            const response = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: 'Bearer invalidtoken123' }
            });
            logTest('1.7 - Get Profile with Invalid Token (Should Fail)', false, 'Should have returned 401');
        } catch (e) {
            logTest('1.7 - Get Profile with Invalid Token (Should Fail)', 
                e.response?.status === 401, 
                e.response?.data?.message);
        }

        // ─────────────────────────────────────────────────────────────
        // TEST 2: COURSE ENDPOINTS
        // ─────────────────────────────────────────────────────────────
        console.log('\n\n📚 TEST SUITE 2: COURSE MANAGEMENT');
        console.log('─────────────────────────────────────────────────────────\n');

        // Test 2.1: Get All Courses (Public)
        try {
            const response = await axios.get(`${API_URL}/courses`);
            logTest('2.1 - Get All Courses', 
                response.status === 200 && Array.isArray(response.data), 
                `Courses found: ${response.data.length}`);
        } catch (e) {
            logTest('2.1 - Get All Courses', false, e.message);
        }

        // Test 2.2: Get Courses by Category
        try {
            const response = await axios.get(`${API_URL}/courses?category=beginner`);
            logTest('2.2 - Get Courses by Category', 
                response.status === 200 && Array.isArray(response.data), 
                `Beginner courses: ${response.data.length}`);
        } catch (e) {
            logTest('2.2 - Get Courses by Category', false, e.message);
        }

        // ─────────────────────────────────────────────────────────────
        // TEST 3: USER ROUTES
        // ─────────────────────────────────────────────────────────────
        console.log('\n\n👥 TEST SUITE 3: USER MANAGEMENT');
        console.log('─────────────────────────────────────────────────────────\n');

        // Test 3.1: Get All Users with Valid Token
        if (studentToken) {
            try {
                const response = await axios.get(`${API_URL}/users`, {
                    headers: { Authorization: `Bearer ${studentToken}` }
                });
                logTest('3.1 - Get All Users', 
                    response.status === 200 && Array.isArray(response.data), 
                    `Users found: ${response.data.length}`);
            } catch (e) {
                logTest('3.1 - Get All Users', false, e.response?.data?.message || e.message);
            }
        }

        // Test 3.2: Get All Users without Token (Should Fail)
        try {
            const response = await axios.get(`${API_URL}/users`);
            logTest('3.2 - Get Users without Token (Should Fail)', false, 'Should have returned 401');
        } catch (e) {
            logTest('3.2 - Get Users without Token (Should Fail)', 
                e.response?.status === 401, 
                e.response?.data?.message);
        }

        // ─────────────────────────────────────────────────────────────
        // TEST 4: ERROR HANDLING & EDGE CASES
        // ─────────────────────────────────────────────────────────────
        console.log('\n\n⚠️  TEST SUITE 4: ERROR HANDLING & EDGE CASES');
        console.log('─────────────────────────────────────────────────────────\n');

        // Test 4.1: Invalid Endpoint
        try {
            const response = await axios.get(`${API_URL}/invalid-endpoint`);
            logTest('4.1 - Invalid Endpoint (Should Fail)', false, 'Should have returned 404');
        } catch (e) {
            logTest('4.1 - Invalid Endpoint (Should Fail)', 
                e.response?.status === 404, 
                'Route not found');
        }

        // Test 4.2: Missing Required Fields in Register
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username: 'testuser'
                // Missing email and password
            });
            logTest('4.2 - Register with Missing Fields (Should Fail)', false, 'Should have returned 400');
        } catch (e) {
            logTest('4.2 - Register with Missing Fields (Should Fail)', 
                e.response?.status === 400 || e.response?.status === 500, 
                e.response?.data?.message || 'Validation error');
        }

        // Test 4.3: Register with Empty Password
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username: `empty_pass_${timestamp}`,
                email: `emptypass_${timestamp}@test.com`,
                password: '', // Empty password
                role: 'student'
            });
            logTest('4.3 - Register with Empty Password (Should Fail)', 
                response.status !== 201, 
                'Should validate password');
        } catch (e) {
            logTest('4.3 - Register with Empty Password (Should Fail)', true, 'Correctly rejected');
        }

        // ─────────────────────────────────────────────────────────────
        // TEST 5: DATA PERSISTENCE
        // ─────────────────────────────────────────────────────────────
        console.log('\n\n💾 TEST SUITE 5: DATA PERSISTENCE');
        console.log('─────────────────────────────────────────────────────────\n');

        // Test 5.1: Verify Registered User Exists
        if (studentToken) {
            try {
                const response = await axios.get(`${API_URL}/users`, {
                    headers: { Authorization: `Bearer ${studentToken}` }
                });
                const userExists = response.data.some(u => u.username === testStudent.username);
                logTest('5.1 - Verify Registered User Exists in Database', 
                    userExists, 
                    `Found user: ${testStudent.username}`);
            } catch (e) {
                logTest('5.1 - Verify Registered User Exists in Database', false, e.message);
            }
        }

        // Test 5.2: User Role Persistence
        if (studentToken) {
            try {
                const response = await axios.get(`${API_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${studentToken}` }
                });
                const hasCorrectRole = response.data.role === 'student';
                logTest('5.2 - User Role Persistence', 
                    hasCorrectRole, 
                    `Role: ${response.data.role}`);
            } catch (e) {
                logTest('5.2 - User Role Persistence', false, e.message);
            }
        }

        // Test 5.3: Gamification Data Initialization
        if (studentToken) {
            try {
                const response = await axios.get(`${API_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${studentToken}` }
                });
                const hasGamification = response.data.gamification && response.data.gamification.xp !== undefined;
                logTest('5.3 - Gamification Data Initialization', 
                    hasGamification, 
                    `XP: ${response.data.gamification?.xp || 0}, Level: ${response.data.gamification?.level || 1}`);
            } catch (e) {
                logTest('5.3 - Gamification Data Initialization', false, e.message);
            }
        }

    } catch (error) {
        console.error('Test Suite Error:', error.message);
    }

    // ─────────────────────────────────────────────────────────────
    // GENERATE TEST REPORT
    // ─────────────────────────────────────────────────────────────
    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('  TEST SUMMARY REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');

    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    const total = testResults.length;
    const passPercentage = ((passed / total) * 100).toFixed(2);

    console.log(`Total Tests: ${total}`);
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`Pass Rate: ${passPercentage}%\n`);

    if (failed > 0) {
        console.log('Failed Tests:');
        testResults.filter(r => !r.passed).forEach(r => {
            console.log(`  • ${r.testName}`);
            if (r.details) console.log(`    └─ ${r.details}`);
        });
    } else {
        console.log('🎉 All tests passed!');
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
};

// Run tests
runComprehensiveTests();
