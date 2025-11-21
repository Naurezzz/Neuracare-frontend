import React, { useRef, useState } from 'react';

const WebcamCapture = ({ value, onCapture }) => {
  const fileInputRef = useRef();

  return (
    <div>
      <label className="font-semibold">Upload Eye-Tracking Video (Webcam or MP4)</label>
      <input ref={fileInputRef} type="file" accept="video/*" onChange={e => onCapture(e.target.files[0])} className="w-full mt-2" />
      {value && <p className="text-green-700 text-sm mt-2">Video selected: {value.name}</p>}
    </div>
  );
};
export default WebcamCapture;
