function ActionButtons({ startListening, openCamera }) {
  return (
    <div className="action-buttons">
      <button onClick={startListening}>
        <span className="action-icon">🎙️</span>
        <span>Voice</span>
      </button>

      <button onClick={openCamera}>
        <span className="action-icon">📷</span>
        <span>Camera</span>
      </button>
    </div>
  );
}

export default ActionButtons;