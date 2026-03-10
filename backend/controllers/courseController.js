const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }
        const courses = await Course.find(query);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        const { id, title, description, totalModules, image, locked, category } = req.body;

        const courseExists = await Course.findOne({ id });
        if (courseExists) {
            return res.status(400).json({ message: 'Course ID already exists' });
        }

        const course = await Course.create({
            id: id || `course_${Date.now()}`,
            title,
            description,
            totalModules,
            image,
            locked: locked !== undefined ? locked : false,
            category: category || 'general'
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ id: req.params.id });

        if (course) {
            course.title = req.body.title || course.title;
            course.description = req.body.description || course.description;
            course.totalModules = req.body.totalModules || course.totalModules;
            course.image = req.body.image || course.image;
            course.category = req.body.category || course.category;
            if (req.body.locked !== undefined) {
                course.locked = req.body.locked;
            }

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ id: req.params.id });

        if (course) {
            await course.deleteOne();
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
