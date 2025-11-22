import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Brain,
  Shield,
  Heart,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
   Zap,
  Mic,          
  Bot,      
  HeartHandshake, 
  Menu,     
  X   
} from "lucide-react";

// --- 1. Internal CSS for Animations ---
const customStyles = `
  /* Floating animations for background icons */
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  .animate-float-slow { animation: float 6s ease-in-out infinite; }
  .animate-float-medium { animation: float 5s ease-in-out infinite; }
  .animate-float-fast { animation: float 4s ease-in-out infinite; }
  
  /* Slower spin for background decorative elements */
  .animate-spin-slow { animation: spin 15s linear infinite; }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Pulse effect for backgrounds */
  .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }

  /* --- NEW ECG ANIMATION (Draw & Fade Loop) --- */
  @keyframes ecgDrawFade {
    0% { 
      stroke-dashoffset: 1200; 
      opacity: 1;
    }
    80% { 
      stroke-dashoffset: 0; 
      opacity: 1;
    }
    90% {
      stroke-dashoffset: 0; 
      opacity: 0; /* Fade out at the end */
    }
    100% { 
      stroke-dashoffset: 1200; 
      opacity: 0; /* Reset invisible */
    }
  }

  .ecg-path-active {
    fill: none;
    stroke: url(#ecg-gradient);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1200; 
    stroke-dashoffset: 1200;
    /* Continuous 3.0s loop */
    animation: ecgDrawFade 3.0s linear infinite; 
  }

  /* --- SCROLL REVEAL ANIMATION CLASSES --- */
  .reveal-section {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
    will-change: opacity, transform;
  }
  .reveal-section.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

// --- 2. Helper Components ---

// Floating Background Icon
const BackgroundIcon = ({ icon: Icon, className }) => (
  <div
    className={`absolute opacity-10 md:opacity-20 pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <Icon className="w-full h-full" />
  </div>
);

// Scroll Animation Wrapper
const RevealOnScroll = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Only animate once
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-section ${isVisible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Animated ECG Component (Pure CSS Animation + Centered Path)
const ECGMonitor = () => {
  return (
    <div className="relative w-80 h-28 md:w-[500px] md:h-36 bg-white/50 backdrop-blur-sm border border-cyan-100 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>
      <svg viewBox="0 0 450 100" className="w-full h-full p-4">
        <defs>
          <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="5%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="95%" stopColor="#0d9488" stopOpacity="1" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="ecg-path-active"
          d="
            M0,50 L45,50 
            L55,40 L65,50 L75,55 L85,10 L95,90 L105,50 L115,40 L135,50 
            L180,50 
            L190,40 L200,50 L210,55 L220,10 L230,90 L240,50 L250,40 L270,50 
            L315,50 
            L325,40 L335,50 L345,55 L355,10 L365,90 L375,50 L385,40 L405,50 
            L450,50
          "
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

// --- 3. Main Home Component ---
const Home = () => {
   const services = [
    {
      title: "Dyslexia Screening",
      description: "AI-powered reading, writing, and comprehension assessment for early dyslexia detection",
      icon: Brain,
      link: "/dyslexia",
      stats: "High Precision",
    },
    {
      title: "Speech Disorder Screening",
      description: "Real-time speech analysis to detect articulation, fluency, and language disorders",
      icon: Mic, // Updated from Heart to Mic
      link: "/speech",
      stats: "Clinically Aligned",
    },
    {
      title: "Mental Health Support",
      description:
        "Confidential AI chat with crisis detection and PHQ-9 screening",
      icon: HeartHandshake, // Updated from Brain to HeartHandshake
      link: "/mental-health",
      stats: "95%+ Accuracy",
    },
    {
      title: "Eye Disease Detection",
      description:
        "AI-powered detection for Glaucoma, Cataract, and Diabetic Retinopathy",
      icon: Eye,
      link: "/eye-disease",
      stats: "90% Accuracy",
    },
    {
      title: "CareIntel AI",
      description:
        "Real-time health stats, news, smart Q&A, report summaries, and actionable solutions",
      icon: Bot, // Updated from Shield to Bot
      link: "/public-health",
      stats: "RAG-Powered",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 overflow-x-hidden font-sans">
      <style>{customStyles}</style>

      <div className="max-w-[90rem] mx-auto px-6 py-8 lg:py-16 space-y-24 lg:space-y-32">
        {/* ================= HERO SECTION ================= */}
        <section className="relative min-h-[85vh] flex flex-col justify-center items-center pt-20">
          {/* Animated Background Elements - Centered Layout */}
          {/* Brain & Heart adjusted to top-1/3 to align with the Title/Content area */}
          <BackgroundIcon
            icon={Brain}
            className="w-32 h-32 lg:w-48 lg:h-48 top-1/3 -left-10 lg:-left-8 text-cyan-500 animate-float-slow"
          />
          <BackgroundIcon
            icon={Heart}
            className="w-24 h-24 lg:w-36 lg:h-36 top-1/3 right-2 lg:-right-8 text-teal-400 animate-float-medium"
          />

          <BackgroundIcon
            icon={Eye}
            className="w-28 h-28 lg:w-40 lg:h-40 bottom-20 left-4 lg:left-10 text-slate-400 animate-float-slow"
          />
          <BackgroundIcon
            icon={Shield}
            className="w-20 h-20 lg:w-32 lg:h-32 bottom-0 -right-4 lg:-right-5 text-cyan-300 animate-float-medium"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-gradient-to-r from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

          <div className="relative z-10 flex flex-col items-center w-full">
            {/* ECG Monitor */}
            <RevealOnScroll>
              <div className="mb-8 lg:mb-12">
                <ECGMonitor />
              </div>
            </RevealOnScroll>

            {/* TITLE */}
            <RevealOnScroll delay={100}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-slate-900 tracking-tight">
                VitalCare
              </h1>
            </RevealOnScroll>

            {/* SUBTITLE */}
            <RevealOnScroll delay={200}>
              <p className="text-2xl md:text-3xl lg:text-4xl text-slate-600 mb-6 max-w-4xl mx-auto font-medium">
                AI-Powered Healthcare Platform
              </p>
            </RevealOnScroll>

            {/* DESCRIPTION */}
            <RevealOnScroll delay={300}>
              <p className="text-xl lg:text-2xl text-center text-slate-500 mb-10 max-w-3xl mx-auto leading-relaxed">
                Comprehensive health screening using state-of-the-art machine
                learning models trained on real medical datasets with
                clinical-grade accuracy.
              </p>
            </RevealOnScroll>

            {/* BUTTONS */}
            <RevealOnScroll delay={400}>
              <div className="flex justify-center gap-6 mb-20">
                <Link
                  to="/eye-disease"
                  className="px-10 py-5 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-xl"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="px-10 py-5 bg-white text-slate-700 rounded-xl font-bold hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-cyan-200 hover:shadow-md hover:-translate-y-1 text-xl"
                >
                  Learn More
                </Link>
              </div>
            </RevealOnScroll>

            {/* STATS BAR */}
            <RevealOnScroll delay={500}>
              <div className="w-full max-w-6xl bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl grid grid-cols-2 md:grid-cols-3 gap-8">
                {[
                  { label: "Features", value: "4" },
                  { label: "Accuracy", value: "95%+" },
                  {
                    label: "Availability",
                    value: "24/7",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="pr-10 flex flex-col items-center text-center space-around"
                  >
                    <div className="text-4xl lg:text-5xl font-extrabold text-cyan-600 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-slate-700 font-bold text-lg lg:text-xl">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ================= THE PROBLEM VS SOLUTION ================= */}
        <section className="relative z-10">
          <RevealOnScroll>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
              {/* LEFT: The Problem */}
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-10 lg:p-16 relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <AlertCircle className="w-40 h-40 text-slate-900" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-red-50 text-red-600 rounded-full font-bold text-base mb-8">
                    <AlertCircle className="w-5 h-5" />
                    The Challenge
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                    Healthcare is often slow, expensive, and inaccessible.
                  </h3>
                  <div className="space-y-6">
                    <p className="text-slate-600 text-xl leading-relaxed">
                      Millions suffer from delayed diagnoses due to overcrowded
                      hospitals and shortage of specialists. Waiting weeks for a
                      simple screening can lead to preventable complications.
                    </p>
                    <ul className="space-y-4 mt-6">
                      {[
                        "Long wait times for appointments",
                        "High cost of specialist consultations",
                        "Limited access in remote areas",
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-4 text-slate-700 text-lg font-medium"
                        >
                          <div className="w-2.5 h-2.5 bg-red-400 rounded-full shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* RIGHT: The Solution */}
              <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-[2rem] p-10 lg:p-16 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity group-hover:rotate-12 duration-500">
                  <Zap className="w-40 h-40 text-white" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-full font-bold text-base mb-8 border border-white/30">
                    <CheckCircle2 className="w-5 h-5" />
                    The VitalCare Solution
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                    Instant, clinical-grade AI analysis from your home.
                  </h3>
                  <div className="space-y-6">
                    <p className="text-cyan-50 text-xl leading-relaxed">
                      VitalCare bridges the gap by leveraging advanced computer
                      vision. Get preliminary diagnostics in seconds, not weeks,
                      empowering you to take control of your health immediately.
                    </p>
                    <ul className="space-y-4 mt-6">
                      {[
                        "Instant results in seconds",
                        "95%+ Accuracy on screenings",
                        "Available 24/7, anywhere",
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-4 text-white text-lg font-medium"
                        >
                          <CheckCircle2 className="w-6 h-6 text-cyan-300 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ================= SERVICES SECTION ================= */}
        <section id="services" className="pt-20 relative z-10">
          <RevealOnScroll>
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Our Services
              </h2>
              <p className="text-slate-600 text-xl lg:text-2xl max-w-3xl mx-auto">
                Advanced machine learning models providing accurate health
                assessments
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {services.map((service, index) => {
              const Icon = service.icon;
              // Logic to center the last card:
              // If it is the last item, make it span 2 columns (on md screens)
              // and restrict width to 50% so it looks like a single centered card.
              const isLast = index === services.length - 1;

              return (
                <RevealOnScroll key={service.title} delay={index * 100}>
                  <div
                    className={`h-full ${
                      isLast ? "md:col-span-2 flex justify-center" : ""
                    }`}
                  >
                    <Link
                      to={service.link}
                      className={`group bg-white rounded-[2rem] p-10 lg:p-12 border border-gray-200 hover:border-cyan-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full w-full ${
                        isLast ? " md:max-w-[calc(100%-1.25rem)]" : ""
                      }`}
                    >
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-8 group-hover:from-cyan-200 group-hover:to-teal-200 transition-all group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-cyan-600" />
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 group-hover:text-cyan-700 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-slate-600 mb-8 leading-relaxed text-lg lg:text-xl flex-grow">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="px-5 py-2.5 bg-cyan-50 text-cyan-700 rounded-xl text-base font-bold border border-cyan-100 group-hover:bg-cyan-100 transition-colors">
                          {service.stats}
                        </span>
                        <ArrowRight className="w-8 h-8 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-2 transition-all" />
                      </div>
                    </Link>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>  

        {/* ================= FEATURES SECTION ================= */}
        <section
          id="features"
          className="bg-white border border-gray-200 rounded-[3rem] p-10 lg:p-20 relative z-10"
        >
          <RevealOnScroll>
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Why Choose VitalCare?
              </h2>
              <p className="text-slate-600 text-xl lg:text-2xl">
                Enterprise-grade healthcare AI platform built for accuracy and
                reliability
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            {[
              {
                title: "AI-Powered",
                desc: "Trained on real medical datasets",
                icon: Brain,
              },
              {
                title: "High Accuracy",
                desc: "90-96% detection accuracy",
                icon: CheckCircle2,
              },
              {
                title: "Real-time",
                desc: "Instant analysis and results",
                icon: Activity,
              },
              {
                title: "Privacy First",
                desc: "Your data stays secure by Blockchain Integration",
                icon: Shield,
              },
              {
                title: "RAG Technology",
                desc: "Advanced Healthcare AI ",
                icon: Eye,
              },
              {
                title: "24/7 Available",
                desc: "Access anytime, anywhere",
                icon: Heart,
              },
            ].map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <RevealOnScroll key={feature.title} delay={index * 50}>
                  <div className="text-center group p-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                      <FeatureIcon className="w-8 h-8 lg:w-10 lg:h-10 text-cyan-600" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-3 text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-lg lg:text-xl leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>

        {/* ================= CTA SECTION ================= */}
        <section className="text-center pb-12 relative z-10">
          <RevealOnScroll>
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden shadow-2xl">
              <div className="absolute -top-32 -right-32 opacity-10 pointer-events-none">
                <Heart className="w-96 h-96 text-white animate-spin-slow" />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 relative z-10">
                Ready to Get Started?
              </h2>
              <p className="text-cyan-100 text-xl lg:text-2xl mb-12 max-w-3xl mx-auto relative z-10 font-medium">
                Experience the future of AI-powered healthcare diagnostics
                today.
              </p>
              <Link
                to="/eye-disease"
                className="inline-block px-12 py-6 bg-cyan-500 text-white rounded-2xl font-bold hover:bg-cyan-400 transition-all shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 text-xl lg:text-2xl relative z-10"
              >
                Start Your Assessment
              </Link>
            </div>
          </RevealOnScroll>
        </section>
      </div>
    </div>
  );
};

export default Home;
