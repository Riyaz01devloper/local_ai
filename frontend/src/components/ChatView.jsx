import { useState, useEffect, useRef, useCallback } from "react";

/**
 * ChatView — main AI assistant chat interface.
 *
 * Features:
 * - Auto-growing textarea with Enter-to-send / Shift+Enter for newline
 * - Copy message button per message
 * - Typing indicator
 * - Quick-action prompts
 * - Camera panel toggle (in-line image upload)
 * - Scroll-to-bottom on new messages
 * - Example prompts on empty state
 */
function ChatView({ messages, isSending, onSend, onVoice, showCamera, onToggleCamera, onCaptureImage, previewImage }) {
  const [input, setInput] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-grow textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
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
      // Clipboard API unavailable — fallback silently
    }
  };

  const quickActions = [
    { label: "🔥 Fire emergency", prompt: "There is a fire emergency. What should I do?" },
    { label: "🩸 Bleeding", prompt: "Someone is bleeding heavily. What are the first aid steps?" },
    { label: "😵 Fainting", prompt: "Someone has fainted and is unconscious. How do I help?" },
    { label: "💊 Poisoning", prompt: "Someone may have ingested a harmful substance. What should I do?" },
    { label: "⚡ Electric shock", prompt: "Someone received an electric shock. What are the steps?" },
  ];

  const examplePrompts = [
    "How do I treat a burn?",
    "What to do if someone is choking?",
    "How to perform CPR?",
    "Signs of a heart attack?",
  ];

  const pageTitle =
    messages.length === 0 ? "ResQ AI Assistant" : "AI Assistant";

  return (
    <div className="page-view">
      {/* Chat header */}
      <div className="chat-view">
        <div className="chat-header">
          <span className="chat-title">{pageTitle}</span>
          <div className="chat-actions">
            <button
              className="icon-btn"
              onClick={onVoice}
              title="Voice input"
              aria-label="Start voice input"
            >
              🎙️
            </button>
            <button
              className={`icon-btn${showCamera ? " active" : ""}`}
              onClick={onToggleCamera}
              title="Image upload"
              aria-label="Toggle image upload"
              style={showCamera ? { background: "var(--bg-active)", color: "var(--sky)" } : {}}
            >
              📷
            </button>
          </div>
        </div>

        {/* Camera panel */}
        {showCamera && (
          <div className="camera-panel">
            <div className="camera-panel-header">
              <span className="camera-panel-title">📷 Image Analysis</span>
              <button className="icon-btn" onClick={onToggleCamera} aria-label="Close camera panel">✕</button>
            </div>
            <label className="camera-upload-label">
              <span>📁</span> Select emergency image
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onCaptureImage}
              />
            </label>
            {previewImage && (
              <img
                className="image-preview"
                src={previewImage}
                alt="Emergency scene preview"
              />
            )}
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: 4 }}>
              Image analysis requires a vision AI model. Currently using rule-based guidance.
            </p>
          </div>
        )}

        {/* Message list */}
        <main
          className="message-list"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">+</div>
              <h2>How can I help?</h2>
              <p>
                Describe the emergency and ResQ AI will provide immediate
                first-aid guidance. For life-threatening situations, always
                contact emergency services first.
              </p>
              <div className="example-prompts">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="example-prompt-btn"
                    onClick={() => onSend(prompt)}
                    disabled={isSending}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={`${msg.type}-${idx}`}
                className={`message-row ${msg.type}`}
              >
                {msg.type === "bot" && (
                  <div className="bot-avatar" aria-hidden="true">+</div>
                )}
                <div className="message-bubble-wrap">
                  <div className={`message-bubble ${msg.type}`}>
                    {msg.text}
                  </div>
                  <div className="message-actions">
                    <button
                      className={`msg-action-btn${copiedIdx === idx ? " copied" : ""}`}
                      onClick={() => handleCopy(msg.text, idx)}
                      title="Copy message"
                      aria-label="Copy message"
                    >
                      {copiedIdx === idx ? "✓" : "⎘"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isSending && (
            <div className="message-row bot">
              <div className="bot-avatar" aria-hidden="true">+</div>
              <div className="typing-indicator" role="status" aria-label="AI is generating a response">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </main>

        {/* Quick actions */}
        <div className="quick-actions" role="group" aria-label="Quick emergency topics">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="quick-action-btn"
              disabled={isSending}
              onClick={() => onSend(action.prompt)}
              title={action.prompt}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Describe the emergency or ask a first-aid question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              rows={1}
              aria-label="Message input"
            />
            <div className="input-actions">
              <button
                className="send-btn"
                onClick={handleSubmit}
                disabled={isSending || !input.trim()}
                aria-label="Send message"
                title="Send (Enter)"
              >
                {isSending ? "⏳" : "↑"}
              </button>
            </div>
          </div>
          <p className="input-hint">
            Enter to send · Shift+Enter for new line · AI guidance only — call emergency services for immediate danger
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatView;

