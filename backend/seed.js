const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');

dotenv.config();

const users = [
    // --- Students ---
    { username: 'student1a', email: 'student1a@example.com', password: 'password123', role: 'student', name: 'Alfie First', gamification: { xp: 120, level: 2, badges: ['🌟 First Login'], currentStreak: 3 } },
    { username: 'student1b', email: 'student1b@example.com', password: 'password123', role: 'student', name: 'Bea First', gamification: { xp: 45, level: 1, badges: [], currentStreak: 1 } },
    
    { username: 'student2a', email: 'student2a@example.com', password: 'password123', role: 'student', name: 'Charlie Second', gamification: { xp: 210, level: 3, badges: ['🔥 5 Day Streak'], currentStreak: 5 } },
    { username: 'student2b', email: 'student2b@example.com', password: 'password123', role: 'student', name: 'Daisy Second', gamification: { xp: 80, level: 1, badges: [], currentStreak: 2 } },
    
    { username: 'student3a', email: 'student3a@example.com', password: 'password123', role: 'student', name: 'Ethan Third', gamification: { xp: 500, level: 5, badges: ['🏆 Course Master'], currentStreak: 10 } },
    { username: 'student3b', email: 'student3b@example.com', password: 'password123', role: 'student', name: 'Fiona Third', gamification: { xp: 10, level: 1, badges: [], currentStreak: 0 } },

    // --- Admin ---
    { username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin', name: 'Ms. Admin' },

    // --- Teachers ---
    { username: 'teacher1', email: 'teacher1@example.com', password: 'password123', role: 'teacher', name: 'Mr. Teacher One' },
    { username: 'teacher2', email: 'teacher2@example.com', password: 'password123', role: 'teacher', name: 'Mrs. Teacher Two' },

    // --- Parents ---
    { username: 'parent1', email: 'parent1@example.com', password: 'password123', role: 'parent', name: 'John Parent One', linkedChildrenUsernames: ['student1a', 'student1b'] },
    { username: 'parent2', email: 'parent2@example.com', password: 'password123', role: 'parent', name: 'Jane Parent Two', linkedChildrenUsernames: ['student2a', 'student2b'] },
    { username: 'parent3', email: 'parent3@example.com', password: 'password123', role: 'parent', name: 'Bob Parent Three', linkedChildrenUsernames: ['student3a', 'student3b'] }
];

const generalCourses = [
    { id: 'course_101', title: 'English Greeting Basics', description: 'Learn how to introduce yourself and ask simple questions.', totalModules: 5, image: 'Hand', category: 'general' },
    { id: 'course_colors', title: 'Colors & Shapes', description: 'Explore the colorful world around you!', totalModules: 4, image: 'Palette', category: 'general' },
    { id: 'course_numbers', title: 'Numbers 1-10', description: 'Count from one to ten with fun friends.', totalModules: 6, image: 'Hash', category: 'general' },
    { id: 'course_animals', title: 'Amazing Animals', description: 'Roar, squeak, and jump with animals!', totalModules: 8, image: 'Cat', category: 'general' },
    { id: 'course_102', title: 'Active Listening Skills', description: 'Practice understanding spoken phrases.', totalModules: 4, image: 'Ear', category: 'general' },
    { id: 'course_103', title: 'Vocabulary: Home', description: 'Essential words for daily life.', totalModules: 5, image: 'Home', category: 'general' },
    { id: 'course_104', title: 'Business English', description: 'Professional communication basics.', totalModules: 6, image: 'Briefcase', category: 'general' },
    { id: 'course_105', title: 'Travel Phrases', description: 'Essential expressions for traveling.', totalModules: 4, image: 'Plane', category: 'general' },
];

const dyslexiaCourses = [
    { id: 'dys_01', title: 'Letter Tracing Magic', description: 'Master the alphabet with fun tracing exercises!', totalModules: 26, image: 'PenTool', category: 'dyslexia', badge: 'popular' },
    { id: 'dys_02', title: 'Phonics Sound Safari', description: 'Listen and match sounds in the jungle.', totalModules: 10, image: 'PawPrint', category: 'dyslexia', badge: 'premium' },
    { id: 'dys_03', title: 'Mirror Letter Mastery', description: 'Master tricky letters like b, d, p, and q.', totalModules: 5, image: 'FlipHorizontal', category: 'dyslexia', badge: 'new' },
    { id: 'dys_04', title: 'Sight Word Superstars', description: 'Recognize common words instantly!', totalModules: 12, image: 'Star', category: 'dyslexia' },
    { id: 'dys_05', title: 'Rhyme Time Adventure', description: 'Find the rhymes and sing along.', totalModules: 8, image: 'Music', category: 'dyslexia' },
    { id: 'dys_06', title: 'Sentence Builders', description: 'Drag and drop words to make sentences.', totalModules: 10, image: 'Blocks', category: 'dyslexia' },
    { id: 'dys_07', title: 'Story Sequencing', description: 'Put the story pictures in the right order.', totalModules: 6, image: 'BookOpen', category: 'dyslexia' }
];

const speechCourses = [
    { id: 'speech_01', title: 'Articulation Basics', description: 'Practice clear pronunciation of difficult sounds.', totalModules: 5, image: 'MessageCircle', category: 'speech' },
    { id: 'speech_02', title: 'Vocal Warmups', description: 'Get your voice ready for speaking.', totalModules: 3, image: 'Music', category: 'speech' },
    { id: 'speech_03', title: 'The "R" Sound Rabbit', description: 'Roar like a lion and growl like a bear!', totalModules: 8, image: 'Rocket', category: 'speech' },
    { id: 'speech_04', title: 'Sizzling "S" Snakes', description: 'Practice the snake sound sssss.', totalModules: 8, image: 'Sparkles', category: 'speech' },
    { id: 'speech_05', title: 'Thumping "Th" Thunder', description: 'Tongue placement for the perfect TH.', totalModules: 6, image: 'CloudLightning', category: 'speech' },
    { id: 'speech_06', title: 'Lurking "L" Lizards', description: 'Lift your tongue for lovely L sounds.', totalModules: 8, image: 'Leaf', category: 'speech' },
    { id: 'speech_07', title: 'Pop "P" & "B" Bubbles', description: 'Popping sounds with your lips!', totalModules: 6, image: 'CircleDashed', category: 'speech' },
    { id: 'speech_08', title: 'Ticking "T" & "D" Clocks', description: 'Tap your tongue for T and D.', totalModules: 6, image: 'Clock', category: 'speech' },
    { id: 'speech_09', title: 'Kicking "K" & "G"', description: 'Back of the throat sounds.', totalModules: 6, image: 'Key', category: 'speech' },
    { id: 'speech_10', title: 'Buzzing "Z" Bees', description: 'Feel the buzz with the Z sound.', totalModules: 6, image: 'Zap', category: 'speech' },
    { id: 'speech_11', title: 'Quiet "Sh" Sheep', description: 'Hushing sounds for quiet time.', totalModules: 6, image: 'Shirt', category: 'speech' },
    { id: 'speech_12', title: 'Choppy "Ch" Trains', description: 'Chugga-chugga choo-choo sounds!', totalModules: 6, image: 'TrainFront', category: 'speech' },
    { id: 'speech_13', title: 'Jumping "J" Jellybeans', description: 'Jump for J sounds.', totalModules: 6, image: 'Joystick', category: 'speech' },
    { id: 'speech_14', title: 'Blending "S" (Stop/Spin)', description: 'combine S with other consonants.', totalModules: 10, image: 'Octagon', category: 'speech' },
    { id: 'speech_15', title: 'Blending "L" (Play/Blue)', description: 'Smooth L blends.', totalModules: 10, image: 'CloudRain', category: 'speech' },
    { id: 'speech_16', title: 'Blending "R" (Tree/Frog)', description: 'Tricky R blends made easy.', totalModules: 10, image: 'TreePine', category: 'speech' },
    { id: 'speech_17', title: 'Smooth Speaking', description: 'Strategies for fluent speech.', totalModules: 5, image: 'Waves', category: 'speech' },
    { id: 'speech_18', title: 'Turtle Talk', description: 'Slowing down your rate of speech.', totalModules: 5, image: 'Timer', category: 'speech' },
    { id: 'speech_19', title: 'Bouncy Ball Speech', description: 'Light contacts for smoother talk.', totalModules: 5, image: 'Circle', category: 'speech' },
    { id: 'speech_20', title: 'Loud Lion, Quiet Mouse', description: 'Controlling your voice volume.', totalModules: 4, image: 'Volume2', category: 'speech' },
    { id: 'speech_21', title: 'Melody Makers', description: 'Adding expression and intonation.', totalModules: 5, image: 'Music', category: 'speech' },
    { id: 'speech_22', title: 'Describing Pictures', description: 'Practice expressive language skills.', totalModules: 8, image: 'Image', category: 'speech' },
    { id: 'speech_23', title: 'Following Directions', description: 'Listen and follow along.', totalModules: 8, image: 'Map', category: 'speech' },
    { id: 'speech_24', title: 'Story Retelling', description: 'Tell the story in your own words.', totalModules: 6, image: 'BookOpen', category: 'speech' },
    { id: 'speech_25', title: 'Social Starters', description: 'Starting conversations with friends.', totalModules: 6, image: 'MessageSquare', category: 'speech' }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        console.log('Cleared existing data.');

        // Seed Users
        const hashedUsers = await Promise.all(users.map(async (u) => {
            const salt = await bcrypt.genSalt(10);
            u.password = await bcrypt.hash(u.password, salt);
            return u;
        }));
        // Prepare parent linkage logic within seed
        // We need to resolve `linkedChildrenUsernames` to actual ObectIds.
        const insertedUsers = await User.insertMany(hashedUsers);

        // Map parent->child linkages post-insert
        const parentUsers = insertedUsers.filter(u => u.role === 'parent');
        for (let p of parentUsers) {
            const seedParent = hashedUsers.find(hu => hu.username === p.username);
            if (seedParent.linkedChildrenUsernames && seedParent.linkedChildrenUsernames.length > 0) {
                const childRefs = [];
                for (let cName of seedParent.linkedChildrenUsernames) {
                    const childObj = insertedUsers.find(u => u.username === cName);
                    if (childObj) {
                        childRefs.push({ userId: childObj._id, username: cName });
                    }
                }
                await User.findByIdAndUpdate(p._id, { linkedChildren: childRefs });
            }
        }
        
        console.log('Users Seeded (6 students, 1 admin, 2 teachers, 3 parents)');

        // Seed Courses
        const allCourses = [...generalCourses, ...dyslexiaCourses, ...speechCourses];
        await Course.insertMany(allCourses);
        console.log(`Courses Seeded: ${allCourses.length} Total`);
        console.log(`- General: ${generalCourses.length}`);
        console.log(`- Dyslexia: ${dyslexiaCourses.length}`);
        console.log(`- Speech: ${speechCourses.length}`);

        console.log('Database Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
