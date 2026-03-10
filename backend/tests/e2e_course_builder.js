// e2e_course_builder.js
// Tests the Course creation flow for a Teacher

const API_URL = 'http://127.0.0.1:5002/api';

async function runTest() {
    console.log("=== Testing Teacher Course Builder Endpoints ===");

    // 1. Log in as Teacher
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'teacher', password: 'password123' })
    });

    const loginData = await loginRes.json();
    if (!loginData.token) {
        console.error("❌ Teacher Login failed:", loginData);
        process.exit(1);
    }
    console.log("✅ Teacher Login successful");

    // 2. Create Course
    const coursePayload = {
        title: "Test Course via E2E",
        description: "Automated test course",
        authorId: loginData._id,
        lessons: [{ id: "l1", type: "text", content: "Hello world" }],
        quiz: [{ id: "q1", type: "multiple_choice", text: "What is this?", options: ["Test", "Prod"], correctAnswer: "Test" }]
    };

    const courseRes = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify(coursePayload)
    });

    const courseData = await courseRes.json();
    if (!courseData._id) {
        console.error("❌ Course creation failed:", courseData);
        process.exit(1);
    }

    console.log(`✅ Course successfully created: ${courseData.title}`);

    // 3. Delete Course Cleanup
    const delRes = await fetch(`${API_URL}/courses/${courseData._id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
        }
    });

    if (delRes.status !== 200) {
        console.error("❌ Course cleanup failed");
    } else {
        console.log("✅ Course cleanup successful.");
    }
    console.log("✅ [E2E Course Builder] PASSED");
}

runTest().catch(console.error);
