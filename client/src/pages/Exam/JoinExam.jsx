import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const JoinExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [examToken, setExamToken] = useState(null);
  const [mobileConfirmed, setMobileConfirmed] = useState(false);
  const [pairingStarted, setPairingStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const startPairing = async () => {
    const loginToken = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/exam/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: loginToken, examId })
      });
      const data = await response.json();
      if (data.success) {
        setExamToken(data.examToken);
        setPairingStarted(true);
        setCurrentStep(2);
      } else {
        console.error("Failed to generate exam token:", data.message);
        alert("Failed to generate pairing code. Please try again.");
      }
    } catch (err) {
      console.error("Error generating exam token:", err);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (pairingStarted && examToken) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `${BASE_URL}/mobile/status?token=${examToken}`
          );
          const statusData = await res.json();
          if (statusData.success && statusData.mobile_confirmed) {
            setMobileConfirmed(true);
            setCurrentStep(3);
            clearInterval(interval);
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

  const mobileMonitorURL = examToken
    ? `${BASE_URL}/static/mobile_monitor.html?token=${examToken}`
    : "";

  const StepIndicator = ({ step, isActive, isCompleted, title }) => (
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        isCompleted ? 'bg-green-500 text-white' : 
        isActive ? 'bg-blue-500 text-white' : 
        'bg-gray-200 text-gray-600'
      }`}>
        {isCompleted ? '✓' : step}
      </div>
      <span className={`ml-2 text-sm font-medium ${
        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
      }`}>
        {title}
      </span>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Exam</h1>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Exam ID:</span>
            <span className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">{examId}</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Setup Progress</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <StepIndicator 
                step={1} 
                isActive={currentStep === 1} 
                isCompleted={currentStep > 1}
                title="Generate QR Code"
              />
              <div className="flex-1 h-px bg-gray-200 mx-4"></div>
              <StepIndicator 
                step={2} 
                isActive={currentStep === 2} 
                isCompleted={currentStep > 2}
                title="Mobile Verification"
              />
              <div className="flex-1 h-px bg-gray-200 mx-4"></div>
              <StepIndicator 
                step={3} 
                isActive={currentStep === 3} 
                isCompleted={false}
                title="Start Exam"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Instructions */}
          <div className="space-y-6">
            {/* Important Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="text-yellow-400 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Important Instructions</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Ensure your mobile device is connected to the internet</li>
                    <li>• Keep your mobile device with you during the exam</li>
                    <li>• Do not close the mobile monitoring page</li>
                    <li>• Contact support if you encounter any issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step-by-step Guide */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">How to Join</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Generate Mobile Pairing</h4>
                    <p className="text-sm text-gray-600">Click the button below to generate a QR code for mobile verification.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Scan QR Code</h4>
                    <p className="text-sm text-gray-600">Use your mobile device to scan the QR code or click the provided link.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Confirm on Mobile</h4>
                    <p className="text-sm text-gray-600">Press the confirm button on your mobile device to verify your presence.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">4</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Start Exam</h4>
                    <p className="text-sm text-gray-600">Once confirmed, click "Proceed to Exam" to begin your test.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-green-500">📱</div>
                    <span className="text-sm text-gray-600">Mobile Device</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-green-500">📶</div>
                    <span className="text-sm text-gray-600">Internet Connection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-green-500">📷</div>
                    <span className="text-sm text-gray-600">Camera Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-green-500">🔊</div>
                    <span className="text-sm text-gray-600">Microphone Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Action Area */}
          <div className="space-y-6">
            {/* Step 1: Generate QR */}
            {!pairingStarted && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Step 1: Generate Mobile Pairing</h3>
                </div>
                <div className="p-6 text-center">
                  <div className="mb-4">
                    <div className="text-4xl mb-2">🔗</div>
                    <p className="text-gray-600 mb-6">Click the button below to generate a QR code for mobile device pairing.</p>
                  </div>
                  <button
                    type="button"
                    onClick={startPairing}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      'Generate Mobile Pairing QR'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: QR Code Display */}
            {pairingStarted && examToken && !mobileConfirmed && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Step 2: Scan QR Code</h3>
                </div>
                <div className="p-6 text-center">
                  <div className="mb-4">
                    <p className="text-gray-600 mb-4">Scan this QR code with your mobile device:</p>
                    <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <QRCodeCanvas value={mobileMonitorURL} size={200} />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Or click this link on your mobile device:</p>
                    <a 
                      href={mobileMonitorURL} 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium break-all"
                      target="_blank" 
                      rel="noreferrer"
                    >
                      Open Mobile Monitor
                    </a>
                  </div>

                  <div className="mt-6 flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm text-gray-600">Waiting for mobile confirmation...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation Success */}
            {mobileConfirmed && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Step 3: Ready to Start</h3>
                </div>
                <div className="p-6 text-center">
                  <div className="mb-6">
                    <div className="text-5xl mb-3">✅</div>
                    <h4 className="text-xl font-semibold text-green-600 mb-2">Mobile Device Confirmed!</h4>
                    <p className="text-gray-600">Your mobile device has been successfully verified. You can now proceed to the exam.</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleProceed}
                    className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Proceed to Exam
                  </button>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="text-blue-400 text-xl mr-3">💡</div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    If you're having trouble with mobile pairing or QR code scanning:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ensure your mobile device camera has permission</li>
                    <li>• Try refreshing the page and generating a new QR code</li>
                    <li>• Use the direct link if QR scanning fails</li>
                    <li>• Contact your instructor for technical support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinExam;