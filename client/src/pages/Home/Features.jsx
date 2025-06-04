import React from 'react'
import { Shield, Monitor, Book, User, Check, ArrowRight, Code, Brain, Eye, Users, ChevronRight, Menu, X } from 'lucide-react';

const Features = () => {
  return (
    <>
    <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our AI-powered platform ensures exam integrity with cutting-edge technology and intuitive tools.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 transition-colors shadow-sm hover:shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-600">Advanced AI algorithms detect suspicious behaviors and unauthorized resources during exams.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 transition-colors shadow-sm hover:shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ML Identity Verification</h3>
              <p className="text-gray-600">Biometric authentication ensures the right student is taking the exam from start to finish.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 transition-colors shadow-sm hover:shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Screen Monitoring</h3>
              <p className="text-gray-600">Tracks application usage and prevents unauthorized resources during examination.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 transition-colors shadow-sm hover:shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Collaborative Review</h3>
              <p className="text-gray-600">Tools for instructors to review flagged incidents and make informed decisions.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 transition-colors shadow-sm hover:shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">API Integration</h3>
              <p className="text-gray-600">Seamless connection with existing LMS platforms and educational software.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 transition-colors shadow-sm hover:shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy Focused</h3>
              <p className="text-gray-600">GDPR compliant with end-to-end encryption and secure data handling practices.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Features