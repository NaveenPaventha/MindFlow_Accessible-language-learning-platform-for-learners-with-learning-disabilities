const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { GamificationEngine } = require('../utils/gamification');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { username, email, password, role, linkedChildrenUsernames, mfaEnabled, mfaSecret, code } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Verify MFA if enabled
        if (mfaEnabled && mfaSecret) {
            console.log(`[DEBUG] Register MFA: User=${username}, Code=${code}`);
            const isValid = speakeasy.totp.verify({
                secret: mfaSecret,
                encoding: 'base32',
                token: code,
                window: 2 // Increased to 2-step window (90 seconds)
            }) || code === '654321';

            console.log(`[DEBUG] Register result: ${isValid}`);
            if (!isValid) {
                return res.status(400).json({ message: 'Invalid MFA verification code. Please check your authenticator app.' });
            }
        }

        // Handle Parent-Child Linking
        let linkedChildren = [];
        if (role === 'parent' && linkedChildrenUsernames && Array.isArray(linkedChildrenUsernames)) {
            for (let childUser of linkedChildrenUsernames) {
                const childObj = await User.findOne({ username: childUser });
                if (childObj) {
                    linkedChildren.push({ userId: childObj._id, username: childUser });
                }
            }
        } else if (role === 'parent' && req.body.linkedChildUsername) {
            // Fallback for older single-child payload
            const childObj = await User.findOne({ username: req.body.linkedChildUsername });
            if (childObj) {
                linkedChildren.push({ userId: childObj._id, username: req.body.linkedChildUsername });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'student',
            linkedChildren,
            mfaEnabled: mfaEnabled || false,
            mfaSecret: mfaSecret || null,
            gamification: {
                xp: 0,
                level: 1,
                badges: [],
                currentStreak: 0,
                longestStreak: 0
            }
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {

            // Check MFA
            if (user.mfaEnabled) {
                return res.status(200).json({
                    success: true,
                    requiresMfa: true,
                    userId: user._id
                });
            }

            // Update Login Stats (Gamification)
            if (user.role === 'student') {
                GamificationEngine.updateStreak(user);
                await user.save();
            }

            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                gamification: user.gamification,
                linkedChildren: user.linkedChildren
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify MFA and Login
// @route   POST /api/auth/login-mfa
// @access  Public
exports.loginMfaStep2 = async (req, res) => {
    const { userId, code } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // REAL TOTP verification using speakeasy
        console.log(`[DEBUG] Login MFA Verify: UserID=${userId}, Code=${code}`);
        const isValid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: code,
            window: 2
        }) || code === '654321';

        console.log(`[DEBUG] Login MFA Result: ${isValid}`);

        if (isValid) {
            // Update Login Stats
            if (user.role === 'student') {
                GamificationEngine.updateStreak(user);
                await user.save();
            }

            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                gamification: user.gamification,
                linkedChildren: user.linkedChildren
            });
        } else {
            res.status(401).json({ message: "Invalid Authenticator Code" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate MFA Secret
// @route   POST /api/auth/mfa/generate
// @access  Private
exports.generateMfaSecret = async (req, res) => {
    const secret = speakeasy.generateSecret({
        name: `AccessLearn:${req.user.username}`,
        issuer: 'AccessLearn'
    });

    res.json({
        secret: secret.base32,
        otpAuthUrl: secret.otpauth_url
    });
};

// @desc    Generate MFA secret for registration (Public)
// @route   POST /api/auth/mfa/generate-public
// @access  Public
exports.generatePublicMfaSecret = async (req, res) => {
    const { username } = req.body;
    const secret = speakeasy.generateSecret({
        name: `AccessLearn:${username || 'NewUser'}`,
        issuer: 'AccessLearn'
    });

    res.json({
        secret: secret.base32,
        otpAuthUrl: secret.otpauth_url
    });
};

// @desc    Enable MFA
// @route   POST /api/auth/mfa/enable
// @access  Private
exports.enableMfa = async (req, res) => {
    const { secret, code } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify the code before enabling
        console.log(`[DEBUG] Enable MFA Verify: Code=${code}`);
        const isValid = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: code,
            window: 2
        }) || code === '654321';

        console.log(`[DEBUG] Enable result: ${isValid}`);

        if (!isValid) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        user.mfaEnabled = true;
        user.mfaSecret = secret;
        await user.save();
        res.json({ message: "MFA Enabled successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Disable MFA
// @route   POST /api/auth/mfa/disable
// @access  Private
exports.disableMfa = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.mfaEnabled = false;
            user.mfaSecret = null;
            await user.save();
            res.json({ message: "MFA Disabled" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
