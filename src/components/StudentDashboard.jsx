import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import {
    Camera, User, Utensils, Droplets, AlertCircle, LogOut, Menu, X, Hotel,
    CheckCircle2, XCircle, MessageSquare, Briefcase, FileText, Download, Edit2, Check
} from 'lucide-react';
import RoomAllocation from './RoomAllocation';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [attendanceType, setAttendanceType] = useState(null); // 'entry' or 'exit'
    const [cooldownParams, setCooldownParams] = useState({ isCooldown: false, timeLeft: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
    const [imgSrc, setImgSrc] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'failed', or null
    const [specialRequest, setSpecialRequest] = useState('');
    const [specialRequests, setSpecialRequests] = useState(() => {
        return JSON.parse(localStorage.getItem('specialRequests') || JSON.stringify([
            { id: 1, dish: 'Paneer Butter Masala', requestedBy: 'Rahul', up: 15, down: 2, userVote: null },
            { id: 2, dish: 'Masala Dosa', requestedBy: 'Sneha', up: 28, down: 4, userVote: null },
            { id: 3, dish: 'Chicken Biryani', requestedBy: 'Amit', up: 42, down: 6, userVote: null }
        ]));
    });
    const [complaintTab, setComplaintTab] = useState('new'); // 'new', 'community', 'track'
    const [trackingId, setTrackingId] = useState('');
    const [trackedComplaint, setTrackedComplaint] = useState(null);
    const defaultComplaints = [
        { id: 'COMP-7821', category: 'Electrical', description: 'Fan in Room 204 is making strange noises.', status: 'Pending', votes: 12, userVote: null, date: '2026-02-15' },
        { id: 'COMP-9012', category: 'Cleanliness', description: 'Corridor lights on 1st floor are not working.', status: 'In Progress', votes: 8, userVote: null, date: '2026-02-16' },
        { id: 'COMP-4532', category: 'Mess Food', description: 'Drinking water filter needs service.', status: 'Resolved', votes: 25, userVote: null, date: '2026-02-14' }
    ];
    const [complaints, setComplaints] = useState(() => {
        try {
            const shared = JSON.parse(localStorage.getItem('sharedComplaints') || '[]');
            const validShared = Array.isArray(shared) ? shared : [];
            const validDefaults = Array.isArray(defaultComplaints) ? defaultComplaints : [];

            const sharedIds = new Set(validShared.map(c => c.id));
            const merged = [...validShared, ...validDefaults.filter(c => !sharedIds.has(c.id))];
            return merged;
        } catch (e) {
            console.error('Error loading complaints:', e);
            return Array.isArray(defaultComplaints) ? defaultComplaints : [];
        }
    });
    const [lastGeneratedId, setLastGeneratedId] = useState(null);
    const [currentUser] = useState(() => {
        try {
            const saved = localStorage.getItem('currentUser');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch (e) {
            console.error('Error loading currentUser:', e);
        }
        return {
            displayName: 'Karan Singh',
            profile: {
                name: 'Karan Singh',
                enrollment: '0201EC251048',
                branch: 'Electronics and Telecommunication Engineering',
                phone: '+91 92011 90093',
                allocatedHostel: 'Hostel Number 8',
                allocatedRoom: '19',
                profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop'
            }
        };
    });
    const [profileImage, setProfileImage] = useState(() => {
        return currentUser.profile.profilePhoto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop';
    });
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    // Check cooldown status
    const checkCooldown = useCallback(() => {
        const lastTime = localStorage.getItem('lastAttendanceTime');
        if (lastTime) {
            const diff = Date.now() - parseInt(lastTime, 10);
            const fiveMinutes = 5 * 60 * 1000;
            if (diff < fiveMinutes) {
                const secondsLeft = Math.ceil((fiveMinutes - diff) / 1000);
                return { isCooldown: true, timeLeft: secondsLeft };
            }
        }
        return { isCooldown: false, timeLeft: 0 };
    }, []);

    // Update cooldown state on mount and when tab changes
    React.useEffect(() => {
        if (activeTab === 'attendance') {
            const status = checkCooldown();
            setCooldownParams(status);

            // Set up interval to update timer if in cooldown
            let interval;
            if (status.isCooldown) {
                interval = setInterval(() => {
                    const newStatus = checkCooldown();
                    setCooldownParams(newStatus);
                    if (!newStatus.isCooldown) clearInterval(interval);
                }, 1000);
            }
            return () => clearInterval(interval);
        } else {
            // Reset attendance flow when leaving tab
            setAttendanceType(null);
            setImgSrc(null);
            setVerificationStatus(null);
        }
    }, [activeTab, checkCooldown]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        setVerifying(true);
        setVerificationStatus(null);

        // Simulate verification process
        setTimeout(() => {
            setVerifying(false);
            setVerificationStatus('success');

            // Save timestamp for cooldown
            const timestamp = Date.now();
            localStorage.setItem('lastAttendanceTime', timestamp.toString());

            // Save attendance record to localStorage
            const attendanceRecord = {
                studentName: 'Karan Singh',
                roll: '0201EC251048',
                room: '19',
                photo: profileImage, // Use current profile image
                verificationPic: imageSrc, // base64 captured image
                entryTime: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                exitTime: '-',
                date: new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                timestamp: timestamp,
                type: attendanceType
            };

            // Get existing records
            const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');

            // Add new record
            existingRecords.push(attendanceRecord);

            // Save back to localStorage
            localStorage.setItem('attendanceRecords', JSON.stringify(existingRecords));
        }, 2000);
    }, [webcamRef, attendanceType]);

    const retake = () => {
        setImgSrc(null);
        setVerificationStatus(null);
    };

    const handleLogout = () => {
        navigate('/');
    };

    const handleProfileImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result;
                setProfileImage(base64Image);
                localStorage.setItem('studentProfileImage', base64Image);
            };
            reader.readAsDataURL(file);
        }
    };

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    const menuItems = [
        { id: 'attendance', label: 'Mark Attendance', icon: <Camera size={20} /> },
        { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
        { id: 'mess', label: 'Todays Mess', icon: <Utensils size={20} /> },
        { id: 'water', label: 'Water Status', icon: <Droplets size={20} /> },
        { id: 'allocation', label: 'Room Allocation', icon: <Hotel size={20} /> },
        { id: 'complaint', label: 'Complaint', icon: <AlertCircle size={20} /> },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            {/* Mobile Sidebar Toggle */}
            <button
                className="md:hidden"
                style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 1000,
                    padding: '0.5rem',
                    backgroundColor: 'var(--primary-red)',
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    display: 'none' // Hidden by default, show via media query if responsive CSS exists
                }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar */}
            <aside style={{
                width: '280px',
                backgroundColor: 'white',
                borderRight: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: 0,
                height: '100vh',
                boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
            }}>
                <div style={{
                    padding: '2rem',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'var(--primary-red)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                    }}>JEC</div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>Student Portal</span>
                </div>

                <nav style={{ flex: 1, padding: '1.5rem 1rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {menuItems.map((item) => (
                            <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        border: 'none',
                                        backgroundColor: activeTab === item.id ? '#fff1f1' : 'transparent',
                                        color: activeTab === item.id ? 'var(--primary-red)' : '#64748b',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === item.id ? '600' : '500',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'left'
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b'
                        }}>
                            <User size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentUser.displayName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Student</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        {menuItems.find(i => i.id === activeTab)?.label}
                    </h1>
                    <p style={{ color: '#64748b' }}>Welcome back, {currentUser.displayName}</p>
                </header>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    minHeight: '400px'
                }}>
                    {/* ATTENDANCE VIEW */}
                    {activeTab === 'attendance' && (
                        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                            {cooldownParams.isCooldown ? (
                                <div style={{
                                    padding: '3rem',
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '16px',
                                    backgroundColor: '#f8fafc',
                                    color: '#64748b'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Cooldown Active</h3>
                                    <p style={{ fontSize: '1.1rem' }}>
                                        You can mark attendance again in <br />
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary-red)', fontSize: '1.4rem' }}>
                                            {Math.floor(cooldownParams.timeLeft / 60)}:{(cooldownParams.timeLeft % 60).toString().padStart(2, '0')}
                                        </span>
                                    </p>
                                </div>
                            ) : !attendanceType ? (
                                <div style={{ animation: 'fadeIn 0.5s' }}>
                                    <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>Are you entering or exiting the hostel?</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <button
                                            onClick={() => setAttendanceType('entry')}
                                            style={{
                                                padding: '3rem 2rem',
                                                border: '2px solid #e2e8f0',
                                                borderRadius: '16px',
                                                backgroundColor: 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-red)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                backgroundColor: '#dcfce7',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#166534'
                                            }}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                                            </div>
                                            <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>Entering Hostel</span>
                                        </button>

                                        <button
                                            onClick={() => setAttendanceType('exit')}
                                            style={{
                                                padding: '3rem 2rem',
                                                border: '2px solid #e2e8f0',
                                                borderRadius: '16px',
                                                backgroundColor: 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-red)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                backgroundColor: '#fee2e2',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#991b1b'
                                            }}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                            </div>
                                            <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>Exiting Hostel</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ animation: 'fadeIn 0.5s' }}>
                                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <button
                                            onClick={() => setAttendanceType(null)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#64748b',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            ← Back to selection
                                        </button>
                                        <span style={{
                                            fontWeight: '600',
                                            color: attendanceType === 'entry' ? '#166534' : '#991b1b',
                                            backgroundColor: attendanceType === 'entry' ? '#dcfce7' : '#fee2e2',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            textTransform: 'capitalize'
                                        }}>
                                            {attendanceType} Marking
                                        </span>
                                    </div>

                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '400px',
                                        backgroundColor: '#000',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        marginBottom: '2rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {!imgSrc ? (
                                            <Webcam
                                                audio={false}
                                                ref={webcamRef}
                                                screenshotFormat="image/jpeg"
                                                videoConstraints={videoConstraints}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <img src={imgSrc} alt="Captured face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}

                                        {!imgSrc && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: '20px',
                                                border: '2px dashed rgba(255,255,255,0.5)',
                                                borderRadius: '12px',
                                                pointerEvents: 'none'
                                            }}></div>
                                        )}

                                        {verifying && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                backgroundColor: 'rgba(0,0,0,0.8)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: 'white'
                                            }}>
                                                <div style={{
                                                    border: '4px solid rgba(255,255,255,0.3)',
                                                    borderTop: '4px solid var(--primary-red)',
                                                    borderRadius: '50%',
                                                    width: '50px',
                                                    height: '50px',
                                                    animation: 'spin 1s linear infinite',
                                                    marginBottom: '1.5rem'
                                                }}></div>
                                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Verifying Identity...</h3>
                                            </div>
                                        )}
                                    </div>

                                    {verificationStatus === 'success' ? (
                                        <div style={{ animation: 'fadeIn 0.5s' }}>
                                            <div style={{
                                                backgroundColor: '#dcfce7',
                                                color: '#166534',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                marginBottom: '1.5rem',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontWeight: '600'
                                            }}>
                                                <span>✅</span> Attendance Marked: {attendanceType === 'entry' ? 'Entered Hostel' : 'Exited Hostel'}
                                            </div>
                                            <br />
                                            <button onClick={retake} className="btn btn-outline" style={{ marginRight: '1rem' }}>Close</button>
                                        </div>
                                    ) : (
                                        !imgSrc ? (
                                            <button onClick={capture} className="btn" style={{
                                                backgroundColor: 'var(--primary-red)',
                                                color: 'white',
                                                padding: '0.75rem 2rem',
                                                fontSize: '1.1rem'
                                            }}>
                                                Verify & Mark {attendanceType === 'entry' ? 'Entry' : 'Exit'}
                                            </button>
                                        ) : (
                                            <button onClick={retake} className="btn btn-outline" disabled={verifying}>
                                                Retake Photo
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFILE VIEW */}
                    {activeTab === 'profile' && (
                        <div>
                            {/* Profile Image Section */}
                            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '4px solid var(--primary-red)',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <label
                                        htmlFor="profile-upload"
                                        style={{
                                            position: 'absolute',
                                            bottom: '5px',
                                            right: '5px',
                                            backgroundColor: 'var(--primary-red)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Camera size={20} />
                                    </label>
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>Click the camera icon to update your profile picture</p>
                            </div>

                            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Personal Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Full Name</label>
                                    <div style={{ fontWeight: '500', fontSize: '1.1rem' }}>{currentUser.profile?.name || currentUser.displayName}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Roll Number</label>
                                    <div style={{ fontWeight: '500', fontSize: '1.1rem' }}>{currentUser.profile?.enrollment || 'N/A'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Branch</label>
                                    <div style={{ fontWeight: '500', fontSize: '1.1rem' }}>{currentUser.profile?.branch || 'N/A'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Hostel Block</label>
                                    <div style={{ fontWeight: '500', fontSize: '1.1rem' }}>{currentUser.profile?.allocatedHostel || 'Not Assigned'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Room Number</label>
                                    <div style={{ fontWeight: '500', fontSize: '1.1rem' }}>{currentUser.profile?.allocatedRoom || 'Not Assigned'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Contact</label>
                                    <div style={{ fontWeight: '500', fontSize: '1.1rem' }}>{currentUser.profile?.phone || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MESS MENU VIEW */}
                    {activeTab === 'mess' && (() => {
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const todayIndex = new Date().getDay();
                        const todayName = days[todayIndex];

                        const weeklyMenu = JSON.parse(localStorage.getItem('messMenu') || JSON.stringify({
                            'Monday': { break: 'Poha/Jalebi', lunch: 'Rajma Chawal', dinner: 'Roti, Sabzi, Dal' },
                            'Tuesday': { break: 'Aloo Paratha', lunch: 'Kadi Chawal', dinner: 'Egg Curry / Paneer' },
                            'Wednesday': { break: 'Idli Sambar', lunch: 'Dal Makhani', dinner: 'Mix Veg' },
                            'Thursday': { break: 'Sandwich', lunch: 'Chole Bhature', dinner: 'Soyabean Curry' },
                            'Friday': { break: 'Upma', lunch: 'Fried Rice', dinner: 'Kofta Curry' },
                            'Saturday': { break: 'Pav Bhaji', lunch: 'Khichdi', dinner: 'Special Thali' },
                            'Sunday': { break: 'Maggi/Pasta', lunch: 'Biryani', dinner: 'Light Khichdi' },
                        }));

                        const todayMenu = weeklyMenu[todayName];

                        const handleVote = (requestId, type) => {
                            setSpecialRequests(prev => {
                                const updated = prev.map(req => {
                                    if (req.id === requestId) {
                                        const newReq = { ...req };
                                        if (req.userVote === type) {
                                            newReq[type] = req[type] - 1;
                                            newReq.userVote = null;
                                        } else if (req.userVote) {
                                            const oldType = req.userVote;
                                            newReq[oldType] = req[oldType] - 1;
                                            newReq[type] = req[type] + 1;
                                            newReq.userVote = type;
                                        } else {
                                            newReq[type] = req[type] + 1;
                                            newReq.userVote = type;
                                        }
                                        return newReq;
                                    }
                                    return req;
                                });
                                localStorage.setItem('specialRequests', JSON.stringify(updated));
                                return updated;
                            });
                        };

                        const handleSpecialRequest = (e) => {
                            e.preventDefault();
                            if (!specialRequest.trim()) return;

                            const newReq = {
                                id: Date.now(),
                                dish: specialRequest,
                                requestedBy: 'Karan', // Hardcoded for demo
                                up: 0,
                                down: 0,
                                userVote: null,
                                status: 'pending'
                            };

                            setSpecialRequests(prev => {
                                const updated = [newReq, ...prev];
                                localStorage.setItem('specialRequests', JSON.stringify(updated));
                                return updated;
                            });
                            setSpecialRequest('');
                        };

                        return (
                            <div style={{ animation: 'fadeIn 0.5s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Planned Meals for {todayName}</h2>
                                    <span style={{ padding: '0.4rem 1rem', backgroundColor: '#fff1f1', color: 'var(--primary-red)', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600' }}>
                                        Current Menu
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                                    {[
                                        { id: 'breakfast', label: 'Breakfast', dish: todayMenu.break, icon: '🥐' },
                                        { id: 'lunch', label: 'Lunch', dish: todayMenu.lunch, icon: '🍛' },
                                        { id: 'dinner', label: 'Dinner', dish: todayMenu.dinner, icon: '🥗' }
                                    ].map((meal) => (
                                        <div key={meal.id} style={{
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meal.label}</span>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{meal.dish}</h3>
                                                </div>
                                                <span style={{ fontSize: '1.5rem' }}>{meal.icon}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '3rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Special Dish Requests</h2>
                                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Vote for your favorites!</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {specialRequests.map((req) => (
                                            <div key={req.id} style={{
                                                backgroundColor: 'white',
                                                borderRadius: '12px',
                                                padding: '1.25rem',
                                                border: '1px solid #e2e8f0',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                <div>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{req.dish}</h4>
                                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Requested by {req.requestedBy}</p>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {req.status === 'accepted' ? (
                                                        <div style={{ padding: '0.4rem 0.85rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <Check size={14} /> Accepted by Mess
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleVote(req.id, 'up')}
                                                                style={{
                                                                    border: 'none',
                                                                    background: req.userVote === 'up' ? '#dcfce7' : '#f8fafc',
                                                                    color: req.userVote === 'up' ? '#166534' : '#64748b',
                                                                    padding: '0.5rem 1rem',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: '600',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                👍 {req.up}
                                                            </button>
                                                            <button
                                                                onClick={() => handleVote(req.id, 'down')}
                                                                style={{
                                                                    border: 'none',
                                                                    background: req.userVote === 'down' ? '#fee2e2' : '#f8fafc',
                                                                    color: req.userVote === 'down' ? '#991b1b' : '#64748b',
                                                                    padding: '0.5rem 1rem',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: '600',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                👎 {req.down}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: '#fffbeb',
                                    padding: '2rem',
                                    borderRadius: '16px',
                                    border: '1px solid #fde68a'
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '12px', fontSize: '1.25rem' }}>✨</div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Suggest a New Special Dish</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#92400e' }}>Is there something special you'd like the mess to prepare? Suggest it here and let others vote!</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleSpecialRequest} style={{ display: 'flex', gap: '1rem' }}>
                                        <input
                                            type="text"
                                            value={specialRequest}
                                            onChange={(e) => setSpecialRequest(e.target.value)}
                                            placeholder="e.g., Paneer Butter Masala, Masala Dosa..."
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem 1rem',
                                                borderRadius: '8px',
                                                border: '1px solid #fcd34d',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <button className="btn" style={{ backgroundColor: '#92400e', color: 'white', padding: '0 1.5rem' }}>Add Suggestion</button>
                                    </form>
                                </div>
                            </div>
                        );
                    })()}

                    {/* WATER STATUS VIEW */}
                    {activeTab === 'water' && (() => {
                        const ws = JSON.parse(localStorage.getItem('waterStatus') || JSON.stringify({ level: 'Good', hostel: '', note: '', lastUpdated: null, report: null, reportName: null }));
                        const colorMap = {
                            Good: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', dot: '#22c55e' },
                            Caution: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', dot: '#f59e0b' },
                            Critical: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', dot: '#ef4444' },
                        };
                        const c = colorMap[ws.level] || colorMap.Good;
                        return (
                            <div style={{ maxWidth: '600px' }}>
                                {/* Status Card */}
                                <div style={{ padding: '2rem', borderRadius: '16px', backgroundColor: c.bg, border: `1px solid ${c.border}`, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: c.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 16px ${c.dot}55` }}>
                                        <span style={{ fontSize: '1.5rem' }}>💧</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                                            Water Quality Status {ws.hostel ? `— ${ws.hostel}` : ''}
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: c.color, lineHeight: 1.2 }}>{ws.level}</div>
                                        {ws.lastUpdated && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>Last updated: {ws.lastUpdated}</div>}
                                    </div>
                                </div>

                                {/* Note */}
                                {ws.note && (
                                    <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.3rem' }}>ADMIN NOTE</div>
                                        <p style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem' }}>{ws.note}</p>
                                    </div>
                                )}

                                {/* Report Download */}
                                {ws.report && (
                                    <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1.25rem' }}>📄</span>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#166534', fontSize: '0.9rem' }}>{ws.reportName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Purification Test Report</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const a = document.createElement('a');
                                                a.href = ws.report;
                                                a.download = ws.reportName;
                                                a.click();
                                            }}
                                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #bbf7d0', backgroundColor: 'white', color: '#166534', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                        >
                                            ⬇ Download
                                        </button>
                                    </div>
                                )}

                                {!ws.report && (
                                    <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                        No purification report uploaded yet.
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* COMPLAINT VIEW */}
                    {activeTab === 'allocation' && (
                        <RoomAllocation isDashboard={true} />
                    )}

                    {activeTab === 'complaint' && (() => {
                        const handleSubmitComplaint = (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const newId = `COMP-${Math.floor(1000 + Math.random() * 9000)}`;
                            const fileInput = e.target.querySelector('input[type="file"]');
                            const file = fileInput?.files[0];

                            const saveComplaint = (proofData, proofType) => {
                                const newComplaint = {
                                    id: newId,
                                    category: formData.get('category'),
                                    hostel: formData.get('hostel'),
                                    description: formData.get('description'),
                                    status: 'Pending',
                                    votes: 0,
                                    userVote: null,
                                    date: new Date().toISOString().split('T')[0],
                                    proof: proofData || null,
                                    proofType: proofType || null
                                };
                                setComplaints(prev => {
                                    const updated = [newComplaint, ...prev];
                                    // Persist to shared localStorage so admin can see it
                                    localStorage.setItem('sharedComplaints', JSON.stringify(updated));
                                    return updated;
                                });
                                setLastGeneratedId(newId);
                                alert(`Complaint Submitted! Your Tracking ID is: ${newId}`);
                                e.target.reset();
                            };

                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const isVideo = file.type.startsWith('video/');
                                    saveComplaint(reader.result, isVideo ? 'video' : 'image');
                                };
                                reader.readAsDataURL(file);
                            } else {
                                saveComplaint(null, null);
                            }
                        };

                        const handleVoteComplaint = (id, type) => {
                            setComplaints(prev => prev.map(c => {
                                if (c.id === id) {
                                    if (c.userVote === type) {
                                        return { ...c, votes: c.votes - (type === 'up' ? 1 : -1), userVote: null };
                                    }
                                    const change = type === 'up' ? (c.userVote === 'down' ? 2 : 1) : (c.userVote === 'up' ? -2 : -1);
                                    return { ...c, votes: c.votes + change, userVote: type };
                                }
                                return c;
                            }));
                        };

                        const handleTrack = (e) => {
                            e.preventDefault();
                            const found = complaints.find(c => c.id === trackingId.toUpperCase());
                            setTrackedComplaint(found || 'not_found');
                        };

                        return (
                            <div>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                    {[
                                        { id: 'new', label: 'New Complaint' },
                                        { id: 'community', label: 'Community Issues' },
                                        { id: 'track', label: 'Track Status' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setComplaintTab(tab.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                border: 'none',
                                                background: 'none',
                                                color: complaintTab === tab.id ? 'var(--primary-red)' : '#64748b',
                                                fontWeight: complaintTab === tab.id ? 'bold' : '500',
                                                borderBottom: complaintTab === tab.id ? '2px solid var(--primary-red)' : 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {complaintTab === 'new' && (
                                    <div style={{ maxWidth: '600px', animation: 'fadeIn 0.3s' }}>
                                        <form onSubmit={handleSubmitComplaint}>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
                                                <select name="category" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required>
                                                    <option>Electrical</option>
                                                    <option>Plumbing</option>
                                                    <option>Cleanliness</option>
                                                    <option>Mess Food</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Hostel</label>
                                                <select name="hostel" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required>
                                                    <option value="">-- Select Hostel --</option>
                                                    <option>Hostel 1</option>
                                                    <option>Hostel 2</option>
                                                    <option>Hostel 3</option>
                                                    <option>Hostel 4</option>
                                                    <option>Hostel 5</option>
                                                    <option>Hostel 6</option>
                                                    <option>Hostel 7</option>
                                                    <option>Hostel 8</option>
                                                    <option>Hostel 9</option>
                                                    <option>Hostel 10</option>
                                                </select>
                                            </div>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Proof (Image/Video)</label>
                                                <input type="file" accept="image/*,video/*" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }} />
                                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Max size: 10MB. Formats: JPG, PNG, MP4</p>
                                            </div>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                                                <textarea name="description" rows={5} placeholder="Describe the issue in detail..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required></textarea>
                                            </div>
                                            <button className="btn" style={{ backgroundColor: 'var(--primary-red)', color: 'white', width: '100%', padding: '1rem' }}>Submit Complaint</button>
                                        </form>

                                        {lastGeneratedId && (
                                            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                                                <p style={{ margin: 0, color: '#166534', fontWeight: '600' }}>Complaint submitted successfully!</p>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{lastGeneratedId}</p>
                                                <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0 }}>Save this ID to track your complaint status.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {complaintTab === 'community' && (
                                    <div style={{ animation: 'fadeIn 0.3s' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {complaints.map(complaint => (
                                                <div key={complaint.id} style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                                        <button
                                                            onClick={() => handleVoteComplaint(complaint.id, 'up')}
                                                            style={{
                                                                border: 'none', background: complaint.userVote === 'up' ? '#fee2e2' : '#f8fafc',
                                                                color: complaint.userVote === 'up' ? 'var(--primary-red)' : '#94a3b8',
                                                                padding: '0.5rem', borderRadius: '6px', cursor: 'pointer'
                                                            }}
                                                        >
                                                            ▲
                                                        </button>
                                                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{complaint.votes}</span>
                                                        <button
                                                            onClick={() => handleVoteComplaint(complaint.id, 'down')}
                                                            style={{
                                                                border: 'none', background: complaint.userVote === 'down' ? '#fee2e2' : '#f8fafc',
                                                                color: complaint.userVote === 'down' ? 'var(--primary-red)' : '#94a3b8',
                                                                padding: '0.5rem', borderRadius: '6px', cursor: 'pointer'
                                                            }}
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary-red)', backgroundColor: '#fff1f1', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                                                {complaint.category}
                                                            </span>
                                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{complaint.date}</span>
                                                        </div>
                                                        {complaint.hostel && (
                                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>🏠 {complaint.hostel}</div>
                                                        )}
                                                        <p style={{ margin: '0.5rem 0', fontWeight: '500' }}>{complaint.description}</p>
                                                        {complaint.proof && (
                                                            <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden', maxWidth: '100%' }}>
                                                                {complaint.proofType === 'video' ? (
                                                                    <video
                                                                        src={complaint.proof}
                                                                        controls
                                                                        style={{ width: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={complaint.proof}
                                                                        alt="Proof"
                                                                        style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                                                        onClick={() => {
                                                                            const byteString = atob(complaint.proof.split(',')[1]);
                                                                            const mimeString = complaint.proof.split(',')[0].split(':')[1].split(';')[0];
                                                                            const ab = new ArrayBuffer(byteString.length);
                                                                            const ia = new Uint8Array(ab);
                                                                            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
                                                                            const blob = new Blob([ab], { type: mimeString });
                                                                            window.open(URL.createObjectURL(blob), '_blank');
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {complaint.id}</span>
                                                            <span style={{
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                color: complaint.status === 'Resolved' ? '#166534' : complaint.status === 'In Progress' ? '#92400e' : '#1e293b'
                                                            }}>
                                                                ● {complaint.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {complaintTab === 'track' && (
                                    <div style={{ maxWidth: '500px', animation: 'fadeIn 0.3s' }}>
                                        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                                            <input
                                                type="text"
                                                placeholder="Enter Complaint ID (e.g. COMP-1234)"
                                                value={trackingId}
                                                onChange={(e) => setTrackingId(e.target.value)}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                required
                                            />
                                            <button className="btn" style={{ backgroundColor: '#1e293b', color: 'white' }}>Track</button>
                                        </form>

                                        {trackedComplaint === 'not_found' && (
                                            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem', textAlign: 'center' }}>
                                                No complaint found with this ID. Please check and try again.
                                            </div>
                                        )}

                                        {trackedComplaint && trackedComplaint !== 'not_found' && (
                                            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status for {trackedComplaint.id}</div>
                                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: trackedComplaint.status === 'Resolved' ? '#166534' : trackedComplaint.status === 'In Progress' ? '#92400e' : '#1e293b' }}>
                                                        {trackedComplaint.status}
                                                    </h3>
                                                </div>

                                                <div style={{ display: 'grid', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Category</label>
                                                        <div style={{ fontWeight: '500' }}>{trackedComplaint.category}</div>
                                                    </div>
                                                    {trackedComplaint.hostel && (
                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Hostel</label>
                                                            <div style={{ fontWeight: '500' }}>🏠 {trackedComplaint.hostel}</div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Description</label>
                                                        <div style={{ fontSize: '0.9rem' }}>{trackedComplaint.description}</div>
                                                    </div>
                                                    {trackedComplaint.proof && (
                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Proof</label>
                                                            {trackedComplaint.proofType === 'video' ? (
                                                                <video
                                                                    src={trackedComplaint.proof}
                                                                    controls
                                                                    style={{ width: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={trackedComplaint.proof}
                                                                    alt="Proof"
                                                                    style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                                                    onClick={() => {
                                                                        const byteString = atob(trackedComplaint.proof.split(',')[1]);
                                                                        const mimeString = trackedComplaint.proof.split(',')[0].split(':')[1].split(';')[0];
                                                                        const ab = new ArrayBuffer(byteString.length);
                                                                        const ia = new Uint8Array(ab);
                                                                        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
                                                                        const blob = new Blob([ab], { type: mimeString });
                                                                        window.open(URL.createObjectURL(blob), '_blank');
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Submitted On</label>
                                                        <div style={{ fontWeight: '500' }}>{trackedComplaint.date}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
