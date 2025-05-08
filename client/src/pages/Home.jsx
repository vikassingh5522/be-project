import { useState, useEffect } from 'react';
import { Shield, Monitor, Book, User, Check, ArrowRight, Code, Brain, Eye, Users, ChevronRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 mr-2 text-blue-400" />
              <span className="font-bold text-xl">FairAI</span>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="#features" className="px-3 py-2 text-sm font-medium hover:text-blue-400 transition-colors">Features</a>
                <a href="#how-it-works" className="px-3 py-2 text-sm font-medium hover:text-blue-400 transition-colors">How It Works</a>
                <a href="#benefits" className="px-3 py-2 text-sm font-medium hover:text-blue-400 transition-colors">Benefits</a>
                <a href="#testimonials" className="px-3 py-2 text-sm font-medium hover:text-blue-400 transition-colors">Testimonials</a>
                <a href="#pricing" className="px-3 py-2 text-sm font-medium hover:text-blue-400 transition-colors">Pricing</a>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link to={"/auth/login"} className="px-4 py-2 text-sm font-medium border border-blue-500 rounded-md hover:bg-blue-500/20 transition-colors">Log In</Link>
              <Link to={"/auth/signup"} className="px-4 py-2 text-sm font-medium bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">Sign Up</Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-800 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-base font-medium hover:bg-slate-700 rounded-md" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-base font-medium hover:bg-slate-700 rounded-md" onClick={() => setIsMenuOpen(false)}>How It Works</a>
              <a href="#benefits" className="block px-3 py-2 text-base font-medium hover:bg-slate-700 rounded-md" onClick={() => setIsMenuOpen(false)}>Benefits</a>
              <a href="#testimonials" className="block px-3 py-2 text-base font-medium hover:bg-slate-700 rounded-md" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium hover:bg-slate-700 rounded-md" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            </div>
            <div className="pt-4 pb-3 border-t border-slate-700">
              <div className="flex items-center px-5">
                <Link className="w-full px-4 py-2 text-sm font-medium border border-blue-500 rounded-md hover:bg-blue-500/20 transition-colors mb-2">Log in</Link>
              </div>
              <div className="flex items-center px-5">
                <button className="w-full px-4 py-2 text-sm font-medium bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">Sign Up</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  AI-Powered Exam Proctoring
                </span> 
                <br />for the Digital Era
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-8">
                Secure, fair, and accessible remote examinations with advanced machine learning monitoring and analytics.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="px-6 py-3 border border-blue-500 rounded-md hover:bg-blue-500/20 transition-colors font-medium">
                  Request Demo
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="bg-blue-500/20 rounded-lg p-2">
                  <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
                    <div className="h-6 bg-slate-700 flex items-center px-4">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <img 
                      src="/api/placeholder/600/400" 
                      alt="FairAI Dashboard" 
                      className="w-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-blue-600 rounded-full p-4 shadow-lg hidden md:block">
                  <Brain className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 bg-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-400 mb-8 text-sm uppercase tracking-wider font-medium">Trusted by leading educational institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {["University of Technology", "Global Learning Institute", "Education First", "Tech Academy", "Future College"].map((name, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-slate-700 rounded-full"></div>
                <span className="text-slate-300 font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Features</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Our AI-powered platform ensures exam integrity with cutting-edge technology and intuitive tools.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Monitoring</h3>
              <p className="text-slate-300">Advanced AI algorithms detect suspicious behaviors and unauthorized resources during exams.</p>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ML Identity Verification</h3>
              <p className="text-slate-300">Biometric authentication ensures the right student is taking the exam from start to finish.</p>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
                <Monitor className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Screen Monitoring</h3>
              <p className="text-slate-300">Tracks application usage and prevents unauthorized resources during examination.</p>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Collaborative Review</h3>
              <p className="text-slate-300">Tools for instructors to review flagged incidents and make informed decisions.</p>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
                <Code className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">API Integration</h3>
              <p className="text-slate-300">Seamless connection with existing LMS platforms and educational software.</p>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy Focused</h3>
              <p className="text-slate-300">GDPR compliant with end-to-end encryption and secure data handling practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-slate-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How FairAI Works</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Our platform combines cutting-edge AI with user-friendly interfaces for seamless exam experiences.</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {[
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
            ].map((item, index) => (
              <div key={index} className="flex mb-12 last:mb-0">
                <div className="mr-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold">
                    {index + 1}
                  </div>
                  {index < 3 && <div className="h-full w-0.5 bg-blue-600 mx-auto mt-2"></div>}
                </div>
                <div>
                  <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">{item.step}</span>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-2">
                  <img 
                    src="/api/placeholder/600/400" 
                    alt="FairAI Benefits" 
                    className="rounded-lg shadow-2xl"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-blue-600 rounded-full p-4 shadow-lg hidden md:block">
                  <Check className="h-8 w-8" />
                </div>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose FairAI?</h2>
              <div className="space-y-6">
                {[
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
                ].map((item, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="bg-blue-500/20 p-1 rounded-full">
                        <Check className="h-5 w-5 text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-slate-300">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-8 px-6 py-3 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center">
                Learn More <ChevronRight className="ml-1 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-24 bg-slate-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Educators Are Saying</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Join hundreds of institutions that have transformed their remote testing with FairAI.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
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
            ].map((item, index) => (
              <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="mb-4 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                </div>
                <p className="text-slate-300 mb-6">{item.quote}</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-slate-700 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-slate-400">{item.role}, {item.institution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Choose the plan that fits your institution's needs with no hidden fees.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$249",
                features: [
                  "Up to 100 exams per month",
                  "Basic AI monitoring",
                  "Identity verification",
                  "Email support",
                  "7-day data retention"
                ]
              },
              {
                name: "Professional",
                price: "$499",
                featured: true,
                features: [
                  "Up to 500 exams per month",
                  "Advanced AI monitoring",
                  "Identity verification",
                  "LMS integration",
                  "Priority support",
                  "30-day data retention",
                  "Custom branding"
                ]
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: [
                  "Unlimited exams",
                  "Premium AI monitoring",
                  "Advanced analytics",
                  "Custom integrations",
                  "Dedicated account manager",
                  "90-day data retention",
                  "Custom security features"
                ]
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className={`rounded-xl p-8 border ${plan.featured ? 'border-blue-500 bg-gradient-to-b from-blue-900/20 to-slate-800' : 'border-slate-700 bg-slate-800'}`}
              >
                {plan.featured && (
                  <span className="inline-block bg-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">Most Popular</span>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-slate-400">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={`w-full py-3 rounded-md font-medium transition-colors ${
                    plan.featured 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'border border-blue-500 hover:bg-blue-500/20'
                  }`}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-800/50 to-purple-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Remote Testing?</h2>
            <p className="text-xl text-slate-300 mb-8">Join leading institutions worldwide in providing secure, fair, and accessible exams with FairAI.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium text-lg">
                Start Free Trial
              </button>
              <button className="px-8 py-4 border border-white/30 rounded-md hover:bg-white/10 transition-colors font-medium text-lg">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-2 text-blue-400" />
                <span className="font-bold text-xl">FairAI</span>
              </div>
              <p className="text-slate-400 mb-4">
                Secure AI-powered proctoring for the future of education.
              </p>
              <div className="flex space-x-4">
                {["twitter", "linkedin", "facebook", "instagram"].map((social) => (
                  <a key={social} href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                    <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="sr-only">{social}</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Case studies</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Webinars</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} FairAI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
