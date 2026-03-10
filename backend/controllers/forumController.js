const ForumPost = require('../models/ForumPost');

// Get all forum posts
const getPosts = async (req, res) => {
    try {
        const posts = await ForumPost.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

// Create a new post
const createPost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        
        if (!title || !content || title.trim() === '' || content.trim() === '') {
            return res.status(400).json({ message: 'Title and content are strictly required' });
        }

        // Validate user object exists properly from the protect middleware
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated properly for forum posting' });
        }

        const newPost = new ForumPost({
            userId: req.user._id,
            username: req.user.username || req.user.name || 'Anonymous Learner',
            title: title.trim(),
            content: content.trim(),
            tags: Array.isArray(tags) && tags.length > 0 ? tags : ['General']
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Forum Post Creation Failed:', error);
        res.status(500).json({ message: 'Error creating post', error: error.message || error.toString() });
    }
};

// Add a reply
const addReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Reply content cannot be empty' });
        }

        const post = await ForumPost.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.replies.push({
            userId: req.user._id,
            username: req.user.username || req.user.name || 'Anonymous Learner',
            content: content.trim()
        });

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        console.error('Forum Reply Failed:', error);
        res.status(500).json({ message: 'Error adding reply', error: error.message });
    }
};

module.exports = {
    getPosts,
    createPost,
    addReply
};
