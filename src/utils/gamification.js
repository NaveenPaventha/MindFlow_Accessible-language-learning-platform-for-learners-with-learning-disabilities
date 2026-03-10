/**
 * Gamification System
 * Manages XP, levels, badges, streaks, and achievements
 * for the Learning Platform
 */

// ============================================
// CONFIGURATION
// ============================================
export const GAMIFICATION_CONFIG = {
    // XP Per Action
    xp: {
        lessonComplete: 50,
        quizPerfect: 100,
        quizPass: 50,
        quizFail: 10,
        dailyLogin: 25,
        firstLesson: 100,
        streakMilestone: 50
    },

    // Level Thresholds
    levels: [
        { level: 1, xpRequired: 0, title: 'Beginner' },
        { level: 2, xpRequired: 100, title: 'Learner' },
        { level: 3, xpRequired: 300, title: 'Student' },
        { level: 4, xpRequired: 600, title: 'Scholar' },
        { level: 5, xpRequired: 1000, title: 'Expert' },
        { level: 6, xpRequired: 1500, title: 'Master' },
        { level: 7, xpRequired: 2200, title: 'Guru' },
        { level: 8, xpRequired: 3000, title: 'Legend' }
    ],

    // Badge Definitions
    badges: {
        first_lesson: {
            id: 'first_lesson',
            name: 'First Steps',
            description: 'Complete your first lesson',
            icon: 'Target',
            condition: (user) => user.lessonsCompleted >= 1
        },
        perfect_quiz: {
            id: 'perfect_quiz',
            name: 'Perfect Score',
            description: 'Get 100% on a quiz',
            icon: 'Medal',
            condition: (user) => user.perfectQuizzes >= 1
        },
        streak_3: {
            id: 'streak_3',
            name: 'Getting Started',
            description: 'Maintain a 3-day streak',
            icon: 'Flame',
            condition: (user) => (user.currentStreak || 0) >= 3
        },
        streak_7: {
            id: 'streak_7',
            name: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            icon: 'Zap',
            condition: (user) => (user.currentStreak || 0) >= 7
        },
        streak_30: {
            id: 'streak_30',
            name: 'Monthly Master',
            description: 'Maintain a 30-day streak',
            icon: 'Trophy',
            condition: (user) => (user.currentStreak || 0) >= 30
        },
        course_complete: {
            id: 'course_complete',
            name: 'Course Champion',
            description: 'Complete an entire course',
            icon: 'GraduationCap',
            condition: (user) => user.coursesCompleted >= 1
        },
        five_courses: {
            id: 'five_courses',
            name: 'Dedicated Learner',
            description: 'Complete 5 courses',
            icon: 'BookOpen',
            condition: (user) => user.coursesCompleted >= 5
        },
        speed_demon: {
            id: 'speed_demon',
            name: 'Speed Demon',
            description: 'Complete 3 lessons in one day',
            icon: 'Zap',
            condition: (user) => (user.lessonsToday || 0) >= 3
        }
    }
};

// ============================================
// GAMIFICATION ENGINE
// ============================================
export const GamificationEngine = {

    /**
     * Initialize gamification data for a user
     */
    initializeUser(user) {
        if (!user.gamification) {
            user.gamification = {
                xp: 0,
                level: 1,
                lessonsCompleted: 0,
                coursesCompleted: 0,
                perfectQuizzes: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastLoginDate: null,
                badges: [],
                lessonsToday: 0,
                lastLessonDate: null
            };
        }
        return user;
    },

    /**
     * Award XP and check for level ups
     */
    awardXP(user, amount, reason) {
        user = this.initializeUser(user);
        user.gamification.xp += amount;

        // Check for level up
        const oldLevel = user.gamification.level;
        const newLevel = this.calculateLevel(user.gamification.xp);

        if (newLevel > oldLevel) {
            user.gamification.level = newLevel;
            this.onLevelUp(user, oldLevel, newLevel);
        }

        // Check for new badges
        this.checkBadges(user);

        // Add activity log
        if (!user.recentActivity) user.recentActivity = [];
        user.recentActivity.unshift({
            text: `+${amount} XP: ${reason}`,
            time: new Date().toLocaleString(),
            type: 'xp'
        });

        return {
            newXP: user.gamification.xp,
            leveledUp: newLevel > oldLevel,
            newLevel: newLevel,
            oldLevel: oldLevel
        };
    },

    /**
     * Calculate level based on XP
     */
    calculateLevel(xp) {
        const levels = GAMIFICATION_CONFIG.levels;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (xp >= levels[i].xpRequired) {
                return levels[i].level;
            }
        }
        return 1;
    },

    /**
     * Get level title
     */
    getLevelTitle(level) {
        const levelData = GAMIFICATION_CONFIG.levels.find(l => l.level === level);
        return levelData ? levelData.title : 'Learner';
    },

    /**
     * Get XP progress to next level
     */
    getXPProgress(user) {
        const currentLevel = user.gamification.level;
        const currentXP = user.gamification.xp;
        const levels = GAMIFICATION_CONFIG.levels;

        const currentLevelData = levels.find(l => l.level === currentLevel);
        const nextLevelData = levels.find(l => l.level === currentLevel + 1);

        if (!nextLevelData) {
            return {
                current: currentXP,
                required: currentLevelData.xpRequired,
                percentage: 100,
                isMaxLevel: true
            };
        }

        const xpInCurrentLevel = currentXP - currentLevelData.xpRequired;
        const xpRequiredForNext = nextLevelData.xpRequired - currentLevelData.xpRequired;
        const percentage = Math.floor((xpInCurrentLevel / xpRequiredForNext) * 100);

        return {
            current: xpInCurrentLevel,
            required: xpRequiredForNext,
            percentage: percentage,
            isMaxLevel: false
        };
    },

    /**
     * Handle level up event
     */
    onLevelUp(user, oldLevel, newLevel) {
        const levelTitle = this.getLevelTitle(newLevel);

        if (!user.recentActivity) user.recentActivity = [];
        user.recentActivity.unshift({
            text: `Level Up! You're now Level ${newLevel} - ${levelTitle}!`,
            time: new Date().toLocaleString(),
            type: 'level_up'
        });

        // Show celebration
        // This should be handled by a UI hook/context in React, but we'll leave the logic here
    },

    /**
     * Update streak
     */
    updateStreak(user) {
        user = this.initializeUser(user);
        const today = new Date().toDateString();
        const lastLogin = user.gamification.lastLoginDate;

        if (lastLogin === today) {
            // Already logged in today
            return { streakContinued: false, currentStreak: user.gamification.currentStreak };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastLogin === yesterdayStr) {
            // Streak continues
            user.gamification.currentStreak += 1;

            // Award XP for streak milestones
            if (user.gamification.currentStreak % 7 === 0) {
                this.awardXP(user, GAMIFICATION_CONFIG.xp.streakMilestone, `${user.gamification.currentStreak}-day streak!`);
            }
        } else if (lastLogin) {
            // Streak broken
            user.gamification.currentStreak = 1;
        } else {
            // First time
            user.gamification.currentStreak = 1;
        }

        // Update longest streak
        if (user.gamification.currentStreak > user.gamification.longestStreak) {
            user.gamification.longestStreak = user.gamification.currentStreak;
        }

        user.gamification.lastLoginDate = today;

        // Award daily login XP
        this.awardXP(user, GAMIFICATION_CONFIG.xp.dailyLogin, 'Daily login');

        // Check badges
        this.checkBadges(user);

        return {
            streakContinued: true,
            currentStreak: user.gamification.currentStreak
        };
    },

    /**
     * Handle lesson completion
     */
    onLessonComplete(user) {
        user = this.initializeUser(user);
        user.gamification.lessonsCompleted += 1;

        // Track lessons today
        const today = new Date().toDateString();
        if (user.gamification.lastLessonDate !== today) {
            user.gamification.lessonsToday = 1;
            user.gamification.lastLessonDate = today;
        } else {
            user.gamification.lessonsToday += 1;
        }

        // Award XP
        const xpAmount = user.gamification.lessonsCompleted === 1
            ? GAMIFICATION_CONFIG.xp.firstLesson
            : GAMIFICATION_CONFIG.xp.lessonComplete;

        const result = this.awardXP(user, xpAmount, 'Lesson completed');

        // Check badges
        this.checkBadges(user);

        return result;
    },

    /**
     * Handle quiz completion
     */
    onQuizComplete(user, score) {
        user = this.initializeUser(user);

        let xpAmount;
        let reason;

        if (score === 100) {
            xpAmount = GAMIFICATION_CONFIG.xp.quizPerfect;
            reason = 'Perfect quiz score!';
            user.gamification.perfectQuizzes += 1;
        } else if (score >= 50) {
            xpAmount = GAMIFICATION_CONFIG.xp.quizPass;
            reason = 'Quiz passed';
        } else {
            xpAmount = GAMIFICATION_CONFIG.xp.quizFail;
            reason = 'Quiz attempted';
        }

        const result = this.awardXP(user, xpAmount, reason);

        // Check badges
        this.checkBadges(user);

        return result;
    },

    /**
     * Handle course completion
     */
    onCourseComplete(user) {
        user = this.initializeUser(user);
        user.gamification.coursesCompleted += 1;

        const xpAmount = 200; // Bonus XP for course completion
        const result = this.awardXP(user, xpAmount, 'Course completed!');

        // Check badges
        this.checkBadges(user);

        return result;
    },

    /**
     * Check and award badges
     */
    checkBadges(user) {
        user = this.initializeUser(user);
        const badges = GAMIFICATION_CONFIG.badges;
        const newBadges = [];

        for (const badgeKey in badges) {
            const badge = badges[badgeKey];

            // Skip if already earned
            if (user.gamification.badges.includes(badge.id)) {
                continue;
            }

            // Check condition
            if (badge.condition(user.gamification)) {
                user.gamification.badges.push(badge.id);
                newBadges.push(badge);

                // Add to activity log
                if (!user.recentActivity) user.recentActivity = [];
                user.recentActivity.unshift({
                    text: `Badge Earned: ${badge.name}`,
                    time: new Date().toLocaleString(),
                    type: 'badge',
                    icon: badge.icon
                });
            }
        }

        return newBadges;
    },

    /**
     * Get all earned badges
     */
    getEarnedBadges(user) {
        user = this.initializeUser(user);
        const badges = GAMIFICATION_CONFIG.badges;
        const earned = [];

        for (const badgeKey in badges) {
            const badge = badges[badgeKey];
            if (user.gamification.badges.includes(badge.id)) {
                earned.push(badge);
            }
        }

        return earned;
    },

    /**
     * Get available badges (not yet earned)
     */
    getAvailableBadges(user) {
        user = this.initializeUser(user);
        const badges = GAMIFICATION_CONFIG.badges;
        const available = [];

        for (const badgeKey in badges) {
            const badge = badges[badgeKey];
            if (!user.gamification.badges.includes(badge.id)) {
                available.push(badge);
            }
        }

        return available;
    }
};
