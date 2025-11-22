import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
  MessageSquare,
  Download,
  Loader,
  Brain,
  Sparkles,
  ArrowRight,
  Activity,
  ShieldCheck, // Blockchain
  Link,        // Chain
  Clock,       // Time
  Hash,        // Hash
  Database     // Block
} from "lucide-react";
import { mlServices } from "../services/api";
import axios from "axios"; 

const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  .animate-float-slow { animation: float 6s ease-in-out infinite; }
  
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

  .result-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .result-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .result-scroll::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
  }
`;

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
    return () => {
      if (ref.current) observer.disconnect();
    };
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

const DyslexiaAgent = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  
  // --- BLOCKCHAIN STATE ---
  const [blockData, setBlockData] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
      setResult(null);
      setBlockData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a handwriting sample first");
      return;
    }
    setLoading(true);
    setError("");
    setBlockData(null);

    try {
      const formData = new FormData();
      formData.append("handwriting", file);
      formData.append("userId", "demo_user");
      
      // 1. ML Result
      const response = await mlServices.analyzeDyslexiaHandwriting(formData);
      const analysisData = response.data.result;
      setResult(analysisData);

      // 2. Blockchain Recording
      try {
        const blockchainResponse = await axios.post('http://localhost:3001/api/record', {
           patientId: "ANON-" + Math.floor(Math.random() * 9999),
           disease: `Dyslexia Risk: ${analysisData.analysis.risk_level}`,
           confidence: analysisData.analysis.risk_score
        });

        // Save FULL block data
        if (blockchainResponse.data && blockchainResponse.data.block) {
           setBlockData(blockchainResponse.data.block);
        }
      } catch (bcError) {
        console.error("Blockchain connection failed:", bcError);
      }

    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || "Analysis failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!result) return;
    setGeneratingPDF(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/ml/dyslexia-agent/generate-pdf",
        result,
        { responseType: "arraybuffer", headers: { "Content-Type": "application/json" } }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dyslexia-report-${result.sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleAskPublicHealthAI = () => {
    if (!result) return;
    sessionStorage.setItem(
      "dyslexia_result",
      JSON.stringify({
        topic: "dyslexia_analysis",
        data: result,
        initial_question: `I just received a dyslexia analysis with a ${result.analysis.risk_level} risk level (${result.analysis.risk_score}%). Can you explain what this means and what I should do?`,
      })
    );
    window.location.href = "/public-health";
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "high": return "text-rose-600 bg-rose-50 border-rose-200";
      case "moderate": return "text-amber-600 bg-amber-50 border-amber-200";
      case "low": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getRiskGradient = (level) => {
    switch (level) {
      case "high": return "from-rose-500 to-red-600";
      case "moderate": return "from-amber-400 to-orange-500";
      case "low": return "from-emerald-400 to-green-600";
      default: return "from-slate-400 to-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 overflow-x-hidden font-sans">
      <style>{customStyles}</style>

      <div className="max-w-[90rem] mx-auto px-6 py-8 lg:py-16">
        {/* HEADER */}
        <section className="relative py-12 flex flex-col items-center text-center mb-12">
          <BackgroundIcon icon={Brain} className="w-48 h-48 top-0 left-10 text-cyan-500 animate-float-slow" />
          <BackgroundIcon icon={FileText} className="w-32 h-32 bottom-0 right-10 text-teal-400 animate-float-slow" />

          <RevealOnScroll>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full font-bold text-sm mb-6 border border-cyan-100">
              <Sparkles className="w-4 h-4" /> Neuro-Linguistic Analysis
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">Dyslexia Screening Agent</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Advanced handwriting analysis using computer vision to detect early signs of dyslexia patterns and provide actionable insights.
            </p>
          </RevealOnScroll>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* LEFT: UPLOAD */}
          <RevealOnScroll delay={100}>
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 lg:p-12 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
                  <Upload className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Upload Sample</h2>
              </div>

              <div className="group">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${preview ? "border-cyan-200 bg-cyan-50/30" : "border-slate-300 hover:border-cyan-400 hover:bg-slate-50"}`}>
                  {preview ? (
                    <div className="relative w-full h-full p-4">
                      <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-xl shadow-sm" />
                      <div className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/10 transition-colors rounded-xl flex items-center justify-center">
                        <p className="opacity-0 hover:opacity-100 bg-white/90 px-4 py-2 rounded-full text-sm font-bold text-slate-700 shadow-sm transition-opacity">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-semibold text-slate-700">Upload Handwriting</p>
                      <p className="text-slate-400 text-sm mt-2">Clear image of handwritten text (JPG/PNG)</p>
                    </div>
                  )}
                </label>
              </div>

              <button onClick={handleAnalyze} disabled={!file || loading} className="w-full mt-8 py-4 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-lg hover:shadow-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg">
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" /> Processing Analysis...
                  </>
                ) : (
                  <>
                    Run Analysis <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {error && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700 animate-pulse">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-medium">{error}</p>
                </div>
              )}
            </div>
          </RevealOnScroll>

          {/* RIGHT: RESULTS */}
          <RevealOnScroll delay={200}>
            <div className={`bg-white border border-gray-200 rounded-[2rem] p-8 lg:p-12 shadow-xl h-full flex flex-col transition-all duration-500 ${!result ? "justify-center items-center text-center min-h-[600px]" : ""}`}>
              {result ? (
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <Activity className="w-6 h-6 text-cyan-600" /> Analysis Report
                    </h2>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getRiskColor(result.analysis.risk_level)}`}>
                      {result.analysis.risk_level} Risk
                    </span>
                  </div>

                  {/* Risk Score Card */}
                  <div className="mb-4 relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 shadow-lg">
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${getRiskGradient(result.analysis.risk_level)} opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}></div>
                    <div className="relative z-10 flex items-end justify-between">
                      <div>
                        <p className="text-slate-400 font-medium mb-1">Dyslexia Probability Score</p>
                        <h3 className="text-5xl font-extrabold tracking-tight">{result.analysis.risk_score}%</h3>
                      </div>
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRiskGradient(result.analysis.risk_level)} flex items-center justify-center shadow-inner`}>
                        {result.analysis.risk_level === "low" ? <CheckCircle className="w-8 h-8 text-white" /> : <AlertCircle className="w-8 h-8 text-white" />}
                      </div>
                    </div>
                    <div className="mt-6 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${getRiskGradient(result.analysis.risk_level)} transition-all duration-1000 ease-out`} style={{ width: `${result.analysis.risk_score}%` }} />
                    </div>
                  </div>

                  {/* --- DETAILED BLOCKCHAIN RECEIPT --- */}
                  <div className="mb-6 bg-slate-50 border border-cyan-100 rounded-xl p-4 relative overflow-hidden shadow-sm">
                      <div className="flex flex-col gap-3">
                        {/* Status Line */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                             <ShieldCheck className="w-4 h-4 text-cyan-600" />
                             <span className="text-xs font-bold text-cyan-800 uppercase tracking-wide">VitalChain Ledger</span>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${blockData ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                             {blockData ? "VERIFIED" : "PENDING"}
                          </span>
                        </div>

                        {/* Details Grid */}
                        {blockData ? (
                           <div className="grid grid-cols-1 gap-2 text-xs font-mono text-slate-500">
                              <div className="flex justify-between">
                                 <span>Block Index:</span>
                                 <span className="text-slate-700 font-bold">#{blockData.index}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span>Timestamp:</span>
                                 <span className="text-slate-700">{new Date(blockData.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <div className="flex flex-col gap-1 mt-1">
                                 <span>Hash:</span>
                                 <div className="bg-white border border-slate-200 p-1.5 rounded text-[10px] break-all text-cyan-600">
                                    {blockData.hash}
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="text-center text-xs text-slate-400 py-2 italic">
                              Syncing record to blockchain node...
                           </div>
                        )}
                      </div>
                  </div>
                  {/* ------------------------- */}

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto result-scroll pr-2 space-y-6 max-h-[350px]">
                    {/* Patterns */}
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3">Detected Patterns</h3>
                      <ul className="space-y-2">
                        {result.explanation.pattern_insights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-700 border border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0"></div> {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Explanation */}
                    <div className="p-4 bg-cyan-50/50 border border-cyan-100 rounded-xl">
                      <h3 className="font-bold text-slate-900 mb-2">Clinical Insight</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{result.explanation.message}</p>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {result.explanation.recommendations.map((rec, i) => (
                          <div key={i} className="flex gap-3 text-sm text-slate-600">
                            <span className="font-bold text-cyan-600">{i + 1}.</span>
                            <span>{rec.replace(/^\d+️⃣\s?/, "")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={handleAskPublicHealthAI} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-md transition-all">
                      <MessageSquare className="w-4 h-4" /> Ask CareIntel AI
                    </button>
                    <button onClick={handleGeneratePDF} disabled={generatingPDF} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 text-slate-700 rounded-xl font-bold hover:border-cyan-500 hover:text-cyan-600 transition-all">
                      {generatingPDF ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                // Empty State
                <>
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Brain className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to Analyze</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Upload a handwriting sample on the left to generate a detailed neurological screening report.</p>
                </>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
};

export default DyslexiaAgent;