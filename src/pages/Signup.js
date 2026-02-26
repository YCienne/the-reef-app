import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup, setUserRole } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setError('');
            setLoading(true);
            const userCredential = await signup(email, password, name);
            const user = userCredential.user;

            const apiUrl = process.env.REACT_APP_API_URL;
            const res = await axios.post(`${apiUrl}/api/users/register`, {
                uid: user.uid,
                email: email,
                name: name,
                inviteCode: inviteCode
            });

            const assignedRole = res.data.role;

            // Immediately set the context role to prevent redirection race condition
            setUserRole(assignedRole);

            if (assignedRole === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Failed to create account: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '60px', height: '60px', background: 'var(--accent)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 15px', color: 'white'
                    }}>
                        <UserPlus size={30} />
                    </div>
                    <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Join The Reef</h2>
                    <p style={{ color: 'var(--text-light)' }}>Start your learning journey today</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(231, 76, 60, 0.1)',
                        border: '1px solid #e74c3c',
                        color: '#e74c3c',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                outline: 'none'
                            }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                outline: 'none'
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            required
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                outline: 'none'
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Confirm Password</label>
                        <input
                            type="password"
                            required
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                outline: 'none'
                            }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Admin Invite Code (Optional)</label>
                        <input
                            type="text"
                            placeholder="Enter code to sign up as admin"
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                outline: 'none'
                            }}
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
