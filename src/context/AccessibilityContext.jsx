import React, { createContext, useState, useEffect, useContext } from 'react';
import { VoiceFeatures } from '../utils/voice';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('siteTheme') || 'dark');
    const [fontSize, setFontSize] = useState(() => {
        const saved = parseInt(localStorage.getItem('fontSize'), 10);
        return isNaN(saved) ? 16 : saved;
    });
    const [dyslexicFont, setDyslexicFont] = useState(() => localStorage.getItem('dyslexiaFont') === 'true');
    const [screenReaderActive, setScreenReaderActive] = useState(() => localStorage.getItem('screenReaderActive') === 'true');
    const [isFocusMode, setIsFocusMode] = useState(() => localStorage.getItem('isFocusMode') === 'true');
    const [speechRate, setSpeechRate] = useState(() => {
        const saved = parseFloat(localStorage.getItem('speechRate'));
        return isNaN(saved) ? 1.0 : saved;
    });

    // Apply side effects
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('siteTheme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    useEffect(() => {
        if (dyslexicFont) {
            document.body.classList.add('dyslexia-font');
        } else {
            document.body.classList.remove('dyslexia-font');
        }
        localStorage.setItem('dyslexiaFont', dyslexicFont);
    }, [dyslexicFont]);

    useEffect(() => {
        localStorage.setItem('screenReaderActive', screenReaderActive);
    }, [screenReaderActive]);

    useEffect(() => {
        localStorage.setItem('isFocusMode', isFocusMode);
    }, [isFocusMode]);

    useEffect(() => {
        localStorage.setItem('speechRate', speechRate);
    }, [speechRate]);

    // Adaptive Generative UI: ADHD Focus Mode Auto-Trigger
    useEffect(() => {
        let clickCount = 0;
        let clickTimer;
        let inactivityTimer;

        const handleGlobalClick = () => {
            clickCount++;
            if (clickCount >= 15 && !isFocusMode) {
                setIsFocusMode(true);
                alert("MindFlow: Rapid clicking detected. Auto-enabling Focus Mode.");
                clickCount = 0;
            }
            
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000); // 5 clicks within 2 seconds
        };

        const handleInactivity = () => {
            if (!isFocusMode) {
                setIsFocusMode(true);
                console.log("MindFlow Adaptive UI: Prolonged inactivity detected. Auto-enabling Focus Mode.");
            }
        };

        const resetInactivity = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(handleInactivity, 120000); // 2 minutes of inactivity
        };

        resetInactivity();
        document.addEventListener('click', handleGlobalClick);
        document.addEventListener('mousemove', resetInactivity);
        document.addEventListener('keydown', resetInactivity);

        return () => {
            document.removeEventListener('click', handleGlobalClick);
            document.removeEventListener('mousemove', resetInactivity);
            document.removeEventListener('keydown', resetInactivity);
            clearTimeout(clickTimer);
            clearTimeout(inactivityTimer);
        };
    }, [isFocusMode]);

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'high-contrast';
            return 'light';
        });
    };

    const toggleDyslexicFont = () => setDyslexicFont(prev => !prev);
    
    const enableScreenReader = () => {
        setScreenReaderActive(true);
    };

    const disableScreenReader = () => {
        setScreenReaderActive(false);
        // Stop all speech - both the voice utility and native browser API
        VoiceFeatures.stopReading();
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    const toggleScreenReader = () => {
        if (screenReaderActive) {
            disableScreenReader();
        } else {
            enableScreenReader();
        }
    };

    const toggleFocusMode = () => setIsFocusMode(prev => !prev);

    const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 32));
    const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

    const updateSpeechRate = (rate) => setSpeechRate(rate);

    return (
        <AccessibilityContext.Provider value={{
            theme,
            fontSize,
            dyslexicFont,
            screenReaderActive,
            isFocusMode,
            speechRate,
            toggleTheme,
            toggleDyslexicFont,
            toggleScreenReader,
            toggleFocusMode,
            increaseFontSize,
            decreaseFontSize,
            updateSpeechRate,
            enableScreenReader,
            disableScreenReader
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};
