import { useState, useEffect } from 'react';
import { Shield, MessageCircle, Activity, MapPin, Newspaper, Loader } from 'lucide-react';
import { mlServices } from '../services/api';

const PublicHealth = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [covidStats, setCovidStats] = useState(null);
  const [news, setNews] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('India');

  useEffect(() => {
    loadCovidStats();
    loadNews();
  }, [selectedCountry]);

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
    try {
      const response = await mlServices.askHealthQuestion(question);
      setAnswer(response.data);
    } catch (error) {
      setAnswer({
        answer: 'Sorry, I encountered an error. Please try again.',
        source: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Public Health Information</h1>
        <p className="text-lg text-gray-600">
          Real-time COVID stats, health news, and AI-powered health Q&A
        </p>
        <div className="mt-4 inline-block px-6 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
          RAG-Powered with Groq Llama 3.1
        </div>
      </div>

      {/* RAG Q&A Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center mb-6">
          <MessageCircle className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Ask Health Questions</h2>
        </div>

        <div className="flex space-x-2 mb-6">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask me anything about health..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Ask'}
          </button>
        </div>

        {/* Quick Questions */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'What is diabetes?',
              'Symptoms of hypertension?',
              'How to prevent heart disease?',
              'What causes glaucoma?',
            ].map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Answer */}
        {answer && (
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Answer</h3>
              <span className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full">
                {answer.source}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{answer.answer}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COVID-19 Statistics */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">COVID-19 Stats</h2>
            </div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Germany">Germany</option>
            </select>
          </div>

          {covidStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 mb-1">Total Cases</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {covidStats.total_cases.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-sm text-red-600 mb-1">Total Deaths</p>
                  <p className="text-2xl font-bold text-red-900">
                    {covidStats.total_deaths.toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-sm text-yellow-600 mb-1">Active Cases</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {covidStats.active_cases.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600 mb-1">Tests</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {covidStats.tests.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Last updated: {new Date(covidStats.last_updated).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading statistics...</p>
            </div>
          )}
        </div>

        {/* Health News */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Newspaper className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Health News</h2>
          </div>

          {news.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {news.map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{article.source}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(article.published).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No news available</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: MapPin, title: 'Global Data', desc: 'Real-time stats from 200+ countries' },
          { icon: Shield, title: 'Verified Sources', desc: 'Data from trusted health organizations' },
          { icon: MessageCircle, title: 'AI Assistant', desc: 'RAG-powered health information' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <Icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PublicHealth;
