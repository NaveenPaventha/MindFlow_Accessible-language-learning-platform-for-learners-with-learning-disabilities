import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../context/AccessibilityContext';
import '../styles/style-kids.css';
import '../styles/animations.css';
import { VoiceFeatures } from '../utils/voice';
import { useAuth } from '../context/AuthContext';
import { Contrast, Volume2, BookOpen, Library, Home, User, LogOut, Megaphone, Users as UsersIcon } from 'lucide-react';

const Layout = ({ children, hideNavigation = false }) => {
    const location = useLocation();
    const isLoggedInPage = ['/dashboard', '/dyslexia-center', '/speech-practice', '/lesson', '/quiz', '/profile', '/admin', '/guardian-dashboard'].some(path => location.pathname.startsWith(path));
    const { user, logout } = useAuth();

    const {
        theme,
        toggleTheme,
        dyslexicFont,
        toggleDyslexicFont,
        increaseFontSize,
        decreaseFontSize,
        screenReaderActive,
        toggleScreenReader
    } = useAccessibility();

    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const [announcement, setAnnouncement] = React.useState(null);

    React.useEffect(() => {
        // const activeAnnouncements = MockBackend.getAnnouncements().filter(a => a.active);
        // if (activeAnnouncements.length > 0) {
        //     setAnnouncement(activeAnnouncements[activeAnnouncements.length - 1]);
        // }
        // TODO: Fetch announcements from API
    }, [location]);

    // Global click handler for Screen Reader
    React.useEffect(() => {
        const handleClick = (e) => {
            if (!screenReaderActive) return;

            // Don't interfere with the accessibility toolbar
            if (e.target.closest('.a11y-toolbar')) return;

            // Stop any current reading
            VoiceFeatures.stopReading();

            // Find the most relevant target
            const container = e.target.closest('.card, .stat-card, .stat-card-practice, .course-card-modern, .navbar, footer, h1, h2, h3, h4, p, button, .btn');
            const target = container || e.target;

            const textToRead = target.innerText || target.getAttribute('aria-label') || target.title;

            if (textToRead && textToRead.trim().length > 0) {
                e.preventDefault();
                e.stopPropagation();

                // Add visual highlight
                const originalOutline = target.style.outline;
                target.style.outline = '4px solid var(--primary-purple)';
                target.style.outlineOffset = '4px';
                target.classList.add('reading-now');

                const cleanText = textToRead.replace(/\s+/g, ' ').trim();
                VoiceFeatures.readText(cleanText, {
                    rate: 0.9,
                    onEnd: () => {
                        target.style.outline = originalOutline;
                        target.classList.remove('reading-now');
                    }
                });
            }
        };

        if (screenReaderActive) {
            document.addEventListener('click', handleClick, true);
            return () => {
                document.removeEventListener('click', handleClick, true);
                VoiceFeatures.stopReading();
            };
        } else {
            VoiceFeatures.stopReading();
        }
    }, [screenReaderActive]);

    const handleReadPage = () => {
        if (!screenReaderActive) return;

        // Collect all major text areas
        const mainContent = document.querySelector('main');
        if (!mainContent) return;

        // Get meaningful text from headings and paragraphs
        const elements = mainContent.querySelectorAll('h1, h2, h3, h4, p, .course-card-title, .course-card-description');
        let fullText = Array.from(elements)
            .map(el => el.innerText)
            .filter(txt => txt && txt.trim().length > 0)
            .join('. ');

        if (fullText) {
            VoiceFeatures.readText(fullText, { rate: 0.9 });
        }
    };

    return (
        <div className="layout-wrapper">
            {/* Animated Background Blobs */}
            <div className={`blob blob-1 ${theme}`}></div>
            <div className={`blob blob-2 ${theme}`}></div>
            <div className={`blob blob-3 ${theme}`}></div>

            {/* Accessibility Toolbar */}
            {!hideNavigation && (
                <aside className="a11y-toolbar animate-slide-in-right" aria-label="Accessibility Tools">
                    <button onClick={toggleTheme} className="a11y-btn" title="Toggle Theme" aria-label="Toggle Theme" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Contrast size={18}/></button>
                    <button onClick={toggleScreenReader} className="a11y-btn" title="Interface Reading" aria-label="Toggle Interface Reading" style={{ background: screenReaderActive ? 'var(--gradient-aurora)' : '', color: screenReaderActive ? 'white' : '', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Volume2 size={18}/></button>
                    {screenReaderActive && (
                        <button onClick={handleReadPage} className="a11y-btn animate-pop-in" title="Read Page Content" aria-label="Read Full Page" style={{ background: 'var(--gradient-sunrise)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={18}/></button>
                    )}
                    <button onClick={toggleDyslexicFont} className="a11y-btn" title="Dyslexia Font" aria-label="Toggle Dyslexia Font" style={{ background: dyslexicFont ? 'var(--gradient-galaxy)' : '', color: dyslexicFont ? 'white' : '' }}>Aa</button>
                    <button onClick={increaseFontSize} className="a11y-btn" title="Increase Font Size" aria-label="Increase Text Size">A+</button>
                    <button onClick={decreaseFontSize} className="a11y-btn" title="Decrease Font Size" aria-label="Decrease Text Size">A-</button>
                </aside>
            )}

            {/* Navigation Header */}
            {!hideNavigation && (
                <header style={{ padding: 'clamp(15px, 3vw, 30px) 0' }}>
                    <nav className="navbar container animate-fade-in-down" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ display: 'flex', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}><Library size={40} color="var(--primary-purple)" /></span>
                            <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontFamily: 'var(--font-display)' }}>MindFlow</h1>
                        </div>
                        <div className="navbar-links" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {!user ? (
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button onClick={toggleLanguage} className="btn btn-ghost btn-sm" style={{ fontWeight: 'bold' }}>
                                        {i18n.language === 'en' ? 'EN | हिंदी' : 'हिंदी | EN'}
                                    </button>
                                    <Link to="/" className="btn btn-ghost btn-sm">Sign In</Link>
                                    <Link to="/register" className="btn btn-primary btn-sm btn-3d">Sign Up</Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
                                    <button onClick={toggleLanguage} className="btn btn-ghost btn-sm" style={{ fontWeight: 'bold', marginRight: '5px' }}>
                                        {i18n.language === 'en' ? 'EN | हिंदी' : 'हिंदी | EN'}
                                    </button>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Welcome, <strong id="user-name" style={{ color: 'var(--text-color)' }}>{user ? (user.name || user.username) : 'User'}</strong>
                                        {user?.role === 'admin' && (
                                            <Link to="/admin" style={{ marginLeft: '12px', color: 'var(--primary-orange)', textDecoration: 'none', fontWeight: 'bold' }}>[Admin Panel]</Link>
                                        )}
                                        {user?.role === 'parent' && (
                                            <Link to="/guardian-dashboard" style={{ marginLeft: '12px', color: 'var(--primary-purple)', textDecoration: 'none', fontWeight: 'bold' }}>[Guardian Hub]</Link>
                                        )}
                                        {user?.role === 'teacher' && (
                                            <Link to="/teacher-dashboard" style={{ marginLeft: '12px', color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 'bold' }}>[Teacher Hub]</Link>
                                        )}
                                    </span>
                                    <Link to="/forum" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><UsersIcon size={16}/> {i18n.language === 'en' ? 'Community' : 'समुदाय'}</Link>
                                    {user?.role === 'student' && (
                                        <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Home size={16}/> {t('nav.dashboard')}</Link>
                                    )}
                                    {user?.role === 'parent' && (
                                        <Link to="/guardian-dashboard" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Home size={16}/> Guardian Hub</Link>
                                    )}
                                    {user?.role === 'teacher' && (
                                        <Link to="/teacher-dashboard" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Home size={16}/> {t('nav.teacherHub')}</Link>
                                    )}
                                    <Link to="/profile" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><User size={16}/> {t('nav.profile')}</Link>
                                    <button onClick={logout} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><LogOut size={16}/> {t('nav.logout')}</button>
                                </div>
                            )}
                        </div>
                    </nav>
                </header>
            )}

            {/* Global Announcement Banner */}
            {announcement && (
                <div className="animate-fade-in-down" style={{ background: 'var(--gradient-sunrise)', color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold', boxShadow: 'var(--shadow-3d-sm)', position: 'sticky', top: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Megaphone size={20}/>
                    {announcement.text}
                    <button onClick={() => setAnnouncement(null)} style={{ marginLeft: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', width: '24px', height: '24px' }}>&times;</button>
                </div>
            )}

            <main>
                {children}
            </main>

            {!isLoggedInPage && !hideNavigation && (
                <footer style={{ marginTop: 'clamp(40px, 8vw, 100px)', padding: 'clamp(20px, 4vw, 40px) 0', borderTop: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>&copy; 2026 MindFlow Academy. Learning that moves with you.</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.9rem' }}>
                                <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>
                                <a href="#" style={{ color: 'var(--text-muted)' }}>Terms of Service</a>
                                <a href="#" style={{ color: 'var(--text-muted)' }}>Contact Us</a>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;

