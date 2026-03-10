import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../utils/api';
import { MockBackend } from '../utils/MockBackend';
import IconMapping from '../components/IconMapping';
import { Pencil, Trash2, Plus, Users, BookOpen, Presentation, CheckCircle } from 'lucide-react';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('courses');
    const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0 });

    useEffect(() => {
        if (user && user.role !== 'teacher') {
            navigate('/');
        } else {
            loadDashboardData();
        }
    }, [user, navigate]);

    const loadDashboardData = async () => {
        try {
            // For prototype, get all courses. In a real app, get courses authored by this teacher.
            let teacherCourses = [];
            try {
                const coursesRes = await courseAPI.getAll();
                teacherCourses = coursesRes.data || [];
            } catch (apiErr) {
                console.warn("Backend API unavailable, falling back to MockBackend");
                teacherCourses = MockBackend.getAllCourses();
            }

            // Final fallback if both fail or return nothing
            if (!teacherCourses || teacherCourses.length === 0) {
                teacherCourses = MockBackend.getAllCourses();
            }

            setCourses(teacherCourses);
            
            // Mock stats
            setStats({
                totalStudents: Math.floor(Math.random() * 50) + 10,
                totalCourses: teacherCourses.length
            });
        } catch (error) {
            console.error("Failed to load teacher data", error);
            // Last resort safety
            setCourses(MockBackend.getAllCourses());
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Delete this course? Note: In a real system you may only archive it if students are enrolled.')) {
            try {
                await courseAPI.delete(courseId);
                loadDashboardData();
            } catch (e) { alert("Failed to delete course"); }
        }
    };

    return (
        <DashboardLayout>
            <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <header className="flex-between mb-lg" style={{ marginBottom: '30px' }}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Teacher Hub</h1>
                        <p className="text-muted">Welcome back, {user?.name}. Manage your courses and track student progress.</p>
                    </div>
                    <div className="flex gap-md items-center">
                        <div className="stat-card-practice" style={{ padding: '15px 25px', borderRadius: '15px', background: 'var(--surface-elevated)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <span className="stat-value" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-purple)' }}>{stats.totalStudents}</span>
                            <span className="stat-label text-xs text-muted" style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Enrolled Students</span>
                        </div>
                        <div className="stat-card-practice" style={{ padding: '15px 25px', borderRadius: '15px', background: 'var(--surface-elevated)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <span className="stat-value" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-blue)' }}>{stats.totalCourses}</span>
                            <span className="stat-label text-xs text-muted" style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Courses</span>
                        </div>
                    </div>
                </header>

                <div className="card w-full" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', background: 'var(--surface-elevated)', borderBottom: '1px solid var(--border-color)' }}>
                        {[
                            { key: 'courses', icon: <BookOpen size={18}/>, label: 'My Courses' },
                            { key: 'students', icon: <Users size={18}/>, label: 'Student Insights' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '15px 20px',
                                    fontWeight: 700,
                                    border: 'none',
                                    borderBottom: activeTab === tab.key ? '3px solid var(--primary-cyan)' : '3px solid transparent',
                                    background: activeTab === tab.key ? 'rgba(0,229,255,0.06)' : 'transparent',
                                    color: activeTab === tab.key ? 'var(--primary-cyan)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4" style={{ padding: '30px' }}>
                        {activeTab === 'courses' && (
                            <div className="animate-slide-up">
                                <div className="flex-between mb-md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0 }}>Course Library</h3>
                                    <button onClick={() => navigate('/teacher/course-builder/new')} className="btn btn-primary btn-3d" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18}/> New Course</button>
                                </div>

                                <div className="grid grid-auto gap-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                    {courses.map(c => (
                                        <div key={c.id} className="card-neu" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                                            <div className="flex gap-md items-start mb-sm" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginBottom: '15px' }}>
                                                <span style={{ display: 'flex', padding: '10px', background: 'var(--surface-hover)', borderRadius: '12px' }}><IconMapping iconName={c.image} size={32} color="var(--primary-purple)" /></span>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{c.title}</h4>
                                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }} className="text-truncate-2">{c.description}</p>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Presentation size={14}/> {c.totalModules} Lessons
                                                </span>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => navigate(`/teacher/course-builder/${c.id}`)} className="btn btn-sm btn-outline" style={{ padding: '5px 10px', borderRadius: '6px' }} title="Edit Course"><Pencil size={16}/></button>
                                                    <button onClick={() => handleDeleteCourse(c.id)} className="btn btn-sm btn-ghost" style={{ padding: '5px 10px', borderRadius: '6px', color: 'var(--error-color)' }} title="Delete"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {courses.length === 0 && (
                                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'var(--surface-hover)', borderRadius: '15px', border: '2px dashed var(--border-color)' }}>
                                            <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '15px' }} />
                                            <h4 style={{ color: 'var(--text-muted)' }}>You haven't created any courses yet.</h4>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click 'New Course' to get started!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'students' && (
                            <div className="animate-slide-up" style={{ textAlign: 'center', padding: '40px' }}>
                                <Users size={48} style={{ display: 'inline-block', margin: '0 auto 20px auto', color: 'var(--primary-blue)' }} />
                                <h3>Student Insights (Coming in Phase 3)</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                                    This dashboard will soon populate with individual student progress reports, completion metrics, and written/speech assignment evaluations.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TeacherDashboard;
