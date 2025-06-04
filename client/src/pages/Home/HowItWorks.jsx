import React from 'react'

const HowItWorks = () => {
    const data = [
              {
                step: "Setup",
                title: "Create Your Exam",
                description: "Configure exam settings, upload questions, and set security parameters in our intuitive dashboard."
              },
              {
                step: "Verification",
                title: "Student Identity Verification",
                description: "Students complete a secure biometric verification process before accessing the exam."
              },
              {
                step: "Monitoring",
                title: "AI-Powered Proctoring",
                description: "Our algorithms monitor student behavior and environment in real-time without being intrusive."
              },
              {
                step: "Analysis",
                title: "Review & Insights",
                description: "Access detailed reports and analytics about exam sessions, flagged incidents, and performance metrics."
              }
            ];
  return (
    <>
    <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How FairAI Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our platform combines cutting-edge AI with user-friendly interfaces for seamless exam experiences.</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {data.map((item, index) => (
              <div key={index} className="flex mb-12 last:mb-0">
                <div className="mr-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold">
                    {index + 1}
                  </div>
                  {index < 3 && <div className="h-full w-0.5 bg-blue-200 mx-auto mt-2"></div>}
                </div>
                <div>
                  <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">{item.step}</span>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default HowItWorks