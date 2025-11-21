import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader } from 'lucide-react';

const VoiceRecorder = ({ onTranscript, onAudioData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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
        if (onAudioData) {
          onAudioData(blob);
        }
        
        // Stop all tracks
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

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 shadow-2xl'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl'
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
          <span className="text-sm text-gray-600 font-medium">Recording...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
