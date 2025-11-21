import { useState } from 'react';
import { Upload, Eye, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { mlServices } from '../services/api';

const EyeDisease = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await mlServices.analyzeEyeImage(selectedImage);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      none: 'green',
      mild: 'yellow',
      moderate: 'orange',
      high: 'red',
      urgent: 'red',
    };
    return colors[severity] || 'gray';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <Eye className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Eye Disease Detection</h1>
        <p className="text-lg text-gray-600">
          AI-powered detection for Glaucoma, Cataract, and Diabetic Retinopathy
        </p>
        <div className="mt-4 inline-block px-6 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
          92-96% Accuracy
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Eye Image</h2>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg mb-4" />
              ) : (
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              )}
              <p className="text-gray-600 mb-2">
                {preview ? 'Click to change image' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
            </label>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || loading}
            className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Analysis Results</h2>
          
          {result ? (
            <div className="space-y-6">
              {/* Disease Detection */}
              <div className={`p-6 rounded-xl bg-${getSeverityColor(result.severity)}-50 border-2 border-${getSeverityColor(result.severity)}-200`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Detected Condition</h3>
                  <CheckCircle className={`w-6 h-6 text-${getSeverityColor(result.severity)}-600`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {result.disease.replace('_', ' ')}
                </div>
                <div className="text-lg text-gray-600">
                  Confidence: {(result.confidence * 100).toFixed(2)}%
                </div>
                <div className="mt-2 inline-block px-4 py-1 bg-white rounded-full text-sm font-semibold">
                  Severity: {result.severity.toUpperCase()}
                </div>
              </div>

              {/* All Probabilities */}
              <div>
                <h4 className="font-bold mb-3 text-gray-800">All Predictions</h4>
                <div className="space-y-2">
                  {Object.entries(result.all_probabilities).map(([disease, prob]) => (
                    <div key={disease} className="flex items-center">
                      <span className="text-sm text-gray-600 w-40">{disease.replace('_', ' ')}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-bold mb-3 text-gray-800">Recommendations</h4>
                <p className="text-gray-700 mb-4">{result.recommendations.message}</p>
                <ul className="space-y-2">
                  {result.recommendations.actions?.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <span className="font-semibold text-gray-800">Follow-up: </span>
                  <span className="text-gray-700">{result.recommendations.follow_up}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Upload and analyze an eye image to see results</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Detectable Conditions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Normal', desc: 'Healthy eyes with no detected issues' },
            { name: 'Diabetic Retinopathy', desc: 'Retinal damage from diabetes' },
            { name: 'Glaucoma', desc: 'Optic nerve damage causing vision loss' },
            { name: 'Cataract', desc: 'Clouding of the eye lens' },
          ].map((condition) => (
            <div key={condition.name} className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition">
              <h3 className="font-bold text-gray-800 mb-2">{condition.name}</h3>
              <p className="text-sm text-gray-600">{condition.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EyeDisease;
