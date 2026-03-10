const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Will be hashed
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student', 'parent', 'admin', 'teacher'], default: 'student' },
    name: { type: String },

    // Parent-Child Linking
    linkedChildren: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String }
    }],

    // Parent Settings
    parentSettings: {
        lockedCourses: [{ type: String }] // Array of course IDs
    },

    // Progress Tracking (Map of courseId -> percentage)
    progress: {
        type: Map,
        of: Number,
        default: {}
    },

    // Gamification Data
    gamification: {
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: [{ type: String }],
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastLoginDate: { type: String, default: null },
        lessonsCompleted: { type: Number, default: 0 },
        coursesCompleted: { type: Number, default: 0 },
        perfectQuizzes: { type: Number, default: 0 },
        lessonsToday: { type: Number, default: 0 },
        lastLessonDate: { type: String, default: null }
    },

    recentActivity: [{
        text: { type: String },
        time: { type: String },
        type: { type: String },
        _id: false
    }],

    // MFA
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
