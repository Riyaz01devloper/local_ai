function Header({ onNewChat, onClear }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">+</div>

        <div>
          <h1>ResQ AI</h1>
          <p>Emergency Assistance</p>
        </div>
      </div>

      <div className="header-right">
        <button
          className="remove-btn"
          onClick={onClear}
        >
          🗑 Clear
        </button>

        <button
          className="new-chat-btn"
          onClick={onNewChat}
        >
          + New Chat
        </button>

        <div className="status">
          <span className="status-dot"></span>
          Ready
        </div>
      </div>
    </header>
  );
}

export default Header;