import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ExamAttempts = () => {
  const { examId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [modalFrames, setModalFrames] = useState(null);

  useEffect(() => {
    async function fetchAttempts() {
      try {
        const res = await fetch(`http://localhost:5000/exam/attempts?examId=${examId}`);
        const data = await res.json();
        if (data.success) {
          setAttempts(data.attempts);
        }
      } catch (err) {
        console.error("Error fetching exam attempts:", err);
      }
    }
    if (examId) {
      fetchAttempts();
    }
  }, [examId]);

  return (
    <div className="exam-attempts p-4">
      <h2 className="text-xl font-semibold mb-4">Student Attempts for Exam: {examId}</h2>

      {attempts.length > 0 ? (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border p-2">Username</th>
              <th className="border p-2">Score</th>
              <th className="border p-2">Submitted At</th>
              <th className="border p-2">Audio Recordings</th>
              <th className="border p-2">Cheating Activities</th>
              <th className="border p-2">Cheating Frames</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt._id}>
                <td className="border p-2">{attempt.username}</td>
                <td className="border p-2">{attempt.score}</td>
                <td className="border p-2">{attempt.submittedAt || "N/A"}</td>
                <td className="border p-2">
                  {attempt.recordings?.length
                    ? attempt.recordings.map((rec, idx) => (
                        <div key={idx}>
                          <audio controls>
                            <source
                              src={`http://localhost:5000/upload/audio/${rec.file}`}
                              type="audio/webm"
                            />
                          </audio>
                          <p className="text-xs">
                            {new Date(rec.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))
                    : "No recordings"}
                </td>
                <td className="border p-2">
                  {attempt.cheatingActivities?.length
                    ? attempt.cheatingActivities.join(", ")
                    : "None"}
                </td>
                <td className="border p-2">
                  <div className="flex flex-wrap gap-2">
                    {attempt.cheatingFrames.slice(0, 3).map((f, i) => (
                      <img
                        key={i}
                        src={`data:image/jpeg;base64,${f.image}`}
                        alt={`frame ${i}`}
                        className="w-20 h-16 object-cover border"
                      />
                    ))}
                    {attempt.cheatingFrames.length > 3 && (
                      <button
                        onClick={() => setModalFrames(attempt.cheatingFrames)}
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        +{attempt.cheatingFrames.length - 3} more
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No student attempts found for this exam.</p>
      )}

      {modalFrames && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setModalFrames(null)}
              className="mb-4 text-sm text-red-500 hover:underline"
            >
              Close
            </button>
            <div className="grid grid-cols-3 gap-4">
              {modalFrames.map((f, i) => (
                <div key={i} className="flex flex-col items-center">
                  <img
                    src={`data:image/jpeg;base64,${f.image}`}
                    alt={`frame ${i}`}
                    className="w-full h-32 object-cover border"
                  />
                  <p className="text-xs mt-1">
                    {new Date(f.timestamp).toLocaleString()}
                  </p>
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
