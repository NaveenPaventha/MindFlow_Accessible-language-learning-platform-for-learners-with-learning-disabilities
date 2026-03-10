const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping string ID for frontend compatibility (e.g., 'course_101')
    title: { type: String, required: true },
    description: { type: String },
    totalModules: { type: Number, default: 0 },
    image: { type: String }, // Emoji or URL
    locked: { type: Boolean, default: false }, // Default state
    category: { type: String, enum: ['general', 'dyslexia', 'speech'], default: 'general' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
