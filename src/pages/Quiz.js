// src/pages/Quiz.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, BookOpen, Award } from 'lucide-react';

const Quiz = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { 0: 2, 1: 0 } -> question index: option index
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [courseId, moduleId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      // In production, use your actual API URL
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/quiz/${courseId}/${moduleId}`);

      if (!response.ok) {
        throw new Error('Failed to load quiz');
      }

      const data = await response.json();
      if (data.success) {
        setQuizData(data.data);
      } else {
        throw new Error(data.message || 'Error fetching quiz');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    if (submitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Construct payload usually implies mapping qIds, but here we'll map by index for simplicity matching backend
      const answerPayload = {};
      quizData.questions.forEach((q, idx) => {
        answerPayload[idx] = userAnswers[idx];
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/quiz/${courseId}/${moduleId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerPayload })
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
        setSubmitted(true);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      alert('Error submitting quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !submitted) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        <h2>Loading assessment...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <XCircle size={48} style={{ margin: '0 auto' }} />
        </div>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchQuiz} style={{ marginTop: '20px' }}>
          Try Again
        </button>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="container" style={{ padding: '60px 0', maxWidth: '800px' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: results.passed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: results.passed ? '#4CAF50' : '#F44336'
          }}>
            {results.passed ? <Award size={40} /> : <BookOpen size={40} />}
          </div>

          <h1 style={{ marginBottom: '10px' }}>
            {results.passed ? 'Assessment Passed!' : 'Keep Learning!'}
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-light)', marginBottom: '30px' }}>
            You scored {results.percentage}% ({results.score} out of {results.total} correct)
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/learn/${courseId}/1`)} // Should ideally go back to last lesson
            >
              Back to Course
            </button>
            {!results.passed && (
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={18} />
                Retake Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) return null;

  const question = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  const isSelected = (idx) => userAnswers[currentQuestionIndex] === idx;

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh', background: 'var(--bg-light)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>

        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: '600' }}>
              MODULE {moduleId} ASSESSMENT
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>
              Question {currentQuestionIndex + 1} of {quizData.questions.length}
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px', transition: 'width 0.3s' }}></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card" style={{ padding: '40px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '30px', lineHeight: '1.4' }}>
            {question.text}
          </h2>

          <div style={{ display: 'grid', gap: '15px' }}>
            {question.options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${isSelected(idx) ? 'var(--primary)' : 'transparent'}`,
                  background: isSelected(idx) ? 'rgba(26, 82, 118, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  transition: 'all 0.2s',
                  boxShadow: isSelected(idx) ? 'none' : '0 2px 5px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected(idx) ? 'var(--primary)' : '#ccc'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isSelected(idx) && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                </div>
                <span style={{ fontSize: '16px', color: isSelected(idx) ? 'var(--primary)' : 'var(--text)' }}>
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentQuestionIndex === quizData.questions.length - 1 ? (
            <button
              className="btn btn-accent"
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < quizData.questions.length}
              style={{ opacity: Object.keys(userAnswers).length < quizData.questions.length ? 0.5 : 1 }}
            >
              Submit Assessment
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={userAnswers[currentQuestionIndex] === undefined}
              style={{ opacity: userAnswers[currentQuestionIndex] === undefined ? 0.5 : 1 }}
            >
              Next Question
              <ChevronRight size={20} />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

export default Quiz;