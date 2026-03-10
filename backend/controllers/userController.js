const User = require('../models/User');
const Course = require('../models/Course');
const { GamificationEngine } = require('../utils/gamification');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Progress
// @route   PUT /api/users/progress
// @access  Private
exports.updateProgress = async (req, res) => {
    const { courseId, percent } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Initialize progress map if needed
        if (!user.progress) user.progress = new Map();

        const currentProgress = user.progress.get(courseId) || 0;

        if (percent > currentProgress) {
            user.progress.set(courseId, percent);

            // Log Activity
            user.recentActivity.unshift({
                text: `Updated progress in ${courseId} to ${percent}%`,
                time: new Date().toLocaleString(),
                type: 'progress'
            });

            // Unlock next course (Simple logic from MockBackend)
            if (courseId === 'course_101' && percent === 100) {
                // In a real DB, we might update the 'Course' doc or a 'UserCourse' doc.
                // For now, we don't have per-user course locking in Schema unless we use parentSettings.
                // We'll just log it.
                user.recentActivity.unshift({
                    text: '🎊 Unlocked: Active Listening Skills',
                    time: new Date().toLocaleString()
                });
            }

            // Award XP
            if (percent === 100) {
                GamificationEngine.onCourseComplete(user);
            } else {
                // Treat significant progress as completing a "mini-lesson" or concept
                GamificationEngine.onLessonComplete(user);
            }

            await user.save();
        }

        res.json({
            progress: user.progress,
            gamification: user.gamification,
            recentActivity: user.recentActivity
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get Child Progress (Parent only)
// @route   GET /api/users/child/:id
// @access  Private/Parent
exports.getChildProgress = async (req, res) => {
    try {
        const parent = req.user;
        // Verify linking
        if (!parent.linkedChildren || parent.linkedChildren.length === 0) {
            return res.status(400).json({ message: "No child accounts linked" });
        }

        // Find children
        const children = [];
        for (let childLink of parent.linkedChildren) {
            const childProfile = await User.findById(childLink.userId).select('-password');
            if (childProfile) children.push(childProfile);
        }

        if (children.length === 0) return res.status(404).json({ message: "Linked children not found" });

        res.json(children); // Now returning an array of profiles
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Child Course Lock
// @route   PUT /api/users/child/lock
// @access  Private/Parent
exports.toggleChildCourseLock = async (req, res) => {
    const { childId, courseId } = req.body;

    try {
        // In this implementation, the lock settings are stored on the PARENT user document according to MockBackend logic?
        // Actually MockBackend stored it on the CHILD user inside `parentSettings`.
        // Let's stick to storing it on the CHILD for cleaner logic, requiring update of child doc.

        // However, the Schema I wrote put `parentSettings` on the User schema.
        // So we will update the Child's `parentSettings`.

        const child = await User.findById(childId);
        if (!child) return res.status(404).json({ message: "Child not found" });

        if (!child.parentSettings) child.parentSettings = { lockedCourses: [] };

        const lockedList = child.parentSettings.lockedCourses || [];
        const isLocked = lockedList.includes(courseId);

        if (isLocked) {
            child.parentSettings.lockedCourses = lockedList.filter(id => id !== courseId);
        } else {
            child.parentSettings.lockedCourses.push(courseId);
        }

        await child.save();
        res.json(child.parentSettings);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
