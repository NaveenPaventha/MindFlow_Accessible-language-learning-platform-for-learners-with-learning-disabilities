const axios = require('axios');
const API_URL = 'http://localhost:5001/api/courses';

async function verifyCourses() {
    try {
        console.log(`Fetching from ${API_URL}...`);
        const res = await axios.get(API_URL);
        const courses = res.data;

        console.log(`Total Courses: ${courses.length}`);

        const counts = courses.reduce((acc, c) => {
            acc[c.category] = (acc[c.category] || 0) + 1;
            return acc;
        }, {});

        console.log('Breakdown:', counts);

        // Check random speech course
        const speech = courses.find(c => c.category === 'speech');
        if (speech) console.log(`Sample Speech: ${speech.title}`);

        // Check random dyslexia course
        const dys = courses.find(c => c.category === 'dyslexia');
        if (dys) console.log(`Sample Dyslexia: ${dys.title}`);

    } catch (e) {
        console.error('Error:', e.message);
    }
}

verifyCourses();
