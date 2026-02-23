import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, BookOpen, Clock, Award, ChevronRight } from 'lucide-react';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                if (!currentUser) return;

                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                console.log("Fetching dashboard for:", currentUser.uid);

                const response = await axios.get(`${apiUrl}/api/users/dashboard/${currentUser.uid}`);
                setCourses(response.data);
            } catch (err) {
                console.error("Dashboard error:", err);
                setError("Failed to load your progress.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [currentUser]);

    const getNextLesson = (course) => {
        let globalIndex = 0;
        let firstUncompleted = null;

        const completedIds = course.enrollment?.completedLessons || [];

        if (course.modules) {
            for (const module of course.modules) {
                if (module.lessons) {
                    for (const lesson of module.lessons) {
                        globalIndex++;
                        // If we haven't found a next lesson yet, and this one isn't complete
                        if (!firstUncompleted && !completedIds.includes(lesson.id)) {
                            firstUncompleted = {
                                ...lesson,
                                globalIndex: globalIndex,
                                moduleTitle: module.title
                            };
                        }
                    }
                }
            }
        }

        return firstUncompleted;
    };

    if (loading) return (
        <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '20px', color: 'var(--text-light)' }}>Loading your learning journey...</p>
        </div>
    );

    return (
        <div style={{ padding: '40px 0' }}>
            <div className="container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
                        Welcome back, <span style={{ color: 'var(--primary)' }}>{currentUser?.displayName || 'Scholar'}</span>
                    </h1>
                    <p style={{ color: 'var(--text-light)' }}>Pick up right where you left off.</p>
                </div>

                {error && (
                    <div style={{ padding: '20px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '10px', marginBottom: '30px' }}>
                        {error}
                    </div>
                )}

                {courses.length === 0 && !loading && !error ? (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '20px', color: 'var(--primary)', opacity: 0.5 }}>
                            <BookOpen size={60} />
                        </div>
                        <h2 style={{ fontSize: '22px', marginBottom: '15px' }}>Start Your Journey</h2>
                        <p style={{ maxWidth: '500px', margin: '0 auto 25px', color: 'var(--text-light)' }}>
                            You aren't enrolled in any courses yet. Explore our catalog to find the perfect course for you.
                        </p>
                        <Link to="/courses" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                        {courses.map(course => {
                            const nextLesson = getNextLesson(course);
                            const progress = course.enrollment?.progress || 0;

                            return (
                                <div key={course.courseId} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={course.image || 'https://via.placeholder.com/300x140?text=Course'}
                                            alt={course.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                            padding: '15px'
                                        }}>
                                            <span style={{
                                                background: 'var(--accent)', color: 'white',
                                                padding: '4px 10px', borderRadius: '20px',
                                                fontSize: '11px', fontWeight: '600'
                                            }}>
                                                {course.category || 'Course'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '18px', marginBottom: '10px', lineHeight: '1.4' }}>{course.title}</h3>

                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px', color: 'var(--text-light)' }}>
                                                <span>{progress}% Complete</span>
                                                <span>{course.totalLessons} Lessons</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', borderRadius: '10px', transition: 'width 0.5s' }}></div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 'auto' }}>
                                            {nextLesson ? (
                                                <div style={{ background: 'rgba(26, 82, 118, 0.05)', borderRadius: '12px', padding: '15px' }}>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        Up Next
                                                    </p>
                                                    <h4 style={{ fontSize: '14px', marginBottom: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Play size={14} style={{ fill: 'var(--primary)', stroke: 'var(--primary)' }} />
                                                        {nextLesson.title}
                                                    </h4>
                                                    <Link
                                                        to={`/learn/${course.courseId}/${nextLesson.globalIndex}`}
                                                        className="btn btn-primary"
                                                        style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                                                    >
                                                        Continue Learning
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ marginBottom: '10px', color: 'var(--accent)' }}>
                                                        <Award size={30} />
                                                    </div>
                                                    <p style={{ fontSize: '14px', fontWeight: '600' }}>Course Completed!</p>
                                                    <Link
                                                        to={`/learn/${course.courseId}/1`}
                                                        style={{ display: 'block', marginTop: '10px', color: 'var(--primary)', textDecoration: 'none', fontSize: '14px' }}
                                                    >
                                                        Review Course
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
