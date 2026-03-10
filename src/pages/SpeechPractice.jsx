import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { VoiceFeatures, VoiceInput } from '../utils/voice';
import { ArrowLeft, Mic, Target, Star, Volume2 } from 'lucide-react';


const SpeechPractice = () => {
    const navigate = useNavigate();

    // Levenshtein distance for phonetic scoring mock
    const getLevenshteinDistance = (a, b) => {
        if (!a || !a.length) return b ? b.length : 0;
        if (!b || !b.length) return a ? a.length : 0;
        
        const matrix = [];
        for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
        for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1  // deletion
                        )
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };


    // Should be moved to data file or state
    const practiceSentences = [
        // Greetings (Easy)
        { id: 1, text: "Hello", difficulty: "easy", category: "Greetings" },
        { id: 2, text: "Good morning", difficulty: "easy", category: "Greetings" },
        { id: 3, text: "How are you today", difficulty: "easy", category: "Greetings" },
        { id: 4, text: "Nice to meet you", difficulty: "easy", category: "Greetings" },

        // Daily Life (Easy-Medium)
        { id: 5, text: "I love to read books", difficulty: "easy", category: "Daily Life" },
        { id: 6, text: "The sun is shining bright", difficulty: "easy", category: "Daily Life" },
        { id: 7, text: "I enjoy playing outside", difficulty: "easy", category: "Daily Life" },
        { id: 8, text: "My favorite color is blue", difficulty: "easy", category: "Daily Life" },

        // Animals (Easy-Medium)
        { id: 9, text: "The dog barks loudly", difficulty: "easy", category: "Animals" },
        { id: 10, text: "Cats like to sleep in the sun", difficulty: "medium", category: "Animals" },
        { id: 11, text: "Birds fly high in the sky", difficulty: "easy", category: "Animals" },
        { id: 12, text: "The elephant has a long trunk", difficulty: "medium", category: "Animals" },

        // Colors & Numbers (Easy-Medium)
        { id: 13, text: "Red yellow and blue are primary colors", difficulty: "medium", category: "Colors" },
        { id: 14, text: "I can count from one to ten", difficulty: "medium", category: "Numbers" },
        { id: 15, text: "The rainbow has seven colors", difficulty: "medium", category: "Colors" },

        // Food (Medium)
        { id: 16, text: "I like to eat apples and bananas", difficulty: "medium", category: "Food" },
        { id: 17, text: "Pizza is my favorite food", difficulty: "easy", category: "Food" },
        { id: 18, text: "Vegetables are good for your health", difficulty: "medium", category: "Food" },

        // Tongue Twisters (Hard)
        { id: 19, text: "The quick brown fox jumps over the lazy dog", difficulty: "hard", category: "Tongue Twisters" },
        { id: 20, text: "She sells seashells by the seashore", difficulty: "hard", category: "Tongue Twisters" },
        { id: 21, text: "Peter Piper picked a peck of pickled peppers", difficulty: "hard", category: "Tongue Twisters" },
        { id: 22, text: "How much wood would a woodchuck chuck", difficulty: "hard", category: "Tongue Twisters" },

        // Educational (Medium-Hard)
        { id: 23, text: "Learning new things makes me happy", difficulty: "medium", category: "Education" },
        { id: 24, text: "Practice makes perfect every single day", difficulty: "medium", category: "Education" },
        { id: 25, text: "Reading helps improve your vocabulary and imagination", difficulty: "hard", category: "Education" }
    ];

    const [currentSentence, setCurrentSentence] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [interim, setInterim] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [accuracyResult, setAccuracyResult] = useState(null);

    // Stats
    const [stats, setStats] = useState({
        totalAttempts: 0,
        accuracyScores: [],
        perfectScores: 0
    });

    const startRecording = () => {
        setAccuracyResult(null);
        setTranscription('');
        setIsRecording(true);
        VoiceInput.startListening(
            (final, interim) => {
                setInterim(interim);
                if (final) {
                    setTranscription(final);
                    analyzeSpeech(final);
                }
            },
            (error) => {
                console.error(error);
                setIsRecording(false);
            },
            () => setIsRecording(false)
        );
    };

    const stopRecording = () => {
        VoiceInput.stopListening();
        setIsRecording(false);
    };

    const analyzeSpeech = (spokenText) => {
        if (!currentSentence) return;

        const target = currentSentence.text.toLowerCase().replace(/[^\w\s]/g, '');
        const spoken = spokenText.toLowerCase().replace(/[^\w\s]/g, '');

        const targetWords = target.split(/\s+/).filter(w => w.length > 0);
        const spokenWords = spoken.split(/\s+/).filter(w => w.length > 0);

        const wordFeedback = targetWords.map((targetWord, i) => {
            const spokenWord = spokenWords[i] || '';
            const distance = getLevenshteinDistance(targetWord, spokenWord);
            const maxLength = Math.max(targetWord.length, spokenWord.length);
            const similarity = maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
            
            // Allow minor phonetic deviations (e.g. 75% similarity is acceptable)
            const isCorrect = similarity >= 0.75;
            return { targetWord, spokenWord, isCorrect, similarity: Math.round(similarity * 100) };
        });

        const matches = wordFeedback.filter(f => f.isCorrect).length;
        const accuracy = Math.round((matches / targetWords.length) * 100);

        setAccuracyResult({
            accuracy,
            wordFeedback,
            spoken,
            target
        });

        // Update stats
        setStats(prev => ({
            ...prev,
            totalAttempts: prev.totalAttempts + 1,
            accuracyScores: [...prev.accuracyScores, accuracy],
            perfectScores: accuracy === 100 ? prev.perfectScores + 1 : prev.perfectScores
        }));
    };

    const speakTarget = () => {
        if (currentSentence) VoiceFeatures.readText(currentSentence.text, { rate: 0.8 });
    };

    const avgAccuracy = stats.accuracyScores.length > 0
        ? Math.round(stats.accuracyScores.reduce((a, b) => a + b, 0) / stats.accuracyScores.length)
        : 0;

    return (
        <Layout>
            <div className="practice-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <div className="flex justify-between items-center mb-4">
                    <Link to="/dashboard" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowLeft size={16}/> Back</Link>
                    <h2 className="text-2xl font-bold" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mic size={28}/> Speech Practice</h2>
                </div>

                {/* Structured Courses Section */}


                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '30px 0' }}>
                    <div className="stat-card-practice" style={{ background: 'var(--surface-elevated)', padding: '25px', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Target size={40} color="var(--primary-color)" /></div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.totalAttempts}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Attempts</div>
                    </div>
                    {/* More stats */}
                    <div className="stat-card-practice" style={{ background: 'var(--surface-elevated)', padding: '25px', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Star size={40} color="#eab308" /></div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{avgAccuracy}%</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Avg Accuracy</div>
                    </div>
                </div>

                {!currentSentence ? (
                    <div id="sentence-selection">
                        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Choose a Sentence to Practice</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {practiceSentences.map(s => (
                                <div key={s.id} onClick={() => {
                                    setCurrentSentence(s);
                                    setAccuracyResult(null);
                                    setTranscription('');
                                    setInterim('');
                                }} style={{ background: 'var(--surface-elevated)', padding: '20px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>
                                    <span className={`difficulty-badge difficulty-${s.difficulty}`} style={{ padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', background: s.difficulty === 'easy' ? '#38ef7d' : '#f45c43', color: 'white' }}>{s.difficulty.toUpperCase()}</span>
                                    <h4 style={{ margin: '10px 0', fontSize: '1.1rem' }}>{s.text}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div id="practice-area">
                        <div className="target-sentence-card" style={{ background: 'var(--gradient-aurora)', color: 'white', padding: '40px', borderRadius: 'var(--radius-2xl)', marginBottom: '30px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', opacity: 0.9 }}>Practice this sentence:</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '20px 0' }}>{currentSentence.text}</div>
                            <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={speakTarget}><Volume2 size={20}/> Listen</button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                            <button onClick={isRecording ? stopRecording : startRecording} style={{ width: '120px', height: '120px', borderRadius: '50%', border: 'none', background: isRecording ? '#ef4444' : 'var(--gradient-galaxy)', color: 'white', boxShadow: 'var(--shadow-xl)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Mic size={48} />
                            </button>
                        </div>

                        <div className="transcription-card" style={{ background: 'white', padding: '30px', borderRadius: 'var(--radius-xl)', minHeight: '150px', textAlign: 'center', border: '3px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: '20px' }}>Transcription:</h3>
                            <div style={{ fontSize: '2rem', color: isRecording ? 'var(--text-muted)' : 'var(--text-main)' }}>
                                {transcription || interim || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Tap microphone and speak...</span>}
                            </div>
                        </div>

                        {accuracyResult && (
                            <div className="feedback-section animate-slide-up" style={{ textAlign: 'center', marginTop: '40px', padding: '30px', background: 'var(--surface-color)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '30px', fontSize: '1.8rem' }}>
                                    {accuracyResult.wordFeedback.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{
                                                color: f.isCorrect ? '#10B981' : '#EF4444',
                                                fontWeight: 'bold',
                                                textDecoration: f.isCorrect ? 'none' : 'line-through'
                                            }}>
                                                {f.spokenWord || '___'}
                                            </span>
                                            {!f.isCorrect && (
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', marginTop: '5px', fontWeight: 600, display: 'block' }}>
                                                        {f.targetWord}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.similarity}% match</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Accuracy Score</div>
                                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: accuracyResult.accuracy > 80 ? '#10B981' : accuracyResult.accuracy > 50 ? '#F59E0B' : '#EF4444' }}>
                                        {accuracyResult.accuracy}%
                                    </div>
                                    <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '5px', marginTop: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${accuracyResult.accuracy}%`, height: '100%', background: 'var(--gradient-aurora)' }}></div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                    <button className="btn btn-primary" onClick={() => setCurrentSentence(null)}>Choose Another</button>
                                    <button className="btn btn-secondary" onClick={() => { setAccuracyResult(null); setTranscription(''); setInterim(''); }}>Try Again</button>
                                </div>
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button className="btn btn-outline" onClick={() => setCurrentSentence(null)}>Back to List</button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SpeechPractice;
