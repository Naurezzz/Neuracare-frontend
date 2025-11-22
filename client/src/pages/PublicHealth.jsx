import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  MessageCircle, 
  Activity, 
  MapPin, 
  Newspaper, 
  Loader, 
  Search, 
  Bot, 
  Globe, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { mlServices } from '../services/api';

// --- 1. Internal CSS ---
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  .animate-float-slow { animation: float 6s ease-in-out infinite; }
  .animate-float-medium { animation: float 5s ease-in-out infinite; }
  
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

const RevealOnScroll = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.disconnect(); };
  }, []);

  return (
    <div ref={ref} className={`reveal-section ${isVisible ? "is-visible" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const BackgroundIcon = ({ icon: Icon, className }) => (
  <div className={`absolute opacity-5 md:opacity-10 pointer-events-none select-none ${className}`} aria-hidden="true">
    <Icon className="w-full h-full" />
  </div>
);

const PublicHealth = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [covidStats, setCovidStats] = useState(null);
  const [news, setNews] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('India');

  // Ref for auto-scrolling to answer
  const answerRef = useRef(null);

  useEffect(() => {
    loadCovidStats();
    loadNews();
  }, [selectedCountry]);

  // Effect to scroll to answer when it loads
  useEffect(() => {
    if (answer && answerRef.current) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        answerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [answer]);

  const loadCovidStats = async () => {
    try {
      const response = await mlServices.getCovidStats(selectedCountry);
      setCovidStats(response.data.data);
    } catch (error) {
      console.error('Failed to load COVID stats:', error);
    }
  };

  const loadNews = async () => {
    try {
      const response = await mlServices.getHealthNews(`health ${selectedCountry}`);
      if (response.data.articles) {
        setNews(response.data.articles);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null); // Reset previous answer
    try {
      const response = await mlServices.askHealthQuestion(question);
      setAnswer(response.data);
    } catch (error) {
      setAnswer({ answer: 'Sorry, I encountered an error. Please try again.', source: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 overflow-x-hidden font-sans">
      <style>{customStyles}</style>

      <div className="max-w-[90rem] mx-auto px-6 py-8 lg:py-16">
        
        {/* ================= HEADER ================= */}
        <section className="relative py-12 flex flex-col items-center text-center mb-12">
          <BackgroundIcon icon={Globe} className="w-48 h-48 top-0 left-10 text-cyan-500 animate-float-slow" />
          <BackgroundIcon icon={Shield} className="w-32 h-32 bottom-0 right-10 text-teal-400 animate-float-medium" />
          
          <RevealOnScroll>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full font-bold text-sm mb-6 border border-cyan-100">
              <Bot className="w-4 h-4" />
              CareIntel AI Core
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Public Health Intelligence
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Real-time epidemiological data, curated medical news, and AI-powered health advisory powered by RAG technology.
            </p>
          </RevealOnScroll>
        </section>

        {/* ================= AI Q&A SECTION ================= */}
        <RevealOnScroll delay={100}>
          <div className="bg-white border border-gray-200 rounded-[2rem] p-8 lg:p-12 shadow-xl mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Ask CareIntel</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-8 relative z-10">
              <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                  placeholder="Ex: What are the early signs of diabetes?"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-all shadow-inner"
                />
              </div>
              <button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className="px-10 py-5 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition-all shadow-lg hover:shadow-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shrink-0"
              >
                {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Ask AI <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-3 mb-8 relative z-10">
              <span className="text-sm font-bold text-slate-500 py-2 mr-2">Suggested:</span>
              {[
                'Symptoms of hypertension?',
                'How to prevent heart disease?',
                'Latest COVID guidelines?',
                'Benefits of Mediterranean diet?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 rounded-xl text-sm font-medium transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Answer Card (Ref added here for scroll targeting) */}
            {answer && (
              <div 
                ref={answerRef} 
                className="bg-gradient-to-br from-slate-50 to-white border border-cyan-100 rounded-2xl p-8 relative z-10 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200/60">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-cyan-600" />
                    AI Analysis
                  </h3>
                  <span className="text-xs font-bold text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Source: {answer.source}
                  </span>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
                </div>
              </div>
            )}
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* ================= COVID STATS ================= */}
          <RevealOnScroll delay={200}>
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-xl h-full">
              <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Live Statistics</h2>
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 cursor-pointer"
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>
              </div>

              {covidStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Cases</p>
                      <p className="text-2xl lg:text-3xl font-extrabold text-slate-800">
                        {covidStats.total_cases.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Total Deaths</p>
                      <p className="text-2xl lg:text-3xl font-extrabold text-slate-800">
                        {covidStats.total_deaths.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Active Cases</p>
                      <p className="text-2xl lg:text-3xl font-extrabold text-slate-800">
                        {covidStats.active_cases.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Total Tests</p>
                      <p className="text-2xl lg:text-3xl font-extrabold text-slate-800">
                        {covidStats.tests.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-center pt-4 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-400">
                      Last updated: {new Date(covidStats.last_updated).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Loader className="w-8 h-8 animate-spin mb-2" />
                  <p>Fetching latest data...</p>
                </div>
              )}
            </div>
          </RevealOnScroll>

          {/* ================= HEALTH NEWS ================= */}
          <RevealOnScroll delay={300}>
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-xl h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Trending News</h2>
              </div>

              {news.length > 0 ? (
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
                  {news.map((article, index) => (
                    <a
                      key={index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-cyan-200 hover:shadow-lg transition-all group"
                    >
                      <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-cyan-700 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                          {article.source}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(article.published).toLocaleDateString()}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Newspaper className="w-12 h-12 opacity-20 mb-4" />
                  <p>No recent news found</p>
                </div>
              )}
            </div>
          </RevealOnScroll>

        </div>

        {/* ================= INFO CARDS ================= */}
        <RevealOnScroll delay={400}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: MapPin, title: 'Global Coverage', desc: 'Aggregated data from over 200+ territories and health organizations.' },
              { icon: CheckCircle2, title: 'Verified Sources', desc: 'Information strictly sourced from WHO, CDC, and local health ministries.' },
              { icon: Bot, title: 'RAG Powered', desc: 'Uses Retrieval-Augmented Generation for accurate context-aware answers.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white p-8 rounded-[2rem] border border-gray-200 hover:border-cyan-200 hover:shadow-xl transition-all text-center group">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

      </div>
    </div>
  );
};

export default PublicHealth;