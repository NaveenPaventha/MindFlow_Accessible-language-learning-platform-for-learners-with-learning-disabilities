import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
    Home, 
    BookOpen, 
    Mic, 
    MessageSquare, 
    Settings, 
    LogOut, 
    ChevronLeft,
    ChevronRight,
    Library,
    User,
    Menu,
    X,
    Contrast,
    Volume2,
    BrainCircuit
} from 'lucide-react';
import '../styles/sidebar.css'; // We will create this

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme, screenReaderActive, toggleScreenReader, dyslexicFont, toggleDyslexicFont, enableScreenReader, disableScreenReader } = useAccessibility();
    const [collapsed, setCollapsed] = useState(false);

    let navItems = [];
    if (user?.role === 'admin') {
        navItems = [
            { path: '/admin', label: t('nav.adminHub', { defaultValue: 'Admin Hub' }), icon: <Home size={20} /> },
            { path: '/forum', label: t('nav.community'), icon: <MessageSquare size={20} /> },
            { path: '/profile', label: t('nav.settings'), icon: <Settings size={20} /> }
        ];
    } else if (user?.role === 'teacher') {
        navItems = [
            { path: '/teacher-dashboard', label: t('nav.teacherHub', { defaultValue: 'Teacher Hub' }), icon: <Home size={20} /> },
            { path: '/forum', label: t('nav.community'), icon: <MessageSquare size={20} /> },
            { path: '/profile', label: t('nav.settings'), icon: <Settings size={20} /> }
        ];
    } else if (user?.role === 'parent') {
        navItems = [
            { path: '/guardian-dashboard', label: t('nav.guardianHub', { defaultValue: 'Guardian Hub' }), icon: <Home size={20} /> },
            { path: '/forum', label: t('nav.community'), icon: <MessageSquare size={20} /> },
            { path: '/profile', label: t('nav.settings'), icon: <Settings size={20} /> }
        ];
    } else {
        navItems = [
            { path: '/dashboard', label: t('nav.dashboard'), icon: <Home size={20} /> },
            { path: '/courses', label: t('nav.courses'), icon: <BookOpen size={20} /> },
            { path: '/dyslexia-center', label: t('nav.dyslexiaCenter', { defaultValue: 'Dyslexia Center' }), icon: <Library size={20} /> },
            { path: '/speech-practice', label: t('nav.speechPractice', { defaultValue: 'Active Listening' }), icon: <Mic size={20} /> },
            { path: '/nlp-lab', label: t('nav.practiceLab'), icon: <Mic size={20} /> },
            { path: '/forum', label: t('nav.community'), icon: <MessageSquare size={20} /> },
            { path: '/profile', label: t('nav.settings'), icon: <Settings size={20} /> }
        ];
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={toggleSidebar}
                />
            )}

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open-mobile' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <BrainCircuit size={28} color="var(--primary-cyan)" />
                        {!collapsed && <h2 style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.05em', margin: 0 }}>MINDFLOW</h2>}
                    </div>
                    
                    {/* Desktop Collapse Toggle */}
                    <button className="sidebar-collapse-btn hidden-mobile" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>

                    {/* Mobile Close Toggle */}
                    <button className="sidebar-close-btn hidden-desktop" onClick={toggleSidebar}>
                        <X size={24} />
                    </button>
                </div>

                <div className="user-profile-mini">
                    <div className="avatar">
                        <User size={24} />
                    </div>
                    {!collapsed && (
                        <div className="user-info">
                            <span className="user-name">{user?.name || user?.username}</span>
                            <span className="user-role badge" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--primary-cyan)', border: '1px solid rgba(0,229,255,0.2)' }}>{user?.role}</span>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path} 
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={() => { if(window.innerWidth <= 768) toggleSidebar(); }}
                        >
                            <span className="icon">{item.icon}</span>
                            {!collapsed && <span className="label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {/* Native Accessibility Options */}
                    {!collapsed && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                            <button onClick={() => { const newLang = i18n.language === 'en' ? 'hi' : 'en'; i18n.changeLanguage(newLang); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }} title="Toggle Language">{i18n.language === 'en' ? 'HI' : 'EN'}</button>
                            <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Toggle Theme"><Contrast size={18}/></button>
                            <button onClick={toggleDyslexicFont} style={{ background: 'transparent', border: 'none', color: dyslexicFont ? 'var(--primary-cyan)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }} title="Dyslexia Font">Aa</button>
                            
                            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '2px' }} title="Read Aloud">
                                <button onClick={disableScreenReader} style={{ border: 'none', background: !screenReaderActive ? 'var(--primary-purple)' : 'transparent', color: 'white', fontSize: '0.65rem', padding: '2px 5px', cursor: 'pointer', borderRadius: '2px' }}>OFF</button>
                                <button onClick={enableScreenReader} style={{ border: 'none', background: screenReaderActive ? 'var(--primary-cyan)' : 'transparent', color: 'white', fontSize: '0.65rem', padding: '2px 5px', cursor: 'pointer', borderRadius: '2px' }}>ON</button>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '10px 0', marginBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                            <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Toggle Theme"><Contrast size={18}/></button>
                            <button onClick={toggleDyslexicFont} style={{ background: 'transparent', border: 'none', color: dyslexicFont ? 'var(--primary-cyan)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }} title="Dyslexia Font">Aa</button>
                            <button onClick={toggleScreenReader} style={{ background: 'transparent', border: 'none', color: screenReaderActive ? 'var(--primary-cyan)' : 'var(--text-muted)', cursor: 'pointer' }} title={screenReaderActive ? "Turn Off Read Aloud" : "Turn On Read Aloud"}><Volume2 size={18}/></button>
                        </div>
                    )}

                    <button className="sidebar-link logout-btn" onClick={logout}>
                        <span className="icon"><LogOut size={20} /></span>
                        {!collapsed && <span className="label">{t('nav.logout')}</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
