import React from 'react'
import { Shield, Monitor, Book, User, Check, ArrowRight, Code, Brain, Eye, Users, ChevronRight, Menu, X } from 'lucide-react';

const HeroSection = () => {
  return (
    <>
          <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  AI-Powered Exam Proctoring
                </span> 
                <br />for the Digital Era
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Secure, fair, and accessible remote examinations with advanced machine learning monitoring and analytics.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="px-6 py-3 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium">
                  Request Demo
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="rounded-lg ">
                  <div className=" overflow-hidden  ">
                    <div className="h-6 flex items-center px-4">
                      <div className="flex space-x-2">
                        {/* <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div> */}
                      </div>
                    </div>
                    <img 
                      src="./assets" 
                      alt="FairAI Dashboard" 
                      className="w-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-blue-600 rounded-full p-4 shadow-lg hidden md:block">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroSection