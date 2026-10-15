function ChatInput({
  input,
  setInput,
  handleSend,
  isSending,
}) {
  return (
    <div className="chat-input-container">
      <input
        type="text"
        placeholder="Describe the emergency..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isSending) {
            handleSend();
          }
        }}
        disabled={isSending}
      />

      <button
        className="send-button"
        onClick={() => handleSend()}
        disabled={isSending || !input.trim()}
      >
        {isSending ? "..." : "Send"}
      </button>
    </div>
  );
}

export default ChatInput;