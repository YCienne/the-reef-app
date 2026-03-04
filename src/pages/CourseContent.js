// src/pages/CourseContent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Brain, FileText, Download, MessageCircle, Check, ChevronDown, ChevronUp, AlertCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CourseContent = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [activeTab, setActiveTab] = useState('notes');
  const [aiExplanation, setAiExplanation] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [expandedModules, setExpandedModules] = useState([]);

  const { currentUser } = useAuth(); // Assuming useAuth is imported at top
  const [enrollment, setEnrollment] = useState(null);
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);

  // Fetch Course and Enrollment Data
  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL;
        if (!apiUrl) console.warn("REACT_APP_API_URL is not set!");

        // 1. Fetch Course Details
        const courseRes = await axios.get(`${apiUrl}/api/courses/${courseId}`);
        setCourse(courseRes.data);

        // 2. Fetch User Enrollment (if logged in)
        if (currentUser) {
          try {
            // We need a way to get specific enrollment or just filter from dashboard
            // For now, let's assume we can fetch all or a specific endpoint if it existed
            // Using the dashboard endpoint to get all enrollments and finding this one
            const dashboardRes = await axios.get(`${apiUrl}/api/users/dashboard/${currentUser.uid}`);
            const currentEnrollment = dashboardRes.data.find(e => e.courseId === courseId);

            if (currentEnrollment) {
              setEnrollment(currentEnrollment);
              setCompletedLessons(currentEnrollment.enrollment.completedLessons || []);
            }
          } catch (err) {
            console.error("Error fetching enrollment:", err);
          }
        }

        if (courseRes.data.modules && courseRes.data.modules.length > 0) {
          // Auto-expand the first module or the one containing the current lesson
          // Simple default: expand all for now or logic to find current
          setExpandedModules(courseRes.data.modules.map((_, i) => i));
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load course content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndEnrollment();
  }, [courseId, currentUser]);

  // Reset state when changing lessons
  useEffect(() => {
    setMaxTimeWatched(0);
    setShowNextOverlay(false);
  }, [lessonId]);

  const handleTimeUpdate = (e) => {
    const video = e.target;
    const currentTime = video.currentTime;
    const duration = video.duration;

    // Update max watched time
    if (currentTime > maxTimeWatched) {
      setMaxTimeWatched(currentTime);
    }

    // Check for completion (90%)
    if (duration > 0 && (currentTime / duration) > 0.9 && !showNextOverlay) {
      if (currentLesson && currentUser && !completedLessons.includes(currentLesson.stableId)) {
        markLessonComplete();
      }
      setShowNextOverlay(true);
    }
  };

  const handleSeeking = (e) => {
    const video = e.target;
    // Check if user is trying to seek past what they've watched
    // Allow seeking if the lesson is already completed
    const isLessonCompleted = currentLesson && completedLessons.some(id => id === currentLesson.stableId);

    // Using a simplified check since we don't have stable IDs in the mock data, 
    // relying on "completedLessons" array which stores IDs. 
    // If we don't have IDs in "lessons", we might need to rely on index or title, which is risky.
    // For this implementation, I will skip the "already completed" check if I can't match IDs easily,
    // OR strictly enforce only based on current session maxTimeWatched.

    if (!isLessonCompleted && video.currentTime > maxTimeWatched + 1) { // +1s buffer
      video.currentTime = maxTimeWatched;
    }
  };

  const markLessonComplete = async () => {
    if (!currentLesson || !currentUser) return;

    // We need a stable ID. If lesson doesn't have one, we might use title or index?
    const lessonIdentifier = currentLesson.stableId;

    if (completedLessons.includes(lessonIdentifier)) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/progress`, {
        userId: currentUser.uid,
        courseId: courseId,
        lessonId: lessonIdentifier
      });
      setCompletedLessons(prev => [...prev, lessonIdentifier]);
    } catch (err) {
      console.error("Failed to mark complete:", err);
    }
  };

  const toggleModule = (index) => {
    setExpandedModules(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getAIExplanation = () => {
    setIsLoadingAI(true);
    setAiExplanation('');

    // Simulate API call for now (Placeholder for real AI)
    setTimeout(() => {
      setAiExplanation(`This AI explanation will be generated based on the content of "${currentLesson?.title}". In a future update, this will connect to the backend AI service.`);
      setIsLoadingAI(false);
    }, 1500);
  };



  // --- Derived State for Current Lesson ---
  // Assuming lessonId is an index (1-based) or we find it. 
  // For simplicity, let's treat lessonId as a potentially 1-based "global" index or implement a finder.
  // The route is /learn/:courseId/:lessonId.
  // If the backend doesn't provide IDs, we'll try to flatten the list to find the "nth" lesson.

  let currentLesson = null;
  let currentModuleTitle = "";
  let nextLessonUrl = null;

  if (course && course.modules) {
    // Flatten lessons to find by global index if lessonId is a number
    let allLessons = [];
    course.modules.forEach((m, mIdx) => {
      m.lessons.forEach((l, lIdx) => {
        allLessons.push({
          ...l,
          moduleTitle: m.title,
          stableId: l.id || `m${mIdx}-l${lIdx}`
        });
      });
    });

    // Try to parse lessonId (assuming 1-based index from URL)
    const lessonIndex = parseInt(lessonId) - 1;
    if (!isNaN(lessonIndex) && allLessons[lessonIndex]) {
      currentLesson = allLessons[lessonIndex];
      currentModuleTitle = currentLesson.moduleTitle;

      // Determine next lesson URL
      if (lessonIndex + 1 < allLessons.length) {
        nextLessonUrl = `/learn/${courseId}/${lessonIndex + 2}`; // 1-based index
      }
    }

    // Fallback: if no lesson found, default to first
    if (!currentLesson && allLessons.length > 0) {
      currentLesson = allLessons[0];
      currentModuleTitle = currentLesson.moduleTitle;
      if (allLessons.length > 1) nextLessonUrl = `/learn/${courseId}/2`;
    }
  }

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
      <h2>Loading Course Content...</h2>
    </div>
  );

  if (error || !course) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#dc3545' }}>
      <AlertCircle size={48} style={{ margin: '0 auto 20px' }} />
      <h2>{error || "Course not found"}</h2>
      <Link to="/courses" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Back to Catalog</Link>
    </div>
  );

  return (
    <div style={{ padding: '30px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', gap: '30px', flexDirection: 'row' }}>
          {/* Main Content */}
          <div style={{ flex: 1 }}>
            {/* Video Player */}
            <div className="glass-card" style={{ marginBottom: '20px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: '100%', height: '500px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {currentLesson ? (
                  <>
                    {/* Content Rendering based on Type */}
                    {(currentLesson.type === 'pdf') ? (
                      <iframe
                        src={currentLesson.videoUrl}
                        title="PDF Viewer"
                        style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
                      />
                    ) : (currentLesson.type === 'ppt') ? (
                      <>
                        <iframe
                          src={`https://docs.google.com/gview?url=${encodeURIComponent(currentLesson.videoUrl)}&embedded=true`}
                          title="PowerPoint Viewer"
                          style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
                        />
                        {/* Overlay to block Google Docs Viewer toolbar buttons (download/open) */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '220px',
                          height: '48px',
                          zIndex: 10,
                          cursor: 'default'
                        }} />
                      </>
                    ) : (currentLesson.type === 'slide') ? (
                      <iframe
                        src={currentLesson.videoUrl}
                        title="Slide Viewer"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allowFullScreen={true}
                        mozallowfullscreen="true"
                        webkitallowfullscreen="true"
                      />
                    ) : currentLesson.videoUrl ? (
                      <video
                        controls
                        controlsList="nodownload"
                        onTimeUpdate={handleTimeUpdate}
                        onSeeking={handleSeeking}
                        style={{ width: '100%', height: '100%' }}
                        src={currentLesson.videoUrl}
                        poster={course.image}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'white' }}>
                        <FileText size={48} style={{ opacity: 0.5, margin: '0 auto 10px' }} />
                        <p>No content source available</p>
                      </div>
                    )}

                    {/* Next Lesson Overlay */}
                    {showNextOverlay && nextLessonUrl && (
                      <div style={{
                        position: 'absolute',
                        bottom: '80px',
                        right: '20px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        animation: 'fadeIn 0.5s ease',
                        zIndex: 10
                      }}>
                        <div style={{ color: 'white' }}>
                          <p style={{ fontSize: '12px', color: '#ccc', marginBottom: '4px' }}>Up Next</p>
                          <p style={{ fontWeight: 'bold' }}>Next Lesson</p>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            navigate(nextLessonUrl);
                            setShowNextOverlay(false);
                          }}
                        >
                          Play Next <Play size={14} style={{ marginLeft: '5px' }} />
                        </button>
                        <button
                          onClick={() => setShowNextOverlay(false)}
                          style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', marginLeft: '10px' }}
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <Play size={48} style={{ opacity: 0.5, margin: '0 auto 10px' }} />
                    <p>No Lesson Selected</p>
                  </div>
                )}
              </div>

              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '22px', marginBottom: '5px' }}>{currentLesson ? currentLesson.title : "No Lesson Selected"}</h2>
                  <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>{currentModuleTitle}</p>
                </div>
                {/* Optional: Navigation Buttons could be wired up here */}
              </div>
            </div>

            {/* AI Explanation */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(40, 180, 99, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '18px' }}>
                  <Brain size={18} />
                </div>
                <h3 style={{ fontSize: '18px' }}>Coral AI Assistant</h3>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: '15px', padding: '15px', marginBottom: '15px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--glass-border)' }}>
                {aiExplanation ? (
                  <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>{aiExplanation}</p>
                ) : isLoadingAI ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-light)' }}>
                    <div className="spinner"></div>
                    AI is analyzing the content...
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-light)', textAlign: 'center', fontStyle: 'italic' }}>
                    Click the button below to get an AI-powered explanation of the current lesson content.
                  </p>
                )}
              </div>

              <button
                className={`btn ${isLoadingAI ? 'btn-secondary' : 'btn-accent'}`}
                onClick={getAIExplanation}
                disabled={isLoadingAI}
              >
                <Brain size={18} />
                {isLoadingAI ? 'Processing...' : 'Get AI Explanation'}
              </button>
            </div>

            {/* Lesson Content Tabs */}
            <div className="glass-card" style={{ padding: '25px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                Lesson Details
              </h3>

              <div style={{ marginBottom: '15px' }}>
                <p>{course.description}</p>
              </div>

              {/* Note: Tabs removed for simplicity as backend doesn't store notes/transcripts yet. 
                  Can be re-added when those fields exist in the data model. */}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: '350px', minWidth: '300px' }}>
            {/* Course Navigation */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '18px' }}>Course Content</h3>
                <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                  {course.modules ? course.modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0) : 0} Lessons
                </span>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>
                  {Math.round((completedLessons.length / (course.modules ? course.modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0) : 1)) * 100)}% Complete
                </div>
              </div>

              {course.modules && course.modules.map((module, mIdx) => (
                <div key={mIdx} style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--glass-border)'
                    }}
                    onClick={() => toggleModule(mIdx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(26, 82, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '14px' }}>
                        <Play size={14} />
                      </div>
                      <span style={{ fontWeight: '500' }}>{module.title}</span>
                    </div>
                    {expandedModules.includes(mIdx) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {expandedModules.includes(mIdx) && (
                    <ul style={{ listStyle: 'none', paddingLeft: '15px', margin: 0 }}>
                      {module.lessons && module.lessons.map((lesson, lIdx) => {
                        // Calculate global index for linking
                        // This is tricky without unique IDs, so we'll approximate logic
                        // or better: just use a unique key if possible. 
                        // For now, let's just make the link inactive or simpler.
                        // Ideally: /learn/courseId/globalIndex

                        // Quick calc for global index (1-based)
                        let globalIndex = 0;
                        for (let i = 0; i < mIdx; i++) globalIndex += course.modules[i].lessons.length;
                        globalIndex += lIdx + 1;

                        const isActive = currentLesson === lesson;
                        // Determine if completed
                        const stableId = lesson.id || `m${mIdx}-l${lIdx}`;
                        const isCompleted = completedLessons.includes(stableId);

                        return (
                          <li
                            key={lIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '12px 0',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: isActive ? 'rgba(26, 82, 118, 0.1)' : 'transparent',
                              borderRadius: isActive ? '10px' : '0',
                              paddingLeft: isActive ? '10px' : '0',
                              color: isActive ? 'var(--primary)' : 'var(--text)'
                            }}
                          >
                            <Link to={`/learn/${courseId}/${globalIndex}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: isCompleted ? 'none' : '2px solid var(--text-light)',
                                background: isCompleted ? '#4CAF50' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}>
                                {isCompleted && <Check size={12} />}
                              </div>
                              <span style={{ flex: 1, fontSize: '14px' }}>{lesson.title}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{lesson.duration || '00:00'}</span>
                            </Link>
                          </li>
                        );
                      })}

                      {/* Module Quiz Button */}
                      <li style={{ paddingTop: '10px' }}>
                        <Link
                          to={`/quiz/${courseId}/${mIdx + 1}`} // Utilizing 1-based module index for quiz
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px',
                            background: 'rgba(241, 196, 15, 0.1)',
                            borderRadius: '8px',
                            color: 'var(--text)',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '14px',
                            border: '1px solid rgba(241, 196, 15, 0.3)'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#f1c40f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px'
                          }}>
                            ?
                          </div>
                          <span>Take Assessment</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default CourseContent;