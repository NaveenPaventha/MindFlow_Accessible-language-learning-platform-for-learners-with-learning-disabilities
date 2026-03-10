import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAccessibility } from '../context/AccessibilityContext';
import { Menu, Contrast, Volume2, BookOpen as BookOpenIcon, XCircle } from 'lucide-react';
import { VoiceFeatures } from '../utils/voice';
import { useTranslation } from 'react-i18next';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const {
        theme,
        toggleTheme,
        dyslexicFont,
        toggleDyslexicFont,
        increaseFontSize,
        decreaseFontSize,
        screenReaderActive,
        toggleScreenReader,
        isFocusMode,
        toggleFocusMode
    } = useAccessibility();
    
    const location = useLocation();

    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleReadPage = () => {
        if (!screenReaderActive) return;
        const mainContent = document.querySelector('main');
        if (!mainContent) return;

        // Only read actual content elements, not buttons or nav controls
        const elements = mainContent.querySelectorAll('h1, h2, h3, h4, p, .course-card-title, .course-card-description');
        let fullText = Array.from(elements)
            .filter(el => {
                // Skip elements inside navigation, topbar, sidebar, or accessibility controls
                const parent = el.closest('nav, [class*="topbar"], [class*="sidebar"], [class*="a11y"], button');
                return !parent && el.innerText && el.innerText.trim().length > 3;
            })
            .map(el => el.innerText)
            .join('. ');

        if (fullText) {
            VoiceFeatures.readText(fullText, { rate: 0.9 });
        }
    };

    useEffect(() => {
        if (screenReaderActive) {
            setTimeout(handleReadPage, 500);
        } else {
            VoiceFeatures.stopReading();
        }
    }, [screenReaderActive, location?.pathname]);

    return (
        <div className={`app-container ${theme} ${dyslexicFont ? 'dyslexia-font' : ''} ${isFocusMode ? 'focus-mode' : ''}`}>
            
            {!isFocusMode && (
                <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            )}

            <div className={`main-content ${isFocusMode ? 'focus-expanded' : ''}`}>
                {!isFocusMode && (
                    <header className="topbar">
                        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>

                        <div className="topbar-actions">
                            {/* Accessibility Controls have been embedded into the Sidebar */}
                        </div>
                    </header>
                )}

                <main className="page-content duolingo-layout">
                    {children}
                </main>

                {isFocusMode && (
                    <button 
                        onClick={toggleFocusMode}
                        style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '12px 24px', background: 'var(--primary-orange)', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(251, 146, 60, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <XCircle size={20} /> Exit Focus Mode
                    </button>
                )}
            </div>
        </div>
    );
};

export default DashboardLayout;
