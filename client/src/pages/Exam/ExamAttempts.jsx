import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, RefreshCw, Eye, Volume2, Keyboard, Shield, AlertTriangle } from "lucide-react";
import AudioDiarizationVisualizer from '../../Components/AudioDiarizationVisualizer';
import MobileMonitoringAnalysis from './MobileMonitoringAnalysis';
import { Box } from '@mui/material';

const ExamAttempts = () => {
  const { examId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [modalFrames, setModalFrames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diarizationData, setDiarizationData] = useState(null);
  const [diarizationLoading, setDiarizationLoading] = useState(false);
  const [diarizationError, setDiarizationError] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  useEffect(() => {
    async function fetchAttempts() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BASE_URL}/exam/attempts?examId=${examId}`);
        const data = await res.json();
        if (data.success) {
          setAttempts(data.attempts);
        } else {
          setError(data.message || "Failed to fetch attempts");
        }
      } catch (err) {
        console.error("Error fetching exam attempts:", err);
        setError("Failed to load attempts. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    if (examId) {
      fetchAttempts();
    }
  }, [examId]);

  const analyzeAudio = async (audioUrl) => {
    setDiarizationLoading(true);
    setDiarizationError(null);
    setDiarizationData(null);
    try {
      // Fetch the audio as a Blob
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      // Create a File from the Blob
      const file = new File([blob], 'exam_audio.wav', { type: blob.type });
      const formData = new FormData();
      formData.append('audio_file', file);
      const apiResponse = await fetch('/api/audio-analysis/analyze-exam-audio', {
        method: 'POST',
        body: formData
      });
      const data = await apiResponse.json();
      setDiarizationData(data);
      if (!data.success) {
        setDiarizationError(data.error || 'Diarization failed');
      }
    } catch (error) {
      setDiarizationError('Failed to analyze audio');
    } finally {
      setDiarizationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading attempts...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Attempts</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-attempts p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Student Attempts for Exam: {examId}</h2>

      {attempts.length > 0 ? (
        <div className="space-y-6">
          {attempts.map((attempt) => (
            <div key={attempt._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{attempt.username}</h3>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {attempt.score}/{attempt.maxScore}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Cheating Score</p>
                    <p className={`text-lg font-semibold ${
                      attempt.cheatingScore > 70 ? 'text-red-600' :
                      attempt.cheatingScore > 30 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {attempt.cheatingScore}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Cheating Factors */}
              {attempt.cheatingFactors && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Cheating Factors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-600">Cursor Warnings</p>
                      <p className="text-lg font-semibold text-red-700">{attempt.cheatingFactors.cursor_warnings}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-600">Suspicious Frames</p>
                      <p className="text-lg font-semibold text-yellow-700">{attempt.cheatingFactors.suspicious_frames}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-orange-600">Abnormal Audio</p>
                      <p className="text-lg font-semibold text-orange-700">{attempt.cheatingFactors.abnormal_audio}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-600">Tab Switches</p>
                      <p className="text-lg font-semibold text-purple-700">{attempt.cheatingFactors.tab_switches}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suspicious Activities */}
              {attempt.cheatingActivities && attempt.cheatingActivities.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Suspicious Activities</h4>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <ul className="list-disc list-inside text-red-700">
                      {attempt.cheatingActivities.map((activity, index) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Suspicious Frames */}
              {attempt.cheatingFrames && attempt.cheatingFrames.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-semibold text-gray-900">Suspicious Frames</h4>
                    <button
                      onClick={() => setModalFrames(attempt.cheatingFrames)}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View All</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {attempt.cheatingFrames.slice(0, 4).map((frame, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`data:image/jpeg;base64,${frame.image}`}
                          alt={`Suspicious frame ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                          {new Date(frame.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Recordings */}
              {attempt.recordings && attempt.recordings.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Exam Audio Recording</h4>
                  <div className="space-y-2">
                    {attempt.recordings.map((recording, index) => {
                      const audioUrl = `${BASE_URL}/upload/audio/${recording.file}`;
                      return (
                        <div key={index} className="flex flex-col space-y-2 bg-gray-50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <Volume2 className="h-5 w-5 text-gray-600" />
                            <audio
                              controls
                              className="flex-1"
                              src={audioUrl}
                            >
                              Your browser does not support the audio element.
                            </audio>
                            <span className="text-sm text-gray-600">
                              {new Date(recording.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <Box sx={{ mt: 1 }}>
                            <button
                              onClick={() => {
                                setSelectedRecording(audioUrl);
                                analyzeAudio(audioUrl);
                              }}
                              disabled={diarizationLoading}
                              style={{
                                padding: '8px 16px',
                                background: '#1976d2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: diarizationLoading ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {diarizationLoading && selectedRecording === audioUrl ? 'Analyzing...' : 'Run Diarization'}
                            </button>
                            {diarizationError && selectedRecording === audioUrl && (
                              <div style={{ color: 'red', marginTop: 8 }}>{diarizationError}</div>
                            )}
                          </Box>
                          {diarizationData && selectedRecording === audioUrl && diarizationData.success && (
                            <Box sx={{ mt: 3 }}>
                              <AudioDiarizationVisualizer diarizationData={diarizationData} />
                            </Box>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mobile Monitoring Analysis */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Mobile Device Monitoring</h4>
                <MobileMonitoringAnalysis examId={examId} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No attempts found for this exam.</p>
        </div>
      )}

      {/* Modal for viewing all suspicious frames */}
      {modalFrames && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">All Suspicious Frames</h3>
              <button
                onClick={() => setModalFrames(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AlertCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {modalFrames.map((frame, index) => (
                <div key={index} className="relative">
                  <img
                    src={`data:image/jpeg;base64,${frame.image}`}
                    alt={`Suspicious frame ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                    {new Date(frame.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAttempts;
