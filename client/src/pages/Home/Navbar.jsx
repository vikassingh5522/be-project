import React from 'react'
import { Shield, Monitor, Book, User, Check, ArrowRight, Code, Brain, Eye, Users, ChevronRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
      const [isMenuOpen, setIsMenuOpen] = React.useState(false);
      const [isScrolled, setIsScrolled] = React.useState(false);

       React.useEffect(() => {
          const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
          };
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
        }, []);

  return (
    <>
        <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 mr-2 text-blue-600" />
              <span className="font-bold text-xl">FairAI</span>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="#features" className="px-3 py-2 text-sm font-medium hover:text-blue-600 transition-colors">Features</a>
                <a href="#how-it-works" className="px-3 py-2 text-sm font-medium hover:text-blue-600 transition-colors">How It Works</a>
                <a href="#benefits" className="px-3 py-2 text-sm font-medium hover:text-blue-600 transition-colors">Benefits</a>
                <a href="#testimonials" className="px-3 py-2 text-sm font-medium hover:text-blue-600 transition-colors">Testimonials</a>
                <a href="#pricing" className="px-3 py-2 text-sm font-medium hover:text-blue-600 transition-colors">Pricing</a>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link to={"/auth/login"} className="px-4 py-2 text-sm font-medium border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">Log In</Link>
              <Link to={"/auth/signup"} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Sign Up</Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-base font-medium hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-base font-medium hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>How It Works</a>
              <a href="#benefits" className="block px-3 py-2 text-base font-medium hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>Benefits</a>
              <a href="#testimonials" className="block px-3 py-2 text-base font-medium hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <Link className="w-full px-4 py-2 text-sm font-medium border border-blue-600 rounded-md hover:bg-blue-50 transition-colors mb-2">Log in</Link>
              </div>
              <div className="flex items-center px-5">
                <button className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Sign Up</button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar