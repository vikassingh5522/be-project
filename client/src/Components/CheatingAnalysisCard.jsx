import React from 'react';
import { AlertTriangle, MousePointer, Video, Volume2, Maximize2 } from 'lucide-react';

const CheatingAnalysisCard = ({ attempt }) => {
  const cheatingScore = attempt.cheatingScore || 0;
  const factors = attempt.cheatingFactors || {
    cursor_warnings: 0,
    suspicious_frames: 0,
    abnormal_audio: 0,
    tab_switches: 0
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cheating Analysis</h2>
            <p className="text-gray-600">Risk assessment based on exam behavior</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(cheatingScore)}`}>
            {cheatingScore}%
          </div>
          <div className={`text-sm font-medium ${getScoreColor(cheatingScore)}`}>
            {getScoreLabel(cheatingScore)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <MousePointer className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Cursor Warnings</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{factors.cursor_warnings}</p>
          <p className="text-sm text-gray-600">Times cursor left exam window</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Video className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-gray-900">Suspicious Frames</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{factors.suspicious_frames}</p>
          <p className="text-sm text-gray-600">Frames with suspicious activity</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Volume2 className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Abnormal Audio</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{factors.abnormal_audio}</p>
          <p className="text-sm text-gray-600">Suspicious audio detections</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Maximize2 className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-gray-900">Tab Switches</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{factors.tab_switches}</p>
          <p className="text-sm text-gray-600">Times switched to other tabs</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">Risk Assessment</h3>
        <p className="text-yellow-700">
          {cheatingScore >= 70
            ? "High risk of academic misconduct detected. Multiple suspicious activities observed."
            : cheatingScore >= 40
            ? "Medium risk of academic misconduct. Some suspicious activities detected."
            : "Low risk of academic misconduct. No significant suspicious activities detected."}
        </p>
      </div>
    </div>
  );
};

export default CheatingAnalysisCard; 