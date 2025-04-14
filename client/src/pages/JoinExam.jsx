import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const JoinExam = () => {
  // Get the exam ID from the route parameter
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // We no longer need an input state for exam ID
  const [examToken, setExamToken] = useState(null);
  const [mobileConfirmed, setMobileConfirmed] = useState(false);
  const [pairingStarted, setPairingStarted] = useState(false);

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

  // Poll the backend for mobile confirmation.
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
      alert(
        "Mobile device is not confirmed. Please ensure you have pressed the confirm button on your mobile device."
      );
    }
  };

  // Build the mobile monitor URL using the exam token
  const mobileMonitorURL = examToken
    ? `http://localhost:5000/static/mobile_monitor.html?token=${examToken}`
    : "";

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="wrapper mx-auto w-[900px]">
        <h2 className="text-2xl font-bold mb-4">Join Exam</h2>
        <p className="text-sm text-gray-500">Exam ID: {examId}</p>
        {!pairingStarted && (
          <button
            type="button"
            onClick={startPairing}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Mobile Pairing QR
          </button>
        )}
        {pairingStarted && examToken && (
          <div className="mt-4 p-4 bg-white shadow rounded">
            <p className="mb-2">
              Scan this QR code with your mobile device to confirm your presence:
            </p>
            <QRCodeCanvas value={mobileMonitorURL} size={200} />
            <p className="text-sm mt-2 ">
              Mobile URL:{" "}
              <a href={mobileMonitorURL} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                Click to Proceed
              </a>
            </p>
            <p className="mt-2">
              {mobileConfirmed ? "Mobile device confirmed!" : "Waiting for mobile confirmation..."}
            </p>
          </div>
        )}
        {mobileConfirmed && (
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
