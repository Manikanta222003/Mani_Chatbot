import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { FaWhatsapp, FaPaperPlane, FaRobot, FaUser, FaComments } from "react-icons/fa";

function App() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const BACKEND_URL = "https://mani-chatbot.onrender.com";

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
    }, 120);
  };

  const handleAsk = async () => {
    if (!question.trim() || loading) return;

    const userQuestion = question;
    setChatHistory([...chatHistory, { type: "user", text: userQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        question: userQuestion,
      });

      const botAnswer = response.data.answer || "Hmm... I'll get back to you on that!";
      
      setChatHistory(prev => [...prev, { type: "bot", text: "", isHtml: true, isTyping: true }]);
      
      setTimeout(() => {
        typeMessage(botAnswer, () => setLoading(false));
      }, 300);
      
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { type: "bot", text: "I'm experiencing some technical difficulties. Please try again in a moment." },
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
      {/* Enhanced Animated Background */}
      <div className="gradient-bg">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
        <div className="particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Professional Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="avatar-container">
            <div className="avatar">
              <FaComments />
            </div>
            <div className="status-indicator"></div>
          </div>
          <div className="header-text">
            <h1 className="title">
              <span className="gradient-text">Manikanta AI</span>
            </h1>
            <p className="subtitle">Your Professional Assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container" ref={chatContainerRef}>
        <div className="chat-inner">
          {chatHistory.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-content">
                <div className="welcome-icon-wrapper">
                  <FaComments className="welcome-icon" />
                </div>
                <h3>Welcome to Manikanta AI! 👋</h3>
                <p>I'm here to assist you with any questions or tasks you have.</p>
                <div className="suggested-questions">
                  <button 
                    className="suggestion-chip"
                    onClick={() => setQuestion("What services do you offer?")}
                  >
                    What services do you offer?
                  </button>
                  <button 
                    className="suggestion-chip"
                    onClick={() => setQuestion("Tell me about your expertise")}
                  >
                    Tell me about your expertise
                  </button>
                  <button 
                    className="suggestion-chip"
                    onClick={() => setQuestion("How can you help me?")}
                  >
                    How can you help me?
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
                {chat.type === "user" ? <FaUser /> : <FaComments />}
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
                <FaComments />
              </div>
              <div className="chat-bubble bot typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">Bot is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Input Container */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows="1"
            disabled={loading}
          />
          <button 
            onClick={handleAsk} 
            disabled={loading || !question.trim()}
            className="send-button"
            title="Send message"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>

      {/* WhatsApp Contact Button - Fixed Position */}
      <a
        href="https://wa.me/917816013123?text=Hi%20Manikanta!%20I%20came%20from%20your%20AI%20chatbot."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-contact"
        title="Contact Manikanta on WhatsApp"
      >
        <FaWhatsapp />
        <span className="whatsapp-text">Contact</span>
      </a>

      {/* Professional AI Badge */}
      <div className="ai-badge">
        <span>✨ Powered by AI</span>
      </div>
    </div>
  );
}

export default App;
