/**
 * PrivacyView — Privacy controls and offline status.
 *
 * Honest about:
 * - Where conversations are stored (PostgreSQL backend + localStorage)
 * - Where inference runs (backend API → Gemini for AI, local rule engine for keywords)
 * - What data is kept and how to delete it
 */
function PrivacyView({ onClearAllData, messageCount, isOnline }) {
  return (
    <div className="page-view">
      <div className="panel-view">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
          Privacy & Storage
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>
          ResQ AI is designed to respect your privacy. Here is exactly what this application stores and where.
        </p>

        {/* Connectivity */}
        <div className="panel-section">
          <div className="panel-section-title">Connection Status</div>
          <div className="panel-card">
            <div className="panel-row">
              <div>
                <div className="panel-row-label">Internet connection</div>
                <div className="panel-row-desc">Required for AI responses via Gemini API</div>
              </div>
              <div className={`panel-row-value${isOnline ? " online" : " error"}`}>
                {isOnline ? "● Online" : "● Offline"}
              </div>
            </div>
            <div className="panel-row">
              <div>
                <div className="panel-row-label">AI inference location</div>
                <div className="panel-row-desc">Emergency keyword responses run locally; AI responses are processed by Google Gemini API via your backend server</div>
              </div>
              <div className="panel-row-value" style={{ color: "var(--amber)" }}>
                Mixed
              </div>
            </div>
            <div className="panel-row">
              <div>
                <div className="panel-row-label">Features available offline</div>
                <div className="panel-row-desc">Emergency first-aid guide (static), keyword-based responses</div>
              </div>
              <div className="panel-row-value local">Yes (limited)</div>
            </div>
          </div>
        </div>

        {/* Data storage */}
        <div className="panel-section">
          <div className="panel-section-title">Data Storage</div>
          <div className="panel-card">
            <div className="panel-row">
              <div>
                <div className="panel-row-label">Conversation history</div>
                <div className="panel-row-desc">Stored in a PostgreSQL database on your backend server (localhost:5000). Not sent to third parties.</div>
              </div>
              <div className="panel-row-value">Local DB</div>
            </div>
            <div className="panel-row">
              <div>
                <div className="panel-row-label">Messages in current session</div>
                <div className="panel-row-desc">Held in browser memory only until you close or refresh the page.</div>
              </div>
              <div className="panel-row-value">{messageCount} message{messageCount !== 1 ? "s" : ""}</div>
            </div>
            <div className="panel-row">
              <div>
                <div className="panel-row-label">AI model data</div>
                <div className="panel-row-desc">No local AI model is downloaded. Requests go to Google Gemini API.</div>
              </div>
              <div className="panel-row-value">Cloud API</div>
            </div>
            <div className="panel-row">
              <div>
                <div className="panel-row-label">Analytics & tracking</div>
                <div className="panel-row-desc">This application collects no analytics, telemetry, or user tracking data.</div>
              </div>
              <div className="panel-row-value online">None</div>
            </div>
          </div>
        </div>

        {/* Third-party services */}
        <div className="panel-section">
          <div className="panel-section-title">Third-Party Services</div>
          <div className="panel-card">
            <div className="panel-row">
              <div>
                <div className="panel-row-label">Google Gemini API</div>
                <div className="panel-row-desc">
                  When you send a message that is not matched by the local rule engine, your message text is sent to the Google Gemini API via your backend. Google's{" "}
                  <a
                    href="https://ai.google.dev/gemini-api/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--sky)" }}
                  >
                    Gemini API Terms
                  </a>{" "}
                  apply.
                </div>
              </div>
              <div className="panel-row-value" style={{ color: "var(--amber)" }}>Used</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="panel-section">
          <div className="panel-section-title">Data Controls</div>
          <div className="panel-card">
            <div className="panel-row">
              <div>
                <div className="panel-row-label">Clear conversation history</div>
                <div className="panel-row-desc">Permanently deletes all saved conversations from the backend database.</div>
              </div>
              <button
                className="btn-danger"
                onClick={onClearAllData}
                style={{ flexShrink: 0 }}
              >
                Delete History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyView;

