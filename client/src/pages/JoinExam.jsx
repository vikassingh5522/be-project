import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const JoinExam = () => {
  const [examId, setExamId] = useState("");
  const [isValidExamId, setIsValidExamId] = useState(false);
  const [examToken, setExamToken] = useState(null);
  const [mobileConfirmed, setMobileConfirmed] = useState(false);
  const [pairingStarted, setPairingStarted] = useState(false);
  const navigate = useNavigate();

  const handleInput = (e) => {
    const id = e.target.value;
    setExamId(id);
    // Regex: 8-4-4-4-12 alphanumeric characters (lowercase)
    const regex = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/;
    setIsValidExamId(regex.test(id));
  };

  // Generate the exam token by calling /exam/connect.
  const startPairing = async () => {
    const loginToken = localStorage.getItem("token"); // Assumes user is logged in.
    try {
      const response = await fetch("http://localhost:5000/exam/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: loginToken, examId })
      });
      const data = await response.json();
      if (data.success) {
        setExamToken(data.examToken);
        setPairingStarted(true);
      } else {
        console.error("Failed to generate exam token:", data.message);
      }
    } catch (err) {
      console.error("Error generating exam token:", err);
    }
  };

  // Poll the backend to check for mobile confirmation.
  useEffect(() => {
    let interval;
    if (pairingStarted && examToken) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/mobile/status?token=${examToken}`
          );
          const statusData = await res.json();
          if (statusData.success && statusData.mobile_confirmed) {
            setMobileConfirmed(true);
            clearInterval(interval);
          } else {
            setMobileConfirmed(false);
          }
        } catch (error) {
          console.error("Error checking mobile status:", error);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pairingStarted, examToken]);

  const handleProceed = () => {
    if (mobileConfirmed) {
      navigate("/exam/" + examId);
    } else {
      alert("Mobile device is not confirmed. Please ensure you have pressed the confirm button on your mobile device.");
    }
  };

  // Build the mobile monitor URL.
  const mobileMonitorURL = examToken 
    ? `http://localhost:5000/static/mobile_monitor.html?token=${examToken}` 
    : "";

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="wrapper mx-auto w-[900px]">
        <form>
          <label htmlFor="examId" className="block text-sm text-gray-500">
            Enter Exam ID
          </label>
          <input
            type="text"
            id="examId"
            placeholder="eg. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={examId}
            onChange={handleInput}
            className="mt-2 block w-full placeholder-gray-400/70 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
          />
          {examId !== "" && !isValidExamId && (
            <p className="text-red-400">Enter valid ID!</p>
          )}
          {isValidExamId && !pairingStarted && (
            <button
              type="button"
              onClick={startPairing}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Generate Mobile Pairing QR
            </button>
          )}
        </form>
        {pairingStarted && examToken && (
          <div className="mt-4 p-4 bg-white shadow rounded">
            <p className="mb-2">
              Scan this QR code with your mobile device to confirm your presence:
            </p>
            <QRCodeCanvas value={mobileMonitorURL} size={200} />
            <p className="text-sm mt-2">
              Mobile URL:{" "}
              <a href={mobileMonitorURL} target="_blank" rel="noreferrer">
                {mobileMonitorURL}
              </a>
            </p>
            <p className="mt-2">
              {mobileConfirmed ? "Mobile device confirmed!" : "Waiting for mobile confirmation..."}
            </p>
          </div>
        )}
        {isValidExamId && mobileConfirmed && (
          <button
            type="button"
            onClick={handleProceed}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Proceed to Exam
          </button>
        )}
      </div>
    </div>
  );
};

export default JoinExam;
