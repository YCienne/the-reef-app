import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';

const AdminEditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // UI state for adding new modules/lessons dynamically
    const [currentModule, setCurrentModule] = useState({ title: '', lessons: [] });
    const [currentLesson, setCurrentLesson] = useState({ title: '', duration: '', type: 'video', contentUrl: '' });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const res = await axios.get(`${apiUrl}/api/courses/${id}`);
                setCourseData(res.data);
            } catch (error) {
                console.error("Error fetching course:", error);
                alert("Failed to load course details.");
                navigate('/admin');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, navigate]);

    const handleCourseChange = (e) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    // Note: To truly swap files (video/PDF uploads), we would need the full upload logic here.
    // For simplicity in this edit view, we will allow updating URLs or metadata. 
    // Deep integrations of new file uploads into existing modules requires heavier component re-use.

    const handleLessonChange = (e) => {
        setCurrentLesson({ ...currentLesson, [e.target.name]: e.target.value });
    };

    const addLessonToNewModule = () => {
        if (!currentLesson.title) return alert('Lesson title required');
        setCurrentModule({
            ...currentModule,
            lessons: [...currentModule.lessons, { ...currentLesson, id: Date.now().toString() }]
        });
        setCurrentLesson({ title: '', duration: '', type: 'video', contentUrl: '' });
    };

    const addNewModuleToCourse = () => {
        if (!currentModule.title || currentModule.lessons.length === 0) return alert('Module title and at least 1 lesson required');

        setCourseData({
            ...courseData,
            modules: [...(courseData.modules || []), { ...currentModule, id: Date.now().toString() }],
            totalLessons: (courseData.totalLessons || 0) + currentModule.lessons.length
        });
        setCurrentModule({ title: '', lessons: [] });
    };

    const removeModule = (moduleIndex) => {
        if (!window.confirm("Remove this entire module?")) return;

        const removedModule = courseData.modules[moduleIndex];
        const newModules = [...courseData.modules];
        newModules.splice(moduleIndex, 1);

        setCourseData({
            ...courseData,
            modules: newModules,
            totalLessons: Math.max(0, (courseData.totalLessons || 0) - (removedModule.lessons?.length || 0))
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.put(`${apiUrl}/api/courses/${id}`, courseData);
            alert('Course updated successfully!');
            navigate('/admin');
        } catch (error) {
            console.error('Error updating course:', error);
            alert('Failed to update course.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Course Editor...</div>;
    if (!courseData) return null;

    return (
        <div style={{ padding: '40px 0', background: 'var(--bg-light)' }}>
            <div className="container">
                <button
                    onClick={() => navigate('/admin')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '20px' }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="glass-card" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '24px', color: 'var(--text)' }}>Edit Course</h2>
                        <button onClick={handleSubmit} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Course Metadata */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)' }}>Course Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={courseData.title || ''}
                                    onChange={handleCourseChange}
                                    required
                                    style={{ width: '100%', padding: '12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)' }}>Instructor</label>
                                <input
                                    type="text"
                                    name="instructor"
                                    value={courseData.instructor || ''}
                                    onChange={handleCourseChange}
                                    required
                                    style={{ width: '100%', padding: '12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)' }}>Category</label>
                                <select
                                    name="category"
                                    value={courseData.category || ''}
                                    onChange={handleCourseChange}
                                    style={{ width: '100%', padding: '12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}
                                >
                                    <option value="ai">Artificial Intelligence</option>
                                    <option value="robotics">Robotics</option>
                                    <option value="software">Software Engineering</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)' }}>Price</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={courseData.price || ''}
                                    onChange={handleCourseChange}
                                    placeholder="e.g., Ghc 500"
                                    style={{ width: '100%', padding: '12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)' }}>Description</label>
                                <textarea
                                    name="description"
                                    value={courseData.description || ''}
                                    onChange={handleCourseChange}
                                    required
                                    rows="4"
                                    style={{ width: '100%', padding: '12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}
                                ></textarea>
                            </div>
                        </div>

                        {/* Existing Modules Preview */}
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Current Curriculum</h3>
                            {courseData.modules && courseData.modules.length > 0 ? (
                                courseData.modules.map((module, mIndex) => (
                                    <div key={mIndex} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '15px', background: '#fff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>{module.title}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeModule(mIndex)}
                                                style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {module.lessons.map((lesson, lIndex) => (
                                                <div key={lIndex} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', fontSize: '14px' }}>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <span style={{ color: 'var(--text-light)', width: '20px' }}>{lIndex + 1}.</span>
                                                        <span>{lesson.title}</span>
                                                        <span style={{ fontSize: '11px', background: 'rgba(26, 82, 118, 0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>
                                                            {lesson.type}
                                                        </span>
                                                    </div>
                                                    <span style={{ color: 'var(--text-light)' }}>{lesson.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-light)' }}>No modules found.</p>
                            )}
                        </div>

                        {/* Append New Builder */}
                        <div style={{ background: 'rgba(26, 82, 118, 0.03)', padding: '25px', borderRadius: '12px', border: '1px dashed rgba(26, 82, 118, 0.3)' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--primary)' }}>Add New Module</h3>

                            <div style={{ marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="Module Title (e.g., Introduction)"
                                    value={currentModule.title}
                                    onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}
                                />
                            </div>

                            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-light)' }}>New Lesson Details</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Lesson Title"
                                        value={currentLesson.title}
                                        onChange={handleLessonChange}
                                        style={{ width: '100%', padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}
                                    />
                                    <input
                                        type="text"
                                        name="duration"
                                        placeholder="Duration (e.g., 5:00)"
                                        value={currentLesson.duration}
                                        onChange={handleLessonChange}
                                        style={{ width: '100%', padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}
                                    />
                                    <select
                                        name="type"
                                        value={currentLesson.type}
                                        onChange={handleLessonChange}
                                        style={{ width: '100%', padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}
                                    >
                                        <option value="video">Video URL/Embed</option>
                                        <option value="slide">Slide URL/Embed</option>
                                        <option value="pdf">PDF URL</option>
                                    </select>
                                    <input
                                        type="text"
                                        name="contentUrl"
                                        placeholder="External Media/Document URL"
                                        value={currentLesson.contentUrl}
                                        onChange={handleLessonChange}
                                        style={{ width: '100%', padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}
                                    />
                                </div>
                                <button type="button" onClick={addLessonToNewModule} className="btn" style={{ background: 'var(--bg-light)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Plus size={14} /> Add Lesson to Draft Module
                                </button>
                            </div>

                            {/* Draft Module Preview */}
                            {currentModule.lessons.length > 0 && (
                                <div style={{ marginBottom: '15px' }}>
                                    <h4 style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '10px' }}>Lessons in Draft Module</h4>
                                    {currentModule.lessons.map((l, i) => (
                                        <div key={i} style={{ fontSize: '13px', padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                            {l.title} ({l.type})
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button type="button" onClick={addNewModuleToCourse} className="btn btn-secondary" style={{ width: '100%' }}>
                                Append Module to Course
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditCourse;
