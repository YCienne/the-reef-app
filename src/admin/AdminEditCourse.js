import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft, Brain, Trash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminEditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { currentUser } = useAuth();
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Quiz State
    const [moduleQuizzes, setModuleQuizzes] = useState({}); // { moduleIndex: quizData }
    const [editingQuizIndex, setEditingQuizIndex] = useState(null); // 1-based index
    const [currentQuiz, setCurrentQuiz] = useState({ questions: [] });
    const [newQuestion, setNewQuestion] = useState({ text: '', options: ['', '', '', ''], correctIndex: 0 });

    // UI state for adding new modules/lessons dynamically
    const [currentModule, setCurrentModule] = useState({ title: '', lessons: [], quiz: null });
    const [currentLesson, setCurrentLesson] = useState({ title: '', duration: '', type: 'video', contentUrl: '' });

    useEffect(() => {
        const fetchCourseAndQuizzes = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const res = await axios.get(`${apiUrl}/api/courses/${id}`);
                const course = res.data;
                setCourseData(course);

                // Fetch quizzes for each module
                if (course.modules) {
                    const quizPromises = course.modules.map((_, idx) =>
                        axios.get(`${apiUrl}/api/quiz/${id}/${idx + 1}`).catch(() => null)
                    );
                    const quizResponses = await Promise.all(quizPromises);
                    const quizzes = {};
                    quizResponses.forEach((r, idx) => {
                        if (r && r.data && r.data.success && r.data.data.id !== 'demo-quiz') {
                            quizzes[idx + 1] = r.data.data;
                        }
                    });
                    setModuleQuizzes(quizzes);
                }
            } catch (error) {
                console.error("Error fetching course data:", error);
                alert("Failed to load course details.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseAndQuizzes();
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

        const newModuleIndex = (courseData.modules || []).length + 1;
        setCourseData({
            ...courseData,
            modules: [...(courseData.modules || []), { ...currentModule, id: Date.now().toString() }],
            totalLessons: (courseData.totalLessons || 0) + currentModule.lessons.length
        });

        if (currentModule.quiz) {
            setModuleQuizzes({ ...moduleQuizzes, [newModuleIndex]: currentModule.quiz });
        }

        setCurrentModule({ title: '', lessons: [], quiz: null });
    };

    // Quiz Handlers
    const startEditingQuiz = (moduleIndex) => {
        setEditingQuizIndex(moduleIndex);
        if (moduleQuizzes[moduleIndex]) {
            setCurrentQuiz(moduleQuizzes[moduleIndex]);
        } else {
            setCurrentQuiz({ questions: [] });
        }
    };

    const addQuestion = () => {
        if (!newQuestion.text || newQuestion.options.some(opt => !opt)) {
            alert('Please provide question text and all 4 options');
            return;
        }
        setCurrentQuiz({
            ...currentQuiz,
            questions: [...currentQuiz.questions, { ...newQuestion }]
        });
        setNewQuestion({ text: '', options: ['', '', '', ''], correctIndex: 0 });
    };

    const removeQuestion = (index) => {
        const updatedQuestions = [...currentQuiz.questions];
        updatedQuestions.splice(index, 1);
        setCurrentQuiz({ ...currentQuiz, questions: updatedQuestions });
    };

    const saveQuiz = () => {
        if (currentQuiz.questions.length === 0) {
            alert('Please add at least one question');
            return;
        }
        setModuleQuizzes({ ...moduleQuizzes, [editingQuizIndex]: currentQuiz });
        setEditingQuizIndex(null);
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
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const token = await currentUser.getIdToken();
            await axios.put(`${apiUrl}/api/courses/${id}`, courseData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Save Quizzes
            await Promise.all(Object.entries(moduleQuizzes).map(([mIdx, quiz]) => {
                return axios.put(`${apiUrl}/api/quiz/${id}/${mIdx}`, quiz, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }));

            alert('Course and quizzes updated successfully!');
            navigate('/dashboard');
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
        <div style={{ padding: '40px 20px', background: 'var(--bg-light)' }}>
            <div className="container">
                <button
                    onClick={() => navigate('/dashboard')}
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

                                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: moduleQuizzes[mIndex + 1] ? '#2e7d32' : 'var(--text-light)' }}>
                                                    <Brain size={16} />
                                                    {moduleQuizzes[mIndex + 1] ? `Quiz Attached (${moduleQuizzes[mIndex + 1].questions.length} Qs)` : 'No Quiz Attached'}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => startEditingQuiz(mIndex + 1)}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '12px', padding: '5px 12px' }}
                                                >
                                                    Manage Quiz
                                                </button>
                                            </div>

                                            {editingQuizIndex === (mIndex + 1) && (
                                                <div style={{ marginTop: '15px', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                                    <h5 style={{ marginBottom: '10px' }}>Quiz Editor</h5>
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <input
                                                            placeholder="Question Text"
                                                            value={newQuestion.text}
                                                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                                            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                        />
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                            {newQuestion.options.map((opt, idx) => (
                                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                    <input
                                                                        type="radio"
                                                                        name="correctOptEdit"
                                                                        checked={newQuestion.correctIndex === idx}
                                                                        onChange={() => setNewQuestion({ ...newQuestion, correctIndex: idx })}
                                                                    />
                                                                    <input
                                                                        placeholder={`Option ${idx + 1}`}
                                                                        value={opt}
                                                                        onChange={(e) => {
                                                                            const newOpts = [...newQuestion.options];
                                                                            newOpts[idx] = e.target.value;
                                                                            setNewQuestion({ ...newQuestion, options: newOpts });
                                                                        }}
                                                                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={addQuestion}
                                                            className="btn btn-primary"
                                                            style={{ marginTop: '10px', fontSize: '12px' }}
                                                        >
                                                            <Plus size={12} /> Add Question
                                                        </button>
                                                    </div>

                                                    {currentQuiz.questions.length > 0 && (
                                                        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                                            <h6 style={{ fontSize: '12px', marginBottom: '10px' }}>Questions Preview:</h6>
                                                            {currentQuiz.questions.map((q, idx) => (
                                                                <div key={idx} style={{ fontSize: '11px', background: '#fff', padding: '8px', borderRadius: '4px', marginBottom: '5px', display: 'flex', justifyContent: 'space-between', border: '1px solid #eee' }}>
                                                                    <span>{idx + 1}. {q.text}</span>
                                                                    <button type="button" onClick={() => removeQuestion(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                                        <Trash size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                                        <button type="button" onClick={saveQuiz} className="btn btn-accent" style={{ fontSize: '12px' }}>Save Quiz Changes</button>
                                                        <button type="button" onClick={() => setEditingQuizIndex(null)} className="btn btn-secondary" style={{ fontSize: '12px' }}>Cancel</button>
                                                    </div>
                                                </div>
                                            )}
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

                            {/* New Module Quiz Builder */}
                            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-light)' }}>Module Assessment (Quiz)</h4>
                                {currentModule.quiz ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(40, 180, 99, 0.1)', padding: '10px', borderRadius: '6px' }}>
                                        <div style={{ color: '#2e7d32', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Brain size={16} /> Quiz Added ({currentModule.quiz.questions.length} questions)
                                        </div>
                                        <button type="button" onClick={() => setCurrentModule({ ...currentModule, quiz: null })} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => startEditingQuiz('new')}
                                        className="btn btn-secondary"
                                        style={{ width: '100%', fontSize: '13px' }}
                                    >
                                        Add Quiz to this Module
                                    </button>
                                )}

                                {editingQuizIndex === 'new' && (
                                    <div style={{ marginTop: '15px', background: '#f0f4f8', padding: '15px', borderRadius: '8px' }}>
                                        <h5 style={{ marginBottom: '10px' }}>New Quiz Editor</h5>
                                        <div style={{ marginBottom: '15px' }}>
                                            <input
                                                placeholder="Question Text"
                                                value={newQuestion.text}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                {newQuestion.options.map((opt, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <input
                                                            type="radio"
                                                            name="correctOptNew"
                                                            checked={newQuestion.correctIndex === idx}
                                                            onChange={() => setNewQuestion({ ...newQuestion, correctIndex: idx })}
                                                        />
                                                        <input
                                                            placeholder={`Option ${idx + 1}`}
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOpts = [...newQuestion.options];
                                                                newOpts[idx] = e.target.value;
                                                                setNewQuestion({ ...newQuestion, options: newOpts });
                                                            }}
                                                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addQuestion}
                                                className="btn btn-primary"
                                                style={{ marginTop: '10px', fontSize: '12px' }}
                                            >
                                                <Plus size={12} /> Add Question
                                            </button>
                                        </div>

                                        {currentQuiz.questions.length > 0 && (
                                            <div style={{ marginTop: '15px', background: '#fff', padding: '10px', borderRadius: '6px' }}>
                                                {currentQuiz.questions.map((q, idx) => (
                                                    <div key={idx} style={{ fontSize: '11px', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                                                        {idx + 1}. {q.text}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                            <button type="button" onClick={() => {
                                                if (currentQuiz.questions.length === 0) return alert('Add at least one question');
                                                setCurrentModule({ ...currentModule, quiz: currentQuiz });
                                                setEditingQuizIndex(null);
                                            }} className="btn btn-accent" style={{ fontSize: '12px' }}>Save Quiz to Module</button>
                                            <button type="button" onClick={() => setEditingQuizIndex(null)} className="btn btn-secondary" style={{ fontSize: '12px' }}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>

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
