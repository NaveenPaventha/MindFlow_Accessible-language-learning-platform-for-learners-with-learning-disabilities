const express = require('express');
const router = express.Router();
const { getCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect, adminOrTeacher } = require('../utils/authMiddleware');

router.get('/', getCourses);
router.post('/', protect, adminOrTeacher, createCourse);
router.put('/:id', protect, adminOrTeacher, updateCourse);
router.delete('/:id', protect, adminOrTeacher, deleteCourse);

module.exports = router;
