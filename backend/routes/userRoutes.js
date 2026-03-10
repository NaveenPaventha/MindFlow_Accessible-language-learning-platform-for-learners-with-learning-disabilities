const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateProgress, getChildProgress, toggleChildCourseLock } = require('../controllers/userController');
const { protect, admin } = require('../utils/authMiddleware');

router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);
router.put('/progress', protect, updateProgress);
router.get('/child/:id', protect, getChildProgress); // Parent role check could be added inside middleware or controller
router.put('/child/lock', protect, toggleChildCourseLock);

module.exports = router;
