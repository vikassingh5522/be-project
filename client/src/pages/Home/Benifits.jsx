import { Check, ChevronRight } from 'lucide-react';
import React from 'react'

const Benifits = () => {
    const data = [
                  {
                    title: "Accuracy & Fairness",
                    description: "Our ML models are trained on diverse datasets to ensure unbiased monitoring across all demographics."
                  },
                  {
                    title: "Student Privacy",
                    description: "Minimally invasive monitoring that respects student privacy while maintaining exam integrity."
                  },
                  {
                    title: "Scalability",
                    description: "Handle from 10 to 10,000+ simultaneous exams with consistent performance and reliability."
                  },
                  {
                    title: "Cost Efficiency",
                    description: "Reduce administrative overhead and eliminate the need for physical testing centers."
                  }
                ];
  return (
    <>
    <section id="benefits" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-2">
                  <img 
                    src=" " 
                    alt="FairAI Benefits" 
                    className="rounded-lg shadow-2xl"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-blue-600 rounded-full p-4 shadow-lg hidden md:block">
                  <Check className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose FairAI?</h2>
              <div className="space-y-6">
                {data.map((item, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="bg-blue-100 p-1 rounded-full">
                        <Check className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center">
                Learn More <ChevronRight className="ml-1 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Benifits