import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { useVerifyToken } from "./hooks/useVerifyToken";
import Home from "./pages//Home/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard/InstructorDashboard";
import Exam from "./pages/Exam/Exam";
import ExamCreation from "./pages/Exam/ExamCreation";
import JoinExam from "./pages/Exam/JoinExam";
// Replace the original JoinExam import with ToggleableExamJoin for testing:
//import ToggleableExamJoin from "./pages/ToggleableExamJoin";
import ExamDashboard from "./pages/Exam/ExamDashboard";
import ExamList from "./Components/ExamList";
import AttemptedExams from "./pages/Exam/AttemptedExams";
import CreatedExams from "./pages/Exam/CreatedExams"; // For instructor's created exams
import ExamAttempts from "./pages/Exam/ExamAttempts"; // For instructor to view student attempts
import ActiveExamsList from "./pages/Exam/ActiveExamsList"; // New active exams section
import Notification from "./pages/Notification";
import {Toaster} from "react-hot-toast";
import LoadingScreen from "./Components/Loading";

// Wrapper to extract examId from URL parameters for ExamDashboard if needed.
const ExamDashboardWrapper = () => {
  const { examId } = useParams();
  return <ExamDashboard examId={examId} />;
};

function App() {
  const currentUser = useVerifyToken();

  // While token verification is in progress
  if (currentUser === undefined) {
    return <LoadingScreen />;
  }

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
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
              <Route
                index
                element={
                  <ExamList
                    role={currentUser.role}
                    username={currentUser.username}
                    />
                }
              />
              <Route
                path="exams/assigned"
                element={
                  <ExamList
                  role={currentUser.role}
                    username={currentUser.username}
                    />
                }
              />
              <Route
                path="exams/practice"
                element={
                  <ExamList
                    role={currentUser.role}
                    username={currentUser.username}
                  />
                }
                />
              <Route path="exams/attempted" element={<AttemptedExams />} />
            </>
          )}
          {/* Nested instructor dashboard routes */}
          {currentUser && currentUser.role !== "student" && (
            <>
              <Route
                index
                element={<CreatedExams instructor={currentUser.username} />}
                />
              <Route
                path="exams/active"
                element={<ActiveExamsList instructor={currentUser.username} />}
                />
              <Route path="exams/attempts/:examId" element={<ExamAttempts />} />
            </>
          )}

          {currentUser && currentUser.role !== "student" && (
            <>
              <Route path="notification" element={<Notification />} />
            </>
          )}
        </Route>

        {/* Other Protected Routes */}
        {/* Use the toggleable component in place of JoinExam for testing */}
        {/*<Route path="/exam/join" element={<ToggleableExamJoin />} />*/}
        <Route path="/exam/join/:examId" element={<JoinExam />} />
        <Route path="/exam/create" element={<ExamCreation />} />
        <Route path="/exam/:examId" element={<Exam />} />
        <Route
          path="/exam/dashboard/:examId"
          element={<ExamDashboardWrapper />}
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
