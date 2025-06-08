// ActiveExamsList.jsx
import React, { useEffect, useState } from "react";
import ExamCardTeacher from "../../Components/ExamCardTeacher";
import { 
  BookOpen, 
  Clock, 
  Users, 
  AlertCircle, 
  RefreshCw,
  Search,
  Filter,
  Grid3X3,
  List
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActiveExamsList = ({ instructor }) => {
  const [activeExams, setActiveExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [examFilter, setExamFilter] = useState("active"); // 'active' or 'all'
  const [allExams, setAllExams] = useState([]);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  useEffect(() => {
    if (examFilter === "active") {
      fetchExams();
    } else {
      fetchAllExams();
    }
  }, [instructor, examFilter]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/exam/created?instructor=${instructor}`);
      const data = await res.json();
      if (data.success) {
        const now = new Date();
        const filtered = data.exams.filter(exam => {
          const activeStart = new Date(exam.active_start);
          const activeEnd = new Date(exam.active_end);
          return now >= activeStart && now <= activeEnd;
        });
        setActiveExams(filtered);
      } else {
        setError(data.message || "Failed to fetch exams");
      }
    } catch (err) {
      console.error("Error fetching active exams:", err);
      setError("Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/exam/created?instructor=${instructor}`);
      const data = await res.json();
      if (data.success) {
        setAllExams(data.exams);
      } else {
        setError(data.message || "Failed to fetch exams");
      }
    } catch (err) {
      console.error("Error fetching all exams:", err);
      setError("Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = (examFilter === "active" ? activeExams : allExams).filter(exam =>
    exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading active exams...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Exams</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchExams()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{examFilter === "active" ? "Active Exams" : "All Exams"}</h2>
              <p className="text-gray-600">{examFilter === "active" ? "Monitor currently running exams" : "View all exams you have created"}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/create-exam")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <BookOpen className="h-5 w-5" />
            <span>Create New Exam</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">{examFilter === "active" ? "Total Active" : "Total Exams"}</p>
                <p className="text-2xl font-bold text-blue-700">{examFilter === "active" ? activeExams.length : allExams.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Total Students</p>
                <p className="text-2xl font-bold text-green-700">
                  {(examFilter === "active" ? activeExams : allExams).reduce((total, exam) => total + (exam.totalStudents || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Average Duration</p>
                <p className="text-2xl font-bold text-purple-700">
                  {(examFilter === "active" ? activeExams : allExams).length > 0
                    ? Math.round(
                        (examFilter === "active" ? activeExams : allExams).reduce((total, exam) => total + (exam.duration || 0), 0) /
                          (examFilter === "active" ? activeExams : allExams).length
                      )
                    : 0} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-semibold focus:outline-none transition-colors ${examFilter === "active" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-100"}`}
            onClick={() => setExamFilter("active")}
          >
            Active Exams
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold focus:outline-none transition-colors ${examFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-100"}`}
            onClick={() => setExamFilter("all")}
          >
            All Exams
          </button>
        </div>
      </div>

      {/* Exams Grid/List */}
      {filteredExams.length > 0 ? (
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }`}
        >
          {filteredExams.map((exam) => (
            <div key={exam.id} className={viewMode === "list" ? "w-full" : ""}>
              <ExamCardTeacher exam={exam} viewMode={viewMode} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? "No exams found" : examFilter === "active" ? "No active exams" : "No exams created yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Try adjusting your search criteria"
              : examFilter === "active"
              ? "Create a new exam to get started"
              : "Create an exam to see it here"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/dashboard/create-exam")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <BookOpen className="h-5 w-5" />
              <span>Create New Exam</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveExamsList;
