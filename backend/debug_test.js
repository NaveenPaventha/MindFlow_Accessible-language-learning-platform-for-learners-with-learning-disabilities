const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

const debugTest = async () => {
    console.log('🔍 BACKEND CONNECTIVITY DEBUG\n');
    console.log(`Testing: ${API_URL}\n`);

    // Test 1: Basic connectivity
    try {
        console.log('1. Testing root endpoint (GET http://localhost:5001/)...');
        const response = await axios.get('http://localhost:5001/');
        console.log('   ✓ Root endpoint works');
        console.log(`   Response: ${response.data}\n`);
    } catch (e) {
        console.log(`   ✗ Failed: ${e.message}\n`);
    }

    // Test 2: Register endpoint with detailed error
    try {
        console.log('2. Testing register endpoint...');
        const testData = {
            username: `test_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            role: 'student'
        };
        console.log('   Sending:', JSON.stringify(testData, null, 2));
        const response = await axios.post(`${API_URL}/auth/register`, testData, {
            timeout: 5000
        });
        console.log('   ✓ Registration successful');
        console.log(`   Response status: ${response.status}`);
        console.log(`   Response data: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (e) {
        console.log(`   ✗ Failed`);
        console.log(`   Status: ${e.response?.status || 'No response'}`);
        console.log(`   Error: ${e.response?.data?.message || e.message}`);
        if (e.response?.data) {
            console.log(`   Full response: ${JSON.stringify(e.response.data, null, 2)}`);
        }
        console.log();
    }

    // Test 3: Get courses
    try {
        console.log('3. Testing get courses endpoint...');
        const response = await axios.get(`${API_URL}/courses`, {
            timeout: 5000
        });
        console.log('   ✓ Courses endpoint works');
        console.log(`   Courses count: ${response.data.length}`);
        if (response.data.length > 0) {
            console.log(`   First course: ${JSON.stringify(response.data[0], null, 2)}`);
        }
        console.log();
    } catch (e) {
        console.log(`   ✗ Failed`);
        console.log(`   Status: ${e.response?.status || 'No response'}`);
        console.log(`   Error: ${e.response?.data?.message || e.message}\n`);
    }
};

debugTest();
