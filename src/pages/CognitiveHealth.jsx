import React, { useState } from 'react';
import ImagePrompt from '../components/features/ImagePrompt';
import LiveEyeTracking from '../components/features/LiveEyeTracking';
import LiveSpeechRecorder from '../components/features/LiveSpeechRecorder';
import CognitiveResultsCard from '../components/features/CognitiveResultsCard';
import { mlServices } from '../services/api';
import { Loader } from 'lucide-react';

const IMAGE_URL = "/assets/test-image.jpg";

const CognitiveHealth = () => {
  const [running, setRunning] = useState(false);
  const [eyeBuffer, setEyeBuffer] = useState([]);
  const [speechBlob, setSpeechBlob] = useState(null);
  const [timer, setTimer] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleStart = () => {
    setResult(null);
    setEyeBuffer([]);
    setSpeechBlob(null);
    setPdfUrl(null);
    setRunning(true);
    setTimer(20);
    const interval = setInterval(() => {
      setTimer(t => {
        if (t > 1) return t - 1;
        setRunning(false);
        clearInterval(interval);
        handleFinished();
        return 0;
      });
    }, 1000);
  };

  const handleLiveEyeData = data => {
    setEyeBuffer(prev => {
      const arr = [...prev, [
        data.gazeX ?? 0,
        data.gazeY ?? 0,
        data.pupilSize ?? 4.0,
        data.fixation ?? 0,
        data.saccade ?? 0,
        data.timestamp ? ((data.timestamp % 1000) / 1000) : 0
      ]];
      if (arr.length === 1 || arr.length % 25 === 0) {
        console.log(`eyeBuffer filling: length = ${arr.length}`);
      }
      return arr;
    });
  };

  const handleLiveSpeechStop = blob => setSpeechBlob(blob);

  const handleFinished = async () => {
    setLoading(true);
    try {
      console.log("eyeBuffer size before sending:", eyeBuffer.length);
      if (!eyeBuffer || eyeBuffer.length < 10) {
        alert("No eye-tracking data collected! Try again, move your head slightly, and wait at least 3 seconds.");
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('eyeFeatures', new Blob([JSON.stringify(eyeBuffer)], { type: "application/json" }), "eyeFeatures.json");
      formData.append('audio', speechBlob, 'speech.wav');
      formData.append('textPrompt', 'Describe the shown image.');
      formData.append('imageId', 'test-image');
      const response = await mlServices.analyzeCognitiveHealth(formData);
      setResult(response.data.results);
    } catch (err) {
      setResult(null);
      alert('Live assessment failed: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await mlServices.generateCognitiveReport(result, "User Name");
      if (response.status >= 400 || !response.data || response.data.error) {
        throw new Error("PDF generation failed. Please try again later.");
      }
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setTimeout(() => window.URL.revokeObjectURL(url), 120000);
    } catch (err) {
      alert('PDF Download failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Cognitive Health Screening (Live Multi-Modal)
      </h1>
      <ImagePrompt imageSrc={IMAGE_URL} />
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-6">
          <LiveEyeTracking running={running} onData={handleLiveEyeData} />
          <LiveSpeechRecorder running={running} onData={handleLiveSpeechStop} />
          <div className="mb-2 text-xs text-gray-400">
            {running && <span>🟢 Eye samples collected: {eyeBuffer.length}</span>}
          </div>
          <div className="mb-4">
            <button
              disabled={running}
              onClick={handleStart}
              className="px-6 py-3 rounded bg-purple-600 text-white font-bold"
            >
              {running ? `Describing for ${timer}s...` : "Start Assessment"}
            </button>
          </div>
        </div>
        <div>
          {loading && (
            <div className="p-6 text-center"><Loader className="w-6 h-6 animate-spin mx-auto mb-2" />Analyzing...</div>
          )}
          {result ? (
            <div>
              <CognitiveResultsCard result={result} />
              <button
                onClick={handleDownloadReport}
                className="mt-6 px-4 py-3 bg-blue-600 text-white rounded font-semibold"
              >
                Download Full PDF Report
              </button>
              {pdfUrl && (
                <a href={pdfUrl} download="cognitive-health-report.pdf" className="block mt-2 text-blue-600">
                  Click to Save PDF
                </a>
              )}
            </div>
          ) : (!loading &&
            <div className="bg-gray-50 p-6 text-gray-400 rounded-xl text-center">
              <p className="text-xl">Results will appear here after live assessment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CognitiveHealth;
