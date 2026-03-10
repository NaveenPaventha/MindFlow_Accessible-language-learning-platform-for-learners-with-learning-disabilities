import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { authAPI, mfaAPI } from '../utils/api';
import { Eye, EyeOff, Backpack, Shield, Rocket, ArrowLeft, Sparkles, Lock } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        linkedChildUsername: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // MFA Registration Step
    const [regStep, setRegStep] = useState('info'); // 'info' or 'mfa'
    const [enableMfa, setEnableMfa] = useState(false);
    const [mfaSecret, setMfaSecret] = useState('');
    const [mfaQrUrl, setMfaQrUrl] = useState('');
    const [otpInput, setOtpInput] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setError('');
    };

    const validatePassword = (password) => {
        const hasLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);
        return { hasLength, hasUpper, hasLower, hasNumber, hasSpecial, isValid: hasLength && hasUpper && hasLower && hasNumber && hasSpecial };
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        const { password, confirmPassword, username } = formData;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError("Password does not meet requirements");
            return;
        }

        if (enableMfa) {
            try {
                // Generate secret on backend for consistency
                const res = await mfaAPI.generatePublicSecret(username);
                setMfaSecret(res.data.secret);
                setMfaQrUrl(res.data.otpAuthUrl);
                setRegStep('mfa');
            } catch (err) {
                setError("Failed to generate MFA secret. Please try again.");
            }
        } else {
            finalizeRegistration();
        }
    };

    const finalizeRegistration = async () => {
        const result = await register({
            ...formData,
            mfaEnabled: enableMfa,
            mfaSecret: enableMfa ? mfaSecret : null,
            code: enableMfa ? otpInput.trim() : null
        });

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            if (enableMfa) setRegStep('info');
        }
    };

    const passStatus = validatePassword(formData.password);

    return (
        <Layout>
            <section style={{ padding: '40px 0' }}>
                <div className="container" style={{ maxWidth: '650px' }}>
                    <div className="card animate-scale-in" style={{ padding: '50px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '15px', fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--primary-purple)' }}>Create Your Account</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-medium)', marginBottom: '40px', fontSize: '1.1rem', fontWeight: 500 }}>
                            Join AccessLearn and start your extraordinary learning journey!
                        </p>

                        {regStep === 'info' ? (
                            <form onSubmit={handleInfoSubmit}>
                                <div className="input-group">
                                    <label htmlFor="username">Choose a Cool Username <span style={{ color: 'var(--error-color)' }}>*</span></label>
                                    <input type="text" id="username" value={formData.username} onChange={handleChange} required placeholder="Ex: SuperLearner123" />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="name">Your Full Name <span style={{ color: 'var(--error-color)' }}>*</span></label>
                                    <input type="text" id="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Jane Doe" />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="email">Your Email Address <span style={{ color: 'var(--error-color)' }}>*</span></label>
                                    <input type="email" id="email" value={formData.email} onChange={handleChange} required placeholder="your.email@example.com" />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="password">Create a Strong Password <span style={{ color: 'var(--error-color)' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPassword ? "text" : "password"} id="password" value={formData.password} onChange={handleChange} required placeholder="At least 8 characters" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                            {showPassword ? <EyeOff size={20} color="var(--text-muted)"/> : <Eye size={20} color="var(--text-muted)"/>}
                                        </button>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="confirmPassword">Confirm Your Password <span style={{ color: 'var(--error-color)' }}>*</span></label>
                                    <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Type it again!" />
                                </div>

                                <div className="input-group" style={{ marginTop: '25px' }}>
                                    <label style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-purple)', display: 'block', marginBottom: '15px' }}>
                                        Who is joining us today?
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div
                                            onClick={() => setFormData({ ...formData, role: 'student' })}
                                            style={{
                                                padding: '20px',
                                                borderRadius: '20px',
                                                border: `3px solid ${formData.role === 'student' ? 'var(--primary-purple)' : 'rgba(0,0,0,0.1)'}`,
                                                background: formData.role === 'student' ? 'rgba(111, 66, 193, 0.05)' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <span style={{ display: 'block', marginBottom: '10px' }}><Backpack size={48} color={formData.role === 'student' ? "var(--primary-purple)" : "var(--text-muted)"} /></span>
                                            <strong style={{ display: 'block' }}>Student</strong>
                                            <small style={{ color: 'var(--text-muted)' }}>I'm here to learn!</small>
                                        </div>
                                        <div
                                            onClick={() => setFormData({ ...formData, role: 'parent' })}
                                            style={{
                                                padding: '20px',
                                                borderRadius: '20px',
                                                border: `3px solid ${formData.role === 'parent' ? 'var(--primary-purple)' : 'rgba(0,0,0,0.1)'}`,
                                                background: formData.role === 'parent' ? 'rgba(111, 66, 193, 0.05)' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <span style={{ display: 'block', marginBottom: '10px' }}><Shield size={48} color={formData.role === 'parent' ? "var(--primary-purple)" : "var(--text-muted)"} /></span>
                                            <strong style={{ display: 'block' }}>Parent/Guardian</strong>
                                            <small style={{ color: 'var(--text-muted)' }}>I'm here to support!</small>
                                        </div>
                                        <div
                                            onClick={() => setFormData({ ...formData, role: 'teacher' })}
                                            style={{
                                                padding: '20px',
                                                borderRadius: '20px',
                                                border: `3px solid ${formData.role === 'teacher' ? 'var(--primary-purple)' : 'rgba(0,0,0,0.1)'}`,
                                                background: formData.role === 'teacher' ? 'rgba(111, 66, 193, 0.05)' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gridColumn: '1 / -1'
                                            }}
                                        >
                                            <span style={{ display: 'block', marginBottom: '10px' }}><Sparkles size={48} color={formData.role === 'teacher' ? "var(--primary-purple)" : "var(--text-muted)"} /></span>
                                            <strong style={{ display: 'block' }}>Teacher</strong>
                                            <small style={{ color: 'var(--text-muted)' }}>I'm here to teach!</small>
                                        </div>
                                    </div>
                                </div>

                                {formData.role === 'parent' && (
                                    <div className="input-group animate-pop-in" style={{ marginTop: '20px', background: 'rgba(255, 193, 7, 0.05)', padding: '20px', borderRadius: '15px', border: '1px dashed var(--primary-orange)' }}>
                                        <label htmlFor="linkedChildUsername" style={{ color: 'var(--primary-orange)', fontWeight: 800 }}>
                                            Connect to Child's Username <span style={{ color: 'var(--error-color)' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="linkedChildUsername"
                                            value={formData.linkedChildUsername}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your child's username"
                                        />
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                            Tip: Ask your child what username they picked!
                                        </p>
                                    </div>
                                )}

                                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', background: 'rgba(111, 66, 193, 0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(111, 66, 193, 0.1)' }}>
                                    <input
                                        type="checkbox"
                                        id="enableMfa"
                                        checked={enableMfa}
                                        onChange={(e) => setEnableMfa(e.target.checked)}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="enableMfa" style={{ cursor: 'pointer', margin: 0, fontWeight: 700, color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Shield size={20}/> Enable Microsoft Authenticator (Recommended)
                                    </label>
                                </div>

                                {error && (
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '25px', marginTop: '25px', textAlign: 'center', fontWeight: 600 }}>
                                        {error}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary btn-lg btn-3d" style={{ width: '100%', fontSize: '1.3rem', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    {enableMfa ? 'Continue to MFA Setup →' : <>Create My Account! <Rocket size={24}/></>}
                                </button>

                                <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-medium)', fontSize: '1.1rem' }}>
                                    Already have an account? <Link to="/" style={{ color: 'var(--primary-orange)', fontWeight: 800, textDecoration: 'none' }}>Sign in here</Link>
                                </p>
                            </form>
                        ) : (
                            <div className="animate-fade-in">
                                <h3 style={{ textAlign: 'center', color: 'var(--primary-purple)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Shield size={28}/> Setup Authentication</h3>
                                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
                                    Use the <strong>Microsoft Authenticator</strong> app to scan this QR code. This adds an extra layer of security to your account.
                                </p>

                                <div style={{ textAlign: 'center', background: 'white', padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: 'var(--shadow-md)' }}>
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mfaQrUrl)}`}
                                        alt="MFA QR Code"
                                        style={{ width: '200px', height: '200px', marginBottom: '15px' }}
                                    />
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Secret Key:</p>
                                        <code style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-purple)' }}>{mfaSecret}</code>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Enter 6-digit code from app:</label>
                                    <input
                                        type="text"
                                        placeholder="123456"
                                        maxLength="6"
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '8px' }}
                                    />
                                </div>

                                {error && (
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '20px', textAlign: 'center', fontWeight: 600 }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={finalizeRegistration}
                                    className="btn btn-primary btn-lg btn-3d"
                                    style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    Verify & Complete Registration <Sparkles size={20}/>
                                </button>

                                <button
                                    onClick={() => setRegStep('info')}
                                    className="btn btn-ghost"
                                    style={{ width: '100%', marginTop: '15px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <ArrowLeft size={16}/> Go Back
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ marginTop: '30px', background: 'var(--surface-elevated)' }}>
                        <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={20}/> Password Requirements</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ color: passStatus.hasLength ? 'var(--success-color)' : 'var(--text-muted)' }}>{passStatus.hasLength ? '✓' : '○'} At least 8 characters</li>
                            <li style={{ color: passStatus.hasUpper ? 'var(--success-color)' : 'var(--text-muted)' }}>{passStatus.hasUpper ? '✓' : '○'} One uppercase letter (A-Z)</li>
                            <li style={{ color: passStatus.hasLower ? 'var(--success-color)' : 'var(--text-muted)' }}>{passStatus.hasLower ? '✓' : '○'} One lowercase letter (a-z)</li>
                            <li style={{ color: passStatus.hasNumber ? 'var(--success-color)' : 'var(--text-muted)' }}>{passStatus.hasNumber ? '✓' : '○'} One number (0-9)</li>
                            <li style={{ color: passStatus.hasSpecial ? 'var(--success-color)' : 'var(--text-muted)' }}>{passStatus.hasSpecial ? '✓' : '○'} One special character (!@#$%^&*)</li>
                        </ul>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Register;
