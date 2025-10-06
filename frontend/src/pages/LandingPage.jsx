// LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Clock, MapPin, Users, Heart, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Rapid Response",
      description:
        "Instant emergency alert system with real-time location tracking",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Live Location",
      description: "Automatic GPS location sharing with emergency responders",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Agency Support",
      description: "Connected with hospitals, police, and fire departments",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Medical Profile",
      description:
        "Quick access to your medical information for first responders",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation Bar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">SwiftAid</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            SwiftAid Emergency Response System
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Your Safety is Our
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {" "}
              Priority
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            SwiftAid connects you with emergency services instantly. With one
            tap, get the help you need from verified responders in your area.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-3"
            >
              <span>Start Protecting Yourself</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Emergency Types */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Comprehensive Emergency Coverage
            </h2>
            <p className="text-gray-600 text-lg">
              We're here for all types of emergencies, 24/7
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Medical Emergency",
              "Fire Accident",
              "Road Accident",
              "Natural Disaster",
              "Security Threat",
              "Other Emergencies",
            ].map((type, index) => (
              <div
                key={index}
                className="bg-gray-50 hover:bg-blue-50 rounded-xl p-4 text-center transition-all duration-300 border border-gray-200 hover:border-blue-200"
              >
                <span className="text-gray-700 font-medium text-sm">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="text-center mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Round the Clock Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Verified Responders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                Instant
              </div>
              <div className="text-gray-600">Emergency Response</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Feel Safer?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of users who trust SwiftAid for their emergency
              response needs.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold">SwiftAid</span>
          </div>
          <p className="text-gray-400 text-sm">
            Emergency Response System • Your Safety Partner
          </p>
          <p className="text-gray-500 text-xs mt-4">
            © 2024 SwiftAid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
