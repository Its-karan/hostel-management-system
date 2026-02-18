import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Star, LogOut, ChefHat, ThumbsUp, ThumbsDown, Save, Edit2, Check, X } from 'lucide-react';

const DEFAULT_MENU = {
    Monday: { break: 'Poha/Jalebi', lunch: 'Rajma Chawal', dinner: 'Roti, Sabzi, Dal' },
    Tuesday: { break: 'Aloo Paratha', lunch: 'Kadi Chawal', dinner: 'Egg Curry / Paneer' },
    Wednesday: { break: 'Idli Sambar', lunch: 'Dal Makhani', dinner: 'Mix Veg' },
    Thursday: { break: 'Sandwich', lunch: 'Chole Bhature', dinner: 'Soyabean Curry' },
    Friday: { break: 'Upma', lunch: 'Fried Rice', dinner: 'Kofta Curry' },
    Saturday: { break: 'Pav Bhaji', lunch: 'Khichdi', dinner: 'Special Thali' },
    Sunday: { break: 'Maggi/Pasta', lunch: 'Biryani', dinner: 'Light Khichdi' },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = [
    { key: 'break', label: 'Breakfast', icon: '🥐' },
    { key: 'lunch', label: 'Lunch', icon: '🍛' },
    { key: 'dinner', label: 'Dinner', icon: '🥗' },
];

const MessDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('menu');

    // Load menu from localStorage (student dashboard writes to 'messMenu', fallback to default)
    const [menu, setMenu] = useState(() => {
        return JSON.parse(localStorage.getItem('messMenu') || JSON.stringify(DEFAULT_MENU));
    });

    // Editing state: { day, meal } or null
    const [editing, setEditing] = useState(null);
    const [editValue, setEditValue] = useState('');

    // Special dish requests — read from localStorage (written by students)
    const [specialRequests, setSpecialRequests] = useState(() => {
        return JSON.parse(localStorage.getItem('specialRequests') || JSON.stringify([
            { id: 1, dish: 'Paneer Butter Masala', requestedBy: 'Rahul', up: 15, down: 2, status: 'pending' },
            { id: 2, dish: 'Masala Dosa', requestedBy: 'Sneha', up: 28, down: 4, status: 'pending' },
            { id: 3, dish: 'Chicken Biryani', requestedBy: 'Amit', up: 42, down: 6, status: 'pending' },
        ]));
    });

    const handleAcceptRequest = (id) => {
        const updated = specialRequests.map(req =>
            req.id === id ? { ...req, status: 'accepted' } : req
        );
        setSpecialRequests(updated);
        localStorage.setItem('specialRequests', JSON.stringify(updated));
        alert('Request accepted! The student will see the updated status.');
    };

    const startEdit = (day, meal, currentValue) => {
        setEditing({ day, meal });
        setEditValue(currentValue);
    };

    const saveEdit = () => {
        if (!editing) return;
        const updated = {
            ...menu,
            [editing.day]: { ...menu[editing.day], [editing.meal]: editValue }
        };
        setMenu(updated);
        localStorage.setItem('messMenu', JSON.stringify(updated));
        setEditing(null);
    };

    const cancelEdit = () => setEditing(null);

    const saveFullMenu = () => {
        localStorage.setItem('messMenu', JSON.stringify(menu));
        alert('Mess menu saved successfully! Students will see the updated menu.');
    };

    const todayIndex = new Date().getDay();
    const todayName = DAYS[todayIndex === 0 ? 6 : todayIndex - 1]; // Convert JS Sunday=0 to our array

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0 }}>
                {/* Logo */}
                <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fff1f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChefHat size={22} color="var(--primary-red, #c0392b)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b' }}>Mess Manager</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>JEC Hostel</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {[
                        { id: 'menu', label: 'Edit Mess Menu', icon: <Utensils size={18} /> },
                        { id: 'requests', label: 'Special Dish Requests', icon: <Star size={18} /> },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                            backgroundColor: activeTab === item.id ? '#fff1f1' : 'transparent',
                            color: activeTab === item.id ? 'var(--primary-red, #c0392b)' : '#64748b',
                            fontWeight: activeTab === item.id ? '700' : '500',
                            cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left', width: '100%',
                            transition: 'all 0.15s'
                        }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '0 0.75rem' }}>
                    <button onClick={() => navigate('/')} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                        backgroundColor: 'transparent', color: '#ef4444',
                        fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', width: '100%'
                    }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        {activeTab === 'menu' ? '📋 Weekly Mess Menu' : '⭐ Special Dish Requests'}
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.3rem', fontSize: '0.95rem' }}>
                        {activeTab === 'menu'
                            ? 'Click the edit icon on any meal to update it. Changes are saved to localStorage instantly.'
                            : 'View and track special dish requests submitted by students.'}
                    </p>
                </div>

                {/* MESS MENU EDITOR */}
                {activeTab === 'menu' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                            <button onClick={saveFullMenu} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary-red, #c0392b)',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem'
                            }}>
                                <Save size={16} /> Save All Changes
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {DAYS.map(day => (
                                <div key={day} style={{
                                    backgroundColor: 'white', borderRadius: '16px',
                                    border: day === todayName ? '2px solid var(--primary-red, #c0392b)' : '1px solid #e2e8f0',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        padding: '0.85rem 1.5rem',
                                        backgroundColor: day === todayName ? '#fff1f1' : '#f8fafc',
                                        borderBottom: '1px solid #e2e8f0',
                                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                                    }}>
                                        <span style={{ fontWeight: '800', fontSize: '1rem', color: day === todayName ? 'var(--primary-red, #c0392b)' : '#1e293b' }}>{day}</span>
                                        {day === todayName && <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'var(--primary-red, #c0392b)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>TODAY</span>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                                        {MEALS.map((meal, idx) => {
                                            const isEditing = editing?.day === day && editing?.meal === meal.key;
                                            return (
                                                <div key={meal.key} style={{
                                                    padding: '1.25rem',
                                                    borderRight: idx < 2 ? '1px solid #f1f5f9' : 'none'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                                        {meal.icon} {meal.label}
                                                    </div>
                                                    {isEditing ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            <input
                                                                autoFocus
                                                                value={editValue}
                                                                onChange={e => setEditValue(e.target.value)}
                                                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
                                                            />
                                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                                <button onClick={saveEdit} style={{ flex: 1, padding: '0.35rem', backgroundColor: '#dcfce7', color: '#166534', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} /></button>
                                                                <button onClick={cancelEdit} style={{ flex: 1, padding: '0.35rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                            <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{menu[day][meal.key]}</span>
                                                            <button onClick={() => startEdit(day, meal.key, menu[day][meal.key])} style={{ padding: '0.3rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', flexShrink: 0 }}>
                                                                <Edit2 size={13} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SPECIAL DISH REQUESTS */}
                {activeTab === 'requests' && (
                    <div>
                        {specialRequests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                                <p>No special dish requests yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[...specialRequests].sort((a, b) => b.up - a.up).map((req, idx) => (
                                    <div key={req.id} style={{
                                        backgroundColor: 'white', borderRadius: '14px',
                                        padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                backgroundColor: idx === 0 ? '#fef3c7' : '#f1f5f9',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '800', fontSize: '0.9rem',
                                                color: idx === 0 ? '#92400e' : '#64748b', flexShrink: 0
                                            }}>
                                                {idx === 0 ? '🏆' : `#${idx + 1}`}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b' }}>{req.dish}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>Requested by {req.requestedBy}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', backgroundColor: '#dcfce7', borderRadius: '8px', color: '#166534', fontWeight: '700', fontSize: '0.9rem' }}>
                                                <ThumbsUp size={14} /> {req.up}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#991b1b', fontWeight: '700', fontSize: '0.9rem' }}>
                                                <ThumbsDown size={14} /> {req.down}
                                            </div>
                                            {req.status === 'accepted' ? (
                                                <div style={{ padding: '0.4rem 0.85rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Check size={14} /> Accepted
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAcceptRequest(req.id)}
                                                    style={{ padding: '0.4rem 1rem', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#334155'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                                                >
                                                    Accept Request
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessDashboard;
