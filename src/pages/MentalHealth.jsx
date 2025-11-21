import { useState, useRef, useEffect } from 'react';
import { Send, Brain, AlertCircle, Phone, Mic, Square, Volume2, VolumeX, ThumbsUp, ThumbsDown, Globe } from 'lucide-react';
import axios from 'axios';

const MentalHealth = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to listen and support you. How are you feeling today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Language mapping for voice
  const languageToVoiceMap = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8002/chat', {
        text: input,
        use_context: true,
        language: selectedLanguage
      });

      const { 
        conversation_id,
        intent, 
        confidence, 
        is_crisis, 
        response: aiResponse,
        emotions_detected,
        follow_up_suggestions,
        crisis_resources,
        detected_language,
        translated_from_english
      } = response.data;

      setCurrentConversationId(conversation_id);

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        intent,
        confidence,
        is_crisis,
        emotions_detected,
        follow_up_suggestions,
        crisis_resources,
        timestamp: new Date(),
        conversation_id,
        detected_language,
        translated: translated_from_english
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (isVoiceMode && !is_crisis) {
        speakText(aiResponse, detected_language || selectedLanguage);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I\'m sorry, I\'m having trouble responding right now. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        handleVoiceInput(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPulsing(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice features');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPulsing(false);
    }
  };

  const handleVoiceInput = async (audioBlob) => {
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    
    // Send with selected language parameter
    const response = await axios.post(
      `http://localhost:8002/chat/voice?language=${selectedLanguage}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );

    const { 
      conversation_id,
      transcribed_text, 
      response: aiResponse, 
      intent, 
      confidence, 
      is_crisis,
      emotions_detected,
      voice_emotions,
      voice_confidence,
      audio_features,
      follow_up_suggestions,
      crisis_resources,
      detected_language
    } = response.data;

    setCurrentConversationId(conversation_id);

    // Add user message with voice emotion info
    // Now transcribed_text will be in the original language!
    setMessages((prev) => [...prev, {
      role: 'user',
      content: transcribed_text,
      timestamp: new Date(),
      isVoice: true,
      voiceEmotions: voice_emotions,
      voiceConfidence: voice_confidence,
      audioFeatures: audio_features,
      language: detected_language
    }]);

    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      intent,
      confidence,
      is_crisis,
      emotions_detected,
      follow_up_suggestions,
      crisis_resources,
      timestamp: new Date(),
      conversation_id,
      language: detected_language
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Speak response in detected language if voice mode enabled
    if (isVoiceMode && !is_crisis) {
      speakText(aiResponse, detected_language || selectedLanguage);
    }

  } catch (error) {
    console.error('Voice chat error:', error);
    setMessages((prev) => [...prev, {
      role: 'assistant',
      content: 'Sorry, I had trouble understanding that. Please try again.',
      timestamp: new Date(),
    }]);
  } finally {
    setLoading(false);
  }
};


  const speakText = (text, language = 'en') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Set language code for voice
      const voiceLang = languageToVoiceMap[language] || 'en-IN';
      utterance.lang = voiceLang;

      // Try to find best voice for language
      const voices = window.speechSynthesis.getVoices();
      
      // Prefer Google voices for better quality
      let preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language) && voice.name.includes('Google')
      );
      
      // Fallback to any voice matching language
      if (!preferredVoice) {
        preferredVoice = voices.find(voice => voice.lang.startsWith(language));
      }
      
      // Last resort: female English voice
      if (!preferredVoice) {
        preferredVoice = voices.find(voice =>
          voice.name.includes('Female') || 
          voice.name.includes('Samantha')
        );
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleFollowUpClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleFeedback = async (helpful) => {
    if (!currentConversationId) return;

    try {
      await axios.post('http://localhost:8002/feedback', {
        conversation_id: currentConversationId,
        rating: helpful ? 5 : 2,
        helpful: helpful,
        comment: helpful ? 'Helpful response' : 'Not helpful'
      });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const resetConversation = async () => {
    try {
      await axios.post('http://localhost:8002/conversation/reset');
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m here to listen and support you. How are you feeling today?',
          timestamp: new Date(),
        },
      ]);
      setCurrentConversationId(null);
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Mental Health Support</h1>
        <p className="text-lg text-gray-600">
          AI-powered support with voice conversation, multilingual, and crisis detection
        </p>
        <div className="mt-4 flex items-center justify-center space-x-4 flex-wrap gap-2">
          <div className="inline-block px-6 py-2 bg-purple-100 text-purple-800 rounded-full font-semibold">
            Advanced Context-Aware AI • 95%+ Accuracy
          </div>
          <div className="inline-block px-6 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
            🌍 10+ Languages
          </div>
          <button
            onClick={resetConversation}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-semibold transition"
          >
            Reset Chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: '700px' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : message.is_crisis
                      ? 'bg-red-100 border-2 border-red-500 text-red-900'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {/* Voice Message Badge */}
                    {message.isVoice && (
                      <div className="mb-2">
                        <div className="flex items-center text-xs opacity-70 animate-pulse mb-2">
                          <Mic className="w-3 h-3 mr-1" />
                          Voice message
                        </div>
                        {message.voiceEmotions && message.voiceEmotions.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-semibold mb-1">Voice Analysis:</p>
                            <div className="flex flex-wrap gap-1">
                              {message.voiceEmotions.map((emotion, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold"
                                >
                                  🎤 {emotion}
                                </span>
                              ))}
                            </div>
                            {message.audioFeatures && (
                              <div className="mt-2 text-xs opacity-60">
                                Pitch: {message.audioFeatures.pitch_hz}Hz • 
                                Energy: {message.audioFeatures.energy_level} • 
                                Tempo: {message.audioFeatures.tempo_bpm} BPM
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Translation Badge */}
                    {message.translated && (
                      <div className="mb-2 flex items-center text-xs opacity-70">
                        <Globe className="w-3 h-3 mr-1" />
                        Auto-translated
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {/* Emotions Detected */}
                    {message.emotions_detected && message.emotions_detected.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.emotions_detected.map((emotion, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold"
                          >
                            💭 {emotion}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Follow-up Suggestions */}
                    {message.follow_up_suggestions && message.follow_up_suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold opacity-70">You might want to talk about:</p>
                        {message.follow_up_suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleFollowUpClick(suggestion)}
                            className="block w-full text-left px-3 py-2 bg-white bg-opacity-50 hover:bg-opacity-70 rounded-lg text-xs transition"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Crisis Resources */}
                    {message.crisis_resources && (
                      <div className="mt-4 p-4 bg-white rounded-lg space-y-2">
                        <p className="font-bold text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Emergency Helplines:
                        </p>
                        {Object.entries(message.crisis_resources.helplines).map(([name, number]) => (
                          <div key={name} className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-red-600" />
                            <span className="font-semibold">{name}:</span>
                            <a href={`tel:${number}`} className="ml-2 text-blue-600 hover:underline font-bold">
                              {number}
                            </a>
                          </div>
                        ))}
                        <p className="text-xs text-red-700 mt-2 font-semibold">
                          {message.crisis_resources.message}
                        </p>
                      </div>
                    )}

                    {/* Intent Badge */}
                    {message.intent && !message.is_crisis && (
                      <div className="mt-2 text-xs opacity-70">
                        Intent: {message.intent} ({(message.confidence * 100).toFixed(1)}%)
                      </div>
                    )}

                    {/* Feedback Buttons */}
                    {message.role === 'assistant' && !message.is_crisis && index === messages.length - 1 && (
                      <div className="mt-3 flex items-center space-x-2">
                        <button
                          onClick={() => handleFeedback(true)}
                          className="p-1 hover:bg-green-100 rounded transition"
                          title="Helpful"
                        >
                          <ThumbsUp className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleFeedback(false)}
                          className="p-1 hover:bg-red-100 rounded transition"
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading Animation */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {/* Language Selector */}
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Select Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
                  <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Type or speak in any language - AI will auto-detect and translate!
                </p>
              </div>

              {/* Voice Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="voice-mode"
                    checked={isVoiceMode}
                    onChange={(e) => setIsVoiceMode(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="voice-mode" className="text-sm font-medium text-gray-700">
                    🔊 Voice Mode (AI speaks responses)
                  </label>
                </div>
                
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 text-sm"
                  >
                    <VolumeX className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                )}
              </div>

              {/* Voice Visualizer */}
              {isRecording && (
                <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex space-x-1">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 40 + 10}px`,
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Recorder Button */}
              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 shadow-2xl scale-110'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}

                  {isPulsing && (
                    <>
                      <span className="absolute w-full h-full rounded-full bg-red-400 animate-ping opacity-75"></span>
                      <span className="absolute w-full h-full rounded-full bg-red-400 animate-pulse opacity-50"></span>
                    </>
                  )}
                </button>

                {isRecording && (
                  <div className="ml-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 font-medium">Recording... Click to stop</span>
                  </div>
                )}
                
                {!isRecording && (
                  <div className="ml-4 text-sm text-gray-500">
                    🎤 Click to record voice
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message or use voice..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading || isRecording}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || isRecording}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Crisis Resources */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-bold text-red-900">Crisis Resources</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-red-900">AASRA (India)</p>
                <a href="tel:9152987821" className="text-red-600 hover:underline text-lg font-bold">
                  91529 87821
                </a>
                <p className="text-xs text-red-700">24/7 Suicide Prevention</p>
              </div>
              <div>
                <p className="font-semibold text-red-900">Vandrevala Foundation</p>
                <a href="tel:18602662345" className="text-red-600 hover:underline text-lg font-bold">
                  1860 2662 345
                </a>
                <p className="text-xs text-red-700">24/7 Crisis Support</p>
              </div>
              <div>
                <p className="font-semibold text-red-900">iCall</p>
                <a href="tel:9152987821" className="text-red-600 hover:underline text-lg font-bold">
                  9152987821
                </a>
                <p className="text-xs text-red-700">Mon-Sat, 8 AM - 10 PM</p>
              </div>
              <div>
                <p className="font-semibold text-red-900">Emergency</p>
                <a href="tel:112" className="text-red-600 hover:underline text-lg font-bold">112</a>
                <p className="text-xs text-red-700">National Emergency</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Advanced Features</h3>
            <ul className="space-y-3">
              {[
                '🎤 Voice conversations',
                '🌍 10+ Indian languages',
                '🧠 Context awareness',
                '💭 Emotion detection',
                '🎯 Voice emotion analysis',
                '🚨 Crisis detection',
                '💡 Follow-up suggestions',
                '📊 Self-learning AI',
                '🔒 Confidential',
                '⚡ 95%+ accuracy',
              ].map((feature) => (
                <li key={feature} className="flex items-start">
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to Use */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">How to Use</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li>1. Select your language</li>
              <li>2. Type or speak your message</li>
              <li>3. Enable voice mode for AI responses</li>
              <li>4. Click follow-ups to continue</li>
              <li>5. Rate responses to improve AI</li>
              <li>6. Call helplines in crisis</li>
            </ol>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <p className="text-sm text-gray-600">
              <strong>Disclaimer:</strong> This AI assistant provides support but is not a replacement for professional mental health care. If you're in crisis, please contact emergency services or a mental health professional immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;
