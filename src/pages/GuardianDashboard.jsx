import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { userAPI, courseAPI } from '../utils/api';
import IconMapping from '../components/IconMapping';
import { Shield, Home, FileText, BarChart3, Settings, Zap, Flame, Printer, Lock, Unlock, Trophy, BookOpen, User } from 'lucide-react';

const GuardianDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('hub');
    const [childrenData, setChildrenData] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        refreshData();
    }, [user]);

    const refreshData = async () => {
        if (user && user.role === 'parent') {
            try {
                const dataResponse = await userAPI.getChildProgress(user._id || user.id);
                if (dataResponse.data && Array.isArray(dataResponse.data) && dataResponse.data.length > 0) {
                    setChildrenData(dataResponse.data);
                    setSelectedChildId(dataResponse.data[0]._id);
                }
            } catch (e) {
                console.error("Failed to fetch children metadata", e);
            }

            // Fetch courses
            try {
                const coursesRes = await courseAPI.getAll();
                setAllCourses(coursesRes.data);
            } catch (e) { console.error(e); }
        }
        setLoading(false);
    };

    const handleToggleCourse = async (courseId) => {
        // userAPI.toggleLock(courseId)...
        alert("Course locking requires backend implementation of Parent-Child linking.");
    };

    const handleResetProgress = (courseId) => {
        if (window.confirm(`Are you sure you want to reset progress for ${courseId.replace('_', ' ')}? This cannot be undone.`)) {
            alert("Reset progress requires backend implementation.");
        }
    };

    if (loading) return <DashboardLayout><div className="container">Loading Guardian Hub...</div></DashboardLayout>;

    const childData = childrenData.find(c => c._id === selectedChildId);

    if (!childData) {
        return (
            <DashboardLayout>
                <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <div className="card shadow-lg" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <Shield size={64} color="var(--primary-purple)" />
                        </div>
                        <h2 style={{ marginTop: '20px', color: 'var(--primary-purple)' }}>Guardian Hub</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-medium)', margin: '20px 0' }}>
                            Account pending child connection.
                        </p>
                        <button className="btn btn-primary" onClick={() => window.location.href = '/profile'}>
                            Link Child Account
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container" style={{ padding: '40px 20px' }}>
                {/* Dashboard Header */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', color: 'var(--primary-purple)', marginBottom: '10px' }}>
                            Guardian Control Center
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <p style={{ color: 'var(--text-medium)', fontSize: '1.2rem', margin: 0 }}>
                                Managing learning path for:
                            </p>
                            <select 
                                value={selectedChildId} 
                                onChange={(e) => setSelectedChildId(e.target.value)}
                                style={{ padding: '8px 15px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '1.1rem', fontWeight: 600, background: 'var(--surface-color)', minWidth: '200px' }}
                            >
                                {childrenData.map(child => (
                                    <option key={child._id} value={child._id}>{child.name || child.username}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div style={{ background: 'var(--surface-color)', padding: '10px 20px', borderRadius: '50px', border: '1px solid var(--border-color)', display: 'flex', gap: '20px', fontWeight: 600 }}>
                        <span>Status: <span style={{ color: 'var(--success-color)' }}>● Active</span></span>
                        <span>Level: {childData.gamification?.level || 1}</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '30px',
                    borderBottom: '2px solid rgba(0,0,0,0.05)',
                    paddingBottom: '2px'
                }}>
                    {[
                        { id: 'hub', label: 'Overview Hub', icon: <Home size={18} />, color: 'var(--primary-purple)' },
                        { id: 'curriculum', label: 'Curriculum Path', icon: <FileText size={18} />, color: 'var(--primary-orange)' },
                        { id: 'insights', label: 'Learning Insights', icon: <BarChart3 size={18} />, color: '#10b981' },
                        { id: 'settings', label: 'Safety Settings', icon: <Settings size={18} />, color: '#6b7280' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '15px 25px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                color: activeTab === tab.id ? tab.color : 'var(--text-muted)',
                                borderBottom: activeTab === tab.id ? `4px solid ${tab.color}` : '4px solid transparent',
                                transition: 'all 0.2s',
                                borderRadius: '12px 12px 0 0'
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {tab.icon} {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in">
                    {activeTab === 'hub' && (
                        <div className="grid grid-3" style={{ gap: '30px' }}>
                            <div className="card shadow-md" style={{ gridColumn: 'span 2', padding: '30px' }}>
                                <h3 style={{ marginBottom: '20px' }}>Learning Pulse</h3>
                                <div className="grid grid-2" style={{ gap: '20px' }}>
                                    <div style={{ background: 'rgba(111, 66, 193, 0.05)', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Zap size={40} color="#eab308" /></div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{childData.gamification?.xp || 0}</div>
                                        <small style={{ color: 'var(--text-muted)' }}>Total Experience Points</small>
                                    </div>
                                    <div style={{ background: 'rgba(255, 193, 7, 0.05)', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Flame size={40} color="#f97316" /></div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{childData.gamification?.currentStreak || 0} Days</div>
                                        <small style={{ color: 'var(--text-muted)' }}>Current Learning Streak</small>
                                    </div>
                                </div>
                                <div style={{ marginTop: '30px' }}>
                                    <h4 style={{ marginBottom: '15px' }}>Most Progressed Course</h4>
                                    {childData.progress && Object.keys(childData.progress).length > 0 ? (
                                        (() => {
                                            const [bestId, bestPercent] = Object.entries(childData.progress).sort((a, b) => b[1] - a[1])[0];
                                            return (
                                                <div style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                        <strong style={{ fontSize: '1.1rem' }}>{bestId.replace('_', ' ').toUpperCase()}</strong>
                                                        <span style={{ color: 'var(--primary-purple)', fontWeight: 800 }}>{bestPercent}%</span>
                                                    </div>
                                                    <div style={{ height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${bestPercent}%`, height: '100%', background: 'var(--primary-purple)' }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)' }}>No courses started yet. house</p>
                                    )}
                                </div>
                            </div>
                            <div className="card shadow-md" style={{ padding: '30px' }}>
                                <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('curriculum')}>Manage Curriculum</button>
                                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('insights')}>View Full Report</button>
                                    <button className="btn btn-ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => window.print()}><Printer size={16}/> Print Report</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="card shadow-md" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div>
                                    <h3>Curriculum Control</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Lock or unlock specific modules to guide your child's learning pace.</p>
                                </div>
                                <span style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary-cyan)', padding: '5px 15px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {(childData.parentSettings?.lockedCourses || []).length} Courses Locked
                                </span>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--surface-color)', borderBottom: '2px solid var(--border-color)' }}>
                                        <tr>
                                            <th style={{ padding: '15px', textAlign: 'left' }}>Course Module</th>
                                            <th style={{ padding: '15px', textAlign: 'center' }}>Child Progress</th>
                                            <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                                            <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allCourses.map(course => {
                                            const settings = childData.parentSettings || { lockedCourses: [] };
                                            const lockedList = settings.lockedCourses || [];
                                            const isLocked = lockedList.includes(course.id);
                                            const progress = (childData.progress && childData.progress[course.id]) ? childData.progress[course.id] : 0;
                                            return (
                                                <tr key={course.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                                    <td style={{ padding: '20px 15px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <span style={{ display: 'flex' }}><IconMapping iconName={course.image} size={32} color="var(--primary-purple)" /></span>
                                                            <div>
                                                                <strong style={{ display: 'block' }}>{course.title}</strong>
                                                                <small style={{ color: 'var(--text-muted)' }}>{course.totalModules} Units</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '20px',
                                                            background: progress === 100 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                                                            color: progress === 100 ? '#10b981' : 'var(--text-medium)',
                                                            fontWeight: 700
                                                        }}>
                                                            {progress}%
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                                        <span style={{
                                                            color: isLocked ? 'var(--error-color)' : 'var(--success-color)',
                                                            fontWeight: 800,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            {isLocked ? <><Lock size={16}/> LOCKED</> : <><Unlock size={16}/> OPEN</>}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                                        <button
                                                            className={`btn btn-sm ${isLocked ? 'btn-primary' : 'btn-outline'}`}
                                                            style={{ marginRight: '10px' }}
                                                            onClick={() => handleToggleCourse(course.id)}
                                                        >
                                                            {isLocked ? 'Unlock' : 'Lock Access'}
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-ghost"
                                                            disabled={progress === 0}
                                                            onClick={() => handleResetProgress(course.id)}
                                                        >
                                                            Reset
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="card shadow-md" style={{ padding: '30px' }}>
                            <h3 style={{ marginBottom: '30px' }}>Learning Insights Report</h3>
                            <div style={{ borderLeft: '4px solid var(--primary-purple)', paddingLeft: '20px' }}>
                                {childData.recentActivity && childData.recentActivity.length > 0 ? (
                                    childData.recentActivity.map((activity, index) => (
                                        <div key={index} style={{
                                            marginBottom: '20px',
                                            padding: '15px',
                                            background: 'var(--surface-color)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activity.text}</div>
                                                <small style={{ color: 'var(--text-muted)' }}>Timestamp: {activity.time}</small>
                                            </div>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}>
                                                {activity.text.includes('100%') ? <Trophy size={18} color="#eab308" /> : <BookOpen size={18} color="var(--primary-purple)" />}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>No activities logged yet. house</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="card shadow-md" style={{ padding: '30px' }}>
                            <h3>Safety & Settings</h3>
                            <div style={{ marginTop: '30px', maxWidth: '500px' }}>
                                <div className="input-group">
                                    <label>Connected Child Profile</label>
                                    <div style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ display: 'flex', background: 'var(--primary-purple)', padding: '8px', borderRadius: '50%' }}><User size={24} color="white" /></div>
                                        <strong>{childData.name} (@{childData.username})</strong>
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginTop: '30px' }}>
                                    <label>Parental PIN Access</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                                        Require a PIN to enter this dashboard from the child's device.
                                    </p>
                                    <button className="btn btn-outline" disabled>Update PIN (Coming Soon)</button>
                                </div>
                                <div className="input-group" style={{ marginTop: '30px', padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '15px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                    <label style={{ color: 'var(--error-color)' }}>Danger Zone</label>
                                    <button className="btn btn-link" style={{ color: 'var(--error-color)', padding: 0 }} onClick={() => alert('Feature coming soon: Please contact admin to unlink accounts.')}>
                                        Unlink Child Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GuardianDashboard;
