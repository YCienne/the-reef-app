import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, LogIn, ChevronLeft, Menu, X, Home, BookOpen, LayoutDashboard, PlusSquare } from 'lucide-react';
import logo from '../crialogo.png';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  const isLearningMode =
    location.pathname.startsWith('/learn/') ||
    location.pathname.startsWith('/quiz/');

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const handleNavClick = () => setMenuOpen(false);

  if (isLearningMode) {
    return (
      <header className="learning-header mobile-header">
        <div className="header-container">
          <div className="header-section left">
            <button
              className="icon-btn"
              onClick={() => navigate(-1)}
              aria-label="Back"
            >
              <ChevronLeft size={22} />
            </button>
          </div>
          <div className="header-section center">
            <img src={logo} alt="Logo" className="logo" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <span className="title">The Reef</span>
          </div>
          <div className="header-section right">
            <div className="mobile-avatar" title={currentUser?.displayName || 'User'}>
              {getInitials(currentUser?.displayName)}
            </div>
            <button
              className="icon-btn"
              onClick={() => logout()}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="desktop-header">
        <div className="container">
          <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', width: '100%' }}>
            {/* Logo */}
            <Link to="/" className="logo" style={{ flexShrink: 0 }}>
              <img
                src={logo}
                alt="Coral Reef Innovation"
                style={{ width: '38px', height: 'auto' }}
              />
              <span className="logo-main">The Reef</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="desktop-nav">
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

            {/* Desktop Actions */}
            <div className="header-actions desktop-actions">
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
                      <button className="icon-btn" onClick={logout} title="Logout">
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

      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="header-container">
          <div className="header-section left">
            {currentUser ? (
              <button className="icon-btn" aria-label="Notifications">
                <Bell size={20} />
              </button>
            ) : (
              <div style={{ minWidth: '48px' }} />
            )}
          </div>
          <div className="header-section center">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <span className="title">The Reef</span>
            </Link>
          </div>
          <div className="header-section right">
            <button
              className="icon-btn hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div className={`mobile-nav-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-inner">
          {/* User Info */}
          {currentUser && (
            <div className="mobile-user-info">
              <div className="mobile-avatar-lg">
                {getInitials(currentUser.displayName)}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)' }}>
                  {currentUser.displayName || 'User'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                  {currentUser.email}
                </div>
              </div>
            </div>
          )}

          {/* Search bar in mobile nav */}
          <div className="mobile-search-bar">
            <Search size={16} className="icon" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Nav Links */}
          <nav className="mobile-nav-links">
            <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`} onClick={handleNavClick}>
              <Home size={18} /> Home
            </Link>
            <Link to="/courses" className={`mobile-nav-item ${isActive('/courses') ? 'active' : ''}`} onClick={handleNavClick}>
              <BookOpen size={18} /> Courses
            </Link>
            {currentUser && (
              <Link to="/dashboard" className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={handleNavClick}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/upload" className={`mobile-nav-item ${isActive('/admin/upload') ? 'active' : ''}`} onClick={handleNavClick}>
                <PlusSquare size={18} /> Create Course
              </Link>
            )}
          </nav>

          {/* Login / Logout */}
          <div className="mobile-nav-footer">
            {currentUser ? (
              <button className="btn btn-secondary mobile-logout-btn" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary" onClick={handleNavClick} style={{ width: '100%', justifyContent: 'center' }}>
                <LogIn size={16} /> Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && <div className="mobile-nav-backdrop" onClick={() => setMenuOpen(false)} />}
    </>
  );
};

export default Header;
