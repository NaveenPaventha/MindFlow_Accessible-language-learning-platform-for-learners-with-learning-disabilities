import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import IconMapping from '../components/IconMapping';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Trophy, Flame, Target, Zap, BookOpen, BrainCircuit, Bell, X, CheckCircle2 } from 'lucide-react';
import { MockBackend } from '../utils/MockBackend';

const DashboardHome = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [dismissedAlerts, setDismissedAlerts] = useState([]);

    if (!user) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>Initializing...</div>;

    const xp = user.gamification?.xp || 0;
    const level = user.gamification?.level || 1;
    const streak = user.gamification?.currentStreak || 0;
    const badges = user.gamification?.badges || [];
    
    // Calculate progress for next level (mock logic: 1000xp per level)
    const xpForNextLevel = level * 1000;
    const currentLevelProgress = (xp % 1000) / 1000;
    const progressCircumference = 2 * Math.PI * 38; // Radius 38
    const progressOffset = progressCircumference - (currentLevelProgress * progressCircumference);

    // ── Dynamic: find the user's next uncompleted course ──
    const allCourses = MockBackend.getAllCourses ? MockBackend.getAllCourses()
        : (JSON.parse(localStorage.getItem('app_courses')) || []);
    const userProgress = user.progress || {};
    const nextUnfinished = allCourses.find(c => (userProgress[c.id] || 0) < 100);
    const completedCount = allCourses.filter(c => (userProgress[c.id] || 0) >= 100).length;
    const overallPct = allCourses.length
        ? Math.round(allCourses.reduce((s, c) => s + (userProgress[c.id] || 0), 0) / allCourses.length)
        : 0;

    const announcements = JSON.parse(localStorage.getItem('mindflow_announcements') || '[]')
        .filter(a => !dismissedAlerts.includes(a.id));

    return (
        <DashboardLayout>
            {/* Announcement Banners from Admin */}
            {announcements.length > 0 && (
                <div style={{ maxWidth: '1100px', margin: '0 auto 20px auto' }}>
                    {announcements.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', marginBottom: '10px', background: 'rgba(251, 146, 60, 0.1)', border: '1px solid var(--primary-orange)', borderLeft: '4px solid var(--primary-orange)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Bell size={18} color="var(--primary-orange)" />
                                <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{a.text}</span>
                            </div>
                            <button onClick={() => setDismissedAlerts(d => [...d, a.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}><X size={16}/></button>
                        </div>
                    ))}
                </div>
            )}

            {/* Duolingo Style Grid: Main Content (Left) + Stats Sidebar (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '40px', alignItems: 'start', maxWidth: '1100px', margin: '0 auto' }}>
                
                {/* LEFT COLUMN: Main Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Hero Welcome Box - Antigravity Style */}
                    <section className="animate-slide-in-up" style={{ padding: '40px', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary-cyan)' }}></div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <BrainCircuit size={32} color="var(--primary-cyan)" /> Welcome back, {user?.name?.split(' ')[0] || user?.username}
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>
                            Ready to continue your learning journey? 🚀
                        </p>
                    </section>

                    {/* Learning Path Simulation (Duolingo Style Nodes) */}
                    <section>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Current Path</h3>
                        
                        {/* ── Dynamic: Next course card ── */}
                        {nextUnfinished ? (
                            <Link
                                to={`/lesson/${nextUnfinished.id}`}
                                style={{ display: 'block', textDecoration: 'none', background: 'var(--surface-elevated)', borderRadius: '16px', padding: '20px', border: '2px solid var(--primary-cyan)', transition: 'all 0.2s', marginBottom: '15px', color: 'inherit', boxShadow: '0 0 20px rgba(0,229,255,0.08)' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,229,255,0.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,255,0.15)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,229,255,0.08)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary-cyan)', fontSize: '1.8rem', flexShrink: 0 }}>
                                        {typeof nextUnfinished.image === 'string' && nextUnfinished.image.length <= 4
                                            ? nextUnfinished.image
                                            : <BookOpen size={28} color="var(--primary-cyan)" />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-cyan)', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(0,229,255,0.1)', padding: '2px 8px', borderRadius: '20px' }}>CONTINUE</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userProgress[nextUnfinished.id] || 0}% complete</span>
                                        </div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nextUnfinished.title}</h4>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nextUnfinished.description}</p>
                                        {/* Progress bar */}
                                        <div style={{ marginTop: '10px', height: '4px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${userProgress[nextUnfinished.id] || 0}%`, height: '100%', background: 'var(--primary-cyan)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                                        </div>
                                    </div>
                                    <button style={{ background: 'var(--primary-cyan)', color: '#000', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}>
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </Link>
                        ) : (
                            <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(0,229,255,0.05)', border: '2px dashed var(--primary-cyan)', borderRadius: '16px', marginBottom: '15px' }}>
                                <CheckCircle2 size={40} color="var(--primary-cyan)" style={{ margin: '0 auto 10px' }} />
                                <h4 style={{ color: 'var(--text-dark)' }}>🎉 All Courses Complete!</h4>
                                <p style={{ color: 'var(--text-muted)' }}>You've mastered everything. Check back soon for new content!</p>
                                <Link to="/courses" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}><BookOpen size={16}/> Browse Library</Link>
                            </div>
                        )}

                        {/* Overall progress bar */}
                        <div style={{ padding: '15px 20px', background: 'var(--surface-elevated)', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Progress</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--primary-cyan)', fontWeight: 700 }}>{completedCount} / {allCourses.length} courses · {overallPct}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{ width: `${overallPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-cyan), var(--primary-green))', borderRadius: '6px', transition: 'width 0.6s ease' }} />
                            </div>
                        </div>

                        {/* NLP Lab Link */}
                        <Link to="/nlp-lab" style={{ display: 'block', textDecoration: 'none', background: 'var(--surface-elevated)', borderRadius: '16px', padding: '20px', border: '2px solid transparent', transition: 'all 0.2s', color: 'inherit' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-purple)'; e.currentTarget.style.background = 'rgba(167,139,250,0.05)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--surface-elevated)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(167,139,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary-purple)' }}>
                                    <IconMapping iconName="Brain" size={28} color="var(--primary-purple)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--text-dark)' }}>Practice Lab</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>AI NLP Writing & Reading Assistant</p>
                                </div>
                                <button style={{ background: 'var(--primary-purple)', color: '#000', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </Link>
                    </section>
                </div>

                {/* RIGHT COLUMN: Stats Sidebar (Sticky) */}
                <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Circular Level Progress Ring */}
                    <div style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '25px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 15px' }}>
                            <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                {/* Background Ring */}
                                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--surface-elevated)" strokeWidth="12" />
                                {/* Progress Ring */}
                                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--primary-cyan)" strokeWidth="12" strokeDasharray={progressCircumference} strokeDashoffset={progressOffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>{level}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--primary-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</span>
                            </div>
                        </div>
                        <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-dark)' }}>{xp} / {xpForNextLevel} XP</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{xpForNextLevel - xp} XP to Level {level + 1}</p>
                    </div>

                    {/* Streak Box */}
                    <div style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255, 107, 53, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Flame size={28} color="var(--primary-orange)" />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 3px 0', fontSize: '1.2rem', color: 'var(--text-dark)' }}>{streak} Day Streak</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keep your connection active.</p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <Zap size={24} color="var(--primary-yellow)" style={{ margin: '0 auto 10px' }} />
                            <h4 style={{ margin: '0 0 3px 0', fontSize: '1.4rem', color: 'var(--text-dark)' }}>{xp}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total XP</span>
                        </div>
                        <div style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <Trophy size={24} color="var(--primary-pink)" style={{ margin: '0 auto 10px' }} />
                            <h4 style={{ margin: '0 0 3px 0', fontSize: '1.4rem', color: 'var(--text-dark)' }}>{badges.length}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Badges</span>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Inject mobile layout adjustments */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 900px) {
                    .duolingo-layout > div {
                        grid-template-columns: 1fr !important;
                    }
                    .duolingo-layout > div > div:last-child {
                        position: relative !important;
                        top: 0 !important;
                    }
                }
            `}} />
        </DashboardLayout>
    );
};

export default DashboardHome;
