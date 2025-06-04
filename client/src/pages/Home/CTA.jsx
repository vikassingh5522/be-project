import React from 'react'

const CTA = () => {
  return (
    <>
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Transform Your Remote Testing?</h2>
            <p className="text-xl text-blue-100 mb-8">Join leading institutions worldwide in providing secure, fair, and accessible exams with FairAI.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium text-lg">
                Start Free Trial
              </button>
              <button className="px-8 py-4 border border-white/30 text-white rounded-md hover:bg-white/10 transition-colors font-medium text-lg">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default CTA