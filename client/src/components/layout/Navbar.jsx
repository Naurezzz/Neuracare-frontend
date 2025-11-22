import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, MoveLeft, Server } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
     { name: "Home", path: "/" },
    { name: "Services", path: "/#services" },
    { name: "Features", path: "/#features" },
   
  ];

  return (
    <>
      {/* Internal Style for Slide Down Animation */}
      <style>
        {`
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .nav-slide-down {
            animation: slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 nav-slide-down ${
          isScrolled
            ? "bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm py-4"
            : "bg-transparent border-b border-transparent py-6"
        }`}
      >
        <div className="max-w-[90rem] mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo Area */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative flex items-center justify-center w-10 h-10  rounded-xl shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-105">
                <Activity className="w-8 h-8 text-cyan-600 animate-pulse" />
              </div>
              <span
                className={`text-2xl font-bold tracking-tight transition-colors ${
                  isScrolled ? "text-slate-800" : "text-slate-800"
                }`}
              >
                VitalCare
              </span>
            </Link>

            {/* Nav Links (Desktop) */}
            <div className="hidden md:flex items-center space-x-10">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="relative group text-xl  font-medium text-slate-600 hover:text-cyan-600 transition-colors"
                >
                  {item.name}
                  {/* Animated Underline */}
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                </a>
              ))}

              {/* Action Button */}
              <Link
                to="/auth "
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
