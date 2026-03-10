const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Announcement = require('../models/Announcement');
const { GamificationEngine } = require('../utils/gamification');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedCourses = [
    {
        id: 'course_101',
        title: 'English Greeting Basics',
        description: 'Learn how to introduce yourself and ask simple questions.',
        totalModules: 3,
        image: '👋',
        locked: false
    },
    {
        id: 'dyslexia_101',
        title: 'Letter Tracing Magic',
        description: 'Master the alphabet with fun tracing exercises!',
        totalModules: 26,
        image: '✍️',
        locked: false
    },
    {
        id: 'dyslexia_102',
        title: 'Phonics Sound Safari',
        description: 'Listen and match sounds in the jungle.',
        totalModules: 15,
        image: '🦁',
        locked: false
    },
    {
        id: 'course_colors',
        title: 'Colors & Shapes',
        description: 'Explore the colorful world around you!',
        totalModules: 4,
        image: '🎨',
        locked: false
    },
    {
        id: 'course_numbers',
        title: 'Numbers 1-10',
        description: 'Count from one to ten with fun friends.',
        totalModules: 5,
        image: '🔢',
        locked: false
    },
    {
        id: 'course_animals',
        title: 'Amazing Animals',
        description: 'Roar, squeak, and jump with animals!',
        totalModules: 6,
        image: '🐯',
        locked: false
    },
    {
        id: 'course_102',
        title: 'Active Listening Skills',
        description: 'Practice understanding spoken phrases.',
        totalModules: 4,
        image: '👂',
        locked: false
    },
    {
        id: 'course_103',
        title: 'Vocabulary: Home',
        description: 'Essential words for daily life.',
        totalModules: 5,
        image: '🏠',
        locked: false
    },
    {
        id: 'course_104',
        title: 'Business English',
        description: 'Professional communication basics.',
        totalModules: 6,
        image: '💼',
        locked: false
    },
    {
        id: 'course_105',
        title: 'Travel Phrases',
        description: 'Essential expressions for traveling.',
        totalModules: 5,
        image: '✈️',
        locked: false
    }
];

const seedUsers = [
    {
        username: 'student',
        password: 'password123',
        role: 'student',
        name: 'Student User',
        email: 'student@example.com'
    },
    {
        username: 'parent',
        password: 'password123',
        role: 'parent',
        name: 'Parent User',
        email: 'parent@example.com',
        linkedChildUsername: 'student'
    },
    {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@accesslearn.com'
    }
];

const importData = async () => {
    try {
        await User.deleteMany();
        await Course.deleteMany();
        await Announcement.deleteMany();

        console.log('Data Destroyed...');

        // Insert Courses
        await Course.insertMany(seedCourses);
        console.log('Courses Imported...');

        // Insert Users
        for (const u of seedUsers) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(u.password, salt);

            let linkedChildId = null;
            if (u.linkedChildUsername) {
                const child = await User.findOne({ username: u.linkedChildUsername });
                if (child) linkedChildId = child._id;
            }

            await User.create({
                username: u.username,
                email: u.email,
                password: hashedPassword,
                role: u.role,
                name: u.name,
                linkedChildId,
                linkedChildUsername: u.linkedChildUsername,
                gamification: {
                    xp: 0,
                    level: 1,
                    badges: [],
                    currentStreak: 0
                }
            });
        }

        console.log('Users Imported...');
        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
