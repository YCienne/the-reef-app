// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Youtube, Facebook } from 'lucide-react';
import logo from '../crialogo.png';


const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
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
                <span className="logo-main">Coral Reef Innovation</span>
                <span className="logo-sub">Empowering tomorrow today</span>
              </div>
            </Link>
            <p style={{ marginTop: '20px', color: 'var(--text-light)', lineHeight: '1.6' }}>
              Empowering Africa's technological future through AI and robotics education.
            </p>
            <div className="social-links">
              <button type="button" className="social-link">
                <Twitter size={18} />
              </button>
              <button type="button" className="social-link">
                <Linkedin size={18} />
              </button>
              <button type="button" className="social-link">
                <Youtube size={18} />
              </button>
              <button type="button" className="social-link">
                <Facebook size={18} />
              </button>
            </div>
          </div>
          
          <div className="footer-column">
            <h3>Programs</h3>
            <ul className="footer-links">
              <li><Link to="/courses">AI Foundations</Link></li>
              <li><button type="button" className="footer-link-btn">Robotics Engineering</button></li>
              <li><button type="button" className="footer-link-btn">Machine Learning</button></li>
              <li><button type="button" className="footer-link-btn">Computer Vision</button></li>
              <li><button type="button" className="footer-link-btn">Industrial Automation</button></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Resources</h3>
            <ul className="footer-links">
              <li><button type="button" className="footer-link-btn">Case Studies</button></li>
              <li><button type="button" className="footer-link-btn">Learning Paths</button></li>
              <li><button type="button" className="footer-link-btn">Community Forum</button></li>
              <li><button type="button" className="footer-link-btn">Career Center</button></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Company</h3>
            <ul className="footer-links">
              <li><button type="button" className="footer-link-btn">About Us</button></li>
              <li><button type="button" className="footer-link-btn">Our Mission</button></li>
              <li><button type="button" className="footer-link-btn">African Impact</button></li>
              <li><button type="button" className="footer-link-btn">Partners</button></li>
              <li><button type="button" className="footer-link-btn">Contact</button></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Coral Reef Innovation Africa. Empowering tomorrow, today!.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;