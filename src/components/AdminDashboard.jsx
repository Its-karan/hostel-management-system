import React, { useState, useMemo } from 'react';
import {
    Users,
    Calendar,
    MessageSquare,
    LogOut,
    CheckCircle2,
    XCircle,
    UserCircle,
    Bell,
    Clock,
    AlertCircle,
    Droplets,
    Upload,
    FileText,
    Download,
    Hotel,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('attendance');
    const [dateOffset, setDateOffset] = useState(0); // 0 = today, -1 = yesterday, etc.

    // Mock Students Data
    const students = [
        {
            id: 1,
            name: 'Karan Singh',
            roll: '0201EC251048',
            room: '19',
            photo: localStorage.getItem('studentProfileImage') || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'
        },
        { id: 2, name: 'Rahul Verma', roll: '0201EC251049', room: '20', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
        { id: 3, name: 'Sneha Gupta', roll: '0201EC251050', room: '21', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
        { id: 4, name: 'Amit Kumar', roll: '0201EC251051', room: '22', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
        { id: 5, name: 'Priya Raj', roll: '0201EC251052', room: '23', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop' },
    ];

    // Generate Mock Attendance for a specific date
    const getAttendanceForDate = (offset) => {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        // Get real attendance records from localStorage
        const storedRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');

        // Filter records for the selected date
        const recordsForDate = storedRecords.filter(record => record.date === dateStr);

        // Create a map of student IDs who have real attendance
        const realAttendanceMap = {};
        recordsForDate.forEach(record => {
            realAttendanceMap[record.roll] = record;
        });

        // Deterministic mock data based on offset, but override with real data if available
        return {
            dateStr,
            records: students.map(s => {
                // Check if this student has real attendance for this date
                if (realAttendanceMap[s.roll]) {
                    const realRecord = realAttendanceMap[s.roll];
                    return {
                        ...s,
                        status: 'Present',
                        entryTime: realRecord.entryTime,
                        exitTime: realRecord.exitTime,
                        verificationPic: realRecord.verificationPic
                    };
                }

                // Otherwise use mock data
                const isPresent = (s.id + offset) % 3 !== 0;
                return {
                    ...s,
                    status: isPresent ? 'Present' : 'Absent',
                    entryTime: isPresent ? '08:15 AM' : '-',
                    exitTime: isPresent ? '06:45 PM' : '-',
                    verificationPic: isPresent ? s.photo : null
                };
            })
        };
    };

    const currentReport = useMemo(() => getAttendanceForDate(dateOffset), [dateOffset]);

    const [adminComplaints, setAdminComplaints] = useState(() => {
        try {
            const saved = localStorage.getItem('adminComplaints');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Error parsing adminComplaints:', e);
        }
        return [];
    });

    // Merge student-submitted complaints into admin view on mount
    useMemo(() => {
        try {
            // Use a shared key 'sharedComplaints' that the student writes to on submit
            const shared = JSON.parse(localStorage.getItem('sharedComplaints') || '[]');
            if (Array.isArray(shared) && shared.length > 0) {
                setAdminComplaints(shared);
            }
        } catch (e) {
            console.error('Error merging shared complaints:', e);
        }
    }, []);

    const handleUpdateStatus = (id, newStatus) => {
        const updated = adminComplaints.map(c =>
            c.id === id ? { ...c, status: newStatus } : c
        );
        setAdminComplaints(updated);
        localStorage.setItem('sharedComplaints', JSON.stringify(updated));
    };

    // Water Status
    const [waterStatus, setWaterStatus] = useState(() => {
        try {
            const saved = localStorage.getItem('waterStatus');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch (e) {
            console.error('Error parsing waterStatus:', e);
        }
        return {
            level: 'Good',
            hostel: 'Hostel 8',
            note: '',
            lastUpdated: null,
            report: null,
            reportName: null
        };
    });

    const handleWaterStatusSave = () => {
        const updated = { ...waterStatus, lastUpdated: new Date().toLocaleString('en-IN') };
        setWaterStatus(updated);
        localStorage.setItem('waterStatus', JSON.stringify(updated));
        alert('Water status updated successfully!');
    };

    const handleReportUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const updated = { ...waterStatus, report: reader.result, reportName: file.name, lastUpdated: new Date().toLocaleString('en-IN') };
            setWaterStatus(updated);
            localStorage.setItem('waterStatus', JSON.stringify(updated));
        };
        reader.readAsDataURL(file);
    };

    const menuItems = [
        { id: 'attendance', label: 'Attendance', icon: <Calendar size={20} /> },
        { id: 'water', label: 'Water Status', icon: <Droplets size={20} /> },
        { id: 'complaints', label: 'Complaints', icon: <MessageSquare size={20} /> },
        { id: 'allocation', label: 'Room Allocation', icon: <Hotel size={20} /> },
        { id: 'profile', label: 'Admin Profile', icon: <UserCircle size={20} /> },
    ];

    // Room Allocation Requests
    const [allocationRequests, setAllocationRequests] = useState(() => {
        try {
            const saved = localStorage.getItem('allocationRequests');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Error parsing allocationRequests:', e);
        }
        return [];
    });

    const [approvalModal, setApprovalModal] = useState({ isOpen: false, requestId: null, hostel: '', room: '' });

    const handleUpdateAllocationStatus = (id, newStatus, details = {}) => {
        const updated = allocationRequests.map(req =>
            req.id === id ? { ...req, status: newStatus, ...details } : req
        );
        setAllocationRequests(updated);
        localStorage.setItem('allocationRequests', JSON.stringify(updated));
    };

    const confirmApproval = () => {
        if (!approvalModal.hostel || !approvalModal.room) {
            alert('Please enter both Hostel and Room numbers.');
            return;
        }
        handleUpdateAllocationStatus(approvalModal.requestId, 'Approved', {
            allocatedHostel: approvalModal.hostel,
            allocatedRoom: approvalModal.room
        });
        setApprovalModal({ isOpen: false, requestId: null, hostel: '', room: '' });
    };

    const handleViewDocument = (dataUrl, label) => {
        const win = window.open();
        win.document.write(`
            <html>
                <head><title>${label}</title></head>
                <body style="margin:0; background:#1e293b; display:flex; justify:center; align-items:center;">
                    <img src="${dataUrl}" style="max-width:100%; max-height:100vh; object-fit:contain;"/>
                </body>
            </html>
        `);
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-main)',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                backgroundColor: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh'
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-red)', borderRadius: '8px', color: 'var(--text-white)' }}>
                            <Users size={24} />
                        </div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Admin Portal</h1>
                    </div>
                </div>

                <nav style={{ padding: '1.5rem', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.85rem 1rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: activeTab === item.id ? 'var(--bg-hover)' : 'transparent',
                                    color: activeTab === item.id ? 'var(--primary-red)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === item.id ? '600' : '500',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: '#e11d48',
                            cursor: 'pointer',
                            width: '100%',
                            fontWeight: '600'
                        }}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '280px', flex: 1, padding: '2rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                            {menuItems.find(m => m.id === activeTab)?.label}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Welcome back, Hemant Administrator</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '50%', backgroundColor: 'var(--bg-card)', cursor: 'pointer' }}>
                            <Bell size={20} color="var(--text-muted)" />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 1rem', backgroundColor: 'var(--bg-card)', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
                            <UserCircle size={24} color="var(--primary-red)" />
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>Admin Control</span>
                        </div>
                    </div>
                </header>

                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {activeTab === 'attendance' && (
                        <div>
                            {/* Attendance Controls */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Review Records</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Slide to change viewing date</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-red)' }}>{currentReport.dateStr}</div>
                                        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            {dateOffset === 0 ? 'TODAY' : dateOffset === -1 ? 'YESTERDAY' : `${Math.abs(dateOffset)} DAYS AGO`}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ padding: '0 1rem' }}>
                                    <input
                                        type="range"
                                        min="-30"
                                        max="0"
                                        value={dateOffset}
                                        onChange={(e) => setDateOffset(parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            accentColor: 'var(--primary-red)',
                                            height: '6px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: '600' }}>
                                        <span>30 DAYS AGO</span>
                                        <span>TODAY</span>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>TOTAL STUDENTS</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{students.length}</div>
                                </div>
                                <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                    <div style={{ color: '#166534', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>PRESENT</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>{currentReport.records.filter(r => r.status === 'Present').length}</div>
                                </div>
                                <div style={{ padding: '1.5rem', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                    <div style={{ color: '#991b1b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>ABSENT</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b' }}>{currentReport.records.filter(r => r.status === 'Absent').length}</div>
                                </div>
                            </div>

                            {/* Student List */}
                            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Student</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Room/Roll</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Verification Pic</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Entry Time</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Exit Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentReport.records.map((record) => (
                                            <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <img src={record.photo} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{record.name}</div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Room {record.room}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{record.roll}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {record.verificationPic ? (
                                                        <div style={{ position: 'relative', width: '60px', height: '45px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #22c55e' }}>
                                                            <img src={record.verificationPic} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <div style={{ position: 'absolute', bottom: 0, right: 0, padding: '2px' }}>
                                                                <CheckCircle2 size={12} color="#22c55e" fill="white" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ width: '60px', height: '45px', borderRadius: '6px', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)' }}>
                                                            <XCircle size={16} color="var(--text-muted)" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{record.entryTime}</td>
                                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{record.exitTime}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'complaints' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Student Complaints</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review and update complaint statuses</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <span style={{ padding: '0.4rem 0.85rem', borderRadius: '999px', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.8rem', fontWeight: '600' }}>
                                        {adminComplaints.filter(c => c.status === 'Pending').length} Pending
                                    </span>
                                    <span style={{ padding: '0.4rem 0.85rem', borderRadius: '999px', backgroundColor: '#fffbeb', color: '#92400e', fontSize: '0.8rem', fontWeight: '600' }}>
                                        {adminComplaints.filter(c => c.status === 'In Progress').length} In Progress
                                    </span>
                                    <span style={{ padding: '0.4rem 0.85rem', borderRadius: '999px', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '0.8rem', fontWeight: '600' }}>
                                        {adminComplaints.filter(c => c.status === 'Resolved').length} Resolved
                                    </span>
                                </div>
                            </div>

                            {adminComplaints.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                                    <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                                    <p style={{ fontWeight: '500' }}>No complaints submitted yet.</p>
                                    <p style={{ fontSize: '0.85rem' }}>Student complaints will appear here once submitted.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {adminComplaints.map(complaint => (
                                        <div key={complaint.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary-red)', backgroundColor: 'var(--bg-hover)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                                            {complaint.category}
                                                        </span>
                                                        {complaint.hostel && (
                                                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                                                🏠 {complaint.hostel}
                                                            </span>
                                                        )}
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{complaint.date}</span>
                                                    </div>
                                                    <p style={{ margin: '0.5rem 0', fontWeight: '500', color: 'var(--text-main)' }}>{complaint.description}</p>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {complaint.id}</span>

                                                    {complaint.proof && (
                                                        <div style={{ marginTop: '0.75rem', maxWidth: '300px' }}>
                                                            {complaint.proofType === 'video' ? (
                                                                <video src={complaint.proof} controls style={{ width: '100%', maxHeight: '180px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                                            ) : (
                                                                <img src={complaint.proof} alt="Proof" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status Update */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Update Status</div>
                                                    {['Pending', 'In Progress', 'Resolved'].map(status => {
                                                        const isActive = complaint.status === status;
                                                        const colors = {
                                                            'Pending': { bg: isActive ? '#fef2f2' : 'var(--bg-main)', color: isActive ? '#991b1b' : 'var(--text-muted)', border: isActive ? '#fecaca' : 'var(--border-color)' },
                                                            'In Progress': { bg: isActive ? '#fffbeb' : 'var(--bg-main)', color: isActive ? '#92400e' : 'var(--text-muted)', border: isActive ? '#fde68a' : 'var(--border-color)' },
                                                            'Resolved': { bg: isActive ? '#f0fdf4' : 'var(--bg-main)', color: isActive ? '#166534' : 'var(--text-muted)', border: isActive ? '#bbf7d0' : 'var(--border-color)' },
                                                        };
                                                        const c = colors[status];
                                                        return (
                                                            <button
                                                                key={status}
                                                                onClick={() => handleUpdateStatus(complaint.id, status)}
                                                                style={{
                                                                    padding: '0.5rem 0.75rem',
                                                                    borderRadius: '8px',
                                                                    border: `1px solid ${c.border}`,
                                                                    backgroundColor: c.bg,
                                                                    color: c.color,
                                                                    fontWeight: isActive ? '700' : '500',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.85rem',
                                                                    textAlign: 'left',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    transition: 'all 0.15s'
                                                                }}
                                                            >
                                                                {status === 'Pending' && <AlertCircle size={14} />}
                                                                {status === 'In Progress' && <Clock size={14} />}
                                                                {status === 'Resolved' && <CheckCircle2 size={14} />}
                                                                {status}
                                                                {isActive && ' ✓'}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'water' && (
                        <div style={{ maxWidth: '680px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>Water Status Management</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Update the hostel water quality status and upload purification test reports.</p>

                            {/* Current Status Badge */}
                            <div style={{
                                padding: '1.5rem',
                                borderRadius: '16px',
                                marginBottom: '2rem',
                                backgroundColor: waterStatus.level === 'Good' ? '#f0fdf4' : waterStatus.level === 'Caution' ? '#fffbeb' : '#fef2f2',
                                border: `1px solid ${waterStatus.level === 'Good' ? '#bbf7d0' : waterStatus.level === 'Caution' ? '#fde68a' : '#fecaca'}`,
                                display: 'flex', alignItems: 'center', gap: '1rem'
                            }}>
                                <Droplets size={36} color={waterStatus.level === 'Good' ? '#16a34a' : waterStatus.level === 'Caution' ? '#d97706' : '#dc2626'} />
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: '#64748b' }}>Current Status {waterStatus.hostel ? `— ${waterStatus.hostel}` : ''}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: waterStatus.level === 'Good' ? '#166534' : waterStatus.level === 'Caution' ? '#92400e' : '#991b1b' }}>
                                        {waterStatus.level}
                                    </div>
                                    {waterStatus.lastUpdated && (
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>Last updated: {waterStatus.lastUpdated}</div>
                                    )}
                                </div>
                            </div>

                            {/* Hostel Selector */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Hostel</label>
                                <select
                                    value={waterStatus.hostel || ''}
                                    onChange={e => setWaterStatus(prev => ({ ...prev, hostel: e.target.value }))}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                >
                                    <option value="">-- Select Hostel --</option>
                                    {Array.from({ length: 10 }, (_, i) => `Hostel ${i + 1}`).map(h => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                    <option value="All Hostels">All Hostels</option>
                                </select>
                            </div>

                            {/* Status Selector */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Update Water Quality Status</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {['Good', 'Caution', 'Critical'].map(level => {
                                        const isActive = waterStatus.level === level;
                                        const cfg = {
                                            Good: { bg: isActive ? '#16a34a' : '#f0fdf4', color: isActive ? 'white' : '#166534', border: '#bbf7d0' },
                                            Caution: { bg: isActive ? '#d97706' : '#fffbeb', color: isActive ? 'white' : '#92400e', border: '#fde68a' },
                                            Critical: { bg: isActive ? '#dc2626' : '#fef2f2', color: isActive ? 'white' : '#991b1b', border: '#fecaca' },
                                        }[level];
                                        return (
                                            <button key={level} onClick={() => setWaterStatus(prev => ({ ...prev, level }))}
                                                style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: `1px solid ${cfg.border}`, backgroundColor: cfg.bg, color: cfg.color, fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.15s' }}>
                                                {level === 'Good' ? '✅' : level === 'Caution' ? '⚠️' : '🚫'} {level}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Note */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Admin Note (optional)</label>
                                <textarea
                                    rows={3}
                                    value={waterStatus.note}
                                    onChange={e => setWaterStatus(prev => ({ ...prev, note: e.target.value }))}
                                    placeholder="e.g. Water supply disrupted in Hostel 3 due to maintenance..."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Report Upload */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Upload Purification Test Report</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '10px', border: '2px dashed #cbd5e1', cursor: 'pointer', backgroundColor: '#f8fafc', transition: 'border-color 0.2s' }}>
                                    <Upload size={20} color="#64748b" />
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                        {waterStatus.reportName ? waterStatus.reportName : 'Click to upload PDF or image report'}
                                    </span>
                                    <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleReportUpload} />
                                </label>

                                {waterStatus.report && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <FileText size={20} color="#16a34a" />
                                            <span style={{ fontWeight: '500', color: '#166534', fontSize: '0.9rem' }}>{waterStatus.reportName}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const a = document.createElement('a');
                                                a.href = waterStatus.report;
                                                a.download = waterStatus.reportName;
                                                a.click();
                                            }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid #bbf7d0', backgroundColor: 'white', color: '#166534', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                        >
                                            <Download size={14} /> Download
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleWaterStatusSave}
                                style={{ padding: '0.85rem 2rem', backgroundColor: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}
                            >
                                Save Water Status
                            </button>
                        </div>
                    )}

                    {activeTab === 'allocation' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Room Allocation Requests</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review student documents and manage room assignments</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <span style={{ padding: '0.4rem 0.85rem', borderRadius: '999px', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.8rem', fontWeight: '600' }}>
                                        {allocationRequests.filter(r => r.status === 'Pending').length} Pending
                                    </span>
                                    <span style={{ padding: '0.4rem 0.85rem', borderRadius: '999px', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '0.8rem', fontWeight: '600' }}>
                                        {allocationRequests.filter(r => r.status === 'Approved').length} Approved
                                    </span>
                                </div>
                            </div>

                            {allocationRequests.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                                    <Hotel size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                                    <p style={{ fontWeight: '500' }}>No applications received yet.</p>
                                    <p style={{ fontSize: '0.85rem' }}>Room allocation requests will appear here once students apply.</p>
                                </div>
                            ) : (
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                                            <tr>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID & Student</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Documents</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allocationRequests.map((req) => (
                                                <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 'bold', color: 'var(--primary-red)', fontSize: '0.9rem' }}>{req.id}</div>
                                                        <div style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.2rem' }}>{req.name}</div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginTop: '0.2rem' }}>
                                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>E: {req.enrollment}</div>
                                                            {req.academicYear && (
                                                                <div style={{ padding: '0.15rem 0.4rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                                                                    {req.academicYear}
                                                                </div>
                                                            )}
                                                            {req.branch && (
                                                                <div style={{ padding: '0.15rem 0.4rem', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #dbeafe', fontSize: '0.65rem', fontWeight: '700', color: '#1e40af' }}>
                                                                    {req.branch}
                                                                </div>
                                                            )}
                                                            {req.phone && (
                                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                                    📞 {req.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                                                            {[
                                                                { key: 'profilePhoto', label: 'Photo' },
                                                                { key: 'jeeMains', label: 'JEE' },
                                                                { key: 'castCertificate', label: 'Cast' },
                                                                { key: 'incomeCertificate', label: 'Income' },
                                                                { key: 'admissionSlip', label: 'Adm' }
                                                            ].map(doc => (
                                                                <button
                                                                    key={doc.key}
                                                                    disabled={!req[doc.key]}
                                                                    onClick={() => handleViewDocument(req[doc.key], doc.label)}
                                                                    style={{
                                                                        padding: '0.3rem 0.4rem',
                                                                        fontSize: '0.65rem',
                                                                        borderRadius: '4px',
                                                                        border: '1px solid var(--border-color)',
                                                                        backgroundColor: req[doc.key] ? (doc.key === 'profilePhoto' ? 'var(--bg-hover)' : 'var(--bg-card)') : 'var(--bg-main)',
                                                                        color: req[doc.key] ? (doc.key === 'profilePhoto' ? 'var(--primary-red)' : 'var(--text-main)') : 'var(--text-muted)',
                                                                        fontWeight: doc.key === 'profilePhoto' ? '700' : '500',
                                                                        cursor: req[doc.key] ? 'pointer' : 'not-allowed',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    {doc.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            padding: '0.3rem 0.75rem',
                                                            borderRadius: '999px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            backgroundColor: req.status === 'Approved' ? '#f0fdf4' : req.status === 'Rejected' ? '#fef2f2' : '#fffbeb',
                                                            color: req.status === 'Approved' ? '#166534' : req.status === 'Rejected' ? '#991b1b' : '#92400e'
                                                        }}>
                                                            {req.status}
                                                        </span>
                                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>{req.submittedAt}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => setApprovalModal({ ...approvalModal, isOpen: true, requestId: req.id })}
                                                                style={{ padding: '0.4rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', cursor: 'pointer' }}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateAllocationStatus(req.id, 'Rejected')}
                                                                style={{ padding: '0.4rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', cursor: 'pointer' }}
                                                                title="Reject"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div style={{ maxWidth: '600px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.4rem', color: 'var(--text-main)' }}>Admin Profile</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Administrator account details.</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem', backgroundColor: 'var(--bg-hover)', borderRadius: '16px', border: '1px solid #fecaca', marginBottom: '2rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <UserCircle size={48} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Hemant</div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Hostel Administrator</div>
                                    <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '999px', border: '1px solid #fecaca', fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-red)' }}>
                                        🏠 Hostel 8
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {[
                                    { label: 'Full Name', value: 'Hemant Kumar' },
                                    { label: 'Role', value: 'Hostel Administrator' },
                                    { label: 'Assigned Hostel', value: 'Hostel 8' },
                                    { label: 'Employee ID', value: 'JEC-ADMIN-008' },
                                    { label: 'Contact', value: '+91 98765 43210' },
                                    { label: 'Email', value: 'hemant@jec.ac.in' },
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{item.label}</span>
                                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Approval Modal */}
            {approvalModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2.5rem',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '450px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Finalize Allocation</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>Assign a room to applicant <span style={{ fontWeight: '700', color: 'var(--primary-red)' }}>{approvalModal.requestId}</span></p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Hostel Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Hostel 8"
                                    value={approvalModal.hostel}
                                    onChange={(e) => setApprovalModal({ ...approvalModal, hostel: e.target.value })}
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Room Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Room 101"
                                    value={approvalModal.room}
                                    onChange={(e) => setApprovalModal({ ...approvalModal, room: e.target.value })}
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button
                                onClick={() => setApprovalModal({ isOpen: false, requestId: null, hostel: '', room: '' })}
                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApproval}
                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--primary-red)', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(192, 57, 43, 0.2)' }}
                            >
                                Confirm & Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
