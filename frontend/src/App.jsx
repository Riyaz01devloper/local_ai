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

const USER_ID = "user_1";
const VOICE_PREF_KEY = "resq_voice_reply_enabled";

function App() {
  // ── Navigation ──────────────────────────────────────────────
  const [activeView, setActiveView] = useState("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Chat state ────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  // ── Voice / Speech state ──────────────────────────────────────
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(VOICE_PREF_KEY);
      return saved !== null ? saved === "true" : true;
    } catch (e) {
      return true;
    }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingIdx, setCurrentlySpeakingIdx] = useState(null);

  // ── Camera state ──────────────────────────────────────────────
  const [showCamera, setShowCamera] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const previewImageRef = useRef(null);

  // ── Modal state ───────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState(null);

  // ── Online status ─────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Stop Speech Synthesis ─────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentlySpeakingIdx(null);
  }, []);

  // ── Toggle Voice Reply On/Off ─────────────────────────────────
  const toggleVoiceReply = useCallback(() => {
    setVoiceReplyEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(VOICE_PREF_KEY, String(next));
      } catch (e) {
        // ignore storage errors
      }
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  // ── Speak text via TTS ─────────────────────────────────────────
  const speak = useCallback(
    (text, msgIdx = null) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();

      // Clean markdown tags & asterisks for cleaner speech
      const cleanText = text
        .replace(/[*#_`~>]/g, "")
        .replace(/\((?:Note|Tip):.*?\)/gi, "")
        .replace(/\n+/g, ". ")
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (msgIdx !== null) setCurrentlySpeakingIdx(msgIdx);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingIdx(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingIdx(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  // Handle on-demand speaking/stopping of a specific message
  const handleSpeakMessage = useCallback(
    (text, msgIdx) => {
      if (isSpeaking && currentlySpeakingIdx === msgIdx) {
        stopSpeaking();
      } else {
        speak(text, msgIdx);
      }
    },
    [isSpeaking, currentlySpeakingIdx, speak, stopSpeaking]
  );

  // ── Load chat history on mount ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const history = await getChatHistory(USER_ID);
        if (cancelled) return;

        const formatted = history.flatMap((chat) => [
          { type: "user", text: chat.message },
          { type: "bot", text: chat.response },
        ]);

        setMessages(formatted);
      } catch (err) {
        if (!cancelled) {
          console.warn("Could not load chat history:", err.message);
        }
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Image URL cleanup on unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      if (previewImageRef.current) {
        URL.revokeObjectURL(previewImageRef.current);
      }
    };
  }, []);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ── Send message ──────────────────────────────────────────────
  const handleSend = useCallback(
    async (text) => {
      const userText = text?.trim();
      if (!userText || isSending) return;

      stopSpeaking();
      setIsSending(true);
      setActiveView("chat");

      const newMessages = [...messages, { type: "user", text: userText }];
      setMessages(newMessages);
      const botMsgIdx = newMessages.length; // index of forthcoming bot response

      try {
        const response = await getAIResponse(userText);

        setMessages((prev) => [...prev, { type: "bot", text: response }]);

        if (voiceReplyEnabled) {
          speak(response, botMsgIdx);
        }

        // Persist to backend & local storage
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
    },
    [isSending, messages, voiceReplyEnabled, speak, stopSpeaking]
  );

  // ── New conversation (clear local only) ───────────────────────
  const handleNewChat = useCallback(() => {
    stopSpeaking();
    setMessages([]);
    setActiveView("chat");
  }, [stopSpeaking]);

  // ── Clear all history (with confirmation) ─────────────────────
  const handleClearHistory = useCallback(() => {
    setConfirmModal({
      title: "Delete all chat history?",
      description:
        "This will permanently delete all saved conversations from the database and local cache. This action cannot be undone.",
      confirmLabel: "Delete History",
      confirmDanger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        stopSpeaking();
        try {
          await clearChatHistory(USER_ID);
          setMessages([]);
        } catch (err) {
          console.error("Failed to clear history:", err.message);
        }
      },
    });
  }, [stopSpeaking]);

  // ── Camera ────────────────────────────────────────────────────
  const handleToggleCamera = useCallback(() => {
    setShowCamera((prev) => !prev);
  }, []);

  const handleCaptureImage = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (previewImageRef.current) {
        URL.revokeObjectURL(previewImageRef.current);
      }

      const url = URL.createObjectURL(file);
      previewImageRef.current = url;
      setPreviewImage(url);

      const notice =
        "📷 Image received. Image-based emergency analysis is in preview. Please describe the emergency in text for immediate guidance.";

      setMessages((prev) => [...prev, { type: "bot", text: notice }]);
      if (voiceReplyEnabled) {
        speak(notice);
      }
    },
    [voiceReplyEnabled, speak]
  );

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
            isOnline={isOnline}
            // Voice reply controls
            voiceReplyEnabled={voiceReplyEnabled}
            isSpeaking={isSpeaking}
            currentlySpeakingIdx={currentlySpeakingIdx}
            onToggleVoiceReply={toggleVoiceReply}
            onStopSpeaking={stopSpeaking}
            onSpeakMessage={handleSpeakMessage}
            onNewChat={handleNewChat}
          />
        );

      case "emergency":
        return (
          <EmergencyView
            onSelectTopic={(prompt) => {
              setActiveView("chat");
              handleSend(prompt);
            }}
          />
        );

      case "voice":
        return (
          <VoiceView
            isSending={isSending}
            onTranscript={(text) => {
              setActiveView("chat");
              handleSend(text);
            }}
          />
        );

      case "privacy":
        return (
          <PrivacyView
            isOnline={isOnline}
            messageCount={messages.length}
            onClearAllData={handleClearHistory}
            voiceReplyEnabled={voiceReplyEnabled}
            onToggleVoiceReply={toggleVoiceReply}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onNewChat={handleNewChat}
        onClearHistory={handleClearHistory}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isOnline={isOnline}
        voiceReplyEnabled={voiceReplyEnabled}
        onToggleVoiceReply={toggleVoiceReply}
        isSpeaking={isSpeaking}
        onStopSpeaking={stopSpeaking}
      />

      <div className="main-content">
        {/* Global SaaS Topbar */}
        <header className="topbar">
          <button
            className="topbar-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <div className="topbar-brand">
            <span className="topbar-logo">+</span>
            <span className="topbar-title">ResQ AI</span>
            <span className="topbar-badge">Emergency Assistant</span>
          </div>

          <div className="topbar-right">
            {/* Active Speech Indicator & Stop Control */}
            {isSpeaking && (
              <button
                className="voice-speaking-pill active"
                onClick={stopSpeaking}
                title="Stop speaking voice response"
              >
                <span className="audio-wave">
                  <span />
                  <span />
                  <span />
                </span>
                <span>Stop Voice</span>
              </button>
            )}

            {/* Voice Toggle */}
            <button
              className={`voice-toggle-btn ${voiceReplyEnabled ? "enabled" : "disabled"}`}
              onClick={toggleVoiceReply}
              title={voiceReplyEnabled ? "Voice replies are ON (Click to mute)" : "Voice replies are MUTED (Click to enable)"}
            >
              {voiceReplyEnabled ? "🔊 Voice ON" : "🔇 Voice OFF"}
            </button>

            {/* Network / Model Status Badge */}
            <div className="status-badge" title={isOnline ? "Connected to Cloud AI & Local Rules" : "Offline First-Aid Triage Mode"}>
              <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
        </header>

        {renderView()}
      </div>

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
