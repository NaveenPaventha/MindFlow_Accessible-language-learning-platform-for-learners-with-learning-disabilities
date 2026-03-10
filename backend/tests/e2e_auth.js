// e2e_auth.js
// Tests basic registration and login flows

const API_URL = 'http://127.0.0.1:5002/api';

async function runTest() {
    console.log("=== Testing Auth Endpoints ===");
    const testUsername = `user_${Date.now()}`;

    // 1. Register
    const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: testUsername, 
            email: `${testUsername}@test.com`, 
            password: 'password123', 
            role: 'student' 
        })
    });

    const regData = await regRes.json();
    if (!regData.token) {
        console.error("❌ Registration failed:", regData);
        process.exit(1);
    }
    console.log(`✅ Registration successful for ${testUsername}`);

    // 2. Login
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testUsername, password: 'password123' })
    });

    const loginData = await loginRes.json();
    if (!loginData.token) {
        console.error("❌ Login failed:", loginData);
        process.exit(1);
    }
    console.log("✅ Login successful");
    
    // 3. Get Profile
    const profileRes = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
        }
    });

    const profileData = await profileRes.json();
    if (profileData.username !== testUsername) {
        console.error("❌ Profile fetch failed:", profileData);
        process.exit(1);
    }
    console.log("✅ Protected Profile Route accessible");
    console.log("✅ [E2E Auth] PASSED");
}

runTest().catch(console.error);
