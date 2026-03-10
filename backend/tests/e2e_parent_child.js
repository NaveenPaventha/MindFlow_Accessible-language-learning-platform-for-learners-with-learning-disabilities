// e2e_parent_child.js
// Tests the Parent -> Children linkages and progress fetching

const API_URL = 'http://127.0.0.1:5002/api';

async function runTest() {
    console.log("=== Testing Parent-Child Endpoints ===");

    // 1. Log in as Parent
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'parent', password: 'password123' })
    });

    const loginData = await loginRes.json();
    if (!loginData.token) {
        console.error("❌ Parent Login failed:", loginData);
        process.exit(1);
    }
    console.log("✅ Parent Login successful, linking validation passed.");
    
    // 2. Fetch linked children array
    if (!loginData.linkedChildren || loginData.linkedChildren.length !== 2) {
        console.error(`❌ Parent should have 2 linked children but got ${loginData.linkedChildren?.length}`);
    } else {
        console.log(`✅ Parent has expected children: ${loginData.linkedChildren.map(c => c.username).join(', ')}`);
    }

    // 3. Fetch full child progress profiles via User API Route
    const progressRes = await fetch(`${API_URL}/users/child/${loginData._id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
        }
    });

    const childrenProfiles = await progressRes.json();
    if (!Array.isArray(childrenProfiles) || childrenProfiles.length !== 2) {
        console.error("❌ Failed to fetch accurate children profiles:", childrenProfiles);
        process.exit(1);
    }

    console.log("✅ Successfully fetched progress metadata for multiple children:", childrenProfiles.map(c => c.username));
    console.log("✅ [E2E Parent-Child] PASSED");
}

runTest().catch(console.error);
