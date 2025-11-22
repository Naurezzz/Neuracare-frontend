import React, { useState } from "react";
import { Upload, AlertCircle, CheckCircle, FileText, MessageSquare, Download, Loader } from "lucide-react";
import { mlServices } from "../services/api";
import axios from "axios";  // ADD THIS IMPORT

const DyslexiaAgent = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log("📁 File selected:", selectedFile.name, selectedFile.size, "bytes");
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a handwriting sample first");
      return;
    }

    console.log("🚀 Starting analysis with file:", file.name);
    setLoading(true);
    setError("");
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append("handwriting", file);
      formData.append("userId", "demo_user");

      console.log("📤 Sending request to backend...");
      const response = await mlServices.analyzeDyslexiaHandwriting(formData);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Response received in ${duration}ms:`, response.data);
      setResult(response.data.result);
      
    } catch (err) {
      console.error("❌ Analysis error:", err);
      console.error("Error response:", err.response?.data);
      
      const errorMsg = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.message 
        || "Analysis failed. Please try again.";
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!result) return;

    setGeneratingPDF(true);
    console.log("📄 Generating PDF...");

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ml/dyslexia-agent/generate-pdf',
        result,
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("✅ PDF received:", response.data.byteLength, "bytes");
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dyslexia-report-${result.sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("✅ PDF downloaded successfully");
    } catch (err) {
      console.error("❌ PDF generation error:", err);
      console.error("Error response:", err.response?.data);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleAskPublicHealthAI = () => {
    if (!result) return;
    
    sessionStorage.setItem('dyslexia_result', JSON.stringify({
      topic: "dyslexia_analysis",
      data: result,
      initial_question: `I just received a dyslexia analysis with a ${result.analysis.risk_level} risk level (${result.analysis.risk_score}%). Can you explain what this means and what I should do?`
    }));
    
    window.location.href = '/public-health';
  };

  const getRiskColor = (level) => {
    switch(level) {
      case "high": return "text-red-600 bg-red-50";
      case "moderate": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dyslexia Detection Agent</h1>
          <p className="text-gray-600">AI-powered handwriting analysis for early dyslexia screening</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="mr-2" size={20} />
              Upload Handwriting Sample
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
                ) : (
                  <div>
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-400 mt-2">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </label>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                "Analyze Handwriting"
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-start">
                <AlertCircle className="text-red-600 mr-2 flex-shrink-0" size={20} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            {!result ? (
              <div className="text-center text-gray-400 py-12">
                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                <p>Upload and analyze a sample to see results</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Risk Score */}
                <div className={`p-4 rounded-lg ${getRiskColor(result.analysis.risk_level)}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Risk Level:</span>
                    <span className="text-2xl font-bold">{result.analysis.risk_score}%</span>
                  </div>
                  <div className="flex items-center">
                    {result.analysis.risk_level === "low" ? (
                      <CheckCircle size={20} className="mr-2" />
                    ) : (
                      <AlertCircle size={20} className="mr-2" />
                    )}
                    <span className="uppercase font-semibold">{result.analysis.risk_level} Risk</span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Analysis Summary</h3>
                  <p className="text-gray-700 text-sm">{result.explanation.message}</p>
                </div>

                {/* Patterns */}
                {result.explanation.pattern_insights.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Detected Patterns</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {result.explanation.pattern_insights.map((insight, i) => (
                        <li key={i}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {result.explanation.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="text-sm text-gray-700">• {rec.replace(/^\d+️⃣\s?/, '')}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-4 space-y-3">
                  <button
                    onClick={handleAskPublicHealthAI}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
                  >
                    <MessageSquare className="mr-2" size={18} />
                    Ask Public Health AI
                  </button>
                  
                  <button
                    onClick={handleGeneratePDF}
                    disabled={generatingPDF}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition flex items-center justify-center"
                  >
                    {generatingPDF ? (
                      <>
                        <Loader className="mr-2 animate-spin" size={18} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2" size={18} />
                        Download Report (PDF)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DyslexiaAgent;
