import { useEffect, useRef, useState, useCallback } from "react";

import { getAIResponse } from "./services/ai";
import { saveChat, getChatHistory, clearChatHistory } from "./services/chatApi";

import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import EmergencyView from "./components/EmergencyView";
import VoiceView from "./components/VoiceView";
import PrivacyView from "./components/PrivacyView";
import ConfirmModal from "./components/ConfirmModal";

import "./styles/App.css";

// Single shared user for this deployment.
// In a real multi-user app this would come from an auth system.
const USER_ID = "user_1";

function App() {
  // ── Navigation ──────────────────────────────────────────────
  const [activeView, setActiveView] = useState("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Chat state ────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  // historyLoading could gate a skeleton UI in future — unused for now

  // ── Camera state ──────────────────────────────────────────────
  const [showCamera, setShowCamera] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const previewImageRef = useRef(null); // track for cleanup

  // ── Modal state ───────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState(null);

  // ── Online status ─────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Load chat history on mount ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const history = await getChatHistory(USER_ID);
        if (cancelled) return;

        const formatted = history.flatMap((chat) => [
          { type: "user", text: chat.message },
          { type: "bot",  text: chat.response },
        ]);

        setMessages(formatted);
      } catch (err) {
        if (!cancelled) {
          console.warn("Could not load chat history (backend may not be running):", err.message);
          // Not a fatal error — app works without history
        }
      } finally {
        // history load complete — could update a loading indicator here
      }
    };

    loadHistory();
    return () => { cancelled = true; };
  }, []);

  // ── Image URL cleanup on unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      if (previewImageRef.current) {
        URL.revokeObjectURL(previewImageRef.current);
      }
    };
  }, []);

  // ── TTS speak ─────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Send message ──────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    const userText = text?.trim();
    if (!userText || isSending) return;

    setIsSending(true);
    setActiveView("chat");

    setMessages((prev) => [...prev, { type: "user", text: userText }]);

    try {
      const response = await getAIResponse(userText);

      setMessages((prev) => [...prev, { type: "bot", text: response }]);

      speak(response);

      // Persist to backend (non-fatal if it fails)
      try {
        await saveChat(USER_ID, userText, response);
      } catch (err) {
        console.warn("Failed to persist chat:", err.message);
      }
    } catch (err) {
      console.error("Failed to get AI response:", err);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "⚠️ Unable to process your request. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }, [isSending, speak]);

  // ── New conversation (clear local only) ───────────────────────
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setActiveView("chat");
  }, []);

  // ── Clear all history (with confirmation) ─────────────────────
  const handleClearHistory = useCallback(() => {
    setConfirmModal({
      title: "Delete all chat history?",
      description:
        "This will permanently delete all saved conversations from the database. This action cannot be undone.",
      confirmLabel: "Delete History",
      confirmDanger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await clearChatHistory(USER_ID);
          setMessages([]);
        } catch (err) {
          console.error("Failed to clear history:", err.message);
        }
      },
    });
  }, []);

  // ── Camera ────────────────────────────────────────────────────
  const handleToggleCamera = useCallback(() => {
    setShowCamera((prev) => !prev);
  }, []);

  const handleCaptureImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // P1-6 fix: revoke previous object URL
    if (previewImageRef.current) {
      URL.revokeObjectURL(previewImageRef.current);
    }

    const url = URL.createObjectURL(file);
    previewImageRef.current = url;
    setPreviewImage(url);

    const notice =
      "📷 Image received. Image-based emergency analysis is not yet available — " +
      "visual AI model support is pending. Please describe the emergency in text for guidance.";

    setMessages((prev) => [...prev, { type: "bot", text: notice }]);
    speak(notice);
  }, [speak]);

  // ── Render ────────────────────────────────────────────────────
  const renderView = () => {
    switch (activeView) {
      case "chat":
        return (
          <ChatView
            messages={messages}
            isSending={isSending}
            onSend={handleSend}
            onVoice={() => setActiveView("voice")}
            showCamera={showCamera}
            onToggleCamera={handleToggleCamera}
            onCaptureImage={handleCaptureImage}
            previewImage={previewImage}
          />
        );
      case "emergency":
        return (
          <EmergencyView
            onAskAI={(text) => { handleSend(text); setActiveView("chat"); }}
          />
        );
      case "voice":
        return (
          <VoiceView
            onTranscript={(text) => { handleSend(text); setActiveView("chat"); }}
            isSending={isSending}
          />
        );
      case "camera":
        setShowCamera(true);
        setActiveView("chat");
        return null;
      case "privacy":
        return (
          <PrivacyView
            onClearAllData={handleClearHistory}
            messageCount={messages.length}
            isOnline={isOnline}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onNewChat={handleNewChat}
        onClearHistory={handleClearHistory}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <div className="main-content">
        {/* Mobile top bar */}
        <header className="topbar">
          <button
            className="topbar-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <span className="topbar-title">ResQ AI</span>
          <div className="topbar-right">
            <span
              className="status-badge"
              title={isOnline ? "Connected to backend" : "Offline — using local fallback"}
            >
              <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </header>

        {/* Active page view */}
        {renderView()}
      </div>

      {/* Confirmation modal */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          description={confirmModal.description}
          confirmLabel={confirmModal.confirmLabel}
          confirmDanger={confirmModal.confirmDanger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

export default App;