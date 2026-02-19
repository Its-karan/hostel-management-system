import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="hero-section" style={{
            backgroundImage: 'linear-gradient(135deg, rgba(60, 40, 35, 0.92) 0%, rgba(100, 0, 0, 0.9) 100%), url("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'var(--text-white)',
            padding: '120px 0',
            textAlign: 'center',
            minHeight: '85vh',
            height: 'auto', // Allow it to grow on mobile if needed
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'inset 0 0 150px rgba(0,0,0,0.5)',
            overflow: 'hidden' // For animations
        }}>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <span className="animate-fadeInUp" style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    marginBottom: '2rem',
                    fontSize: '0.95rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    Excellence in Accommodation
                </span>

                <h1 className="animate-fadeInUp delay-100" style={{
                    // FontSize handled by media queries in index.css
                    fontWeight: '800',
                    marginBottom: '1.5rem',
                    lineHeight: '1.1',
                    textShadow: '0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)',
                    letterSpacing: '-0.02em',
                    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' // Fluid typography
                }}>
                    JEC Hostel <br /> Management System
                </h1>

                <p className="animate-fadeInUp delay-200" style={{
                    fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                    marginBottom: '3.5rem',
                    maxWidth: '800px',
                    margin: '0 auto 3.5rem',
                    opacity: 0.95,
                    fontWeight: 400,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    padding: '0 1rem'
                }}>
                    Seamless accommodation management for students and administrators. <br />
                    <span style={{ fontWeight: 600, color: '#FFD700' }}>Secure. Efficient. Reliable.</span>
                </p>

                <div className="animate-fadeInUp delay-300" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/student-login" className="btn btn-outline" style={{
                        minWidth: '180px',
                        fontSize: '1.1rem',
                        padding: '14px 32px',
                        borderWidth: '2px'
                    }}>
                        Student Login
                    </Link>
                    <Link to="/admin-login" className="btn btn-primary" style={{
                        backgroundColor: 'var(--bg-white)',
                        color: 'var(--primary-red)',
                        minWidth: '180px',
                        fontSize: '1.1rem',
                        padding: '14px 32px',
                        border: 'none',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                    }}>
                        Admin Login
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
