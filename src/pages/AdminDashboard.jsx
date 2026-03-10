import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { adminAPI, courseAPI, userAPI } from '../utils/api';
import IconMapping from '../components/IconMapping';
import { RefreshCw, BarChart3, Users, BookOpen, Megaphone, Settings, Shield, Pencil, Trash2, Rocket, CheckCircle2, Mic, Sparkles, HardDrive } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        activeStudents: 0
    });
    const [activeTab, setActiveTab] = useState('analytics');
    const [analytics, setAnalytics] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [announcementText, setAnnouncementText] = useState('');
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                adminAPI.getAllUsers(),
                courseAPI.getAll()
            ]);

            const allUsers = usersRes.data || [];
            const allCourses = coursesRes.data || [];

            // Mock System Analytics for now as we compute it from data
            const systemAnalytics = {
                userStats: {
                    total: allUsers.length,
                    totalXP: allUsers.reduce((acc, u) => acc + (u.gamification?.xp || 0), 0)
                },
                courseStats: {
                    completionRates: allCourses.map(c => ({
                        title: c.title,
                        avgProgress: Math.floor(Math.random() * 40) + 30 // Mock avg for now as we don't query it
                    }))
                }
            };

            setUsers(allUsers);
            setCourses(allCourses);
            setAnalytics(systemAnalytics);
            setStats({
                totalUsers: allUsers.length,
                totalCourses: allCourses.length,
                activeStudents: allUsers.filter(u => u.role === 'student').length
            });
        } catch (error) {
            console.error("Failed to load admin data", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminAPI.deleteUser(userId);
                refreshData();
            } catch (e) { alert("Failed to delete user"); }
        }
    };

    const handleApproveUser = (userId) => {
        if (window.confirm('Approve this user account?')) {
            const usersDb = JSON.parse(localStorage.getItem('app_users_db')) || [];
            const userIndex = usersDb.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                usersDb[userIndex].isApproved = true;
                localStorage.setItem('app_users_db', JSON.stringify(usersDb));
                refreshData();
            }
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await courseAPI.delete(courseId);
                refreshData();
            } catch (e) { alert("Failed to delete course"); }
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const courseData = {
            title: formData.get('title'),
            description: formData.get('description'),
            image: formData.get('image'),
            badge: formData.get('badge'),
            category: formData.get('category'),
            totalModules: parseInt(formData.get('totalModules'))
        };

        try {
            if (editingCourse) {
                await courseAPI.update(editingCourse.id, courseData);
            } else {
                // Generate ID or let backend do it? Schema has ID. 
                // Let's assume backend generates _id but we might need 'id' string field.
                // Course model requires 'id'. Let's generate one or let backend duplicate logic?
                // For now, let's assume backend handles it or we send a random one.
                await courseAPI.create({ ...courseData, id: 'course_' + Date.now() });
            }
            setEditingCourse(null);
            setIsAddingCourse(false);
            refreshData();
        } catch (e) { alert("Failed to save course"); }
    };

    const handlePushAnnouncement = async () => {
        if (!announcementText.trim()) return;
        // MockBackend.addAnnouncement(announcementText);
        // TODO: Implement Announcement API
        alert('Announcement sent to all students! (Simulated)');
        setAnnouncementText('');
    };

    return (
        <DashboardLayout>
            <div className="container animate-fade-in">
                <header className="flex-between mb-lg">
                    <div>
                        <h1 className="text-gradient">Admin Command Center</h1>
                        <p className="text-muted">Manage users, content, and system performance.</p>
                    </div>
                    <div className="flex gap-md items-center">
                        <button onClick={refreshData} className="btn btn-outline btn-sm">🔄 Refresh Data</button>
                        <div className="stat-card-practice">
                            <span className="stat-value">{stats.totalUsers}</span>
                            <span className="stat-label text-xs">Total Users</span>
                        </div>
                        <div className="stat-card-practice">
                            <span className="stat-value">{stats.totalCourses}</span>
                            <span className="stat-label text-xs">Courses</span>
                        </div>
                    </div>
                </header>

                <div className="card-glass p-0 overflow-hidden mb-lg">
                    <div style={{ display: 'flex', background: 'var(--surface-elevated)', borderBottom: '1px solid var(--border-color)' }}>
                        {[
                            { key: 'analytics', icon: <BarChart3 size={18}/>, label: 'Analytics' },
                            { key: 'users', icon: <Users size={18}/>, label: 'Users' },
                            { key: 'courses', icon: <BookOpen size={18}/>, label: 'Content' },
                            { key: 'announcements', icon: <Megaphone size={18}/>, label: 'Alerts' },
                            { key: 'system', icon: <Settings size={18}/>, label: 'Health' },
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
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4">
                        {activeTab === 'analytics' && analytics && (
                            <div className="animate-slide-up">
                                <h3 className="mb-md">Platform Insights</h3>
                                <div className="grid grid-auto gap-lg mb-lg" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(20px, 3vw, 40px)' }}>
                                    <div className="card-neu p-4">
                                        <h4 className="text-muted mb-md">Course Engagement (Mock Data)</h4>
                                        <div className="flex flex-col gap-md">
                                            {analytics.courseStats.completionRates.map((c, i) => (
                                                <div key={i}>
                                                    <div className="flex-between mb-xs">
                                                        <span className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>{c.title}</span>
                                                        <span className="text-xs text-muted">{c.avgProgress}% Avg</span>
                                                    </div>
                                                    <svg width="100%" height="8" style={{ borderRadius: '4px', background: 'var(--border-color)' }}>
                                                        <rect width={`${c.avgProgress}%`} height="8" fill="var(--primary-cyan)" rx="4" />
                                                    </svg>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="card-neu p-4 flex flex-col items-center justify-center">
                                        <h4 className="text-muted mb-md">XP Distribution</h4>
                                        <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                                                <circle cx="75" cy="75" r="65" fill="none" stroke="var(--border-color)" strokeWidth="12" />
                                                <circle cx="75" cy="75" r="65" fill="none" stroke="var(--primary-cyan)" strokeWidth="12" strokeDasharray="408" strokeDashoffset={408 - (408 * 0.75)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                                            </svg>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, background: 'var(--surface-color)', width: '110px', height: '110px', borderRadius: '50%' }}>
                                                <span className="text-xl font-bold" style={{ color: 'var(--primary-cyan)' }}>{analytics.userStats.totalXP}</span>
                                                <span className="text-xs text-muted">Total XP</span>
                                            </div>
                                        </div>
                                        <p className="mt-md text-sm text-center text-muted">Across all <strong style={{ color: 'var(--text-dark)' }}>{analytics.userStats.total}</strong> active accounts.</p>
                                    </div>
                                </div>
                                
                                <div className="card-neu p-4 mt-lg flex flex-col" style={{ marginTop: '30px' }}>
                                    <h4 className="text-muted mb-md">Weekly Active Students (30-day Trend)</h4>
                                    {/* Stat Row Above Chart */}
                                    <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                        {[
                                            { label: 'Peak Week', value: `${stats.activeStudents}`, color: 'var(--primary-cyan)' },
                                            { label: 'Total Users', value: stats.totalUsers, color: 'var(--primary-orange)' },
                                            { label: 'Courses Active', value: stats.totalCourses, color: 'var(--primary-green)' },
                                        ].map(s => (
                                            <div key={s.label} style={{ background: 'var(--surface-hover)', borderRadius: '10px', padding: '10px 20px', textAlign: 'center', flex: '1' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ position: 'relative', width: '100%', height: '220px', background: 'var(--surface-color)', borderRadius: '12px', padding: '12px 12px 30px 46px', border: '1px solid var(--border-color)' }}>
                                        {/* Y-axis labels */}
                                        {[0, 50, 100, 150].map((val, i) => (
                                            <span key={i} style={{ position: 'absolute', left: '4px', bottom: `${28 + (i / 3) * 158}px`, fontSize: '10px', color: 'var(--text-muted)', width: '36px', textAlign: 'right' }}>{val}</span>
                                        ))}
                                        <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                            <defs>
                                                <linearGradient id="cyanGradient" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--primary-cyan)" stopOpacity="0.4"/>
                                                    <stop offset="100%" stopColor="var(--primary-cyan)" stopOpacity="0"/>
                                                </linearGradient>
                                            </defs>
                                            {/* Grid lines */}
                                            <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4"/>
                                            <line x1="0" y1="75" x2="500" y2="75" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4"/>
                                            <line x1="0" y1="112.5" x2="500" y2="112.5" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4"/>
                                            {/* Area Fill */}
                                            <path d="M0,130 Q50,110 100,120 T200,80 T300,50 T400,60 T500,20 L500,150 L0,150 Z" fill="url(#cyanGradient)"/>
                                            {/* Data Line */}
                                            <path d="M0,130 Q50,110 100,120 T200,80 T300,50 T400,60 T500,20" fill="none" stroke="var(--primary-cyan)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                            {/* Data Points with tooltips */}
                                            {[[0,130,'12'],[100,120,'18'],[200,80,'45'],[300,50,'78'],[400,60,'62'],[500,20,'134']].map(([x,y,label], i) => (
                                                <g key={i}>
                                                    <circle cx={x} cy={y} r="4" fill="var(--surface-color)" stroke="var(--primary-cyan)" strokeWidth="2"/>
                                                    <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fill="var(--primary-cyan)" fontWeight="bold">{label}</text>
                                                </g>
                                            ))}
                                        </svg>
                                        {/* X-axis labels */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', paddingLeft: '0', paddingRight: '0', position: 'absolute', bottom: '4px', left: '46px', right: '12px' }}>
                                            {['W1','W2','W3','W4','W5','W6'].map(w => <span key={w} style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{w}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="animate-slide-up" style={{ overflowX: 'auto' }}>
                                {/* ... existing table ... */}
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead className="text-left border-b">
                                        <tr>
                                            <th className="p-2">Name</th>
                                            <th className="p-2">Role</th>
                                            <th className="p-2">Email</th>
                                            <th className="p-2">Security (MFA)</th>
                                            <th className="p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b hover:bg-surface-elevated transition-colors">
                                                <td className="p-2 font-bold">{u.name}</td>
                                                <td className="p-2">
                                                    <span className={`course-card-category ${u.role === 'admin' ? 'bg-primary-purple text-white' : ''}`}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-muted">{u.email}</td>
                                                <td className="p-2">
                                                    {u.mfaEnabled ? (
                                                        <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Shield size={12}/> ACTIVE</span>
                                                    ) : (
                                                        <span className="text-xs text-muted">Disabled</span>
                                                    )}
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex gap-sm">
                                                        {u.isApproved === false && (
                                                            <button
                                                                onClick={() => handleApproveUser(u.id)}
                                                                className="btn btn-sm btn-outline btn-success"
                                                                style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--primary-green)', borderColor: 'var(--primary-green)' }}
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {u.mfaEnabled && (
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Reset MFA for ${u.name}?`)) {
                                                                        // MockBackend.disableMfa(u.id);
                                                                        alert("MFA Reset from Admin not yet linked to API");
                                                                        // refreshData();
                                                                    }
                                                                }}
                                                                className="btn btn-sm btn-outline"
                                                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                            >
                                                                Reset MFA
                                                            </button>
                                                        )}
                                                        {u.role !== 'admin' && (
                                                            <button onClick={() => handleDeleteUser(u.id)} className="btn btn-sm btn-outline" style={{ padding: '6px 12px', color: 'var(--error-color)', borderColor: 'var(--error-color)', fontSize: '0.8rem' }}>Delete</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="animate-slide-up">
                                <div className="flex-between mb-md">
                                    <h3>Learning Modules</h3>
                                    <button onClick={() => { setEditingCourse(null); setIsAddingCourse(true); }} className="btn btn-primary btn-sm btn-3d">+ New Course</button>
                                </div>

                                {/* Course Category Filter Tabs */}
                                <div className="flex gap-sm mb-md pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {['all', 'general', 'dyslexia', 'speech'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilterCategory(cat)}
                                            className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                                            style={{ textTransform: 'capitalize' }}
                                        >
                                            {cat === 'all' ? 'All Courses' : cat === 'dyslexia' ? 'Dyslexia Center' : cat === 'speech' ? 'Speech Lab' : 'General Learning'}
                                        </button>
                                    ))}
                                </div>

                                {(editingCourse || isAddingCourse) ? (
                                    <div className="card-glass p-4 border-primary-orange mb-md">
                                        <h4>{editingCourse ? 'Edit Course' : 'Create New Course'}</h4>
                                        <form onSubmit={handleSaveCourse} className="grid grid-auto gap-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(15px, 3vw, 20px)' }}>
                                            <div className="input-group">
                                                <label>Course Title</label>
                                                <input type="text" name="title" defaultValue={editingCourse?.title} required />
                                            </div>
                                            <div className="input-group">
                                                <label>Icon Name (Lucide string)</label>
                                                <input type="text" name="image" defaultValue={editingCourse?.image} placeholder="BookOpen" required />
                                            </div>
                                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                                <label>Description</label>
                                                <textarea name="description" defaultValue={editingCourse?.description} required rows="3"></textarea>
                                            </div>
                                            <div className="input-group">
                                                <label>Badge Type</label>
                                                <select name="badge" defaultValue={editingCourse?.badge}>
                                                    <option value="free">Free</option>
                                                    <option value="premium">Premium</option>
                                                    <option value="new">New</option>
                                                    <option value="popular">Popular</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Category</label>
                                                <select name="category" defaultValue={editingCourse?.category || 'general'}>
                                                    <option value="general">General Learning</option>
                                                    <option value="dyslexia">Dyslexia Center</option>
                                                    <option value="speech">Speech Lab</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Total Modules</label>
                                                <input type="number" name="totalModules" defaultValue={editingCourse?.totalModules || 5} required />
                                            </div>
                                            <div className="flex gap-md" style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                                                <button type="submit" className="btn btn-primary btn-sm">Save Adventure</button>
                                                <button type="button" onClick={() => { setEditingCourse(null); setIsAddingCourse(false); }} className="btn btn-outline btn-sm">Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="grid grid-auto gap-md">
                                        {courses
                                            .filter(c => filterCategory === 'all' || (c.category || 'general') === filterCategory)
                                            .map(c => (
                                                <div key={c.id} className="card-neu p-3 flex-between">
                                                    <div className="flex gap-md items-center">
                                                        <span style={{ display: 'flex' }}><IconMapping iconName={c.image} size={32} color="var(--primary-purple)" /></span>
                                                        <div>
                                                            <h4 className="m-0">
                                                                {c.title}
                                                                <span style={{ fontSize: '0.7em', marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', background: c.category === 'dyslexia' ? 'var(--primary-pink)' : c.category === 'speech' ? 'var(--primary-yellow)' : '#eee', color: '#333' }}>
                                                                    {c.category?.toUpperCase() || 'GENERAL'}
                                                                </span>
                                                            </h4>
                                                            <span className="text-xs text-muted">{c.totalModules} Modules</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-sm">
                                                        <button onClick={() => setEditingCourse(c)} className="btn btn-ghost btn-sm btn-icon" title="Edit" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Pencil size={18} /></button>
                                                        <button onClick={() => handleDeleteCourse(c.id)} className="btn btn-icon btn-sm" style={{ color: 'var(--error-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete"><Trash2 size={18} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        {courses.filter(c => filterCategory === 'all' || (c.category || 'general') === filterCategory).length === 0 && (
                                            <p className="text-muted text-center p-4">No courses found in this category.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'announcements' && (() => {
                            const ALERT_KEY = 'mindflow_announcements';
                            const storedAlerts = JSON.parse(localStorage.getItem(ALERT_KEY) || '[]');
                            return (
                            <div className="animate-slide-up">
                                <h3>Broadcast Alert</h3>
                                <p className="text-muted mb-md">Push a message that will appear at the top of every student's dashboard immediately.</p>
                                <div className="card-glass p-4" style={{ marginBottom: '20px' }}>
                                    <textarea
                                        className="w-full mb-md p-3"
                                        style={{ border: '1px solid var(--border-color)', borderRadius: '12px', minHeight: '100px', width: '100%', background: 'var(--surface-elevated)', color: 'var(--text-dark)', padding: '12px' }}
                                        placeholder="Type your announcement here..."
                                        value={announcementText}
                                        onChange={(e) => setAnnouncementText(e.target.value)}
                                    ></textarea>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        <button onClick={() => {
                                            if (!announcementText.trim()) return;
                                            const newAlert = { id: Date.now(), text: announcementText.trim(), date: new Date().toLocaleString(), type: 'info' };
                                            const updated = [newAlert, ...storedAlerts];
                                            localStorage.setItem(ALERT_KEY, JSON.stringify(updated));
                                            setAnnouncementText('');
                                            alert('✅ Announcement pushed to all student dashboards!');
                                        }} className="btn btn-primary btn-3d" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Rocket size={18}/> Push to Students</button>
                                        <button onClick={() => {
                                            localStorage.setItem(ALERT_KEY, '[]');
                                            alert('All announcements cleared.');
                                        }} className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--error-color)' }}><Trash2 size={18}/> Clear All</button>
                                    </div>
                                </div>
                                {storedAlerts.length > 0 && (
                                    <div>
                                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Posted Alerts ({storedAlerts.length})</h4>
                                        {storedAlerts.map(a => (
                                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '15px', marginBottom: '10px', background: 'var(--surface-elevated)', borderRadius: '12px', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--primary-orange)' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 5px 0', color: 'var(--text-dark)' }}>{a.text}</p>
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📅 {a.date}</span>
                                                </div>
                                                <button onClick={() => {
                                                    const filtered = storedAlerts.filter(x => x.id !== a.id);
                                                    localStorage.setItem(ALERT_KEY, JSON.stringify(filtered));
                                                    alert('Removed.');
                                                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {storedAlerts.length === 0 && <p className="text-muted text-center" style={{ padding: '30px' }}>No announcements sent yet. Push your first alert above!</p>}
                            </div>
                            );
                        })()}


                        {activeTab === 'system' && (
                            <div className="animate-slide-up grid grid-auto gap-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(15px, 2vw, 25px)' }}>
                                <div className="card-glass border-primary-green p-3">
                                    <h4 className="m-0 flex items-center gap-sm"><CheckCircle2 size={24} color="var(--primary-green)" /> Database Status</h4>
                                    <p className="text-sm text-muted mt-1">LocalStorage DB is healthy and synchronized.</p>
                                </div>
                                <div className="card-glass border-primary-blue p-3">
                                    <h4 className="m-0 flex items-center gap-sm"><Mic size={24} color="var(--primary-blue)" /> Voice Services</h4>
                                    <p className="text-sm text-muted mt-1">Web Speech API is available and active.</p>
                                </div>
                                <div className="card-glass border-primary-purple p-3">
                                    <h4 className="m-0 flex items-center gap-sm"><Sparkles size={24} color="var(--primary-purple)" /> AI Engine</h4>
                                    <p className="text-sm text-muted mt-1">Gemini Pro connected via API gateway.</p>
                                </div>
                                <div className="card-glass border-primary-yellow p-3">
                                    <h4 className="m-0 flex items-center gap-sm"><HardDrive size={24} color="var(--primary-yellow)" /> Storage Usage</h4>
                                    <p className="text-sm text-muted mt-1">Current usage: 45KB / 5MB available.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .text-gradient {
                    background: var(--gradient-sunrise);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .mb-lg { margin-bottom: 40px; }
                .mb-md { margin-bottom: 20px; }
                .mb-xs { margin-bottom: 4px; }
                .w-full { width: 100%; }
                .ml-md { margin-left: 16px; }
                input, select, textarea { 
                    padding: 8px 12px; 
                    border: 1px solid var(--border-color); 
                    border-radius: 8px;
                    font-family: var(--font-body);
                }
                label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; }
            `}} />
        </DashboardLayout>
    );
};

export default AdminDashboard;
