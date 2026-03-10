const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginMfaStep2, getProfile, generateMfaSecret, generatePublicMfaSecret, enableMfa, disableMfa } = require('../controllers/authController');
const { protect } = require('../utils/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/login-mfa', loginMfaStep2);
router.get('/profile', protect, getProfile);

router.post('/mfa/generate-public', generatePublicMfaSecret);
router.post('/mfa/generate', protect, generateMfaSecret);
router.post('/mfa/enable', protect, enableMfa);
router.post('/mfa/disable', protect, disableMfa);

module.exports = router;
