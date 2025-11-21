import React from 'react';

const ImagePrompt = ({ imageSrc }) => (
  <div className="mb-6 text-center bg-white rounded-2xl shadow p-6">
    <img 
      src={imageSrc} 
      alt="Cognitive Test Prompt" 
      className="mx-auto rounded-lg shadow-lg max-h-64 mb-4"
    />
    <p className="text-lg font-semibold text-gray-700">
      📸 Please describe what you see in this image aloud for about 20 seconds.
    </p>
    <p className="text-sm text-gray-500 mt-2">
      Your eye movements and speech will be analyzed in real-time!
    </p>
  </div>
);

export default ImagePrompt;
