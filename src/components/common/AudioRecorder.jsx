import React from 'react';

const AudioRecorder = ({ value, onRecord }) => {
  return (
    <div>
      <label className="font-semibold">Upload Speech Audio (WAV/MP3)</label>
      <input type="file" accept="audio/*" onChange={e => onRecord(e.target.files[0])} className="w-full mt-2" />
      {value && <p className="text-green-700 text-sm mt-2">Audio selected: {value.name}</p>}
    </div>
  );
};
export default AudioRecorder;
