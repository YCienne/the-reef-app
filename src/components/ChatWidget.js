import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Brain } from 'lucide-react';
import axios from 'axios';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi there! I'm Coral, your AI guide. Tell me what you're interested in, and I'll find the perfect course for you!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            // Prepare history for context (last 10 messages)
            const history = messages.slice(-10);

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chat`, {
                message: userMessage,
                history: history
            });

            setMessages(prev => [...prev, { role: 'assistant', text: response.data.reply }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            {/* Chat Window */}
            {isOpen && (
                <div className="glass-card" style={{
                    width: '350px',
                    height: '500px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '15px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'white', padding: '5px', borderRadius: '50%', color: 'var(--primary)' }}>
                                <Brain size={18} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', margin: 0 }}>Coral AI Assistant</h3>
                                <span style={{ fontSize: '12px', opacity: 0.9 }}>Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%'
                            }}>
                                <div style={{
                                    padding: '10px 15px',
                                    borderRadius: '15px',
                                    background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.8)',
                                    color: msg.role === 'user' ? 'white' : 'var(--text)',
                                    borderBottomRightRadius: msg.role === 'user' ? '5px' : '15px',
                                    borderBottomLeftRadius: msg.role === 'assistant' ? '5px' : '15px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.8)', padding: '10px 15px', borderRadius: '15px', borderBottomLeftRadius: '5px' }}>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} style={{ padding: '15px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.5)' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about courses..."
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    outline: 'none'
                                }}
                            />
                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '10px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="btn btn-accent"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
                        animation: 'bounce 2s infinite'
                    }}
                >
                    <MessageCircle size={30} />
                </button>
            )}


        </div>
    );
};

export default ChatWidget;
