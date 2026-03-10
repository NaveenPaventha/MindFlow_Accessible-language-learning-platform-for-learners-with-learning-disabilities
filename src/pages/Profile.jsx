import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { mfaAPI } from '../utils/api';
import { User, Sun, Moon, Contrast, Lock, AlertTriangle, ShieldCheck, BarChart2, Zap, Target, Flame, Trophy } from 'lucide-react';

const Profile = () => {
    const { theme, toggleTheme, dyslexicFont, toggleDyslexicFont, fontSize, speechRate, updateSpeechRate, isFocusMode, toggleFocusMode } = useAccessibility();
    const { user, updateUser } = useAuth(); // Use AuthContext
    return (
        <DashboardLayout>

            <div className="container" style={{ margin: '40px auto', maxWidth: '1000px' }}>
                <header style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><User size={28}/> My Profile</h2>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                    {/* Personal Details */}
                    <div className="card">
                        <h3>Personal Details</h3>
                        <form onSubmit={(e) => { e.preventDefault(); alert('Profile Updated!'); }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Display Name</label>
                                <input type="text" defaultValue={user.name} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Email</label>
                                <input type="email" defaultValue={user.email} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Role</label>
                                <input type="text" value={user.role} disabled style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--background-color)' }} />
                            </div>
                            <button className="btn btn-primary">Save Changes</button>
                        </form>
                    </div>

                    {/* Accessibility Settings */}
                    <div className="card">
                        <h3>Learning Preferences</h3>
                        <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Customize your learning experience.</p>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Color Theme</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={toggleTheme} className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {theme === 'light' ? <><Sun size={18}/> Light</> : theme === 'dark' ? <><Moon size={18}/> Dark</> : <><Contrast size={18}/> High Contrast</>}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Font Style</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input type="checkbox" id="pref-dyslexic" checked={dyslexicFont} onChange={toggleDyslexicFont} style={{ width: '20px', height: '20px' }} />
                                <label htmlFor="pref-dyslexic" style={{ cursor: 'pointer' }}>Use Dyslexia-Friendly Font (OpenDyslexic)</label>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Distraction-Free Mode</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input type="checkbox" id="pref-focus" checked={isFocusMode} onChange={toggleFocusMode} style={{ width: '20px', height: '20px' }} />
                                <label htmlFor="pref-focus" style={{ cursor: 'pointer' }}>Enable Focus Mode (hides gamification during lessons)</label>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Current Font Size: {fontSize}px</label>
                            <div style={{ background: 'var(--surface-hover)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                                Using global toolbar to adjust size.
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Speech Rate: {speechRate}x</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>Slow</span>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="2.0" 
                                    step="0.1" 
                                    value={speechRate} 
                                    onChange={(e) => updateSpeechRate(parseFloat(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <span>Fast</span>
                            </div>
                        </div>
                    </div>

                    {/* Account Security (MFA Status) */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={20}/> Account Security</h3>
                        <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Account security status and protection.</p>

                        {!user.mfaEnabled ? (
                            <div className="animate-fade-in" style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><AlertTriangle size={48} color="var(--primary-color)" /></div>
                                <h4 style={{ margin: 0, color: 'var(--text-muted)' }}>MFA is Disabled</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>Security can only be enabled during registration.</p>
                            </div>
                        ) : (
                            <div className="animate-fade-in" style={{ padding: '20px', textAlign: 'center', border: '1px solid var(--primary-green)', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><ShieldCheck size={48} color="var(--primary-green)" /></div>
                                <h4 style={{ margin: 0, color: 'var(--primary-green)' }}>MFA is Active</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Your account is protected by an extra layer of security.</p>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Disable MFA? This will reduce your account security.')) {
                                            try {
                                                await mfaAPI.disable();
                                                alert('MFA Disabled.');
                                                updateUser({ ...user, mfaEnabled: false });
                                            } catch (err) {
                                                alert("Failed to disable MFA");
                                            }
                                        }
                                    }}
                                    className="btn btn-outline btn-sm"
                                    style={{ color: 'var(--error-color)', fontSize: '0.8rem' }}
                                >
                                    Disable MFA
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats Summary */}
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><BarChart2 size={20}/> Activity Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px', textAlign: 'center' }}>
                            <div style={{ background: 'var(--surface-hover)', padding: '15px', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Zap size={32} color="#eab308" /></div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.gamification?.xp || 0}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total XP</div>
                            </div>
                            <div style={{ background: 'var(--surface-hover)', padding: '15px', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Target size={32} color="var(--primary-color)" /></div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.gamification?.level || 1}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Level</div>
                            </div>
                            <div style={{ background: 'var(--surface-hover)', padding: '15px', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Flame size={32} color="#f97316" /></div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.gamification?.currentStreak || 0}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Day Streak</div>
                            </div>
                            <div style={{ background: 'var(--surface-hover)', padding: '15px', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Trophy size={32} color="#eab308" /></div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.gamification?.badges?.length || 0}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Badges</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
