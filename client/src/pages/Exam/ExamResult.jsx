import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import CheatingAnalysisCard from '../../Components/CheatingAnalysisCard';

const ExamResult = () => {
  const { examId } = useParams();
  const [result, setResult] = useState(null);
  const [cheatingAnalysis, setCheatingAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = localStorage.getItem('username');
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch exam result
        const resultRes = await fetch(
          `${BASE_URL}/exam/result?examId=${examId}&username=${username}`
        );
        const resultData = await resultRes.json();

        if (!resultData.success) {
          throw new Error(resultData.message || 'Failed to fetch exam result');
        }

        setResult(resultData.result);

        // Fetch cheating analysis
        const analysisRes = await fetch(
          `${BASE_URL}/exam/cheating-analysis?examId=${examId}&username=${username}`
        );
        const analysisData = await analysisRes.json();

        if (analysisData.success) {
          setCheatingAnalysis(analysisData.analysis);
        }
      } catch (err) {
        console.error('Error fetching exam results:', err);
        setError(err.message || 'Failed to load exam results');
      } finally {
        setLoading(false);
      }
    };

    if (examId && username) {
      fetchResults();
    }
  }, [examId, username]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading exam results...</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Results</h3>
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

  if (!result) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">The exam results are not available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{result.examName}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600">Score</p>
              <p className="text-2xl font-semibold text-blue-600">
                {result.score}/{result.maxScore}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Submission Time</p>
              <p className="text-lg">
                {new Date(result.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Cheating Analysis Card */}
        {cheatingAnalysis && <CheatingAnalysisCard analysis={cheatingAnalysis} />}

        {/* Detailed Scores */}
        {result.detailedScores && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Question-wise Scores</h3>
            <div className="space-y-4">
              {result.detailedScores.map((score, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Question {index + 1}</p>
                    <p className="text-sm text-gray-600 capitalize">{score.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{score.score}/{score.maxScore}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResult; 