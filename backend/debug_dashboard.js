const axios = require('axios');
const API_URL = 'http://localhost:5001/api/courses';

async function checkCourses() {
    try {
        console.log(`Fetching from ${API_URL}...`);
        const res = await axios.get(API_URL);
        console.log(`Total Courses: ${res.data.length}`);
        res.data.forEach(c => console.log(`[${c.category || 'no-cat'}] ${c.title}`));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkCourses();
