import React from 'react'

const Testimonials = () => {
    const data = [
              {
                quote: "FairAI has revolutionized how we conduct assessments. The AI monitoring is accurate without being intrusive to students.",
                name: "Dr. Sarah Chen",
                role: "Professor of Computer Science",
                institution: "Tech University"
              },
              {
                quote: "We've seen a 40% reduction in academic dishonesty cases since implementing FairAI across our online programs.",
                name: "Michael Rodriguez",
                role: "Dean of Digital Learning",
                institution: "Global Institute"
              },
              {
                quote: "The platform's ease of use and comprehensive analytics have made remote testing actually easier than in-person exams.",
                name: "Prof. Jessica Taylor",
                role: "Department Chair",
                institution: "Future College"
              }
            ];
  return (
    <>
    <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Educators Are Saying</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Join hundreds of institutions that have transformed their remote testing with FairAI.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="mb-4 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                </div>
                <p className="text-gray-600 mb-6">{item.quote}</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.role}, {item.institution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Testimonials