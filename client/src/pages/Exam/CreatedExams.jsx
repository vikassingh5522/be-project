import React, { useEffect, useState } from "react";
import ExamCardTeacher from "../../Components/ExamCardTeacher";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Users,
  Clock,
  AlertCircle,
  RefreshCw,
  Grid3X3,
  List
} from "lucide-react";

const CreatedExams = ({ instructor }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_date");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  useEffect(() => {
    fetchExams();
  }, [instructor]);

  const fetchExams = async () => {
    if (!instructor) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/exam/created?instructor=${instructor}`);
      const data = await res.json();
      
      if (data.success) {
        setExams(data.exams);
      } else {
        setError(data.message || "Failed to fetch exams");
      }
    } catch (err) {
      console.error("Error fetching created exams:", err);
      setError("Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to compute status
  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.active_start);
    const end = new Date(exam.active_end);
    if (now < start) return "draft";
    if (now > end) return "expired";
    return "active";
  };

  const filteredAndSortedExams = exams
    .filter(exam => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        (exam.name || "").toLowerCase().includes(search) ||
        (exam.id || "").toLowerCase().includes(search);
      const status = getExamStatus(exam);
      const matchesFilter = filterStatus === "all" || status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.name || "").localeCompare(b.name || "");
        case "created_date":
          return new Date(b.active_start) - new Date(a.active_start);
        case "exam_date":
          return new Date(a.date) - new Date(b.date);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100";
      case "draft": return "text-yellow-600 bg-yellow-100";
      case "completed": return "text-blue-600 bg-blue-100";
      case "expired": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="created-exams p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading exams...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="created-exams p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Exams</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchExams}
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
    <div className="created-exams p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Created Exams</h2>
              <p className="text-gray-600">Manage and monitor your exam collection</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/create-exam")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Exam</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Exams</p>
                <p className="text-2xl font-bold text-blue-700">{exams.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Active</p>
                <p className="text-2xl font-bold text-green-700">
                  {exams.filter(e => e.status === "active").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600 font-medium">Drafts</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {exams.filter(e => e.status === "draft").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-purple-700">
                  {exams.filter(e => e.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_date">Sort by Created Date</option>
              <option value="title">Sort by Title</option>
              <option value="exam_date">Sort by Exam Date</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Exams Grid/List */}
      {filteredAndSortedExams.length > 0 ? (
        <div className={`${
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        }`}>
          {filteredAndSortedExams.map((exam) => (
            <div key={exam.id} className={`${viewMode === "list" ? "w-full" : ""}`}>
              <ExamCardTeacher exam={exam} viewMode={viewMode} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== "all" ? "No exams found" : "No exams created yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first exam"
            }
          </p>
          {(!searchTerm && filterStatus === "all") && (
            <button
              onClick={() => navigate("/dashboard/create-exam")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Exam</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatedExams;