import React, { useState, useEffect } from 'react';
import { X, Volume2, MessageCircle, Target, Clock, Activity, Zap, ArrowRight } from 'lucide-react';
import '../styles/style-kids.css'; // Ensure styles are available

// === DATA ===
const LETTER_SOUNDS = {
    'A': { sound: 'ay', example: 'apple', phonetic: '/æ/' },
    'B': { sound: 'buh', example: 'ball', phonetic: '/b/' },
    'C': { sound: 'kuh', example: 'cat', phonetic: '/k/' },
    'D': { sound: 'duh', example: 'dog', phonetic: '/d/' },
    'E': { sound: 'eh', example: 'egg', phonetic: '/ɛ/' },
    'F': { sound: 'fuh', example: 'fish', phonetic: '/f/' },
    'G': { sound: 'guh', example: 'goat', phonetic: '/g/' },
    'H': { sound: 'huh', example: 'hat', phonetic: '/h/' },
    'I': { sound: 'ih', example: 'igloo', phonetic: '/ɪ/' },
    'J': { sound: 'juh', example: 'jump', phonetic: '/dʒ/' },
    'K': { sound: 'kuh', example: 'kite', phonetic: '/k/' },
    'L': { sound: 'luh', example: 'lion', phonetic: '/l/' },
    'M': { sound: 'muh', example: 'moon', phonetic: '/m/' },
    'N': { sound: 'nuh', example: 'nest', phonetic: '/n/' },
    'O': { sound: 'oh', example: 'orange', phonetic: '/ɒ/' },
    'P': { sound: 'puh', example: 'pig', phonetic: '/p/' },
    'Q': { sound: 'kwuh', example: 'queen', phonetic: '/kw/' },
    'R': { sound: 'ruh', example: 'rabbit', phonetic: '/r/' },
    'S': { sound: 'suh', example: 'sun', phonetic: '/s/' },
    'T': { sound: 'tuh', example: 'tree', phonetic: '/t/' },
    'U': { sound: 'uh', example: 'umbrella', phonetic: '/ʌ/' },
    'V': { sound: 'vuh', example: 'van', phonetic: '/v/' },
    'W': { sound: 'wuh', example: 'water', phonetic: '/w/' },
    'X': { sound: 'ks', example: 'box', phonetic: '/ks/' },
    'Y': { sound: 'yuh', example: 'yellow', phonetic: '/j/' },
    'Z': { sound: 'zuh', example: 'zebra', phonetic: '/z/' }
};

const BLENDING_WORDS = [
    { letters: ['c', 'a', 't'], word: 'cat', difficulty: 'easy' },
    { letters: ['d', 'o', 'g'], word: 'dog', difficulty: 'easy' },
    { letters: ['s', 'u', 'n'], word: 'sun', difficulty: 'easy' },
    { letters: ['b', 'a', 't'], word: 'bat', difficulty: 'easy' },
    { letters: ['r', 'u', 'n'], word: 'run', difficulty: 'medium' },
    { letters: ['j', 'u', 'm', 'p'], word: 'jump', difficulty: 'medium' },
    { letters: ['s', 't', 'o', 'p'], word: 'stop', difficulty: 'medium' },
    { letters: ['g', 'r', 'e', 'e', 'n'], word: 'green', difficulty: 'hard' }
];

// === SPEECH UTILS ===
const speak = (text, rate = 0.8) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Try to get an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (englishVoice) utterance.voice = englishVoice;

    window.speechSynthesis.speak(utterance);
};

// === COMPONENT: PHONICS LESSON ===
export const PhonicsLesson = ({ letter, onClose }) => {
    const data = LETTER_SOUNDS[letter.toUpperCase()];

    useEffect(() => {
        if (data) {
            speak(`Letter ${letter}`);
            setTimeout(() => speak(`${data.sound} sound`), 1500);
            setTimeout(() => speak(`${letter} for ${data.example}`), 3000);
        }
    }, [letter, data]);

    if (!data) return null;

    return (
        <div className="game-overlay animate-fade-in">
            <div className="card game-modal" style={{ maxWidth: '600px', width: '90%', textAlign: 'center' }}>
                <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24}/></button>

                <div style={{ fontSize: '8rem', marginBottom: '30px', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                    {letter}
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '15px' }}>Letter {letter}</h2>
                    <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Sound: <strong style={{ color: 'var(--primary-color)' }}>{data.sound}</strong>
                    </p>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                        Phonetic: {data.phonetic}
                    </p>
                </div>

                <div style={{ padding: '30px', background: 'var(--surface-elevated)', borderRadius: 'var(--radius-lg)', marginBottom: '30px' }}>
                    <p style={{ fontSize: '1.3rem', marginBottom: '15px' }}>Example Word:</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {data.example}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button onClick={() => speak(data.sound)} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Volume2 size={24}/> Hear Sound
                    </button>
                    <button onClick={() => speak(data.example)} className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={24}/> Hear Example
                    </button>
                </div>
            </div>
        </div>
    );
};

// === COMPONENT: BLENDING PRACTICE ===
export const BlendingPractice = ({ onClose }) => {
    const [currentWord, setCurrentWord] = useState(BLENDING_WORDS[0]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const playBlend = (speed = 'slow') => {
        const delays = { slow: 1000, medium: 600, fast: 300 };
        const delay = delays[speed];

        setActiveIndex(-1);

        currentWord.letters.forEach((l, i) => {
            setTimeout(() => {
                const sound = LETTER_SOUNDS[l.toUpperCase()]?.sound || l;
                speak(sound);
                setActiveIndex(i);
            }, i * delay);
        });

        setTimeout(() => {
            setActiveIndex(-1);
            speak(currentWord.word);
            setShowAnswer(true);
        }, currentWord.letters.length * delay + 500);
    };

    const nextWord = () => {
        const next = BLENDING_WORDS[Math.floor(Math.random() * BLENDING_WORDS.length)];
        setCurrentWord(next);
        setShowAnswer(false);
        setActiveIndex(-1);
    };

    return (
        <div className="game-overlay animate-fade-in">
            <div className="card game-modal" style={{ maxWidth: '800px', width: '90%', textAlign: 'center' }}>
                <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24}/></button>

                <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Target size={28}/> Word Blending</h2>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '10px' }}>
                    {currentWord.letters.map((l, i) => (
                        <div key={i} style={{
                            fontSize: '4rem',
                            fontWeight: 'bold',
                            padding: '20px 30px',
                            background: activeIndex === i ? 'var(--primary-gradient)' : 'var(--surface-elevated)',
                            color: activeIndex === i ? 'white' : 'var(--text-dark)',
                            borderRadius: 'var(--radius-lg)',
                            transition: 'all 0.3s',
                            transform: activeIndex === i ? 'scale(1.1)' : 'scale(1)'
                        }}>
                            {l.toUpperCase()}
                        </div>
                    ))}
                    <div style={{ fontSize: '3rem', margin: '0 20px' }}>→</div>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        color: 'var(--primary-color)',
                        minWidth: '150px'
                    }}>
                        {showAnswer ? currentWord.word.toUpperCase() : '?'}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
                    <button onClick={() => playBlend('slow')} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20}/> Slow</button>
                    <button onClick={() => playBlend('medium')} className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={20}/> Medium</button>
                    <button onClick={() => playBlend('fast')} className="btn btn-ghost btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={20}/> Fast</button>
                </div>

                <button onClick={nextWord} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Next Word <ArrowRight size={18}/></button>
            </div>
        </div>
    );
};
