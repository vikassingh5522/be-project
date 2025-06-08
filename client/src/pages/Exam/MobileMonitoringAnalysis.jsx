import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MobileMonitoringAnalysis = ({ examId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/mobile/analysis/${examId}`);
        if (response.data.success) {
          setAnalysis(response.data);
        } else {
          setError(response.data.message || 'Failed to fetch mobile monitoring analysis');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching mobile analysis:', err);
        setError('Failed to fetch mobile monitoring analysis. Please try again.');
        setLoading(false);
      }
    };

    if (examId) {
      fetchAnalysis();
    }
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading mobile monitoring analysis...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <p className="text-yellow-700">No mobile monitoring data available for this exam.</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const prepareChartData = () => {
    const students = Object.keys(analysis.analysis);
    const focusViolations = students.map(student => analysis.analysis[student].analysis.focus_violations);
    const screenChanges = students.map(student => analysis.analysis[student].analysis.screen_changes);
    const networkChanges = students.map(student => analysis.analysis[student].analysis.network_changes);

    return {
      labels: students,
      datasets: [
        {
          label: 'Focus Violations',
          data: focusViolations,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Screen Changes',
          data: screenChanges,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Network Changes',
          data: networkChanges,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };
  };

  const chartData = prepareChartData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mobile Monitoring Analysis',
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Mobile Monitoring Analysis</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Students</p>
            <p className="text-2xl font-bold">{analysis.total_students}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Confirmed Devices</p>
            <p className="text-2xl font-bold">
              {Object.values(analysis.analysis).filter(a => a.mobile_confirmed).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Suspicious Activities</p>
            <p className="text-2xl font-bold">
              {Object.values(analysis.analysis).reduce((sum, a) => 
                sum + a.analysis.focus_violations + a.analysis.screen_changes, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Activity Distribution</h3>
        <div className="h-96">
          <Bar options={chartOptions} data={chartData} />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Detailed Analysis</h3>
        <div className="space-y-4">
          {Object.entries(analysis.analysis).map(([username, data]) => (
            <div key={username} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{username}</h4>
                <span className={`px-2 py-1 rounded text-sm ${
                  data.mobile_confirmed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {data.mobile_confirmed ? 'Device Confirmed' : 'Device Not Confirmed'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Focus Violations</p>
                  <p className="font-semibold">{data.analysis.focus_violations}</p>
                </div>
                <div>
                  <p className="text-gray-600">Screen Changes</p>
                  <p className="font-semibold">{data.analysis.screen_changes}</p>
                </div>
                <div>
                  <p className="text-gray-600">Network Changes</p>
                  <p className="font-semibold">{data.analysis.network_changes}</p>
                </div>
                <div>
                  <p className="text-gray-600">Battery Issues</p>
                  <p className="font-semibold">{data.analysis.battery_issues}</p>
                </div>
              </div>

              {data.analysis.suspicious_periods.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600 font-semibold">Suspicious Periods:</p>
                  <ul className="text-sm text-gray-600">
                    {data.analysis.suspicious_periods.map((period, index) => (
                      <li key={index}>
                        {new Date(period.start).toLocaleTimeString()} - {new Date(period.end).toLocaleTimeString()}
                        {' '}({Math.round(period.duration)}s)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileMonitoringAnalysis; 