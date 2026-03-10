const express = require('express');
const router = express.Router();
const { getPosts, createPost, addReply } = require('../controllers/forumController');
const { protect } = require('../utils/authMiddleware');

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.post('/:id/reply', protect, addReply);

module.exports = router;
