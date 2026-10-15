import { useState, useRef, useEffect } from "react";

/**
 * VoiceView — voice input assistant.
 *
 * Uses the Web Speech API (SpeechRecognition).
 * Properly cleans up the recognition instance to prevent memory leaks.
 */
function VoiceView({ onTranscript, isSending }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  // Check support at component initialization — not inside an effect
  const [supported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount only — P1-5 fix
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }

    // Abort any existing instance before creating a new one — P1-5 fix
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    setError(null);
    setTranscript("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      const messages = {
        "no-speech": "No speech detected. Please try again.",
        "audio-capture": "Microphone access failed.",
        "not-allowed": "Microphone permission denied. Please allow microphone access.",
        "network": "Network error during voice recognition.",
      };
      setError(messages[event.error] || `Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSendTranscript = () => {
    if (transcript.trim() && onTranscript) {
      onTranscript(transcript.trim());
      setTranscript("");
    }
  };

  if (!supported) {
    return (
      <div className="page-view">
        <div className="voice-view">
          <div className="empty-state-icon">🎙️</div>
          <h2 style={{ fontSize: 16, color: "var(--text-primary)" }}>Voice Not Supported</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13.5, textAlign: "center", maxWidth: 300 }}>
            Your browser does not support the Web Speech API. Try Chrome or Edge for voice input.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-view">
      <div className="voice-view">
        <button
          className={`voice-orb${isListening ? " listening" : ""}`}
          onClick={isListening ? stopListening : startListening}
          disabled={isSending}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          title={isListening ? "Click to stop" : "Click to start voice input"}
        >
          {isListening ? "🎙️" : "🎤"}
        </button>

        <p className="voice-status">
          {isListening
            ? "Listening… speak now"
            : transcript
            ? "Tap send to submit, or tap mic to try again"
            : "Tap the mic to start speaking"}
        </p>

        {error && (
          <p style={{ color: "var(--red)", fontSize: 13, textAlign: "center", maxWidth: 320 }}>
            {error}
          </p>
        )}

        {transcript && (
          <div style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 16px",
            maxWidth: 420,
            width: "100%",
            textAlign: "left",
          }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Transcript</p>
            <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>
              "{transcript}"
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {!isListening && (
            <button
              className="voice-btn"
              onClick={startListening}
              disabled={isSending}
            >
              {transcript ? "🔁 Try Again" : "Start Listening"}
            </button>
          )}

          {isListening && (
            <button
              className="voice-btn stop"
              onClick={stopListening}
            >
              ⏹ Stop
            </button>
          )}

          {transcript && !isListening && (
            <button
              className="voice-btn"
              onClick={handleSendTranscript}
              disabled={isSending}
              style={{ background: "var(--green)" }}
            >
              ↑ Send to AI
            </button>
          )}
        </div>

        <p style={{ fontSize: 11.5, color: "var(--text-muted)", textAlign: "center", maxWidth: 320 }}>
          Voice recognition runs in your browser and requires microphone access.
          For emergencies, always call your local emergency services directly.
        </p>
      </div>
    </div>
  );
}

export default VoiceView;
