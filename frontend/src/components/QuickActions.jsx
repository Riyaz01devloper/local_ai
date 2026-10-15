function QuickActions({ handleSend, isSending }) {
  return (
    <div className="quick-actions">
      <button
        disabled={isSending}
        onClick={() => handleSend("fire")}
      >
        🔥 Fire
      </button>

      <button
        disabled={isSending}
        onClick={() => handleSend("burn")}
      >
        🤕 Burn
      </button>

      <button
        disabled={isSending}
        onClick={() => handleSend("faint")}
      >
        😵 Fainting
      </button>
    </div>
  );
}

export default QuickActions;