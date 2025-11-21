import React, { useEffect, useState } from 'react';

const LiveEyeTracking = ({ running, onData }) => {
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    let bufferCount = 0;
    let syntheticInterval = null;

    if (!running) {
      setStatus('Paused');
      setError(null);
      if (window.webgazer && window.webgazer.pause) window.webgazer.pause();
      if (syntheticInterval) clearInterval(syntheticInterval);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setStatus('Camera granted. Tracking...');
        if (window.webgazer) {
          window.webgazer.clearGazeListener && window.webgazer.clearGazeListener();
          window.webgazer.setRegression('ridge')
            .setTracker('TFFacemesh')
            .setGazeListener((data) => {
              if (data && typeof data.x === 'number' && typeof data.y === 'number') {
                bufferCount++;
                onData &&
                  onData({
                    gazeX: data.x / window.innerWidth,
                    gazeY: data.y / window.innerHeight,
                    pupilSize: 4.0,
                    fixation: Math.random() > 0.5 ? 1 : 0,
                    saccade: Math.random() * 0.5,
                    timestamp: Date.now(),
                  });
                if (bufferCount === 1) setStatus('Tracking eyes! Collecting...');
              }
            })
            .begin();
        } else {
          setError('WebGazer not loaded.');
          synthetic();
        }
      })
      .catch(() => {
        setError('Camera access denied! Allow camera to continue.');
        setStatus('Error');
        synthetic();
      });

    function synthetic() {
      setStatus('Using synthetic data');
      syntheticInterval = setInterval(() => {
        if (running) {
          onData &&
            onData({
              gazeX: Math.random(),
              gazeY: Math.random(),
              pupilSize: 3.5 + Math.random(),
              fixation: Math.random() > 0.7 ? 1 : 0,
              saccade: Math.random() * 0.5,
              timestamp: Date.now(),
            });
        } else {
          clearInterval(syntheticInterval);
        }
      }, 25);
    }

    return () => {
      if (window.webgazer && window.webgazer.clearGazeListener)
        window.webgazer.clearGazeListener();
      if (syntheticInterval) clearInterval(syntheticInterval);
    };
  }, [running, onData]);

  return (
    <div className="mb-6">
      <label className="font-semibold block mb-2">👁️ Eye Tracking</label>
      <div className={`p-4 rounded-lg border-2 ${error ? 'border-red-500 bg-red-50' : running ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          {running && !error && <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>}
          {error && <div className="w-3 h-3 bg-red-600 rounded-full"></div>}
          <span className={error ? 'text-red-600 font-semibold' : running ? 'text-green-600 font-semibold' : 'text-gray-500'}>
            {error || status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveEyeTracking;
