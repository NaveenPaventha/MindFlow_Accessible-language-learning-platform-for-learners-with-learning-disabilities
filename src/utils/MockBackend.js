import { GamificationEngine } from './gamification';

// === MOCK DATABASE & API LAYER ===
export const MockBackend = {
    // Initial Seed Data (Simulating a DB)
    seedData: {
        courses: [
            {
                id: 'course_101',
                title: 'English Greeting Basics',
                description: 'Learn how to introduce yourself and ask simple questions.',
                totalModules: 3,
                image: '👋',
                locked: false
            },
            {
                id: 'dyslexia_101',
                title: 'Letter Tracing Magic',
                description: 'Master the alphabet with fun tracing exercises!',
                totalModules: 26,
                image: '✍️',
                locked: false
            },
            {
                id: 'dyslexia_102',
                title: 'Phonics Sound Safari',
                description: 'Listen and match sounds in the jungle.',
                totalModules: 15,
                image: '🦁',
                locked: false
            },
            {
                id: 'course_colors',
                title: 'Colors & Shapes',
                description: 'Explore the colorful world around you!',
                totalModules: 4,
                image: '🎨',
                locked: false
            },
            {
                id: 'course_numbers',
                title: 'Numbers 1-10',
                description: 'Count from one to ten with fun friends.',
                totalModules: 5,
                image: '🔢',
                locked: false
            },
            {
                id: 'course_animals',
                title: 'Amazing Animals',
                description: 'Roar, squeak, and jump with animals!',
                totalModules: 6,
                image: '🐯',
                locked: false
            },
            {
                id: 'course_102',
                title: 'Active Listening Skills',
                description: 'Practice understanding spoken phrases.',
                totalModules: 4,
                image: '👂',
                locked: false
            },
            {
                id: 'course_103',
                title: 'Vocabulary: Home',
                description: 'Essential words for daily life.',
                totalModules: 5,
                image: '🏠',
                locked: false
            },
            {
                id: 'course_104',
                title: 'Business English',
                description: 'Professional communication basics.',
                totalModules: 6,
                image: '💼',
                locked: false
            },
            {
                id: 'course_105',
                title: 'Travel Phrases',
                description: 'Essential expressions for traveling.',
                totalModules: 5,
                image: '✈️',
                locked: false
            }
        ],
        users: [
            {
                id: 'u_1',
                username: 'student',
                password: 'password123', // stored plain text for prototype simplicity
                role: 'student',
                name: 'Student User',
                email: 'student@example.com',
                progress: {
                    'course_101': 0, 'course_102': 0, 'course_103': 0,
                    'course_104': 0, 'course_105': 0, 'course_106': 0,
                    'course_107': 0, 'course_108': 0, 'course_109': 0, 'course_110': 0
                },
                recentActivity: [],
                gamification: {
                    xp: 0,
                    level: 1,
                    badges: [],
                    currentStreak: 0,
                    longestStreak: 0,
                    lastLoginDate: null
                },
                mfaEnabled: false,
                mfaSecret: null,
                isApproved: true
            },
            {
                id: 'u_p1',
                username: 'parent',
                password: 'password123',
                role: 'parent',
                name: 'Parent User',
                email: 'parent@example.com',
                linkedChildId: 'u_1',
                linkedChildUsername: 'student'
            },
            {
                id: 'u_admin',
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'System Administrator',
                email: 'admin@accesslearn.com',
                mfaEnabled: false,
                mfaSecret: null,
                isApproved: true
            }
        ]
    },

    // Administrative Methods
    getAllUsers() {
        return JSON.parse(localStorage.getItem('app_users_db')) || this.seedData.users;
    },

    deleteUser(userId) {
        let users = this.getAllUsers();
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('app_users_db', JSON.stringify(users));
        return true;
    },

    addCourse(courseData) {
        const courses = JSON.parse(localStorage.getItem('app_courses')) || this.seedData.courses;
        const newCourse = {
            ...courseData,
            id: 'course_' + Date.now(),
            locked: false
        };
        courses.push(newCourse);
        localStorage.setItem('app_courses', JSON.stringify(courses));
        return newCourse;
    },

    deleteCourse(courseId) {
        let courses = JSON.parse(localStorage.getItem('app_courses')) || this.seedData.courses;
        courses = courses.filter(c => c.id !== courseId);
        localStorage.setItem('app_courses', JSON.stringify(courses));
        return true;
    },

    getAllCourses() {
        return JSON.parse(localStorage.getItem('app_courses')) || this.seedData.courses;
    },

    updateCourse(courseId, data) {
        let courses = JSON.parse(localStorage.getItem('app_courses')) || this.seedData.courses;
        const index = courses.findIndex(c => c.id === courseId);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...data };
            localStorage.setItem('app_courses', JSON.stringify(courses));
            return courses[index];
        }
        return null;
    },

    getSystemAnalytics() {
        const users = this.getAllUsers();
        const courses = this.getCourses();

        const totalXP = users.reduce((sum, u) => sum + (u.gamification?.xp || 0), 0);
        const roleDistribution = users.reduce((acc, u) => {
            acc[u.role] = (acc[u.role] || 0) + 1;
            return acc;
        }, {});

        const moduleCompletion = courses.map(c => ({
            title: c.title,
            enrollment: Math.floor(Math.random() * 50) + 10,
            avgProgress: Math.floor(Math.random() * 100)
        }));

        return {
            userStats: {
                total: users.length,
                roles: roleDistribution,
                totalXP
            },
            courseStats: {
                total: courses.length,
                completionRates: moduleCompletion
            },
            systemHealth: "Optimal"
        };
    },

    getChildProgress(parentId) {
        const users = this.getAllUsers();
        const parent = users.find(u => u.id === parentId);
        if (!parent || !parent.linkedChildId) return null;

        const child = users.find(u => u.id === parent.linkedChildId);
        if (!child) return null;

        // Return a focused object for the parent
        return {
            id: child.id,
            name: child.name,
            username: child.username,
            progress: child.progress || {},
            gamification: child.gamification,
            recentActivity: child.recentActivity || [],
            settings: child.parentSettings || { lockedCourses: [] }
        };
    },

    toggleChildCourse(parentId, courseId) {
        const users = this.getAllUsers();
        const parent = users.find(u => u.id === parentId);
        if (!parent || !parent.linkedChildId) return false;

        const childIndex = users.findIndex(u => u.id === parent.linkedChildId);
        if (childIndex === -1) return false;

        if (!users[childIndex].parentSettings) {
            users[childIndex].parentSettings = { lockedCourses: [] };
        }

        const locked = users[childIndex].parentSettings.lockedCourses || [];
        if (locked.includes(courseId)) {
            users[childIndex].parentSettings.lockedCourses = locked.filter(id => id !== courseId);
        } else {
            users[childIndex].parentSettings.lockedCourses.push(courseId);
        }

        localStorage.setItem('app_users_db', JSON.stringify(users));
        return true;
    },

    resetChildProgress(parentId, courseId) {
        const users = this.getAllUsers();
        const parent = users.find(u => u.id === parentId);
        if (!parent || !parent.linkedChildId) return false;

        const childIndex = users.findIndex(u => u.id === parent.linkedChildId);
        if (childIndex === -1) return false;

        if (users[childIndex].progress && users[childIndex].progress[courseId]) {
            users[childIndex].progress[courseId] = 0;
            if (!users[childIndex].recentActivity) users[childIndex].recentActivity = [];
            users[childIndex].recentActivity.unshift({
                text: `Parent reset progress for ${courseId}`,
                time: new Date().toLocaleString()
            });
            localStorage.setItem('app_users_db', JSON.stringify(users));
            return true;
        }
        return false;
    },

    getStudents() {
        return this.getAllUsers().filter(u => u.role === 'student');
    },

    getAnnouncements() {
        return JSON.parse(localStorage.getItem('app_announcements')) || [];
    },

    addAnnouncement(message) {
        const announcements = this.getAnnouncements();
        const newAnnouncement = {
            id: 'ann_' + Date.now(),
            text: message,
            timestamp: new Date().toISOString(),
            active: true
        };
        // Keep only latest announcement active for simplicity in this prototype
        announcements.forEach(a => a.active = false);
        announcements.push(newAnnouncement);
        localStorage.setItem('app_announcements', JSON.stringify(announcements));
        return newAnnouncement;
    },

    clearAnnouncements() {
        localStorage.setItem('app_announcements', JSON.stringify([]));
    },

    // MFA Methods
    base32ToBuf(base32) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        for (let i = 0; i < base32.length; i++) {
            const val = alphabet.indexOf(base32.charAt(i).toUpperCase());
            if (val === -1) continue;
            bits += val.toString(2).padStart(5, '0');
        }
        const bytes = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.substr(i, 8), 2));
        }
        return new Uint8Array(bytes);
    },

    async generateTotp(secret) {
        try {
            const keyBytes = this.base32ToBuf(secret);
            const epoch = Math.floor(Date.now() / 1000);
            const time = Math.floor(epoch / 30);

            // Create 8-byte counter buffer
            const counter = new Uint8Array(8);
            let tempTime = time;
            for (let i = 7; i >= 0; i--) {
                counter[i] = tempTime & 0xff;
                tempTime = Math.floor(tempTime / 256);
            }

            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyBytes,
                { name: 'HMAC', hash: 'SHA-1' },
                false,
                ['sign']
            );

            const hmac = await crypto.subtle.sign('HMAC', cryptoKey, counter);
            const hmacBytes = new Uint8Array(hmac);
            const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
            const code = (
                ((hmacBytes[offset] & 0x7f) << 24) |
                ((hmacBytes[offset + 1] & 0xff) << 16) |
                ((hmacBytes[offset + 2] & 0xff) << 8) |
                (hmacBytes[offset + 3] & 0xff)
            ) % 1000000;

            return code.toString().padStart(6, '0');
        } catch (err) {
            console.error("TOTP Generation Error:", err);
            return null;
        }
    },

    generateMfaSecret(userId) {
        // Generates a valid Base32 secret (A-Z, 2-7) for Authenticator apps
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 16; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    },

    getOtpAuthUrl(username, secret) {
        // Standard OTP Auth URI format
        const issuer = "AccessLearn";
        return `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;
    },

    async verifyMfaCode(userId, code, secretOverride = null) {
        // 1. Test Override (Crucial for dev/testing)
        if (code === '654321' || code.startsWith('1111')) return true;

        // 2. Real TOTP Check
        let secret = secretOverride;

        if (!secret && userId) {
            const users = this.getAllUsers();
            const user = users.find(u => u.id === userId || u.username === userId);
            if (user) secret = user.mfaSecret;
        }

        if (!secret) return false;

        const expectedCode = await this.generateTotp(secret);
        return code === expectedCode;
    },

    enableMfa(userId, secret) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].mfaEnabled = true;
            users[index].mfaSecret = secret;
            localStorage.setItem('app_users_db', JSON.stringify(users));

            // Also update current session if it's the same user
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                currentUser.mfaEnabled = true;
                currentUser.mfaSecret = secret;
                localStorage.setItem('app_current_session', JSON.stringify(currentUser));
            }
            return true;
        }
        return false;
    },

    disableMfa(userId) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].mfaEnabled = false;
            users[index].mfaSecret = null;
            localStorage.setItem('app_users_db', JSON.stringify(users));

            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                currentUser.mfaEnabled = false;
                currentUser.mfaSecret = null;
                localStorage.setItem('app_current_session', JSON.stringify(currentUser));
            }
            return true;
        }
        return false;
    },

    // Initialize DB if empty OR strictly sync new content
    init() {
        let storedCourses = JSON.parse(localStorage.getItem('app_courses'));

        if (!storedCourses) {
            localStorage.setItem('app_courses', JSON.stringify(this.seedData.courses));
        } else {
            // MERGE/SYNC LOGIC: Ensure new courses from seedData exist in localStorage
            let hasChanges = false;
            this.seedData.courses.forEach(seedCourse => {
                const existingIndex = storedCourses.findIndex(c => c.id === seedCourse.id);

                if (existingIndex === -1) {
                    // Start new courses as unlocked if specified in seed (e.g. Colors, Numbers)
                    storedCourses.push(seedCourse);
                    hasChanges = true;
                } else {
                    // Update metadata but preserve user progress if any
                    if (seedCourse.locked === false && storedCourses[existingIndex].locked === true) {
                        storedCourses[existingIndex].locked = false;
                        hasChanges = true;
                    }

                    // Update title/description/image to match latest code
                    storedCourses[existingIndex].title = seedCourse.title;
                    storedCourses[existingIndex].description = seedCourse.description;
                    storedCourses[existingIndex].image = seedCourse.image;
                    storedCourses[existingIndex].totalModules = seedCourse.totalModules;
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                localStorage.setItem('app_courses', JSON.stringify(storedCourses));
            }
        }

        // Initial User Sync
        let storedUsers = JSON.parse(localStorage.getItem('app_users_db'));
        if (!storedUsers) {
            localStorage.setItem('app_users_db', JSON.stringify(this.seedData.users));
        } else {
            // Ensure default admin/student/teacher always exist for dev purposes
            let usersChanged = false;
            if (!storedUsers.some(u => u.role === 'teacher')) {
                storedUsers.push({
                    id: 'u_t1', username: 'teacher', password: 'password123', role: 'teacher', name: 'Teacher User', email: 'teacher@test.com', progress: {}, recentActivity: [], gamification: { xp: 0, level: 1, badges: [], currentStreak: 0, longestStreak: 0, lastLoginDate: null }, mfaEnabled: false, mfaSecret: null, linkedChildId: null, linkedChildUsername: null, isApproved: true
                });
                usersChanged = true;
            }
            this.seedData.users.forEach(seedUser => {
                if (!storedUsers.some(u => u.username === seedUser.username)) {
                    storedUsers.push(seedUser);
                    usersChanged = true;
                }
            });
            if (usersChanged) {
                localStorage.setItem('app_users_db', JSON.stringify(storedUsers));
            }
        }
    },

    // Login Method
    login(username, password) {
        const users = JSON.parse(localStorage.getItem('app_users_db')) || this.seedData.users;
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            if (user.isApproved === false) {
                return { success: false, message: "Account pending admin approval." };
            }
            if (user.mfaEnabled) {
                // Return partial success requiring OTP
                return { success: true, requiresMfa: true, userId: user.id };
            }
            // Set active session
            localStorage.setItem('app_current_session', JSON.stringify(user));
            return { success: true, role: user.role, user };
        }
        return { success: false, message: "Invalid credentials" };
    },

    async loginStep2(userId, otpCode) {
        const isValid = await this.verifyMfaCode(userId, otpCode);
        if (isValid) {
            const users = this.getAllUsers();
            const user = users.find(u => u.id === userId);
            if (user) {
                if (user.isApproved === false) {
                    return { success: false, message: "Account pending admin approval." };
                }
                localStorage.setItem('app_current_session', JSON.stringify(user));
                return { success: true, role: user.role, user };
            }
        }
        return { success: false, message: "Invalid OTP code" };
    },

    logout() {
        localStorage.removeItem('app_current_session');
    },

    // Get current logged in user (Session)
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('app_current_session'));
    },

    // Save user state back to the MAIN "users db"
    saveUser(updatedUser) {
        // Update session
        localStorage.setItem('app_current_session', JSON.stringify(updatedUser));

        // Update DB
        const users = JSON.parse(localStorage.getItem('app_users_db')) || [];
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('app_users_db', JSON.stringify(users));
        }
    },

    // Get all courses with user progress attached
    getCourses() {
        // Safety check: if init hasn't run or storage is empty, use seed
        const rawCourses = localStorage.getItem('app_courses');
        const courses = rawCourses ? JSON.parse(rawCourses) : this.seedData.courses;

        const user = this.getCurrentUser();

        if (!user || user.role !== 'student') return courses;

        return courses.map(course => {
            const isParentLocked = user.parentSettings?.lockedCourses?.includes(course.id);
            return {
                ...course,
                progress: (user.progress && user.progress[course.id]) || 0,
                locked: isParentLocked !== undefined ? isParentLocked : course.locked
            };
        });
    },

    // Update progress for a specific course
    updateProgress(courseId, percent) {
        const user = this.getCurrentUser();
        if (!user) return;

        // Only update if new percentage is higher
        if (!user.progress[courseId] || percent > user.progress[courseId]) {
            user.progress[courseId] = percent;

            // Log activity
            if (!user.recentActivity) user.recentActivity = [];
            user.recentActivity.unshift({
                text: 'Updated progress in ' + courseId + ' to ' + percent + '%',
                time: new Date().toLocaleString()
            });

            // Unlock next course logic (Simple simulation)
            if (courseId === 'course_101' && percent === 100) {
                this.unlockCourse('course_102');
                user.recentActivity.unshift({
                    text: '🎊 Unlocked: Active Listening Skills',
                    time: new Date().toLocaleString()
                });
            }

            // Award XP for lesson/course completion via Gamification Engine
            if (percent === 100) {
                GamificationEngine.awardXP(user, 50, 'Completed course ' + courseId);
            } else {
                GamificationEngine.awardXP(user, 10, 'Progress in ' + courseId);
            }

            this.saveUser(user);
        }
    },

    unlockCourse(courseId) {
        const courses = JSON.parse(localStorage.getItem('app_courses')) || [];
        const course = courses.find(c => c.id === courseId);
        if (course) {
            course.locked = false;
            localStorage.setItem('app_courses', JSON.stringify(courses));
        }
    },

    // Register new user
    register(newUser) {
        const users = JSON.parse(localStorage.getItem('app_users_db')) || [];

        // Check if username/email exists
        if (users.find(u => u.username === newUser.username)) {
            return { success: false, message: "Username already exists" };
        }
        if (users.find(u => u.email === newUser.email)) {
            return { success: false, message: "Email already registered" };
        }

        // Add defaults
        const userWithDefaults = {
            ...newUser,
            id: 'u_' + Date.now(),
            role: newUser.role || 'student',
            progress: {},
            recentActivity: [],
            gamification: {
                xp: 0,
                level: 1,
                badges: [],
                currentStreak: 0,
                longestStreak: 0,
                lastLoginDate: null
            },
            mfaEnabled: newUser.mfaEnabled || false,
            mfaSecret: newUser.mfaSecret || null,
            linkedChildId: newUser.linkedChildId || null,
            linkedChildUsername: newUser.linkedChildUsername || null,
            isApproved: false // Require admin approval by default
        };

        if (newUser.role === 'parent' && newUser.linkedChildUsername) {
            const student = users.find(u => u.username === newUser.linkedChildUsername);
            if (student) {
                userWithDefaults.linkedChildId = student.id;
            }
        }

        users.push(userWithDefaults);
        localStorage.setItem('app_users_db', JSON.stringify(users));
        return { success: true };
    },

    // Add a simple quiz result
    submitQuiz(quizName, score) {
        const user = this.getCurrentUser();
        if (!user) return;

        if (!user.recentActivity) user.recentActivity = [];
        user.recentActivity.unshift({
            text: 'Completed Quiz: ' + quizName + ' - Score: ' + score + '%',
            time: new Date().toLocaleString()
        });

        // Award XP
        // Assuming GamificationEngine handles logic inside direct calls or we call it here
        const xpEarned = Math.round(score / 2); // 50 XP for 100%
        GamificationEngine.awardXP(user, xpEarned, 'Quiz: ' + quizName);

        this.saveUser(user);
    }
};
