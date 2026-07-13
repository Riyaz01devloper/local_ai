import { useState } from "react";
import { getAIResponse } from "./services/ai";
function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const[showCamera, setShowCamera] = useState(false);
  const[image,setImage]=useState(null);

  const getResponse = (text) => {
    text = text.toLowerCase();

    if (text.includes("burn")) {
      return "Run cool water over the burn for 10 minutes.";
    }
    if (text.includes("fire")) {
      return "Move away from fire and cover your nose with cloth.";
    }
    if (text.includes("faint")) {
      return "Check breathing and keep the person lying flat.";
    }

    return "Stay calm. Help is on the way.";
  };

  const handleSend = async (text) => {
  const userText = text || input;
  if (!userText) return;

  const userMsg = { type: "user", text: userText };
  setMessages((prev) => [...prev, userMsg]);

  const response =
    (await getAIResponse(userText)) || getResponse(userText);

  const botMsg = { type: "bot", text: response };

  speak(response);

  setMessages((prev) => [...prev, botMsg]);
  setInput("");
};
  // 🎤 Voice Recognition
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.start();

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      handleSend(speechText);
    };
  };
const speak = (text)=>{
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate=1;
  msg.pitch=1;
  speechSynthesis.speak(msg);
}
const handleImageAI = (file) =>{
  const response = "Image analyzed. Possible injury detected. Apply basic first aid.";

  const botMsg={type:"bot", text:response};
  speak(response);
  setMessages((prev)=>[...prev,botMsg]);
}

const openCamera = () =>{
  setShowCamera(true);
}
const captureImage = (e) =>{
  const file =e.target.files[0];
  if(file){
    setImage(URL.createObjectURL(file));
    handleImageAI(file);
  }
};
  return (
  <div style={{
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px"
  }}>
    
    <h1 style={{ marginBottom: "20px" }}>🚑 AI Emergency Assistant</h1>

    {/* Chat Box */}
    <div style={{
      width: "100%",
      maxWidth: "500px",
      height: "300px",
      overflowY: "auto",
      background: "#1e293b",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "15px"
    }}>
      {messages.map((msg, index) => (
        <div key={index} style={{
          marginBottom: "10px",
          textAlign: msg.type === "user" ? "right" : "left"
        }}>
          <span style={{
            background: msg.type === "user" ? "#3b82f6" : "#334155",
            padding: "8px 12px",
            borderRadius: "10px",
            display: "inline-block"
          }}>
            {msg.text}
          </span>
        </div>
      ))}
    </div>

    {/* Input */}
    <div style={{ display: "flex", width: "100%", maxWidth: "500px" }}>
      <input
        type="text"
        placeholder="Describe emergency..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "5px",
          border: "none"
        }}
      />

      <button onClick={() => handleSend()} style={{
        marginLeft: "5px",
        padding: "10px",
        background: "#22c55e",
        border: "none",
        color: "white",
        borderRadius: "5px"
      }}>
        Send
      </button>
    </div>

    <div style={{ marginTop: "10px" }}>
  <button onClick={() => handleSend("fire")} style={{ marginRight: "5px" }}>
    🔥 Fire
  </button>

  <button onClick={() => handleSend("burn")} style={{ marginRight: "5px" }}>
    🤕 Burn
  </button>

  <button onClick={() => handleSend("faint")}>
    😵 Faint
  </button>
</div>

    {/* Action Buttons */}
    <div style={{ marginTop: "15px" }}>
      <button onClick={startListening} style={{ marginRight: "10px" }}>
        🎤 Speak
      </button>

      <button onClick={openCamera}>
        📷 Camera
      </button>
    </div>

    {/* Camera */}
    {showCamera && (
      <input
        type="file"
        accept="image/*"
        onChange={captureImage}
        style={{ marginTop: "10px" }}
      />
    )}

  </div>
);
}

export default App;