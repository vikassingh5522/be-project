import { useState, useEffect } from "react";
import {
  Shield,
  Monitor,
  Book,
  User,
  Check,
  ArrowRight,
  Code,
  Brain,
  Eye,
  Users,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import Benifits from "./Benifits";
import Testimonials from "./Testimonials";
import CTA from "./CTA";
import Footer from "./Footer";

export default function Home() {
  // Handle scroll effect for navbar

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <Features />

      {/* How It Works */}
      <HowItWorks />

      {/* Benefits */}
      <Benifits />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA */}
      <CTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
