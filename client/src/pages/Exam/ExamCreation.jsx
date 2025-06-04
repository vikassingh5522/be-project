import React, { useState } from 'react';
import { FileText, Users, Calendar, Clock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../Components/SideBar';

const ExamCreation = () => {
  const navigate = useNavigate();
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [examActiveStart, setExamActiveStart] = useState('');
  const [examActiveEnd, setExamActiveEnd] = useState('');
  const [file, setFile] = useState(null); // For exam questions file (.txt or .docx)
  const [studentDataFile, setStudentDataFile] = useState(null); // For student Excel file
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [examId, setExamId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const handleExamFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleStudentDataChange = (e) => {
    setStudentDataFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select an exam file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", examName);
    formData.append("duration", examDuration);
    formData.append("date", examDate);
    formData.append("active_start", examActiveStart);
    formData.append("active_end", examActiveEnd);
    if (studentDataFile) {
      formData.append("studentData", studentDataFile);
    }
    try {
      // Retrieve token from localStorage
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/exam/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setError("");
        setExamId(data.examId);
        console.log("Exam created with ID:", data.examId);
        setVisible(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("An error occurred while uploading the file.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    uploadFile();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SideBar 
        role="instructor"
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h2 className="text-2xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">Create New Exam</h2>
          </div>

          {visible ? (
            <div className="text-center p-8 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Exam Created Successfully!</h3>
              <p className="text-gray-600 mb-4">Your exam has been created and is ready to use.</p>
              <div className="bg-white p-4 rounded-lg shadow-sm inline-block">
                <p className="text-sm text-gray-500 mb-2">Exam ID</p>
                <div className="flex items-center space-x-2">
                  <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">{examId}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(examId);
                      alert('Exam ID copied to clipboard!');
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="mt-6 space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    setVisible(false);
                    setExamName('');
                    setExamDate('');
                    setExamDuration('');
                    setExamActiveStart('');
                    setExamActiveEnd('');
                    setFile(null);
                    setStudentDataFile(null);
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                >
                  Create Another Exam
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Name
                  </label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exam name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Date
                  </label>
                  <div className="relative">
                    <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <div className="relative">
                    <Clock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={examDuration}
                      onChange={(e) => setExamDuration(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter duration"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={examActiveStart}
                    onChange={(e) => setExamActiveStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={examActiveEnd}
                    onChange={(e) => setExamActiveEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Exam File (.txt or .docx)
                    </label>
                    <input
                      type="file"
                      onChange={handleExamFileChange}
                      accept=".txt,.docx"
                      className="hidden"
                      id="examFile"
                    />
                    <label
                      htmlFor="examFile"
                      className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Choose File
                    </label>
                    {file && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Student Data (Excel file)
                    </label>
                    <input
                      type="file"
                      onChange={handleStudentDataChange}
                      accept=".xlsx,.xls"
                      className="hidden"
                      id="studentDataFile"
                    />
                    <label
                      htmlFor="studentDataFile"
                      className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Choose File
                    </label>
                    {studentDataFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {studentDataFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Exam...
                    </>
                  ) : (
                    'Create Exam'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamCreation;
