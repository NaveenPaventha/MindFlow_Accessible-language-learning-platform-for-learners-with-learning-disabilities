import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { COURSE_DATA } from '../data/course_data';
import { VoiceFeatures, VoiceInput } from '../utils/voice';
// import { GamificationEngine } from '../utils/gamification'; // Backend handles this now
import { userAPI } from '../utils/api';
import { MiniGames } from '../components/MiniGames';

import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { AlertTriangle, Gamepad2, Brain, Volume2, Mic, FileSignature, ArrowLeft, ArrowRight } from 'lucide-react';

const LessonPlayer = () => {
    const { isFocusMode } = useAccessibility();
    const { updateUser } = useAuth();
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [lessonSlides, setLessonSlides] = useState([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [courseTitle, setCourseTitle] = useState('');
    const [practiceStatus, setPracticeStatus] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [activeGame, setActiveGame] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const course = COURSE_DATA[courseId || 'course_101'];
        if (course) {
            setLessonSlides(course.lessons);
            setCourseTitle(course.title);
            setError(null);
        } else {
            setError("Course not found or coming soon!");
        }
    }, [courseId]);

    const currentSlide = lessonSlides[currentSlideIndex];

    const handleNext = () => {
        if (currentSlideIndex < lessonSlides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        } else {
            navigate(`/quiz/${courseId}`);
        }
    };

    const handlePrev = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        }
    };

    const speakText = () => {
        const text = document.getElementById('lesson-text')?.innerText;
        if (text) VoiceFeatures.readText(text);
    };

    const startPractice = () => {
        setPracticeStatus("Listening...");
        setIsListening(true);
        VoiceInput.startListening(
            (final, interim) => {
                if (final) {
                    setPracticeStatus(`You said: "${final}"`);
                    // Logic to check correctness could go here
                }
            },
            (error) => {
                setPracticeStatus(`Error: ${error}`);
                setIsListening(false);
            },
            () => {
                setIsListening(false);
            }
        );
    };

    if (error) return (
        <Layout>
            <div className="container" style={{ padding: '50px', textAlign: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <AlertTriangle size={32} color="var(--error-color)" /> {error}
                </h2>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>
                    Return to Dashboard
                </button>
            </div>
        </Layout>
    );

    if (!currentSlide) return <Layout><div className="container">Loading...</div></Layout>;

    return (
        <Layout hideNavigation={isFocusMode}>
            {activeGame === 'matching' && (
                <MiniGames.PictureMatching
                    onClose={() => setActiveGame(null)}
                    onComplete={() => { alert("Awesome Job! +50 XP"); setActiveGame(null); }}
                />
            )}
            {activeGame === 'memory' && (
                <MiniGames.MemoryAndFocus
                    onClose={() => setActiveGame(null)}
                    onComplete={() => { alert("Memory Master! +50 XP"); setActiveGame(null); }}
                />
            )}

            <div className="container" style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Link to="/dashboard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowLeft size={16}/> Back</Link>
                    {!isFocusMode && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setActiveGame('matching')}><Gamepad2 size={16}/> Match Game</button>
                            <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setActiveGame('memory')}><Brain size={16}/> Memory Game</button>
                        </div>
                    )}
                </div>

                <div className="card lesson-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(20px, 4vw, 40px)', alignItems: 'start' }}>
                    {/* Visual Aid */}
                    <div>
                        {typeof currentSlide.visual === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: currentSlide.visual }} />
                        ) : (
                            <div>{currentSlide.visual}</div>
                        )}
                        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Fig {currentSlide.id}
                        </p>
                    </div>

                    {/* Content */}
                    <div>
                        <h1 style={{ marginBottom: '20px', color: 'var(--primary-purple)' }}>{currentSlide.title}</h1>
                        {typeof currentSlide.content === 'string' ? (
                            <div id="lesson-text" className="text-content" style={{ fontSize: '1.3rem', lineHeight: 1.8, color: 'var(--text-dark)' }} dangerouslySetInnerHTML={{ __html: currentSlide.content }} />
                        ) : (
                            <div id="lesson-text" className="text-content" style={{ fontSize: '1.3rem', lineHeight: 1.8, color: 'var(--text-dark)' }}>{currentSlide.content}</div>
                        )}

                        {/* Assistive Actions */}
                        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary btn-pulse" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={speakText}>
                                <Volume2 size={20}/> Read Aloud
                            </button>
                            <button className={`btn btn-outline ${isListening ? 'listening' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={startPractice}>
                                <Mic size={20}/> Practice Speaking
                            </button>
                        </div>
                        {practiceStatus && (
                            <div className="animate-fade-in" style={{ marginTop: '15px', padding: '15px', background: 'var(--surface-elevated)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-cyan)' }}>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{practiceStatus}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="controls" style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                    <button className="btn btn-ghost" onClick={handlePrev} disabled={currentSlideIndex === 0}>Previous Concept</button>
                    <button className="btn btn-primary btn-lg btn-3d" onClick={async () => {
                        // Progress update: Calculate percent
                        const percent = Math.round(((currentSlideIndex + 1) / lessonSlides.length) * 100);

                        // Call backend to update progress and maybe award XP
                        // We use the userAPI for this.
                        // Ideally we should debounce this or only do it on meaningful completion, 
                        // but for now let's do it on every 'next' to ensure progress is saved.
                        try {
                            const res = await userAPI.updateProgress(courseId, percent);
                            // Update local user state with new XP/Progress immediately
                            if (res.data) {
                                updateUser({
                                    gamification: res.data.gamification,
                                    progress: res.data.progress,
                                    recentActivity: res.data.recentActivity
                                });
                            }
                        } catch (e) {
                            console.error("Failed to save progress", e);
                        }

                        handleNext();
                    }}>
                        {currentSlideIndex < lessonSlides.length - 1 ? <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>Next Concept <ArrowRight size={18}/></span> : <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>Take Quiz <FileSignature size={18}/></span>}
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default LessonPlayer;
