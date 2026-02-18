import React, { useState } from 'react';
import { Hotel, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoomAllocation = ({ isDashboard = false }) => {
    const navigate = useNavigate();
    const [allocationData, setAllocationData] = useState(() => {
        const saved = localStorage.getItem('roomAllocation');
        return saved ? JSON.parse(saved) : {
            name: '',
            enrollment: '',
            academicYear: '',
            branch: '',
            phone: '',
            profilePhoto: null,
            jeeMains: null,
            castCertificate: null,
            incomeCertificate: null,
            admissionSlip: null
        };
    });

    const [trackingId, setTrackingId] = useState('');
    const [searchId, setSearchId] = useState('');
    const [foundRequest, setFoundRequest] = useState(null);

    const handleDataChange = (newData) => {
        setAllocationData(newData);
        localStorage.setItem('roomAllocation', JSON.stringify(newData));
    };

    const handleTrackRequest = () => {
        const allRequests = JSON.parse(localStorage.getItem('allocationRequests') || '[]');
        const req = allRequests.find(r => r.id === searchId);
        if (req) {
            setFoundRequest(req);
        } else {
            alert('Request ID not found.');
            setFoundRequest(null);
        }
    };

    const handleSubmit = () => {
        try {
            if (!allocationData.name || !allocationData.enrollment) {
                alert('Please fill in your name and enrollment number.');
                return;
            }

            const newId = `ALLOC-${Math.floor(1000 + Math.random() * 9000)}`;
            const newRequest = {
                ...allocationData,
                id: newId,
                status: 'Pending',
                submittedAt: new Date().toLocaleString()
            };

            // Save allocation request
            let existingRequests = [];
            try {
                existingRequests = JSON.parse(localStorage.getItem('allocationRequests') || '[]');
                if (!Array.isArray(existingRequests)) existingRequests = [];
            } catch (e) {
                console.error('Error parsing allocationRequests', e);
                existingRequests = [];
            }

            // Create mock student account
            let existingAccounts = [];
            try {
                existingAccounts = JSON.parse(localStorage.getItem('studentAccounts') || '[]');
                if (!Array.isArray(existingAccounts)) existingAccounts = [];
            } catch (e) {
                console.error('Error parsing studentAccounts', e);
                existingAccounts = [];
            }

            const newAccount = {
                username: allocationData.name.toLowerCase().replace(/\s+/g, ''),
                displayName: allocationData.name,
                password: '0000',
                profile: { ...newRequest }
            };

            // Avoid duplicate accounts for the same name (simple mock logic)
            const updatedAccounts = existingAccounts.filter(acc => acc.username !== newAccount.username);

            // Atomic update attempt
            localStorage.setItem('allocationRequests', JSON.stringify([...existingRequests, newRequest]));
            localStorage.setItem('studentAccounts', JSON.stringify([...updatedAccounts, newAccount]));

            // Clear temporary form data to save space since we now have the permanent record
            localStorage.removeItem('roomAllocation');
            setAllocationData({
                name: '',
                enrollment: '',
                academicYear: '',
                branch: '',
                phone: '',
                profilePhoto: null,
                jeeMains: null,
                castCertificate: null,
                incomeCertificate: null,
                admissionSlip: null
            });

            setTrackingId(newId);
            alert(`Request submitted successfully! \n\nYour Tracking ID: ${newId}\nYour Login Name: ${newAccount.username}\nDefault Password: 0000\n\nPlease save these details to track your status later.`);
        } catch (error) {
            console.error('Submission Error:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Storage is full! Please try uploading a smaller photo or clear some browser data.');
            } else {
                alert('An error occurred during submission. Please try again or check the console for details.');
            }
        }
    };

    const containerStyle = isDashboard ? {} : {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 20px',
        animation: 'fadeIn 0.5s'
    };

    return (
        <div style={containerStyle}>
            {!isDashboard && (
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-red)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '2rem'
                    }}
                >
                    <ArrowLeft size={20} /> Back to Home
                </button>
            )}

            <div style={{ marginBottom: '2.5rem', textAlign: isDashboard ? 'left' : 'center' }}>
                <h2 style={{ fontSize: isDashboard ? '1.75rem' : '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                    Hostel Room Allocation
                </h2>
                <p style={{ color: '#64748b', marginTop: '0.5rem', maxWidth: '600px', margin: isDashboard ? '0.5rem 0' : '0.5rem auto' }}>
                    Complete the application below or track your existing request using your Tracking ID.
                </p>
            </div>

            {/* Tracking Section */}
            <div style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Track Your Application</h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        placeholder="Enter Tracking ID (e.g., ALLOC-1234)"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                    <button
                        onClick={handleTrackRequest}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Search
                    </button>
                </div>

                {foundRequest && (
                    <div style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Status for <span style={{ fontWeight: '700', color: '#1e293b' }}>{foundRequest.id}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: foundRequest.status === 'Approved' ? '#166534' : foundRequest.status === 'Rejected' ? '#991b1b' : '#92400e' }}>
                                    {foundRequest.status}
                                </div>
                                {foundRequest.status === 'Approved' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', border: '1px solid #bbf7d0' }}>
                                            🏠 {foundRequest.allocatedHostel}
                                        </span>
                                        <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', border: '1px solid #bbf7d0' }}>
                                            🔑 {foundRequest.allocatedRoom}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Submitted On</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>{foundRequest.submittedAt}</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{
                backgroundColor: 'white',
                padding: '2.5rem',
                borderRadius: '24px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
            }}>
                {trackingId && (
                    <div style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#166534', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Submission Successful!</div>
                        <div style={{ color: '#166534', fontSize: '0.9rem' }}>
                            Your Tracking ID: <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>{trackingId}</span>
                        </div>
                        <p style={{ color: '#166534', fontSize: '0.8rem', marginTop: '0.5rem' }}>Please save this ID to track your application status.</p>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Full Name</label>
                        <input
                            type="text"
                            value={allocationData.name}
                            onChange={(e) => handleDataChange({ ...allocationData, name: e.target.value })}
                            placeholder="Enter your full name"
                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Enrollment Number / Application ID</label>
                        <input
                            type="text"
                            value={allocationData.enrollment}
                            onChange={(e) => handleDataChange({ ...allocationData, enrollment: e.target.value })}
                            placeholder="e.g., JEC/2024/0001"
                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Branch</label>
                        <select
                            value={allocationData.branch}
                            onChange={(e) => handleDataChange({ ...allocationData, branch: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', backgroundColor: 'white' }}
                        >
                            <option value="">Select Branch</option>
                            <option value="CSE">Computer Science</option>
                            <option value="AI-DS">AI & Data Science</option>
                            <option value="ETC">Electronics & Telecommunication</option>
                            <option value="EE">Electrical Engineering</option>
                            <option value="ME">Mechanical Engineering</option>
                            <option value="CE">Civil Engineering</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Phone Number</label>
                        <input
                            type="tel"
                            value={allocationData.phone}
                            onChange={(e) => handleDataChange({ ...allocationData, phone: e.target.value })}
                            placeholder="e.g., +91 9876543210"
                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '1.5rem' }}>Academic Year & Profile Photo</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
                            <button
                                key={year}
                                onClick={() => handleDataChange({ ...allocationData, academicYear: year })}
                                style={{
                                    padding: '0.85rem',
                                    borderRadius: '12px',
                                    border: '1px solid',
                                    borderColor: allocationData.academicYear === year ? 'var(--primary-red)' : '#e2e8f0',
                                    backgroundColor: allocationData.academicYear === year ? '#fff1f1' : 'white',
                                    color: allocationData.academicYear === year ? 'var(--primary-red)' : '#64748b',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.75rem' }}>Passport Size Photo</label>
                    <div
                        onClick={() => document.getElementById('file-profilePhoto').click()}
                        style={{
                            maxWidth: '200px',
                            height: '240px',
                            border: '2px dashed #cbd5e1',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backgroundColor: allocationData.profilePhoto ? '#f0fdf4' : '#f8fafc',
                            borderColor: allocationData.profilePhoto ? '#22c55e' : '#cbd5e1',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {allocationData.profilePhoto ? (
                            <img src={allocationData.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>Upload Photo</div>
                            </div>
                        )}
                        <input
                            type="file"
                            id="file-profilePhoto"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => handleDataChange({ ...allocationData, profilePhoto: reader.result });
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Requirement: Formal passport size photo (PDF/JPG/PNG)</p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.5rem' }}>Required Documents</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {[
                            { id: 'jeeMains', label: 'JEE Mains Result', icon: '📝' },
                            { id: 'castCertificate', label: 'Cast Certificate', icon: '📜' },
                            { id: 'incomeCertificate', label: 'Father\'s Income Certificate', icon: '💰' },
                            { id: 'admissionSlip', label: 'Admission Slip', icon: '🎟️' }
                        ].map((doc) => (
                            <div key={doc.id}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.75rem' }}>{doc.label}</label>
                                <div
                                    onClick={() => document.getElementById(`file-${doc.id}`).click()}
                                    style={{
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '16px',
                                        padding: '2rem 1.5rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        backgroundColor: allocationData[doc.id] ? '#f0fdf4' : '#f8fafc',
                                        borderColor: allocationData[doc.id] ? '#22c55e' : '#cbd5e1',
                                        boxShadow: allocationData[doc.id] ? '0 4px 6px -1px rgba(34, 197, 94, 0.1)' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!allocationData[doc.id]) e.currentTarget.style.borderColor = 'var(--primary-red)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!allocationData[doc.id]) e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                >
                                    <input
                                        type="file"
                                        id={`file-${doc.id}`}
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    handleDataChange({ ...allocationData, [doc.id]: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{doc.icon}</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: allocationData[doc.id] ? '#166534' : '#1e293b' }}>
                                        {allocationData[doc.id] ? 'Document Verified' : 'Click to Upload'}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                                        {allocationData[doc.id] ? 'Tap to change file' : 'PDF or Image up to 5MB'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: isDashboard ? 'flex-end' : 'center' }}>
                        <button
                            onClick={handleSubmit}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1.25rem 3rem',
                                backgroundColor: 'var(--primary-red)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                boxShadow: '0 10px 15px -3px rgba(192, 57, 43, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            <Send size={20} /> Submit Application
                        </button>
                    </div>
                </div>

                {!isDashboard && (
                    <div style={{ marginTop: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                        © 2026 JEC Hostel Management System. All rights reserved.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomAllocation;
