import React from 'react';

const CognitiveResultsCard = ({ result }) => (
  <div className="bg-white rounded shadow p-4">
    <h2 className="text-2xl font-bold mb-2">
      Overall Risk: {result.overall_risk}
    </h2>
    <p><strong>Confidence:</strong> {result.confidence}%</p>
    <p><strong>Eye Movement Score:</strong> {result.eye_movement_score}%</p>
    <p><strong>Speech Pattern Score:</strong> {result.speech_pattern_score}%</p>
    <p><strong>Reading Speed (WPM):</strong> {result.reading_speed.wpm}</p>
    <p><strong>Level:</strong> {result.reading_speed.level}</p>
    <div className="mt-3">
      <strong>Recommendations:</strong>
      <ul>
        {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
      </ul>
    </div>
  </div>
);

export default CognitiveResultsCard;
