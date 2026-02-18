import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="hero-section" style={{
            backgroundImage: 'linear-gradient(rgba(128, 0, 0, 0.9), rgba(93, 64, 55, 0.8)), url("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'var(--text-white)',
            padding: '100px 0',
            textAlign: 'center',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div className="container">
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                    JEC Hostel Management System
                </h1>
                <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
                    Seamless accommodation management for students and administrators. Secure, efficient, and reliable.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/student-login" className="btn" style={{
                        backgroundColor: 'transparent',
                        color: 'var(--bg-white)',
                        fontWeight: '700',
                        border: '2px solid var(--bg-white)',
                        textDecoration: 'none'
                    }}>
                        Student Login
                    </Link>
                    <Link to="/admin-login" className="btn" style={{
                        backgroundColor: 'var(--bg-white)',
                        color: 'var(--primary-red)',
                        fontWeight: '700',
                        border: '2px solid var(--bg-white)',
                        textDecoration: 'none'
                    }}>
                        Admin Login
                    </Link>
                    <Link to="/room-allocation" className="btn" style={{
                        backgroundColor: 'var(--primary-red)',
                        color: 'white',
                        fontWeight: '700',
                        border: '2px solid var(--primary-red)',
                        textDecoration: 'none'
                    }}>
                        Apply for Room
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
