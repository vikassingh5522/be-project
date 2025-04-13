import React, { useState } from 'react';

const ExamCreation = () => {
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
      const response = await fetch("http://localhost:5000/exam/create", {
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
    uploadFile();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md relative">
      <h2 className="text-2xl font-bold mb-6">Create Exam</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Exam Name:</label>
          <input 
            type="text" 
            value={examName} 
            onChange={(e) => setExamName(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Exam Date:</label>
          <input 
            type="date" 
            value={examDate} 
            onChange={(e) => setExamDate(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Exam Duration (in minutes):</label>
          <input 
            type="number" 
            value={examDuration} 
            onChange={(e) => setExamDuration(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Exam Active Start:</label>
          <input 
            type="datetime-local" 
            value={examActiveStart} 
            onChange={(e) => setExamActiveStart(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Exam Active End:</label>
          <input 
            type="datetime-local" 
            value={examActiveEnd} 
            onChange={(e) => setExamActiveEnd(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="file-upload-section mb-4">
          <label className="block text-gray-700">Upload Exam File (.txt or .docx):</label>
          <input type="file" onChange={handleExamFileChange} />
        </div>
        <div className="file-upload-section mb-4">
          <label className="block text-gray-700">Upload Student Data (Excel file):</label>
          <input type="file" onChange={handleStudentDataChange} />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          Create Exam
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
      {visible && (
        <>
          <button 
            onClick={() => navigator.clipboard.writeText(examId)} 
            className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Copy Exam ID
          </button>
          <div className="text-center mt-4">
            <p className="text-green-500">Exam created successfully!</p>
            <p>Exam ID: {examId}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamCreation;
