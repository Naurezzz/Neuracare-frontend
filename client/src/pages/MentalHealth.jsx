import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, AlertCircle, Mic, Square, 
  Volume2, Globe, Settings, Menu, ShieldCheck, 
  ChevronLeft, Activity
} from 'lucide-react';
import axios from 'axios';

// --- STYLE SYSTEM ---
const customStyles = `
  /* Isolate the chat scrollbar from the window scrollbar */
  .chat-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
  }
  .chat-container::-webkit-scrollbar {
    width: 6px;
  }
  .chat-container::-webkit-scrollbar-track {
    background: transparent;
  }
  .chat-container::-webkit-scrollbar-thumb {
    background-color: rgba(148, 163, 184, 0.3);
    border-radius: 20px;
  }

  /* Animations */
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .msg-anim { animation: slideIn 0.3s cubic-bezier(0.2, 0.9, 0.4, 1) forwards; }

  @keyframes pulse-soft {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  .recording-pulse { animation: pulse-soft 2s infinite; }
`;

const MentalHealth = () => {
  // --- STATE ---
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello. I\'m VitalCare Mind. I\'m here to listen. How are you feeling right now?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- REFS ---
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // --- AUTO SCROLL ---
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  // --- HANDLERS ---
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8002/chat', {
        text: input, use_context: true, language: selectedLanguage
      });
      
      const data = response.data;
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, ...data, timestamp: new Date() }]);
      
      if (isVoiceMode && !data.is_crisis) {
        speakText(data.response, data.detected_language || selectedLanguage);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m having trouble connecting. Please try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  // --- AUDIO ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        handleVoiceInput(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) { alert("Microphone access denied"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceInput = async (blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', blob, 'recording.wav');
    try {
      const res = await axios.post(`http://localhost:8002/chat/voice?language=${selectedLanguage}`, formData);
      const data = res.data;
      setMessages(prev => [...prev, { role: 'user', content: data.transcribed_text, isVoice: true, ...data, timestamp: new Date() }]);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, ...data, timestamp: new Date() }]);
      if (isVoiceMode && !data.is_crisis) speakText(data.response, data.detected_language);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const speakText = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  const handleReset = async () => {
    await axios.post('http://localhost:8002/conversation/reset').catch(()=>{});
    setMessages([{ role: 'assistant', content: 'Hello. I\'m VitalCare Mind. I\'m here to listen. How are you feeling right now?', timestamp: new Date() }]);
  };

  return (
    /* KEY FIX: Use `h-[calc(100vh-100px)]` (adjust 100px based on your Nav+Footer height).
       This forces the chat to fit strictly between them without overflowing the window.
    */
    <div className="mt-20 w-full h-[calc(100vh-120px)] flex flex-col md:flex-row bg-slate-50 overflow-hidden relative border-t border-slate-200">
      <style>{customStyles}</style>

      {/* === SIDEBAR === */}
      <aside 
        className={`
          ${sidebarOpen ? ' w-80 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'} 
          bg-slate-900 h-full transition-all duration-300 ease-in-out flex flex-col shrink-0 z-20
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 whitespace-nowrap overflow-hidden">
          <div className="relative flex items-center justify-center w-10 h-10  rounded-xl shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-105">
                          <Activity className="w-8 h-8 text-cyan-600 animate-pulse" />
                        </div>
          <span className={`ml-3 font-bold text-white text-lg tracking-tight transition-opacity duration-300 ${!sidebarOpen && 'md:opacity-0'}`}>
            VitalCare
          </span>
        </div>

        {/* Sidebar Controls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Language */}
          <div className={`space-y-2 transition-opacity duration-300 ${!sidebarOpen && 'md:opacity-0 md:hidden'}`}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Language</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 appearance-none border border-slate-700 focus:border-cyan-500 outline-none"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
              </select>
            </div>
          </div>

          {/* Voice Toggle */}
          <div className={`space-y-2 transition-opacity duration-300 ${!sidebarOpen && 'md:opacity-0 md:hidden'}`}>
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Output</label>
             <button 
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                isVoiceMode ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm font-medium">Voice</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${isVoiceMode ? 'bg-cyan-400' : 'bg-slate-600'}`} />
            </button>
          </div>

          {/* Emergency Card (Hidden when collapsed) */}
          <div className={`mt-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4 ${!sidebarOpen && 'hidden'}`}>
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">Crisis Support</span>
            </div>
            <div className="flex justify-between text-sm text-slate-300">
               <span>Helpline</span>
               <a href="tel:112" className="font-mono font-bold text-red-400 hover:text-white">112</a>
            </div>
          </div>
        </div>

        {/* Sidebar Toggler */}
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center md:justify-start gap-3 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className={`text-sm font-medium ${!sidebarOpen && 'md:hidden'}`}>Collapse</span>
          </button>
        </div>
      </aside>


      {/* === MAIN CHAT AREA === */}
      <main className="flex-1 flex flex-col h-full relative bg-slate-50/50 backdrop-blur-sm">
        
        {/* Internal Header (Toolbar) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-bold text-slate-800">Mental Health Companion</h2>
            <div className="hidden md:flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              <Activity className="w-3 h-3 mr-1" /> Live
            </div>
          </div>
          <button onClick={handleReset} className="text-m font-bold text-slate-500 hover:text-cyan-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
             Reset Chat
          </button>
        </header>

        {/* CHAT SCROLL CONTAINER */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto chat-container p-4 md:p-8 space-y-6">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isCrisis = msg.is_crisis;
            return (
              <div key={idx} className={`flex w-full msg-anim ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col max-w-[85%] md:max-w-[65%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    relative px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                    ${isUser ? 'bg-slate-800 text-white rounded-br-sm' : isCrisis ? 'bg-red-50 border border-red-200 text-slate-800 rounded-bl-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}
                  `}>
                    {msg.isVoice && <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-70 mb-2"><Mic className="w-3 h-3"/> Voice Input</div>}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {!isUser && !isCrisis && msg.follow_up_suggestions && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                        {msg.follow_up_suggestions.map((s, i) => (
                          <button key={i} onClick={() => setInput(s)} className="text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-3 py-1 rounded-full transition-colors border border-cyan-100">{s}</button>
                        ))}
                      </div>
                    )}
                    {isCrisis && (
                       <div className="mt-3 bg-white p-3 rounded border-l-4 border-red-500">
                         <div className="flex items-center gap-2 text-red-600 font-bold text-sm"><AlertCircle className="w-4 h-4" /> Crisis Detected</div>
                         <div className="mt-2 text-xs text-slate-600">Please contact emergency services immediately. <br/> <span className="font-bold text-slate-800">Dial 112</span></div>
                       </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 px-1">{msg.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start msg-anim">
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT DOCK */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 z-10">
          <div className="max-w-3xl mx-auto relative flex items-end gap-2">
            {isRecording && (
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-bounce">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> Listening...
               </div>
            )}
            
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-50 text-red-500 recording-pulse' : 'bg-slate-100 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600'}`}
            >
              {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-cyan-100 focus-within:border-cyan-300 transition-all flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
                placeholder={isRecording ? "Listening..." : "Type here..."}
                className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${input.trim() ? 'bg-slate-900 text-white hover:scale-105 shadow-md' : 'bg-slate-100 text-slate-300'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentalHealth;