/**
 * Backend Gamification System
 * Manages XP, levels, badges, streaks, and achievements
 */

// ============================================
// CONFIGURATION
// ============================================
const GAMIFICATION_CONFIG = {
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
            icon: '🎯',
            condition: (user) => user.gamification.lessonsCompleted >= 1
        },
        perfect_quiz: {
            id: 'perfect_quiz',
            name: 'Perfect Score',
            description: 'Get 100% on a quiz',
            icon: '💯',
            condition: (user) => user.gamification.perfectQuizzes >= 1
        },
        streak_3: {
            id: 'streak_3',
            name: 'Getting Started',
            description: 'Maintain a 3-day streak',
            icon: '🔥',
            condition: (user) => (user.gamification.currentStreak || 0) >= 3
        },
        streak_7: {
            id: 'streak_7',
            name: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            icon: '⚡',
            condition: (user) => (user.gamification.currentStreak || 0) >= 7
        },
        streak_30: {
            id: 'streak_30',
            name: 'Monthly Master',
            description: 'Maintain a 30-day streak',
            icon: '🏆',
            condition: (user) => (user.gamification.currentStreak || 0) >= 30
        },
        course_complete: {
            id: 'course_complete',
            name: 'Course Champion',
            description: 'Complete an entire course',
            icon: '🎓',
            condition: (user) => user.gamification.coursesCompleted >= 1
        },
        five_courses: {
            id: 'five_courses',
            name: 'Dedicated Learner',
            description: 'Complete 5 courses',
            icon: '📚',
            condition: (user) => user.gamification.coursesCompleted >= 5
        },
        speed_demon: {
            id: 'speed_demon',
            name: 'Speed Demon',
            description: 'Complete 3 lessons in one day',
            icon: '⚡',
            condition: (user) => (user.gamification.lessonsToday || 0) >= 3
        }
    }
};

// ============================================
// GAMIFICATION ENGINE
// ============================================
const GamificationEngine = {

    /**
     * Award XP and check for level ups
     * Returns: { newXP, leveledUp, newLevel, oldLevel, modifications }
     * modifications is an object of fields to update on the user doc
     */
    awardXP(user, amount, reason) {
        // Ensure gamification object exists
        if (!user.gamification) user.gamification = {};

        user.gamification.xp = (user.gamification.xp || 0) + amount;

        // Check for level up
        const oldLevel = user.gamification.level || 1;
        const newLevel = this.calculateLevel(user.gamification.xp);
        let leveledUp = false;

        if (newLevel > oldLevel) {
            user.gamification.level = newLevel;
            leveledUp = true;
            this.onLevelUp(user, oldLevel, newLevel);
        }

        // Check for new badges
        this.checkBadges(user);

        // Add activity log
        user.recentActivity.unshift({
            text: `+${amount} XP: ${reason}`,
            time: new Date().toLocaleString(),
            type: 'xp'
        });

        return {
            newXP: user.gamification.xp,
            leveledUp,
            newLevel,
            oldLevel
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
     * Handle level up event
     */
    onLevelUp(user, oldLevel, newLevel) {
        const levelTitle = this.getLevelTitle(newLevel);
        user.recentActivity.unshift({
            text: `🎉 Level Up! You're now Level ${newLevel} - ${levelTitle}!`,
            time: new Date().toLocaleString(),
            type: 'level_up'
        });
    },

    /**
     * Update streak
     */
    updateStreak(user) {
        if (!user.gamification) user.gamification = {};

        const today = new Date().toDateString();
        const lastLogin = user.gamification.lastLoginDate;

        if (lastLogin === today) {
            return { streakContinued: false, currentStreak: user.gamification.currentStreak };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastLogin === yesterdayStr) {
            user.gamification.currentStreak = (user.gamification.currentStreak || 0) + 1;

            // Streak milestone reward
            if (user.gamification.currentStreak % 7 === 0) {
                this.awardXP(user, GAMIFICATION_CONFIG.xp.streakMilestone, `${user.gamification.currentStreak}-day streak!`);
            }

        } else if (!lastLogin) {
            user.gamification.currentStreak = 1;
        } else {
            // Streak broken
            user.gamification.currentStreak = 1;
        }

        // Update longest streak
        if (user.gamification.currentStreak > (user.gamification.longestStreak || 0)) {
            user.gamification.longestStreak = user.gamification.currentStreak;
        }

        user.gamification.lastLoginDate = today;

        // Daily login XP
        this.awardXP(user, GAMIFICATION_CONFIG.xp.dailyLogin, 'Daily login');

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
        if (!user.gamification) user.gamification = {};

        user.gamification.lessonsCompleted = (user.gamification.lessonsCompleted || 0) + 1;

        // Track lessons today
        const today = new Date().toDateString();
        if (user.gamification.lastLessonDate !== today) {
            user.gamification.lessonsToday = 1;
            user.gamification.lastLessonDate = today;
        } else {
            user.gamification.lessonsToday += 1;
        }

        const xpAmount = user.gamification.lessonsCompleted === 1
            ? GAMIFICATION_CONFIG.xp.firstLesson
            : GAMIFICATION_CONFIG.xp.lessonComplete;

        const result = this.awardXP(user, xpAmount, 'Lesson completed');
        this.checkBadges(user);
        return result;
    },

    /**
     * Handle quiz completion
     */
    onQuizComplete(user, score) {
        if (!user.gamification) user.gamification = {};

        let xpAmount;
        let reason;

        if (score === 100) {
            xpAmount = GAMIFICATION_CONFIG.xp.quizPerfect;
            reason = 'Perfect quiz score!';
            user.gamification.perfectQuizzes = (user.gamification.perfectQuizzes || 0) + 1;
        } else if (score >= 50) {
            xpAmount = GAMIFICATION_CONFIG.xp.quizPass;
            reason = 'Quiz passed';
        } else {
            xpAmount = GAMIFICATION_CONFIG.xp.quizFail;
            reason = 'Quiz attempted';
        }

        const result = this.awardXP(user, xpAmount, reason);
        this.checkBadges(user);
        return result;
    },

    /**
    * Handle course completion
    */
    onCourseComplete(user) {
        user.gamification.coursesCompleted = (user.gamification.coursesCompleted || 0) + 1;
        const result = this.awardXP(user, 200, 'Course completed!'); // Bonus XP
        this.checkBadges(user);
        return result;
    },

    /**
     * Check and award badges
     */
    checkBadges(user) {
        const badges = GAMIFICATION_CONFIG.badges;
        const newBadges = [];

        if (!user.gamification.badges) user.gamification.badges = [];

        for (const key in badges) {
            const badge = badges[key];

            // Skip if already earned
            if (user.gamification.badges.includes(badge.id)) continue;

            // Check condition
            if (badge.condition(user)) {
                user.gamification.badges.push(badge.id);
                newBadges.push(badge);

                user.recentActivity.unshift({
                    text: `${badge.icon} Badge Earned: ${badge.name}`,
                    time: new Date().toLocaleString(),
                    type: 'badge'
                });
            }
        }
        return newBadges;
    }
};

module.exports = { GamificationEngine, GAMIFICATION_CONFIG };
