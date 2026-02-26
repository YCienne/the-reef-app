import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, Plus, Edit, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({ totalUsers: 0, totalStudents: 0, totalAdmins: 0, totalCourses: 0 });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;

                const [metricsRes, coursesRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/admin/metrics`),
                    axios.get(`${apiUrl}/api/courses`)
                ]);

                setMetrics(metricsRes.data);
                setCourses(coursesRes.data);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.delete(`${apiUrl}/api/courses/${courseId}`);
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Failed to delete course.");
        }
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Admin Dashboard...</div>;

    const MetricCard = ({ title, value, icon: Icon, color }) => (
        <div className="glass-card" style={{ padding: '25px', flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '15px', borderRadius: '15px', background: `${color}20`, color: color }}>
                <Icon size={30} />
            </div>
            <div>
                <h3 style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '5px' }}>{title}</h3>
                <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px' }}>Admin Dashboard</h1>
                <Link to="/admin/upload" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    Create New Course
                </Link>
            </div>

            {/* Metrics Section */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <MetricCard title="Total Learners" value={metrics.totalStudents} icon={GraduationCap} color="#2ecc71" />
                <MetricCard title="Total Courses" value={metrics.totalCourses} icon={BookOpen} color="#3498db" />
                <MetricCard title="Total Staff/Admins" value={metrics.totalAdmins} icon={Users} color="#9b59b6" />
            </div>

            {/* Courses Management Section */}
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
                                            <span style={{ background: 'rgba(26, 82, 118, 0.1)', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', color: 'var(--primary)' }}>
                                                {course.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 10px', color: 'var(--primary)', fontWeight: 'bold' }}>{course.price || 'Free'}</td>
                                        <td style={{ padding: '15px 10px', display: 'flex', gap: '10px' }}>
                                            <Link to={`/admin/edit/${course.id}`} className="btn btn-secondary" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Edit size={14} /> Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteCourse(course.id)}
                                                style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
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
        </div>
    );
};

export default AdminDashboard;
