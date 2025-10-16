import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { FaWhatsapp, FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";

function App() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const typeMessage = (message, callback) => {
    setIsTyping(true);
    const words = message.split(' ');
    let currentText = '';
    let wordIndex = 0;

    const typeInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (currentText ? ' ' : '') + words[wordIndex];
        setChatHistory(prev => [
          ...prev.slice(0, -1),
          { type: "bot", text: currentText, isHtml: true, isTyping: true }
        ]);
        wordIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setChatHistory(prev => [
          ...prev.slice(0, -1),
          { type: "bot", text: message, isHtml: true, isTyping: false }
        ]);
        callback();
      }
    }, 150);
  };

  const handleAsk = async () => {
    if (!question.trim() || loading) return;

    const userQuestion = question;
    setChatHistory([...chatHistory, { type: "user", text: userQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        question: userQuestion,
      });

      const botAnswer = response.data.answer || "Hmm... I'll get back to you on that!";
      
      // Add empty bot message for typing effect
      setChatHistory(prev => [...prev, { type: "bot", text: "", isHtml: true, isTyping: true }]);
      
      setTimeout(() => {
        typeMessage(botAnswer, () => setLoading(false));
      }, 500);
      
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { type: "bot", text: "Oops! Something went wrong. Try again later." },
      ]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="chat-app">
      {/* Animated Background */}
      <div className="gradient-bg">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
        <div className="particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="avatar-container">
            <div className="avatar">
              <FaRobot />
            </div>
            <div className="status-indicator"></div>
          </div>
          <div className="header-text">
            <h1 className="title">
              Meet <span className="gradient-text">Manikant AI</span>
            </h1>
            <p className="subtitle">Your Intelligent Assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container" ref={chatContainerRef}>
        <div className="chat-inner">
          {chatHistory.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-content">
                <FaRobot className="welcome-icon" />
                <h3>Welcome! 👋</h3>
                <p>Ask me anything and I'll help you out!</p>
                <div className="suggested-questions">
                  <button 
                    className="suggestion-chip"
                    onClick={() => setQuestion("Tell me about yourself")}
                  >
                    Tell me about yourself
                  </button>
                  <button 
                    className="suggestion-chip"
                    onClick={() => setQuestion("What can you help me with?")}
                  >
                    What can you help me with?
                  </button>
                </div>
              </div>
            </div>
          )}

          {chatHistory.map((chat, idx) => (
            <div
              key={idx}
              className={`message-wrapper ${chat.type}`}
            >
              <div className="message-avatar">
                {chat.type === "user" ? <FaUser /> : <FaRobot />}
              </div>
              <div className={`chat-bubble ${chat.type} ${chat.isTyping ? 'typing-active' : ''}`}>
                {chat.isHtml ? (
                  <span dangerouslySetInnerHTML={{ __html: chat.text }} />
                ) : (
                  chat.text
                )}
                {chat.isTyping && <span className="typing-cursor">|</span>}
              </div>
            </div>
          ))}

          {loading && !isTyping && (
            <div className="message-wrapper bot">
              <div className="message-avatar">
                <FaRobot />
              </div>
              <div className="chat-bubble bot typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Container */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows="1"
            disabled={loading}
          />
          <button 
            onClick={handleAsk} 
            disabled={loading || !question.trim()}
            className="send-button"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>

      {/* WhatsApp Contact Button */}
      <a
        href="https://wa.me/917816013123"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        title="Chat with Manikanta on WhatsApp"
      >
        <FaWhatsapp />
        <span>Contact</span>
      </a>

      {/* Floating Action Hint */}
      <div className="floating-hint">
        <span>✨ Powered by AI</span>
      </div>
    </div>
  );
}

export default App;
