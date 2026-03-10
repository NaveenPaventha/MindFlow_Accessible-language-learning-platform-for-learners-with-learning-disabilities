const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Optional, can use _id
    text: { type: String, required: true },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
