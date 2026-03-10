import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../utils/api';
import { COURSE_DATA } from '../data/course_data';
import IconMapping from '../components/IconMapping';
import { useTranslation } from 'react-i18next';

const CourseLibrary = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                if (user) {
                    const response = await courseAPI.getAll();
                    const userProgress = user.progress || {};
                    const parentSettings = user.parentSettings || { lockedCourses: [] };

                    // Implementation logic for Strict Recommendation:
                    // Find the FIRST course mathematically that is NOT 100% completed.
                    // This implies the sequence must be followed in index order from DB.
                    let targetRecommendedIndex = -1;
                    
                    const sortedRaw = response.data.sort((a,b) => {
                        return (parseInt(a.id.replace('c','')) || 0) - (parseInt(b.id.replace('c','')) || 0);
                    });

                    for (let i = 0; i < sortedRaw.length; i++) {
                        const cid = sortedRaw[i].id;
                        if ((userProgress[cid] || 0) < 100) {
                            targetRecommendedIndex = i;
                            break;
                        }
                    }

                    const enrichedCourses = sortedRaw.map((course, index) => {
                        const isLockedByParent = parentSettings.lockedCourses?.includes(course.id);
                        
                        // It is structurally locked if it's past the recommended index (requires previous course finish)
                        // By default we enforce sequential progression unless Admin/Teacher disables it (mocked here as always strictly sequential)
                        const isSequentialLock = index > targetRecommendedIndex && targetRecommendedIndex !== -1;
                        
                        return {
                            ...course,
                            progress: userProgress[course.id] || 0,
                            locked: isLockedByParent || isSequentialLock,
                            lockedReason: isLockedByParent ? 'Locked by Guardian' : (isSequentialLock ? 'Finish previous courses first' : null),
                            recommended: index === targetRecommendedIndex
                        };
                    });
                    
                    // Keep them in numerical chapter order, rather than floating recommended to top, 
                    // visually implying the path to take.
                    setCourses(enrichedCourses);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    if (!user) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Loading Library...</div>;

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10px' }}>
                <div className="course-section-header" style={{ marginBottom: '30px' }}>
                    <h2 className="course-section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '2rem' }}>
                        <span className="icon-bounce" style={{ display: 'flex' }}><IconMapping iconName="BookOpen" size={36} color="var(--primary-cyan)" /></span> 
                        {t('nav.courses', 'Course Library')}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Follow your personalized learning path below.</p>
                </div>
                
                <div className="course-cards-grid">
                    {courses.map((course, index) => {
                        const hasData = !!COURSE_DATA[course.id];
                        const isHardLocked = course.locked || !hasData;

                        return (
                            <article key={course.id} className="course-card-modern animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className={`course-card-illustration ${course.gradient || 'gradient-blue'}`} style={{ filter: isHardLocked ? 'grayscale(0.8)' : 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <span className="illustration-icon" style={{ display: 'flex' }}><IconMapping iconName={course.image || 'Library'} size={64} color="white" style={{opacity: 0.9, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'}} /></span>
                                    {course.badge && <span className={`course-badge ${course.badge}`}>{course.badge.toUpperCase()}</span>}
                                    {!hasData && <span className="course-badge" style={{ background: '#666', right: '10px' }}>{t('dashboard.comingSoon')}</span>}
                                    {course.recommended && <span className="course-badge" style={{ background: 'var(--primary-orange)', right: course.badge ? '80px' : '10px', boxShadow: '0 0 10px rgba(251, 146, 60, 0.5)' }}>{t('dashboard.recommended')}</span>}
                                </div>
                                <div className="course-card-body">
                                    <h3 className="course-card-title">{course.title}</h3>
                                    <p className="course-card-description">{course.description}</p>
                                    
                                    <div className="course-progress-wrapper" style={{ marginTop: '15px' }}>
                                        <div className="course-progress-header">
                                            <span className="course-progress-label">Completion</span>
                                            <span className="course-progress-percent">{course.progress}%</span>
                                        </div>
                                        <div className="course-progress-bar">
                                            <div className="course-progress-fill" style={{ width: `${course.progress}%` }}></div>
                                        </div>
                                    </div>

                                    <button
                                        className={`course-action-btn ${isHardLocked ? 'btn-locked' : 'btn-start'}`}
                                        onClick={() => {
                                            if (!hasData) {
                                                alert("This course module is currently under construction.");
                                            } else if (!course.locked) {
                                                window.location.href = `/lesson/${course.id}`;
                                            }
                                        }}
                                        style={{
                                            opacity: isHardLocked ? 0.6 : 1,
                                            cursor: isHardLocked && hasData ? 'not-allowed' : 'pointer',
                                            filter: isHardLocked ? 'grayscale(0.5)' : 'none',
                                            marginTop: '15px'
                                        }}
                                    >
                                        {!hasData ? `🔒 ${t('dashboard.locked')}` : (course.locked ? `🔒 ${course.lockedReason}` : (course.progress > 0 ? t('dashboard.continueCourse') : t('dashboard.startCourse')))}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CourseLibrary;
