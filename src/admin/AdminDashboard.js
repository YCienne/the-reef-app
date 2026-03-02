import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users, BookOpen, GraduationCap, Plus, Edit, Trash2,
    ClipboardList, Activity, ChevronDown, ChevronUp, Search, User, Clock
} from 'lucide-react';

const timeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const [metrics, setMetrics] = useState({
        totalUsers: 0, totalStudents: 0, totalAdmins: 0,
        totalCourses: 0, totalEnrollments: 0
    });
    const [courses, setCourses] = useState([]);
    const [enrollmentsPerCourse, setEnrollmentsPerCourse] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [learnerProgress, setLearnerProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedLearner, setExpandedLearner] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            if (!currentUser) return;

            const apiUrl = process.env.REACT_APP_API_URL;
            console.log('[AdminDashboard] Fetching data from:', apiUrl);

            try {
                const token = await currentUser.getIdToken();
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const results = await Promise.allSettled([
                    axios.get(`${apiUrl}/api/admin/metrics`, config),
                    axios.get(`${apiUrl}/api/courses`), // Courses list is public
                    axios.get(`${apiUrl}/api/admin/enrollments-per-course`, config),
                    axios.get(`${apiUrl}/api/admin/recent-activity?limit=20`, config),
                    axios.get(`${apiUrl}/api/admin/learner-progress`, config)
                ]);

                const labels = ['metrics', 'courses', 'enrollments-per-course', 'recent-activity', 'learner-progress'];
                results.forEach((result, i) => {
                    if (result.status === 'fulfilled') {
                        console.log(`[AdminDashboard] ${labels[i]} OK:`, result.value.data);
                    } else {
                        console.error(`[AdminDashboard] ${labels[i]} FAILED:`, result.reason?.response?.data || result.reason?.message);
                    }
                });

                if (results[0].status === 'fulfilled') setMetrics(results[0].value.data);
                if (results[1].status === 'fulfilled') setCourses(results[1].value.data);
                if (results[2].status === 'fulfilled') setEnrollmentsPerCourse(results[2].value.data);
                if (results[3].status === 'fulfilled') setRecentActivity(results[3].value.data);
                if (results[4].status === 'fulfilled') setLearnerProgress(results[4].value.data);
            } catch (err) {
                console.error("Error fetching admin data:", err);
            }

            setLoading(false);
        };

        fetchAdminData();
    }, []);

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const token = await currentUser.getIdToken();
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.delete(`${apiUrl}/api/courses/${courseId}`, config);
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Failed to delete course.");
        }
    };

    // Build course title lookup from courses array
    const courseMap = {};
    courses.forEach(c => { courseMap[c.id] = c.title; });

    if (loading) return (
        <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            <p style={{ color: 'var(--text-light)' }}>Loading Admin Dashboard...</p>
        </div>
    );

    const MetricCard = ({ title, value, icon: Icon, color }) => (
        <div className="glass-card" style={{ padding: '25px', flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '15px', borderRadius: '15px', background: `${color}20`, color: color }}>
                <Icon size={28} />
            </div>
            <div>
                <h3 style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
                <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{value}</p>
            </div>
        </div>
    );

    const tabs = ['overview', 'learners', 'courses'];

    const filteredLearners = learnerProgress.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const maxEnrollments = Math.max(...enrollmentsPerCourse.map(c => c.enrollmentCount), 1);

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Platform overview and management</p>
                </div>
                <Link to="/admin/upload" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    Create New Course
                </Link>
            </div>

            {/* Metrics Cards */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                <MetricCard title="Total Learners" value={metrics.totalStudents} icon={GraduationCap} color="#2ecc71" />
                <MetricCard title="Total Courses" value={metrics.totalCourses} icon={BookOpen} color="#3498db" />
                <MetricCard title="Staff / Admins" value={metrics.totalAdmins} icon={Users} color="#9b59b6" />
                <MetricCard title="Enrollments" value={metrics.totalEnrollments} icon={ClipboardList} color="#e67e22" />
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex', gap: '0', marginBottom: '30px',
                background: 'rgba(255,255,255,0.5)', borderRadius: '15px',
                padding: '5px', border: '1px solid var(--glass-border)'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1, padding: '12px 20px', border: 'none', borderRadius: '12px',
                            background: activeTab === tab ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-light)',
                            fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s',
                            textTransform: 'capitalize', fontSize: '14px'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ========== OVERVIEW TAB ========== */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    {/* Enrollments by Course */}
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
                            Enrollments by Course
                        </h2>
                        {enrollmentsPerCourse.length === 0 ? (
                            <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>No enrollment data yet.</p>
                        ) : (
                            <div>
                                {enrollmentsPerCourse.map(course => (
                                    <div key={course.courseId} style={{
                                        display: 'flex', alignItems: 'center', gap: '15px',
                                        padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{course.title}</div>
                                        <div style={{ width: '40px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px' }}>
                                            {course.enrollmentCount}
                                        </div>
                                        <div style={{
                                            width: '120px', height: '8px', background: 'rgba(0,0,0,0.05)',
                                            borderRadius: '10px', overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(course.enrollmentCount / maxEnrollments) * 100}%`,
                                                height: '100%', background: 'var(--accent)',
                                                borderRadius: '10px', transition: 'width 0.5s'
                                            }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="glass-card" style={{ padding: '25px', maxHeight: '500px', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} style={{ color: 'var(--accent)' }} />
                            Recent Activity
                        </h2>
                        {recentActivity.length === 0 ? (
                            <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>No recent activity.</p>
                        ) : (
                            <div>
                                {recentActivity.map((activity, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex', gap: '12px', padding: '12px 0',
                                        borderBottom: idx < recentActivity.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none'
                                    }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: 'rgba(40, 180, 99, 0.1)', color: '#2ecc71',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <User size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                                <span style={{ fontWeight: '600' }}>{activity.userName}</span>
                                                {' enrolled in '}
                                                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{activity.courseTitle}</span>
                                            </p>
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '4px' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={11} /> {timeAgo(activity.timestamp)}
                                                </span>
                                                {activity.completedLessonsCount > 0 && (
                                                    <span style={{ fontSize: '12px', color: 'var(--accent)' }}>
                                                        {activity.completedLessonsCount} lessons done
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========== LEARNERS TAB ========== */}
            {activeTab === 'learners' && (
                <div className="glass-card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <GraduationCap size={20} className="text-primary" />
                            Learner Progress
                        </h2>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '10px', padding: '8px 15px'
                        }}>
                            <Search size={16} style={{ color: 'var(--text-light)' }} />
                            <input
                                type="text"
                                placeholder="Search learners..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', width: '180px' }}
                            />
                        </div>
                    </div>

                    {filteredLearners.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '30px' }}>
                            {searchTerm ? 'No learners match your search.' : 'No learners registered yet.'}
                        </p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)', color: 'var(--text-light)' }}>
                                        <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '13px' }}>Name</th>
                                        <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '13px' }}>Email</th>
                                        <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '13px', textAlign: 'center' }}>Enrolled</th>
                                        <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '13px' }}>Joined</th>
                                        <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '13px', textAlign: 'center' }}>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLearners.map(learner => (
                                        <React.Fragment key={learner.userId}>
                                            <tr style={{
                                                borderBottom: expandedLearner === learner.userId ? 'none' : '1px solid rgba(0,0,0,0.05)',
                                                background: expandedLearner === learner.userId ? 'rgba(26, 82, 118, 0.03)' : 'transparent',
                                                cursor: 'pointer'
                                            }}
                                                onClick={() => setExpandedLearner(expandedLearner === learner.userId ? null : learner.userId)}
                                            >
                                                <td style={{ padding: '14px 10px', fontWeight: '500', fontSize: '14px' }}>{learner.name}</td>
                                                <td style={{ padding: '14px 10px', fontSize: '14px', color: 'var(--text-light)' }}>{learner.email}</td>
                                                <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                                                    <span style={{
                                                        background: learner.totalEnrollments > 0 ? 'rgba(40, 180, 99, 0.1)' : 'rgba(0,0,0,0.05)',
                                                        color: learner.totalEnrollments > 0 ? '#2ecc71' : 'var(--text-light)',
                                                        padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600'
                                                    }}>
                                                        {learner.totalEnrollments}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-light)' }}>
                                                    {learner.createdAt ? new Date(learner.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                                                    {expandedLearner === learner.userId
                                                        ? <ChevronUp size={18} style={{ color: 'var(--primary)' }} />
                                                        : <ChevronDown size={18} style={{ color: 'var(--text-light)' }} />
                                                    }
                                                </td>
                                            </tr>

                                            {/* Expanded row: per-course progress */}
                                            {expandedLearner === learner.userId && (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '0 10px 15px', background: 'rgba(26, 82, 118, 0.03)' }}>
                                                        {learner.enrollments.length === 0 ? (
                                                            <p style={{ padding: '10px 0', color: 'var(--text-light)', fontSize: '13px' }}>
                                                                No course enrollments yet.
                                                            </p>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '5px' }}>
                                                                {learner.enrollments.map((enrollment, eIdx) => {
                                                                    const courseTitle = courseMap[enrollment.courseId] || 'Unknown Course';
                                                                    return (
                                                                        <div key={eIdx} style={{
                                                                            display: 'flex', alignItems: 'center', gap: '15px',
                                                                            background: 'white', padding: '12px 15px', borderRadius: '10px',
                                                                            border: '1px solid rgba(0,0,0,0.05)'
                                                                        }}>
                                                                            <div style={{ flex: 1 }}>
                                                                                <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>{courseTitle}</p>
                                                                                <div style={{
                                                                                    width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)',
                                                                                    borderRadius: '10px', overflow: 'hidden'
                                                                                }}>
                                                                                    <div style={{
                                                                                        width: `${Math.min(enrollment.completedLessonsCount * 10, 100)}%`,
                                                                                        height: '100%', background: 'var(--accent)',
                                                                                        borderRadius: '10px', transition: 'width 0.5s'
                                                                                    }}></div>
                                                                                </div>
                                                                            </div>
                                                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                                                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>
                                                                                    {enrollment.completedLessonsCount} lessons
                                                                                </p>
                                                                                <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                                                                                    Last: {timeAgo(enrollment.lastAccessed)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ========== COURSES TAB ========== */}
            {activeTab === 'courses' && (
                <div className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BookOpen size={20} className="text-primary" />
                        Manage Courses
                    </h2>

                    {courses.length === 0 ? (
                        <p style={{ color: 'var(--text-light)' }}>No courses found. Create one above!</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)', color: 'var(--text-light)' }}>
                                        <th style={{ padding: '15px 10px', fontWeight: '600' }}>Course Title</th>
                                        <th style={{ padding: '15px 10px', fontWeight: '600' }}>Category</th>
                                        <th style={{ padding: '15px 10px', fontWeight: '600' }}>Price</th>
                                        <th style={{ padding: '15px 10px', fontWeight: '600' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map(course => (
                                        <tr key={course.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                            <td style={{ padding: '15px 10px', fontWeight: '500' }}>{course.title}</td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <span style={{
                                                    background: 'rgba(26, 82, 118, 0.1)', padding: '5px 10px',
                                                    borderRadius: '20px', fontSize: '12px', color: 'var(--primary)'
                                                }}>
                                                    {course.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 10px', color: 'var(--primary)', fontWeight: 'bold' }}>
                                                {course.price || 'Free'}
                                            </td>
                                            <td style={{ padding: '15px 10px', display: 'flex', gap: '10px' }}>
                                                <Link to={`/admin/edit/${course.id}`} className="btn btn-secondary" style={{
                                                    padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    <Edit size={14} /> Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    style={{
                                                        background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: 'none',
                                                        padding: '8px 15px', borderRadius: '8px', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '5px'
                                                    }}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
