const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('1. Registering new user...');
        const uniqueParams = Date.now();
        const newUser = {
            username: `testuser_${uniqueParams}`,
            email: `test_${uniqueParams}@example.com`,
            password: 'password123',
            name: 'Test User',
            role: 'student'
        };

        try {
            await axios.post(`${API_URL}/auth/register`, newUser);
            console.log('   User Registered Successfully');
        } catch (e) {
            console.error('   Registration Failed:', e.response?.data || e.message);
            return;
        }

        console.log('2. Logging in as Admin...');
        let adminToken;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                username: 'admin',
                password: 'admin123'
            });
            adminToken = loginRes.data.token;
            console.log('   Admin Logged In');
        } catch (e) {
            console.error('   Admin Login Failed:', e.response?.data || e.message);
            return;
        }

        console.log('3. Fetching All Users...');
        try {
            const usersRes = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const users = usersRes.data;
            console.log(`   Fetched ${users.length} users`);

            const found = users.find(u => u.username === newUser.username);
            if (found) {
                console.log('   SUCCESS: New user found in the list!');
            } else {
                console.error('   FAILURE: New user NOT found in the list!');
                console.log('   Current Users:', users.map(u => u.username));
            }

        } catch (e) {
            console.error('   Fetch Users Failed:', e.response?.data || e.message);
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
};

runTest();
