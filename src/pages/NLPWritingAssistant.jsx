import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Bot, CheckCircle, AlertTriangle, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NLPWritingAssistant = () => {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    // Mock NLP Engine
    const analyzeText = () => {
        if (!text.trim()) return;
        setIsAnalyzing(true);

        setTimeout(() => {
            const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
            const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
            const charCount = text.length;
            
            // Flesch-Kincaid Grade Level Mock (Simplified formula for demo)
            const readingLevel = Math.max(1, Math.min(12, Math.round((charCount / wordCount) * 0.39 + (wordCount / sentenceCount) * 11.8 - 15.59)));
            
            // Basic Sentiment Detection Mock
            const positiveWords = ['good', 'great', 'happy', 'love', 'excellent', 'amazing', 'fun', 'like'];
            const negativeWords = ['bad', 'sad', 'hate', 'terrible', 'awful', 'angry', 'hard', 'difficult'];
            const words = text.toLowerCase().match(/\b\w+\b/g) || [];
            
            let posScore = 0; let negScore = 0;
            words.forEach(w => {
                if(positiveWords.includes(w)) posScore++;
                if(negativeWords.includes(w)) negScore++;
            });

            let sentiment = 'Neutral';
            if (posScore > negScore) sentiment = 'Positive';
            if (negScore > posScore) sentiment = 'Negative';

            // Grammar / Passive Voice Mock (Super Basic)
            const passiveTriggers = ['is', 'are', 'was', 'were', 'be', 'being', 'been'];
            const passiveMatches = words.filter(w => passiveTriggers.includes(w)).length;
            const grammarSuggestions = [];
            
            if (passiveMatches > 2) {
                grammarSuggestions.push("You are using a lot of 'to be' verbs. Try using more active action words!");
            }
            if (wordCount > 0 && sentenceCount > 0 && (wordCount / sentenceCount) > 15) {
                grammarSuggestions.push("You have very long sentences. Try breaking them up to make it easier to read.");
            }
            if (grammarSuggestions.length === 0 && wordCount > 5) {
                grammarSuggestions.push("Great job! Your sentences look clear and direct.");
            }

            setAnalysisResult({
                wordCount,
                sentenceCount,
                readingLevel,
                sentiment,
                grammarSuggestions
            });
            setIsAnalyzing(false);
        }, 1500);
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px' }}>
                <div className="course-section-header" style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '2.5rem', margin: 0 }}>
                        <Bot size={40} color="var(--primary-purple)" />
                        AI Writing Assistant
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '10px' }}>Practice typing sentences or stories, and I'll give you feedback!</p>
                </div>

                <div className="card hover-lift" style={{ border: '2px solid var(--border-color)', marginBottom: '30px' }}>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing your story here..."
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '20px',
                            fontSize: '1.1rem',
                            border: 'none',
                            outline: 'none',
                            resize: 'vertical',
                            background: 'transparent',
                            color: 'var(--text-color)',
                            lineHeight: 1.6
                        }}
                    />
                    <div style={{ padding: '15px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-hover)' }}>
                        <button 
                            className="btn btn-primary btn-3d" 
                            onClick={analyzeText}
                            disabled={!text.trim() || isAnalyzing}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {isAnalyzing ? <><Sparkles size={18} className="spin"/> Analyzing Text...</> : <><Sparkles size={18}/> Analyze My Writing</>}
                        </button>
                    </div>
                </div>

                {analysisResult && (
                    <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        
                        {/* Metrics Card */}
                        <div className="card" style={{ background: 'var(--surface-elevated)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--text-main)' }}>
                                <FileText size={20} color="var(--primary-cyan)" /> Reading Stats
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Word Count</span>
                                    <strong style={{ fontSize: '1.2rem' }}>{analysisResult.wordCount}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Sentences</span>
                                    <strong style={{ fontSize: '1.2rem' }}>{analysisResult.sentenceCount}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Grade Level (Flesch)</span>
                                    <span className={`badge ${analysisResult.readingLevel > 8 ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: '1rem' }}>Grade {analysisResult.readingLevel}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Tone / Sentiment</span>
                                    <span className="badge badge-purple" style={{ fontSize: '1rem' }}>{analysisResult.sentiment}</span>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Card */}
                        <div className="card" style={{ background: 'var(--surface-elevated)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--text-main)' }}>
                                <TrendingUp size={20} color="var(--primary-orange)" /> Grammar & Style
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {analysisResult.grammarSuggestions.map((suggestion, index) => (
                                    <li key={index} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', background: 'var(--background-color)', padding: '15px', borderRadius: 'var(--radius-md)' }}>
                                        {suggestion.includes('Great job') 
                                            ? <CheckCircle size={24} color="#10B981" style={{ flexShrink: 0 }} />
                                            : <AlertTriangle size={24} color="#F59E0B" style={{ flexShrink: 0 }} />
                                        }
                                        <span style={{ lineHeight: 1.5 }}>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default NLPWritingAssistant;
