// SideBar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  User, 
  Users, 
  Bell, 
  PenTool, 
  ListChecks, 
  FileText,
  BookOpen,
  ClipboardList,
  Target,
  TrendingUp,
  Settings,
  Home,
  GraduationCap,
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import LogoutButton from "./LogoutButton";

const SideBar = ({ role, collapsed = false, onToggle }) => {
  return (
    <>
      {role === "student" ? (
        <StudentSideBar collapsed={collapsed} onToggle={onToggle} />
      ) : (
        <InstructorSidebar collapsed={collapsed} onToggle={onToggle} />
      )}
    </>
  );
};

const StudentSideBar = ({ collapsed, onToggle }) => {
  const navigationItems = [
    {
      section: "Dashboard",
      items: [
        {
          to: "/dashboard",
          icon: Home,
          label: "Overview",
          end: true
        },
        {
          to: "/dashboard/profile",
          icon: User,
          label: "Profile"
        }
      ]
    },
    {
      section: "Exams",
      items: [
        {
          to: "/exam/join",
          icon: PenTool,
          label: "Join Exam",
          badge: "Live"
        },
        {
          to: "/dashboard/exams/assigned",
          icon: ListChecks,
          label: "Assigned Exams"
        },
        {
          to: "/dashboard/exams/practice",
          icon: Target,
          label: "Practice Exams"
        },
        {
          to: "/dashboard/exams/attempted",
          icon: ClipboardList,
          label: "Attempted Exams"
        }
      ]
    },
    {
      section: "Performance",
      items: [
        {
          to: "/dashboard/results",
          icon: TrendingUp,
          label: "My Results"
        },
        {
          to: "/dashboard/analytics",
          icon: Bell,
          label: "Notifications"
        }
      ]
    }
  ];

  return (
    <div className={`fixed top-0 left-0 bottom-0 bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-50"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">FairAI</h1>
              <p className="text-xs text-gray-500">Student Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navigationItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!collapsed && (
              <h5 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.section}
              </h5>
            )}
            <nav className="space-y-1 px-3">
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={itemIndex}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <IconComponent className={`flex-shrink-0 h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1 text-green-400">({item.badge})</span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <LogoutButton collapsed={collapsed} />
      </div>
    </div>
  );
};

const InstructorSidebar = ({ collapsed, onToggle }) => {
  const navigationItems = [
    {
      section: "Dashboard",
      items: [
        {
          to: "/dashboard",
          icon: Home,
          label: "Overview",
          end: true
        },
        {
          to: "/dashboard/profile",
          icon: User,
          label: "Profile"
        }
      ]
    },
    {
      section: "Exam Management",
      items: [
        {
          to: "/exam/create",
          icon: PenTool,
          label: "Create Exam",
          badge: "New"
        },
        {
          to: "/dashboard/exams/active",
          icon: BookOpen,
          label: "Active Exams"
        },
        {
          to: "/dashboard/exams/drafts",
          icon: FileText,
          label: "Draft Exams"
        },
        {
          to: "/dashboard/exams/templates",
          icon: ClipboardList,
          label: "Templates"
        }
      ]
    },
    {
      section: "Results & Analytics",
      items: [
        {
          to: "/exam/result",
          icon: TrendingUp,
          label: "Exam Results"
        },
        {
          to: "/dashboard/analytics",
          icon: Target,
          label: "Analytics"
        },
        {
          to: "/dashboard/students",
          icon: Users,
          label: "Students"
        }
      ]
    },
    {
      section: "Settings",
      items: [
        {
          to: "/dashboard/notifications",
          icon: Bell,
          label: "Notifications"
        },
        {
          to: "/dashboard/settings",
          icon: Settings,
          label: "Settings"
        }
      ]
    }
  ];

  return (
    <div className={`fixed top-0 left-0 bottom-0 bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-50"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">FairAI</h1>
              <p className="text-xs text-gray-500">Instructor Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navigationItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!collapsed && (
              <h5 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.section}
              </h5>
            )}
            <nav className="space-y-1 px-3">
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={itemIndex}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <IconComponent className={`flex-shrink-0 h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1 text-green-400">({item.badge})</span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <LogoutButton collapsed={collapsed} />
      </div>
    </div>
  );
};

export default SideBar;