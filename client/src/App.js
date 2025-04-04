import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useVerifyToken } from "./hooks/useVerifyToken";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import Exam from "./pages/Exam";
import ExamCreation from "./pages/ExamCreation";
import JoinExam from "./pages/JoinExam";
import ExamDashboard from "./pages/ExamDashboard";
import ExamList from "./Components/ExamList";
import AttemptedExams from "./pages/AttemptedExams";
import CreatedExams from "./pages/CreatedExams"; // For instructor's created exams
import ExamAttempts from "./pages/ExamAttempts"; // For instructor to view student attempts

// Wrapper to extract examId from URL parameters for ExamDashboard if needed.
const ExamDashboardWrapper = () => {
  const { examId } = useParams();
  return <ExamDashboard examId={examId} />;
};

function App() {
  const currentUser = useVerifyToken();

  // While token verification is in progress
  if (currentUser === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            currentUser ? (
              currentUser.role === "student" ? (
                <StudentDashboard user={currentUser} />
              ) : (
                <InstructorDashboard user={currentUser} />
              )
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        >
          {/* Nested student dashboard routes */}
          {currentUser && currentUser.role === "student" && (
            <>
              <Route index element={<ExamList role={currentUser.role} />} />
              <Route path="exams/practice" element={<ExamList role={currentUser.role} />} />
              <Route path="exams/attempted" element={<AttemptedExams />} />
            </>
          )}
          {/* Nested instructor dashboard routes */}
          {currentUser && currentUser.role !== "student" && (
            <>
              <Route index element={<CreatedExams instructor={currentUser.username} />} />
              <Route path="exams/attempts/:examId" element={<ExamAttempts />} />
            </>
          )}
        </Route>

        {/* Other Protected Routes */}
        <Route path="/exam/join" element={<JoinExam />} />
        <Route path="/exam/create" element={<ExamCreation />} />
        <Route path="/exam/:examId" element={<Exam />} />
        <Route path="/exam/dashboard/:examId" element={<ExamDashboardWrapper />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
