import React from 'react';
import { Bed, MapPin, MessageSquare, Utensils, Droplet, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, onClick, style, className }) => (
    <div
        onClick={onClick}
        className={`feature-card ${className || ''}`}
        style={{
            padding: '40px 30px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '20px',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            ...style
        }}
        onMouseEnter={(e) => {
            if (onClick) {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                e.currentTarget.querySelector('.icon-wrapper').style.backgroundColor = 'var(--primary-red)';
                e.currentTarget.querySelector('.icon-wrapper').style.color = 'white';
            }
        }}
        onMouseLeave={(e) => {
            if (onClick) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.querySelector('.icon-wrapper').style.backgroundColor = '#FFF5F5';
                e.currentTarget.querySelector('.icon-wrapper').style.color = 'var(--primary-red)';
            }
        }}
    >
        <div className="icon-wrapper" style={{
            color: 'var(--primary-red)',
            padding: '16px',
            backgroundColor: '#FFF5F5',
            borderRadius: '16px',
            transition: 'all 0.3s ease',
            display: 'inline-flex'
        }}>
            <Icon size={28} strokeWidth={2} />
        </div>

        <div>
            <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                marginBottom: '10px',
                fontFamily: 'var(--font-serif)'
            }}>
                {title}
            </h3>
            <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.6'
            }}>
                {description}
            </p>
        </div>

        {onClick && (
            <span style={{
                marginTop: 'auto',
                fontSize: '0.9rem',
                color: 'var(--primary-red)',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                Get Started
                <span style={{ transition: 'transform 0.2s' }}>→</span>
            </span>
        )}
    </div>
);

const Features = () => {
    const navigate = useNavigate();
    const features = [
        { icon: Bed, title: "Room Allocation", description: "Streamlined digital occupancy management and room requests.", path: '/room-allocation' },
        { icon: MapPin, title: "Smart Attendance", description: "Geo-fenced, real-time location-based tracking for students." },
        { icon: MessageSquare, title: "Complaint Portal", description: "Transparent issue resolution tracking with status updates." },
        { icon: Utensils, title: "Mess & Dining", description: "Weekly menu updates, feedback loop, and diet preferences." },
        { icon: Droplet, title: "Water Monitoring", description: "Live IoT-based status of drinking water facilities." },
        { icon: Shield, title: "Campus Security", description: "Role-based access control for Wardens and security staff." },
    ];

    return (
        <section className="features-section" style={{ padding: '100px 0', backgroundColor: 'var(--bg-white)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <span className="animate-fadeInUp" style={{
                        color: 'var(--accent-brown)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        fontSize: '0.875rem',
                        letterSpacing: '0.1em',
                        display: 'block',
                        marginBottom: '10px'
                    }}>
                        Why Choose Us
                    </span>
                    <h2 className="section-title animate-fadeInUp delay-100" style={{ marginBottom: '20px' }}>Key Campus Features</h2>
                    <p className="animate-fadeInUp delay-200" style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
                        Designed to enhance the living experience with technology-driven solutions.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Reduced min-width for smaller phones
                    gap: '30px'
                }}>
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            {...feature}
                            onClick={feature.path ? () => navigate(feature.path) : null}
                            className="animate-fadeInUp"
                            style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
