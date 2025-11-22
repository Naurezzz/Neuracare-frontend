import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Loader, 
  FileText, 
  Bot,
  Activity,
  ArrowRight,
  ShieldCheck, // Blockchain Icon
  Link,        // Link Icon for chain
  Clock,       // Time Icon
  Hash,        // Hash Icon
  Database     // Block Icon
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

const EyeDisease = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // --- UPDATED: Store Full Block Data ---
  const [blockData, setBlockData] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setBlockData(null); 
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }
    setLoading(true);
    setError(null);
    setBlockData(null);

    try {
      // 1. ML Analysis
      const response = await mlServices.analyzeEyeImage(selectedImage);
      const diagnosisData = response.data.data;
      setResult(diagnosisData);

      // 2. Blockchain Recording
      try {
        const blockchainResponse = await axios.post('http://localhost:3001/api/record', {
           patientId: "ANON-" + Math.floor(Math.random() * 100000), 
           disease: diagnosisData.disease,
           confidence: diagnosisData.confidence
        });

        // Save the FULL block object
        if (blockchainResponse.data && blockchainResponse.data.block) {
           setBlockData(blockchainResponse.data.block);
           console.log("Block Created:", blockchainResponse.data.block);
        }
      } catch (bcError) {
         console.error("Blockchain Error:", bcError);
      }

    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      none: "emerald",
      mild: "yellow",
      moderate: "orange",
      high: "red",
      urgent: "red",
    };
    return colors[severity] || "slate";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 overflow-x-hidden font-sans">
      <style>{customStyles}</style>
      
      <div className="max-w-[90rem] mx-auto px-6 py-8 lg:py-16">
        
        {/* HEADER */}
        <section className="relative py-12 flex flex-col items-center text-center mb-12">
          <BackgroundIcon icon={Eye} className="w-48 h-48 top-0 left-10 text-cyan-500 animate-float-slow" />
          <BackgroundIcon icon={Activity} className="w-32 h-32 bottom-0 right-10 text-teal-400 animate-float-medium" />
          
          <RevealOnScroll>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full font-bold text-sm mb-6 border border-cyan-100">
              <Eye className="w-4 h-4" />
              Ophthalmology AI Model
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Eye Disease Detection
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upload a fundus image to screen for Glaucoma, Cataract, and Diabetic Retinopathy with clinical-grade accuracy.
            </p>
          </RevealOnScroll>
        </section>

        {/* MAIN INTERFACE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Upload Section */}
          <RevealOnScroll delay={100}>
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
                  <Upload className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Upload Scan</h2>
              </div>

              <div className="group">
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${preview ? 'border-cyan-200 bg-cyan-50/30' : 'border-slate-300 hover:border-cyan-400 hover:bg-slate-50'}`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-contain p-4 rounded-2xl" />
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Eye className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-semibold text-slate-700">Click or drag image here</p>
                      <p className="text-slate-400 text-sm mt-2">Supports JPG, PNG (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>

              <button onClick={handleAnalyze} disabled={!selectedImage || loading} className="w-full mt-8 py-4 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-lg hover:shadow-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg">
                {loading ? (
                    <>
                        <Loader className="w-6 h-6 animate-spin" /> Processing...
                    </>
                ) : (
                    <>
                        Analyze Image <ArrowRight className="w-5 h-5" />
                    </>
                )}
              </button>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-pulse">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-medium">{error}</p>
                </div>
              )}
            </div>
          </RevealOnScroll>

          {/* RIGHT: Results Section */}
          <RevealOnScroll delay={200}>
            <div className={`bg-white border border-gray-200 rounded-[2rem] p-8 lg:p-12 shadow-xl transition-all duration-500 h-full flex flex-col ${!result ? 'justify-center items-center text-center min-h-[600px]' : ''}`}>
              {result ? (
                <div className="w-full space-y-8">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <Activity className="w-6 h-6 text-cyan-600" />
                      Analysis Results
                    </h2>
                    <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider bg-${getSeverityColor(result.severity)}-100 text-${getSeverityColor(result.severity)}-700`}>
                      {result.severity}
                    </span>
                  </div>

                  {/* Main Disease Card */}
                  <div className={`p-6 rounded-2xl bg-slate-50 border border-${getSeverityColor(result.severity)}-200 relative overflow-hidden`}>
                     <div className={`absolute top-0 left-0 w-2 h-full bg-${getSeverityColor(result.severity)}-500`}></div>
                     <p className="text-slate-500 font-medium mb-1">Detected Condition</p>
                     <div className="flex justify-between items-end">
                       <h3 className="text-3xl font-bold text-slate-900">{result.disease.replace("_", " ")}</h3>
                       <div className="text-right">
                         <span className="text-3xl font-bold text-cyan-600">{(result.confidence * 100).toFixed(1)}%</span>
                         <p className="text-xs text-slate-400 uppercase font-bold">Confidence</p>
                       </div>
                     </div>
                  </div>

                  {/* --- DETAILED BLOCKCHAIN RECEIPT --- */}
                  <div className="mt-4 bg-slate-900 rounded-2xl border border-slate-700 relative overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="bg-slate-800/50 px-5 py-3 border-b border-slate-700 flex justify-between items-center">
                       <div className="flex items-center gap-2 text-cyan-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="font-bold text-xs uppercase tracking-wider">VitalChain Ledger</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${blockData ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                          <span className="text-[10px] text-slate-400 font-mono">{blockData ? "CONFIRMED" : "SYNCING"}</span>
                       </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4 font-mono text-xs">
                      {blockData ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-black/30 p-2 rounded border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                   <Database className="w-3 h-3" /> Block Height
                                </div>
                                <div className="text-white font-bold text-sm">#{blockData.index}</div>
                             </div>
                             <div className="bg-black/30 p-2 rounded border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                   <Clock className="w-3 h-3" /> Timestamp
                                </div>
                                <div className="text-white text-[10px]">{new Date(blockData.timestamp).toLocaleTimeString()}</div>
                             </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                               <Link className="w-3 h-3" /> Previous Block Hash
                            </div>
                            <div className="text-slate-600 break-all leading-tight text-[10px] hover:text-slate-500 transition-colors">
                               {blockData.previousHash}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-emerald-500 mb-1">
                               <Hash className="w-3 h-3" /> Current Transaction Hash
                            </div>
                            <div className="text-emerald-400 break-all leading-tight text-[10px] bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                               {blockData.hash}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
                           <Loader className="w-5 h-5 animate-spin" />
                           <p>Minting block on local chain...</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* ---------------------------------- */}

                  {/* Probabilities */}
                  <div className="space-y-4 pt-4">
                    <p className="text-slate-900 font-bold text-lg">Prediction Breakdown</p>
                    {Object.entries(result.all_probabilities).map(([disease, prob]) => (
                      <div key={disease}>
                        <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                          <span>{disease.replace("_", " ")}</span>
                          <span>{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${prob * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="bg-cyan-50/50 rounded-2xl p-6 border border-cyan-100">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-cyan-600" /> AI Recommendation
                    </h4>
                    <p className="text-slate-700 leading-relaxed mb-4">{result.recommendations.message}</p>
                    <div className="text-sm font-semibold text-cyan-800">Follow-up: {result.recommendations.follow_up}</div>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <button className="flex items-center justify-center gap-2 px-6 py-4 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
                      <Bot className="w-5 h-5" /> Summarize
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-700 border-2 border-gray-200 rounded-xl font-bold hover:border-cyan-200 hover:bg-gray-50 transition-all hover:-translate-y-1">
                      <FileText className="w-5 h-5" /> Report
                    </button>
                  </div>
                </div>
              ) : (
                // Empty State
                <>
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Activity className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Awaiting Analysis</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Upload a scan on the left to generate a detailed medical report.</p>
                </>
              )}
            </div>
          </RevealOnScroll>
        </div>

        {/* INFO CARDS */}
        <RevealOnScroll delay={300}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
            {[
              { name: "Normal", desc: "No significant abnormalities detected." },
              { name: "Diabetic Retinopathy", desc: "Damage to blood vessels in the tissue at the back of the eye." },
              { name: "Glaucoma", desc: "Damage to the optic nerve, often linked to high pressure." },
              { name: "Cataract", desc: "Clouding of the normally clear lens of the eye." },
            ].map((item) => (
              <div key={item.name} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-cyan-300 hover:shadow-lg transition-all">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{item.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>

      </div>
    </div>
  );
};

export default EyeDisease;