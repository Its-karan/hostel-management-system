import React from 'react';
import { Bed, MapPin, MessageSquare, Utensils, Droplet, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, onClick }) => (
    <div
        onClick={onClick}
        style={{
            padding: '30px',
            backgroundColor: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '15px',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-5px)')}
        onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
    >
        <div style={{
            color: 'var(--primary-red)',
            padding: '12px',
            backgroundColor: '#FFF5F5',
            borderRadius: '50%'
        }}>
            <Icon size={32} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
        {onClick && <span style={{ fontSize: '0.85rem', color: 'var(--primary-red)', fontWeight: '700' }}>Get Started →</span>}
    </div>
);

const Features = () => {
    const navigate = useNavigate();
    const features = [
        { icon: Bed, title: "Room Allocation", description: "Digital occupancy management.", path: '/room-allocation' },
        { icon: MapPin, title: "Smart Attendance", description: "Real-time location-based tracking." },
        { icon: MessageSquare, title: "Complaint Portal", description: "Transparent issue resolution tracking." },
        { icon: Utensils, title: "Mess & Dining", description: "Menu updates and feedback loop." },
        { icon: Droplet, title: "Water Monitoring", description: "Live status of drinking water facilities." },
        { icon: Shield, title: "Security", description: "Role-based access for Wardens and Staff." },
    ];

    return (
        <section className="features-section" style={{ padding: '80px 0', backgroundColor: '#FAFAFA' }}>
            <div className="container">
                <h2 className="section-title">Key Features</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
                }}>
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            {...feature}
                            onClick={feature.path ? () => navigate(feature.path) : null}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
