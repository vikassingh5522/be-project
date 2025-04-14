import React, { useEffect } from "react";
import SideBar from "../Components/SideBar";
import { FaCalendarPlus, FaEllipsisV, FaUserCog } from "react-icons/fa";

const Notification = () => {
    
  return (
    <>
      <SideBar />
      <div class="max-w-2xl mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Notifications</h1>
        <div class="flex space-x-4 border-b border-gray-200 pb-2 mb-4">
          <button class="text-black font-semibold border-b-2 border-black">
            All
          </button>
          <button class="text-gray-500">Unread</button>
          <button class="text-gray-500">System</button>
          <button class="text-gray-500">Exam Alerts</button>
          <button class="text-gray-500">Student Activity</button>
        </div>
        <div>
          <h2 class="text-lg font-semibold mb-2">Today</h2>
          <div class="space-y-4">
            <div class="flex items-start space-x-4">
              <div class="bg-purple-100 p-2 rounded-full">
                <i class="fas fa-clock text-purple-500"></i>
              </div>
              <div class="flex-1">
                <p class="font-semibold">Exam Session Started</p>
                <p class="text-gray-500">Advanced Mathematics - 10:30 AM</p>
              </div>
              <i class="fas fa-ellipsis-v text-gray-500"></i>
            </div>
            <div class="flex items-start space-x-4">
              <div class="bg-purple-100 p-2 rounded-full">
                <i class="fas fa-exclamation-triangle text-purple-500"></i>
              </div>
              <div class="flex-1">
                <p class="font-semibold">Potential Cheating Detected</p>
                <p class="text-gray-500">
                  Student ID: 1024 - Computer Science Exam
                </p>
              </div>
              <i class="fas fa-ellipsis-v text-gray-500"></i>
            </div>
            <div class="flex items-start space-x-4">
              <div class="bg-purple-100 p-2 rounded-full">
                <img
                  alt="Profile picture of Emma Johnson"
                  class="rounded-full"
                  src="https://placehold.co/32x32"
                />
              </div>
              <div class="flex-1">
                <p class="font-semibold">New Student Registered</p>
                <p class="text-gray-500">Emma Johnson joined Physics 101</p>
              </div>
              <i class="fas fa-ellipsis-v text-gray-500"></i>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <h2 class="text-lg font-semibold mb-2">Yesterday</h2>
          <div class="space-y-4">
            <div class="flex items-start space-x-4">
              <div class="bg-purple-100 p-2 rounded-full">
                <i class="fas fa-cog text-purple-500"></i>
              </div>
              <div class="flex-1">
                <p class="font-semibold">System Update Completed</p>
                <p class="text-gray-500">
                  New proctoring features are now available
                </p>
              </div>
              <i class="fas fa-ellipsis-v text-gray-500"></i>
            </div>
            <div class="flex items-start space-x-4">
              <div class="bg-purple-100 p-2 rounded-full">
                <i class="fas fa-file-alt text-purple-500"></i>
              </div>
              <div class="flex-1">
                <p class="font-semibold">Exam Results Published</p>
                <p class="text-gray-500">
                  Introduction to Biology - 28 students
                </p>
              </div>
              <i class="fas fa-ellipsis-v text-gray-500"></i>
            </div>
            <div class="flex items-start space-x-4">
              <div class="bg-purple-100 p-2 rounded-full">
                <i class="fas fa-wifi text-purple-500"></i>
              </div>
              <div class="flex-1">
                <p class="font-semibold">Connection Issues Detected</p>
                <p class="text-gray-500">
                  3 students experienced connectivity problems
                </p>
              </div>
              <i class="fas fa-ellipsis-v text-gray-500"></i>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <h2 class="text-lg font-semibold mb-2">Last Week</h2>
          <div class="space-y-4">
            <div class="flex items-start space-x-4">
              <div class="bg-purple-100 p-2 rounded-full">
                <FaCalendarPlus class="text-purple-500" />
              </div>
              <div class="flex-1">
                <p class="font-semibold">New Exam Created</p>
                <p class="text-gray-500">
                  Advanced Physics - Scheduled for next Monday
                </p>
              </div>
              <FaEllipsisV class="text-gray-500" />
            </div>
            <div class="flex items-start space-x-4">
              <div class="bg-purple-100 p-2 rounded-full">
                <FaUserCog class="text-purple-500"/>
              </div>
              <div class="flex-1">
                <p class="font-semibold">Account Settings Updated</p>
                <p class="text-gray-500">
                  Password and security preferences changed
                </p>
              </div>
              <FaEllipsisV class="text-gray-500" />
            </div>
          </div>
        </div>
        <div class="flex justify-between mt-6">
          <button class="bg-gray-200 text-gray-700 px-4 py-2 rounded">
            Mark All as Read
          </button>
          <button class="bg-purple-500 text-white px-4 py-2 rounded">
            Load More
          </button>
        </div>
      </div>
    </>
  );
};

export default Notification;
