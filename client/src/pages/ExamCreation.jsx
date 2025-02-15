// examcreation.js
import React, { useState } from 'react';

const ExamCreation = () => {
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [examId, setExamId] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", examName);
    formData.append("duration", examDuration);
    formData.append("date", examDate); // Include exam details

    try {
      const response = await fetch("http://localhost:5000/upload-file", {
          method: "POST",
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
    console.log({ examName, examDate, examDuration });
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
        <div className="file-upload-section mb-4">
          <input type="file" onChange={handleFileChange} />
          <button
            type="button"
            onClick={uploadFile}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4"
          >
            Upload File
          </button>
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
