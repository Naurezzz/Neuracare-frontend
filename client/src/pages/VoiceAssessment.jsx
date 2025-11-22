import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, RefreshCw, TrendingUp, Sparkles, Loader, Play, Pause } from 'lucide-react';
import axios from 'axios';

const VoiceAssessment = () => {
  const [level, setLevel] = useState('beginner');
  const [prompt, setPrompt] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [isPlayingFeedback, setIsPlayingFeedback] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    generateNewPrompt();
  }, []);

  const generateNewPrompt = async () => {
    setLoadingPrompt(true);
    setResult(null);
    setAudioBlob(null);

    try {
      const formData = new FormData();
      formData.append('level', level);
      formData.append('user_id', 'demo_user');

      const response = await axios.post(
        'http://localhost:5000/api/ml/voice-assessment/generate-prompt',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('✅ Prompt generated:', response.data);
      setPrompt(response.data.prompt);
    } catch (error) {
      console.error('❌ Error generating prompt:', error);
      alert('Failed to generate prompt. Check console.');
    } finally {
      setLoadingPrompt(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('🎙️ Recording started');
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('⏹️ Recording stopped');
    }
  };

  const analyzeRecording = async () => {
    if (!audioBlob || !prompt) return;

    setIsAnalyzing(true);
    console.log('🔄 Analyzing speech...');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('expected_text', prompt.text);
      formData.append('level', level);
      formData.append('user_id', 'demo_user');

      const response = await axios.post(
        'http://localhost:5000/api/ml/voice-assessment/analyze',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        }
      );

      console.log('✅ Analysis complete:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('❌ Analysis error:', error);
      alert('Analysis failed. Check console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playFeedbackAudio = () => {
    if (!result?.audio_feedback_url) return;

    const audioUrl = `http://localhost:8006${result.audio_feedback_url}`;
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlayingFeedback(true);
      
      audioRef.current.onended = () => setIsPlayingFeedback(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Practice';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Mic className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Voice Assessment Agent</h1>
          </div>
          <p className="text-gray-600 text-lg">AI-powered speech analysis and pronunciation feedback</p>
        </div>

        {/* Level Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Select Your Level:</label>
          <div className="flex gap-4">
            {['beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  generateNewPrompt();
                }}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                  level === lvl
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recording Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Read Aloud</h2>
              <button
                onClick={generateNewPrompt}
                disabled={loadingPrompt || isRecording}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loadingPrompt ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Prompt Display */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6 min-h-[120px] flex items-center justify-center">
              {loadingPrompt ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>Generating prompt...</span>
                </div>
              ) : prompt ? (
                <p className="text-2xl text-gray-800 font-medium text-center leading-relaxed">
                  "{prompt.text}"
                </p>
              ) : (
                <p className="text-gray-400">Click refresh to generate a prompt</p>
              )}
            </div>

            {/* Recording Controls */}
            <div className="space-y-4">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  disabled={!prompt || loadingPrompt}
                  className="w-full py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="w-full py-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2 animate-pulse"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </button>
              )}

              {audioBlob && !isRecording && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <Volume2 className="w-5 h-5" />
                    <span className="font-medium">Recording captured!</span>
                  </div>
                  
                  <button
                    onClick={analyzeRecording}
                    disabled={isAnalyzing}
                    className="w-full py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 transition flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        Analyze Speech
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setAudioBlob(null);
                      setResult(null);
                    }}
                    className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    Record Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h2>

            {!result ? (
              <div className="text-center py-12 text-gray-400">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Record and analyze your speech to see results</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className={`p-4 rounded-lg ${getScoreColor(result.analysis.overall_score)}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Overall Score:</span>
                    <span className="text-3xl font-bold">{result.analysis.overall_score}/100</span>
                  </div>
                  <p className="text-sm mt-1">{getScoreLabel(result.analysis.overall_score)}</p>
                </div>

                {/* Individual Scores */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.analysis.scores).map(([key, value]) => {
                    if (key === 'overall') return null;
                    return (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 capitalize">{key}</p>
                        <p className="text-xl font-bold text-gray-800">{value}/100</p>
                      </div>
                    );
                  })}
                </div>

                {/* Transcription */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 text-sm text-gray-700">You said:</h3>
                  <p className="text-gray-800 italic">"{result.analysis.transcription}"</p>
                </div>

                {/* AI Feedback */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 text-sm text-gray-700">AI Feedback:</h3>
                  <p className="text-gray-700 leading-relaxed">{result.feedback.text}</p>
                  
                  <button
                    onClick={playFeedbackAudio}
                    disabled={isPlayingFeedback}
                    className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 transition flex items-center justify-center gap-2"
                  >
                    {isPlayingFeedback ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Listen to Feedback
                      </>
                    )}
                  </button>
                </div>

                {/* Suggestions */}
                {result.feedback.suggestions && result.feedback.suggestions.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2 text-sm text-gray-700">Tips for Improvement:</h3>
                    <ul className="space-y-1">
                      {result.feedback.suggestions.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-700">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hidden audio element for feedback playback */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default VoiceAssessment;
