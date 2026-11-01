import { useState, useEffect, useRef, useCallback } from "react";

/**
 * ChatView — Modern SaaS-style AI emergency triage workspace.
 *
 * Features:
 * - Fluid full-screen responsive layout with comfortable readability
 * - Voice speech controls: Stop speaking button, global voice reply toggle, and per-message play/stop
 * - Auto-growing input textarea with keyboard shortcuts (Enter to send, Shift+Enter for newline)
 * - Quick emergency triage prompt chips
 * - Copy message to clipboard
 * - In-line emergency vision/image attachment preview
 * - Professional AI status indicators and source badges
 */
function ChatView({
  messages,
  isSending,
  onSend,
  onVoice,
  showCamera,
  onToggleCamera,
  onCaptureImage,
  previewImage,
  isOnline,
  voiceReplyEnabled,
  isSpeaking,
  currentlySpeakingIdx,
  onToggleVoiceReply,
  onStopSpeaking,
  onSpeakMessage,
  onNewChat,
}) {
  const [input, setInput] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-grow textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    onSend(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1800);
    } catch {
      // Clipboard fallback
    }
  };

  const quickActions = [
    { label: "🔥 Burn Care", prompt: "I got a burn. What are the immediate first aid steps?" },
    { label: "🩸 Severe Bleeding", prompt: "Someone is bleeding heavily from a deep cut. How do I stop it?" },
    { label: "🫁 Choking (Heimlich)", prompt: "Someone is choking and cannot breathe. How do I perform first aid?" },
    { label: "🫀 CPR Protocol", prompt: "How do I perform CPR on an unresponsive adult?" },
    { label: "❤️ Heart Attack Alert", prompt: "What are the emergency steps for a suspected heart attack?" },
    { label: "⚡ Electric Shock", prompt: "Someone received an electric shock. How to handle safely?" },
  ];

  const exampleCards = [
    {
      icon: "🔥",
      title: "Burns & Scalds",
      desc: "Immediate cooling, dressing, and emergency severity criteria.",
      prompt: "What is the emergency first-aid procedure for a second-degree burn?",
    },
    {
      icon: "🩸",
      title: "Heavy Bleeding",
      desc: "Arterial pressure, tourniquets, and shock prevention.",
      prompt: "How to control uncontrolled arterial bleeding from a wound?",
    },
    {
      icon: "🫁",
      title: "Choking Emergency",
      desc: "Back blows and Heimlich abdominal thrust guidelines.",
      prompt: "Step-by-step Heimlich manoeuvre for a conscious choking adult?",
    },
    {
      icon: "🧠",
      title: "Stroke & FAST",
      desc: "Face, Arms, Speech, and Time stroke identification.",
      prompt: "How to identify stroke symptoms using the FAST emergency protocol?",
    },
  ];

  return (
    <div className="page-view saas-page">
      <div className="chat-view saas-chat-view">
        {/* SaaS Chat Top Subheader */}
        <header className="chat-header saas-chat-header">
          <div className="chat-header-left">
            <div className="model-chip">
              <span className="model-dot" />
              <span className="model-name">ResQ AI Assistant</span>
              <span className="model-version">Gemini 2.5 Flash / Local Triage</span>
            </div>
          </div>

          <div className="chat-header-actions">
            {/* Active Voice Playing Indicator & Direct Stop Button */}
            {isSpeaking && (
              <button
                className="saas-stop-voice-btn"
                onClick={onStopSpeaking}
                title="Stop current voice reply (Click to silence)"
                aria-label="Stop voice reply"
              >
                <span className="audio-wave">
                  <span />
                  <span />
                  <span />
                </span>
                <span>Stop Voice</span>
              </button>
            )}

            {/* Voice Reply Mode Toggle */}
            <button
              className={`saas-pill-btn ${voiceReplyEnabled ? "active-voice" : ""}`}
              onClick={onToggleVoiceReply}
              title={
                voiceReplyEnabled
                  ? "Automatic voice replies are enabled. Click to mute."
                  : "Automatic voice replies are muted. Click to enable speech."
              }
              aria-label="Toggle voice replies"
            >
              <span className="btn-icon">{voiceReplyEnabled ? "🔊" : "🔇"}</span>
              <span className="btn-text">{voiceReplyEnabled ? "Voice ON" : "Voice MUTED"}</span>
            </button>

            {/* Quick New Chat */}
            <button
              className="saas-pill-btn"
              onClick={onNewChat}
              title="Start a new triage session"
              aria-label="New conversation"
            >
              <span className="btn-icon">✏️</span>
              <span className="btn-text">New Triage</span>
            </button>
          </div>
        </header>

        {/* Camera / Image Attachment Drawer */}
        {showCamera && (
          <div className="camera-panel saas-camera-panel">
            <div className="camera-panel-header">
              <span className="camera-panel-title">📷 Emergency Scene Photo Attachment</span>
              <button className="icon-btn" onClick={onToggleCamera} aria-label="Close camera panel">
                ✕
              </button>
            </div>
            <div className="camera-body">
              <label className="camera-upload-label">
                <span>📁 Upload or Take Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onCaptureImage}
                />
              </label>
              {previewImage && (
                <div className="image-preview-wrap">
                  <img
                    className="image-preview"
                    src={previewImage}
                    alt="Emergency scene preview"
                  />
                </div>
              )}
              <p className="camera-notice">
                Image analysis is in preview. Please include specific text symptoms for immediate triage guidance.
              </p>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <main
          className="message-list saas-message-list"
          role="log"
          aria-live="polite"
          aria-label="Emergency Conversation"
        >
          {messages.length === 0 ? (
            <div className="saas-empty-hero">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                <span>24/7 Offline-Ready Emergency AI</span>
              </div>
              <h1 className="hero-title">How can ResQ AI assist you right now?</h1>
              <p className="hero-subtitle">
                Describe the patient's symptoms or physical emergency. ResQ AI provides rapid, step-by-step
                first-aid triage, CPR cadence, and life-safety guidance.
              </p>

              <div className="hero-cards-grid">
                {exampleCards.map((card) => (
                  <button
                    key={card.title}
                    className="hero-action-card"
                    onClick={() => onSend(card.prompt)}
                    disabled={isSending}
                  >
                    <div className="hero-card-header">
                      <span className="hero-card-icon">{card.icon}</span>
                      <span className="hero-card-arrow">↗</span>
                    </div>
                    <div className="hero-card-title">{card.title}</div>
                    <div className="hero-card-desc">{card.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={`${msg.type}-${idx}`}
                className={`message-row ${msg.type} saas-row`}
              >
                {msg.type === "bot" && (
                  <div className="bot-avatar-wrap">
                    <div className="bot-avatar" aria-hidden="true">+</div>
                  </div>
                )}

                <div className="message-bubble-wrap">
                  {msg.type === "bot" && (
                    <div className="bot-msg-meta">
                      <span className="meta-author">ResQ AI First-Aid</span>
                      <span className="meta-badge">Verified Guidance</span>
                    </div>
                  )}

                  <div className={`message-bubble ${msg.type}`}>
                    {msg.text}
                  </div>

                  {/* Message Action Bar */}
                  <div className="saas-message-toolbar">
                    {msg.type === "bot" && (
                      <button
                        className={`toolbar-btn ${
                          isSpeaking && currentlySpeakingIdx === idx ? "speaking-active" : ""
                        }`}
                        onClick={() => onSpeakMessage(msg.text, idx)}
                        title={
                          isSpeaking && currentlySpeakingIdx === idx
                            ? "Stop speaking this message"
                            : "Listen to this message"
                        }
                      >
                        {isSpeaking && currentlySpeakingIdx === idx ? (
                          <>
                            <span className="audio-wave small">
                              <span />
                              <span />
                              <span />
                            </span>
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <span>🔊</span>
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      className={`toolbar-btn ${copiedIdx === idx ? "copied" : ""}`}
                      onClick={() => handleCopy(msg.text, idx)}
                      title="Copy response to clipboard"
                    >
                      <span>{copiedIdx === idx ? "✓" : "📋"}</span>
                      <span>{copiedIdx === idx ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isSending && (
            <div className="message-row bot saas-row">
              <div className="bot-avatar-wrap">
                <div className="bot-avatar loading" aria-hidden="true">+</div>
              </div>
              <div className="message-bubble-wrap">
                <div className="typing-indicator saas-typing" role="status" aria-label="AI is analyzing the emergency">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-text">Analyzing emergency triage...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </main>

        {/* Quick Emergency Scenario Chips */}
        <div className="saas-quick-chips-bar" role="group" aria-label="Quick emergency scenarios">
          <div className="chips-label">Quick Actions:</div>
          <div className="chips-scroll">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="saas-chip-btn"
                disabled={isSending}
                onClick={() => onSend(action.prompt)}
                title={action.prompt}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* SaaS Floating Command Input Area */}
        <div className="saas-input-container">
          <div className="saas-input-box">
            {/* Left Action Buttons (Voice dictation & camera) */}
            <div className="input-prefix-actions">
              <button
                type="button"
                className="input-tool-btn"
                onClick={onVoice}
                title="Dictate emergency via Voice input"
                aria-label="Start voice speech recognition"
              >
                🎙️
              </button>
              <button
                type="button"
                className={`input-tool-btn ${showCamera ? "active" : ""}`}
                onClick={onToggleCamera}
                title="Attach scene photo"
                aria-label="Attach photo"
              >
                📷
              </button>
            </div>

            <textarea
              ref={textareaRef}
              className="saas-textarea"
              placeholder="Describe what happened (e.g. burn, deep cut, chest pain, choking)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              rows={1}
              aria-label="Emergency description input"
            />

            <button
              type="button"
              className={`saas-send-btn ${input.trim() ? "ready" : ""}`}
              onClick={handleSubmit}
              disabled={isSending || !input.trim()}
              aria-label="Send emergency description"
              title="Send (Enter)"
            >
              {isSending ? (
                <span className="btn-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>

          <div className="saas-input-footer">
            <span className="shortcut-hint">Press <kbd>Enter ↵</kbd> to send, <kbd>Shift</kbd> + <kbd>Enter</kbd> for new line</span>
            <span className="disclaimer-hint">⚠️ For severe life-threatening emergencies, immediately dial <strong>911 / 112</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
