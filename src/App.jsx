import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import MessDashboard from './components/MessDashboard';
import RoomAllocation from './components/RoomAllocation';

import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <Features />
              </>
            } />
            <Route path="/student-login" element={<Login role="student" />} />
            <Route path="/admin-login" element={<Login role="admin" />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/mess-dashboard" element={<MessDashboard />} />
            <Route path="/room-allocation" element={<RoomAllocation />} />
            <Route path="/signup" element={<Signup />} />
            {/* Add more routes here as needed, e.g., /dashboard */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App;
