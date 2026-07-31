import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, Pause, Play, Square } from 'lucide-react';

// Reads the current page's main content aloud using the browser's built-in
// speech synthesis, so visually impaired learners can follow along without
// relying on a third-party screen reader.
const ReadAloud = () => {
    const [isReading, setIsReading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const location = useLocation();
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Stop reading whenever the route changes so it never reads stale content
    // from a page the learner has already left.
    useEffect(() => {
        if (!supported) return;
        window.speechSynthesis.cancel();
        setIsReading(false);
        setIsPaused(false);
    }, [location.pathname, supported]);

    useEffect(() => {
        if (!supported) return;
        return () => window.speechSynthesis.cancel();
    }, [supported]);

    if (!supported) return null;

    const handleStart = () => {
        const main = document.querySelector('main');
        const text = (main ? main.innerText : document.body.innerText || '').trim();
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setIsReading(false);
            setIsPaused(false);
        };
        utterance.onerror = () => {
            setIsReading(false);
            setIsPaused(false);
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
        setIsPaused(false);
    };

    const handlePauseResume = () => {
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        } else {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsReading(false);
        setIsPaused(false);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            left: '30px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
            {isReading && (
                <>
                    <button
                        onClick={handlePauseResume}
                        className="btn btn-secondary"
                        aria-label={isPaused ? 'Resume reading page aloud' : 'Pause reading page aloud'}
                        title={isPaused ? 'Resume' : 'Pause'}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
                    >
                        {isPaused ? <Play size={18} /> : <Pause size={18} />}
                    </button>
                    <button
                        onClick={handleStop}
                        className="btn btn-secondary"
                        aria-label="Stop reading page aloud"
                        title="Stop"
                        style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
                    >
                        <Square size={16} />
                    </button>
                </>
            )}
            <button
                onClick={handleStart}
                className="btn btn-primary"
                aria-label="Read page aloud"
                title="Read page aloud"
                style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.3)' }}
            >
                <Volume2 size={26} />
            </button>
        </div>
    );
};

export default ReadAloud;
