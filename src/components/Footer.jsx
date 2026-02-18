import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: 'var(--accent-brown)',
            color: 'white',
            padding: '40px 0',
            marginTop: 'auto'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>JEC Hostel Management</h3>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Secure Hostel Ecosystem</p>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <p style={{ marginBottom: '5px' }}>Jabalpur Engineering College</p>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Gokalpur, Jabalpur, M.P.</p>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '10px' }}>&copy; {new Date().getFullYear()} JEC. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
