function ChatBox({ messages, chatBoxRef, isSending }) {
    
  return (
    <main
      ref={chatBoxRef}
      className="chat-box"
    >
      {messages.length === 0 && (
        <div className="empty-chat">
          <div className="empty-icon">+</div>

          <h2>How can I help?</h2>

          <p>
            Describe the emergency and ResQ AI will provide immediate
            first-aid guidance.
          </p>
        </div>
      )}

      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message-row ${msg.type}`}
        >
          <div className={`message ${msg.type}`}>
            {msg.text}
          </div>
        </div>
      ))}

      {isSending && (
        <div className="message-row bot">
          <div className="message bot typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </main>
  );
}

export default ChatBox;