// Sidebar navigation component
// Supports collapse/expand on desktop, drawer on mobile

function Sidebar({ activeView, onNavigate, onNewChat, onClearHistory, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const navItems = [
    { id: "chat",      icon: "💬", label: "AI Assistant",         section: "main" },
    { id: "emergency", icon: "🚨", label: "Emergency Guide",      section: "main" },
    { id: "voice",     icon: "🎙️", label: "Voice Assistant",      section: "main" },
    { id: "camera",    icon: "📷", label: "Image Upload",         section: "main" },
    { id: "privacy",   icon: "🔒", label: "Privacy & Storage",    section: "settings" },
  ];

  const sections = [
    { key: "main",     label: "Features",  items: navItems.filter(i => i.section === "main") },
    { key: "settings", label: "Settings",  items: navItems.filter(i => i.section === "settings") },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${mobileOpen ? " visible" : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`} role="navigation" aria-label="Main navigation">
        {/* Brand / header */}
        <div className="sidebar-header">
          <div className="brand-icon" aria-hidden="true">+</div>
          <div className="brand-text">
            <h1>ResQ AI</h1>
            <span>Emergency Assistant</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* New chat button */}
        <div style={{ padding: "10px 8px 4px" }}>
          <button
            className="nav-item"
            onClick={() => { onNewChat(); onCloseMobile(); }}
            style={{ background: "rgba(37,99,235,0.12)", color: "#93c5fd", fontWeight: 600 }}
            title="New Conversation"
          >
            <span className="nav-icon">✏️</span>
            <span className="nav-label">New Conversation</span>
          </button>
        </div>

        {/* Nav sections */}
        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section.key}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item${activeView === item.id ? " active" : ""}`}
                  onClick={() => { onNavigate(item.id); onCloseMobile(); }}
                  title={item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="sidebar-footer">
          <button
            className="nav-item danger"
            onClick={() => { onClearHistory(); }}
            title="Clear all chat history"
          >
            <span className="nav-icon">🗑️</span>
            <span className="nav-label">Clear History</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

