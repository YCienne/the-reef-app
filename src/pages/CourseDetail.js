// src/pages/CourseDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, User, Star, Play, ShoppingCart, Heart, Check, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/courses/${id}`);
        if (!response.ok) throw new Error('Course not found');
        const data = await response.json();
        setCourse(data);
        // Expand first module by default
        if (data.modules && data.modules.length > 0) {
          setExpandedModules({ 0: true });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const toggleModule = (index) => {
    setExpandedModules(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEnroll = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/course/${id}` } });
      return;
    }

    try {
      setEnrollLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.post(`${apiUrl}/api/users/enroll`, {
        userId: currentUser.uid,
        courseId: id
      });
      // Redirect to dashboard after successful enrollment
      navigate('/dashboard');
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert("Failed to enroll. Please try again.");
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 0' }}>
        <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner"></div>
          <div style={{ fontSize: '18px', color: 'var(--text-light)', marginTop: '20px' }}>Loading course...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ padding: '40px 0' }}>
        <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '18px', color: 'var(--text-light)', marginBottom: '20px' }}>
            {error || 'Course not found'}
          </div>
          <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-light)', fontSize: '14px', marginBottom: '20px' }}>
          <Link to="/courses" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Courses</Link>
          <span>›</span>
          <span>{course.title}</span>
        </div>

        <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Main Content */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            {/* Course Header */}
            <div style={{ marginBottom: '30px' }}>
              <span style={{ display: 'inline-block', padding: '6px 15px', background: 'rgba(26, 82, 118, 0.1)', color: 'var(--primary)', borderRadius: '50px', fontSize: '14px', fontWeight: '600', marginBottom: '15px' }}>
                {course.category}
              </span>
              <h1 style={{ fontSize: '36px', lineHeight: '1.2', marginBottom: '15px', color: 'var(--primary)' }}>{course.title}</h1>
              <p style={{ fontSize: '18px', color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '20px' }}>{course.description}</p>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '14px' }}>
                  <Clock size={16} />
                  <span>{totalLessons} Lessons</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '14px' }}>
                  <User size={16} />
                  <span>{course.level}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '14px' }}>
                  <BookOpen size={16} />
                  <span>{course.modules?.length || 0} Modules</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', color: '#f1c40f' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.floor(course.rating || 0) ? '#f1c40f' : 'none'} />
                  ))}
                </div>
                <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                  {course.rating || 0} ({course.numStudents || 0} students)
                </span>
              </div>

              {/* Instructor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                  {course.instructor?.charAt(0) || 'I'}
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', marginBottom: '5px' }}>{course.instructor}</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Course Instructor</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="glass-card">
              <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
                {['overview', 'curriculum'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '20px 30px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      fontWeight: '600',
                      borderBottom: `3px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                      background: 'none',
                      border: 'none',
                      color: activeTab === tab ? 'var(--primary)' : 'var(--text)'
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{ padding: '30px' }}>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Course Description</h3>
                    <p style={{ marginBottom: '25px', lineHeight: '1.7', color: 'var(--text)' }}>
                      {course.description}
                    </p>

                    <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>What You'll Learn</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '30px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <Check size={16} style={{ color: 'var(--accent)', marginTop: '3px', flexShrink: 0 }} />
                        <span>{totalLessons} comprehensive lessons across {course.modules?.length || 0} modules</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <Check size={16} style={{ color: 'var(--accent)', marginTop: '3px', flexShrink: 0 }} />
                        <span>Practical, hands-on learning experience</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <Check size={16} style={{ color: 'var(--accent)', marginTop: '3px', flexShrink: 0 }} />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div>
                    <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Course Curriculum</h3>
                    <p style={{ marginBottom: '25px', color: 'var(--text-light)' }}>
                      {course.modules?.length || 0} modules • {totalLessons} lessons
                    </p>

                    {course.modules?.map((module, idx) => (
                      <div key={idx} className="glass-card" style={{ marginBottom: '15px', border: '1px solid var(--glass-border)', borderRadius: '15px', overflow: 'hidden' }}>
                        <div
                          style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.5)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => toggleModule(idx)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(26, 82, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '14px' }}>
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>{module.title}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                {module.lessons?.length || 0} lesson{module.lessons?.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                            {expandedModules[idx] ? '▼' : '▶'}
                          </div>
                        </div>

                        {expandedModules[idx] && module.lessons && module.lessons.length > 0 && (
                          <div>
                            {module.lessons.map((lesson, lessonIdx) => (
                              <div key={lessonIdx} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', borderTop: '1px solid var(--glass-border)' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(26, 82, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '12px', flexShrink: 0 }}>
                                  <Play size={12} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '500', marginBottom: '3px' }}>{lesson.title}</div>
                                  <div style={{ display: 'flex', gap: '15px', color: 'var(--text-light)', fontSize: '12px' }}>
                                    <span>video</span>
                                    <span>{lesson.duration || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: '400px', minWidth: '300px' }}>
            <div className="glass-card" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
              {/* Course Image */}
              {course.image && (
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundImage: `url(${course.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '15px',
                  marginBottom: '20px'
                }} />
              )}
              {!course.image && (
                <div style={{ width: '100%', height: '200px', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--accent) 100%)', borderRadius: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '48px' }}>
                  📚
                </div>
              )}

              <div style={{ marginBottom: '25px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', marginBottom: '5px' }}>
                  ${course.price}
                  {course.originalPrice && (
                    <>
                      <span style={{ fontSize: '18px', color: 'var(--text-light)', textDecoration: 'line-through', marginLeft: '10px' }}>
                        ${course.originalPrice}
                      </span>
                      <span style={{ background: 'var(--accent)', color: 'white', padding: '3px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', marginLeft: '10px' }}>
                        {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div style={{ color: 'var(--text-light)', fontSize: '14px' }}>One-time payment • Lifetime access</div>
              </div>

              <ul style={{ listStyle: 'none', marginBottom: '25px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', color: 'var(--text-light)' }}>
                  <Check size={16} style={{ color: 'var(--accent)' }} />
                  <span>{totalLessons} video lessons</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', color: 'var(--text-light)' }}>
                  <Check size={16} style={{ color: 'var(--accent)' }} />
                  <span>Lifetime access</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', color: 'var(--text-light)' }}>
                  <Check size={16} style={{ color: 'var(--accent)' }} />
                  <span>Certificate of completion</span>
                </li>
              </ul>

              <button
                onClick={handleEnroll}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '15px', justifyContent: 'center' }}
                disabled={enrollLoading}
              >
                <ShoppingCart size={18} />
                {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <Heart size={18} />
                Add to Wishlist
              </button>

              <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '14px', marginTop: '15px' }}>
                Certificate included
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;