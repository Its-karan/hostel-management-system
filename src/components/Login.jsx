import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ role }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const roleTitle = role === 'admin' ? 'Admin Sign In' : 'Student Sign In';

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Mock Student Login
        if (role === 'student') {
            const studentAccounts = JSON.parse(localStorage.getItem('studentAccounts') || '[]');
            const student = studentAccounts.find(acc =>
                acc.username.toLowerCase() === email.toLowerCase() && acc.password === password
            );

            // Legacy fallback for 'karan'
            if (student || (email.toLowerCase() === 'karan' && password === '0000')) {
                const userProfile = student ? student : {
                    username: 'karan',
                    displayName: 'Karan Singh',
                    profile: { name: 'Karan Singh', branch: 'ETC', phone: '9876543210' }
                };

                console.log('Student mocked login successful');
                localStorage.setItem('currentUser', JSON.stringify(userProfile));
                setLoading(false);
                navigate('/student-dashboard');
                return;
            } else {
                setError('Invalid Student Name or Password.');
                setLoading(false);
                return;
            }
        }

        // Mock Admin/Mess Login
        if (role === 'admin') {
            if (email.toLowerCase() === 'hemant' && password === '0000') {
                console.log('Admin mocked login successful');
                setLoading(false);
                navigate('/admin-dashboard');
                return;
            } else if (email.toLowerCase() === 'vankat' && password === '0000') {
                console.log('Mess Manager mocked login successful');
                setLoading(false);
                navigate('/mess-dashboard');
                return;
            } else {
                setError('Invalid Admin/Manager Name or Password.');
                setLoading(false);
                return;
            }
        }

        // Supabase Login (Fallback/Other roles)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            backgroundColor: 'var(--bg-white)'
        }}>
            <div className="auth-card" style={{
                padding: '2rem',
                borderRadius: 'var(--border-radius)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid var(--border-color)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-red)' }}>{roleTitle}</h2>

                {error && (
                    <div style={{
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                            {role === 'student' ? 'Student Name' : 'Admin Name'}
                        </label>
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={role === 'student' ? 'e.g. karan' : 'e.g. hemant'}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-red)', fontWeight: '600' }}>Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
