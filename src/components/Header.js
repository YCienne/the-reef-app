import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, LogIn, ChevronLeft } from 'lucide-react';
import logo from '../crialogo.png';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  const isLearningMode = location.pathname.startsWith('/learn/') || location.pathname.startsWith('/quiz/');

  if (isLearningMode) {
    return (
      <header className="learning-header">
        <div className="container">
          <div className="header-content" style={{ justifyContent: 'space-between' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-back"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }}
            >
              <ChevronLeft size={20} />
              Back to Dashboard
            </button>

            <Link to="/" className="logo">
              <img src={logo} alt="Logo" style={{ width: '35px', height: 'auto' }} />
              <span className="logo-main" style={{ fontSize: '16px' }}>The Reef</span>
            </Link>

            <div className="user-actions">
              <span style={{ fontSize: '14px', fontWeight: '500', marginRight: '10px' }}>{currentUser?.displayName || 'User'}</span>
              <button className="icon-btn" onClick={() => logout()} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header>
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div style={{ color: 'var(--coral)' }}>
              <img
                src={logo}
                alt="Coral Reef Innovation"
                style={{
                  width: '50px',
                  height: 'auto',
                  marginRight: '0px'
                }}
              />
            </div>
            <div className="logo-text">
              <span className="logo-main">The Reef</span>
              <span className="logo-sub">Empowering tomorrow today</span>
            </div>
          </Link>

          <nav>
            <ul>
              <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
              <li><Link to="/courses" className={isActive('/courses') ? 'active' : ''}>Courses</Link></li>
              {currentUser && (
                <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link></li>
              )}
              {isAdmin && (
                <li><Link to="/admin/upload" className={isActive('/admin/upload') ? 'active' : ''}>Create Course</Link></li>
              )}
            </ul>
          </nav>

          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} className="icon" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="user-actions">
              {currentUser ? (
                <>
                  <button className="icon-btn">
                    <Bell size={18} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{currentUser.displayName || 'User'}</span>
                    <button className="icon-btn" onClick={() => logout()} title="Logout">
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px' }}>
                  <LogIn size={16} />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
