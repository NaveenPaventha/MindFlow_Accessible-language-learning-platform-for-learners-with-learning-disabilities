import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { PhonicsLesson, BlendingPractice } from '../components/PhonicsModule';
import { LetterTracing } from '../components/LetterTracing';
import { MiniGames } from '../components/MiniGames';
import { RhymeLab } from '../components/RhymeLab';
import { courseAPI } from '../utils/api';
import '../styles/dyslexia-backdrop.css';
import { Type, PenTool, Brain, Target, Puzzle, Music, Mic, Candy, Palette, Hammer, X } from 'lucide-react';

const DyslexiaCenter = () => {
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState(null);
    const [subModal, setSubModal] = useState(null);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await courseAPI.getAll({ category: 'dyslexia' });
                setCourses(res.data);
            } catch (error) {
                console.error("Failed to fetch dyslexia courses", error);
            }
        };
        fetchCourses();
    }, []);

    const features = [
        { id: 'phonics', icon: <Type size={40} />, title: 'Phonics & Letter Sounds', desc: 'Learn letter sounds, practice blending, and build reading skills', color: 'primary' },
        { id: 'tracing', icon: <PenTool size={40} />, title: 'Letter Tracing', desc: 'Practice writing letters with interactive tracing on canvas', color: 'pink' },
        { id: 'words', icon: <Brain size={40} />, title: 'Memory Match', desc: 'Boost memory and focus by matching pairs', color: 'cyan' },
        { id: 'matching', icon: <Target size={40} />, title: 'Picture Matching', desc: 'Match pictures with their words in this fun memory game', color: 'green' },
        { id: 'wordbuilder', icon: <Puzzle size={40} />, title: 'Word Builder', desc: 'Drag and drop letters to build words and master spelling', color: 'orange' },
        { id: 'rhymes', icon: <Music size={40} />, title: 'Rhyme Time Lab', desc: 'Animated nursery rhymes with singing, music, and word highlighting', color: 'pink' },
    ];

    const openFeature = (id) => {
        setActiveModal(id);
    };

    return (
        <Layout>
            {/* BACKGROUND ELEMENTS */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="cloud" style={{ top: '80px', left: '15%', animationDelay: '0s' }}>
                <div className="cloud-shape"></div>
            </div>
            <div className="cloud" style={{ top: '250px', right: '10%', animationDelay: '-5s' }}>
                <div className="cloud-shape"></div>
            </div>

            <div className="deco-icon" style={{ top: '120px', right: '20%', animationDelay: '0s' }}><Candy size={48} color="#ec4899" /></div>
            <div className="deco-icon" style={{ bottom: '150px', left: '10%', animationDelay: '-2s' }}><Palette size={48} color="#8b5cf6" /></div>
            <div className="deco-icon" style={{ top: '500px', left: '5%', animationDelay: '-4s' }}><Puzzle size={48} color="#f59e0b" /></div>

            <div className="container" style={{ paddingBottom: '60px', position: 'relative', zIndex: 1 }}>
                <div className="hero-dyslexia animate-pop-in" style={{ textAlign: 'center', margin: '40px 0' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}><Brain size={48}/> Dyslexia Learning Center</h1>
                    <p>Special tools and activities designed to make learning easier, fun, and accessible for everyone.</p>
                </div>

                <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', marginTop: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}><Hammer size={28}/> Interactive Tools</h2>
                <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                    {features.map(f => (
                        <div key={f.id} className="feature-card animate-scale-in" onClick={() => openFeature(f.id)} style={{ cursor: 'pointer', padding: '30px', background: 'var(--surface-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', transition: 'all 0.3s' }}>
                            <span className="feature-icon" style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>{f.icon}</span>
                            <h3 className="feature-title" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{f.title}</h3>
                            <p className="feature-description" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                        </div>
                    ))}

                    <div className="feature-card animate-scale-in" onClick={() => navigate('/speech-practice')} style={{ cursor: 'pointer', padding: '30px', background: 'var(--surface-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
                        <span className="feature-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}><Mic size={40}/></span>
                        <h3 className="feature-title" style={{ fontSize: '1.5rem', marginBottom: '10px', textAlign: 'center' }}>Speech Practice Lab</h3>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Learn to speak with real-time feedback</p>
                    </div>
                </div>



                {/* Phonics & Blending Modals */}
                {activeModal === 'phonics' && (
                    <div className="game-overlay animate-fade-in">
                        <div className="card game-modal" style={{ maxWidth: '900px', width: '90%', padding: '40px', position: 'relative' }}>
                            <button onClick={() => setActiveModal(null)} className="btn-icon" style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none' }}><X size={24}/></button>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Type size={28}/> Phonics Lab</h2>

                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
                                    <button key={l} onClick={() => setSubModal({ type: 'phonics-lesson', data: l })} className="btn btn-primary" style={{ fontSize: '1.5rem', width: '60px', height: '60px' }}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <button onClick={() => setSubModal({ type: 'blending' })} className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Music size={20}/> Practice Blending</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tracing Modal */}
                {activeModal === 'tracing' && (
                    <div className="game-overlay animate-fade-in">
                        <div className="card game-modal" style={{ maxWidth: '900px', width: '90%', padding: '40px', position: 'relative' }}>
                            <button onClick={() => setActiveModal(null)} className="btn-icon" style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none' }}><X size={24}/></button>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><PenTool size={28}/> Letter Tracing</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
                                    <button key={l} onClick={() => setSubModal({ type: 'tracing', data: l })} className="btn btn-pink" style={{ fontSize: '1.5rem', width: '60px', height: '60px' }}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sub-Modals */}
                {subModal?.type === 'phonics-lesson' && (
                    <PhonicsLesson letter={subModal.data} onClose={() => setSubModal(null)} />
                )}
                {subModal?.type === 'blending' && (
                    <BlendingPractice onClose={() => setSubModal(null)} />
                )}
                {subModal?.type === 'tracing' && (
                    <LetterTracing letter={subModal.data} onClose={() => setSubModal(null)} />
                )}
                {activeModal === 'matching' && (
                    <MiniGames.PictureMatching onClose={() => setActiveModal(null)} onComplete={() => { alert('YAY! +50 XP'); setActiveModal(null); }} />
                )}
                {activeModal === 'words' && (
                    <MiniGames.MemoryAndFocus onClose={() => setActiveModal(null)} onComplete={() => { alert('Great Memory! +50 XP'); setActiveModal(null); }} />
                )}
                {activeModal === 'wordbuilder' && (
                    <MiniGames.WordBuilder onClose={() => setActiveModal(null)} onComplete={() => { alert('Incredible Spelling! +100 XP'); setActiveModal(null); }} />
                )}
                {activeModal === 'rhymes' && (
                    <RhymeLab onClose={() => setActiveModal(null)} />
                )}
            </div>
        </Layout>
    );
};

export default DyslexiaCenter;
