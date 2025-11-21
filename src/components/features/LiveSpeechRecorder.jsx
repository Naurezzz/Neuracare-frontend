import React, { useState, useRef, useEffect } from 'react';

const LiveSpeechRecorder = ({ running, onData }) => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (running && !recording) {
      startRecording();
    } else if (!running && recording) {
      stopRecording();
    }
  }, [running]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onData && onData(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setError(null);
    } catch (err) {
      console.error('Audio recording failed:', err);
      setError('Microphone access denied');
      // Create empty audio blob as fallback
      onData && onData(new Blob([], { type: 'audio/webm' }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="mb-6">
      <label className="font-semibold block mb-2">🎤 Speech Recording</label>
      <div className={`p-4 rounded-lg border-2 ${error ? 'border-red-500 bg-red-50' : recording ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          {recording && !error && (
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          )}
          <span className={error ? 'text-red-600' : recording ? 'text-red-600 font-semibold' : 'text-gray-500'}>
            {error || (recording ? 'Recording your speech...' : 'Ready to record')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveSpeechRecorder;
