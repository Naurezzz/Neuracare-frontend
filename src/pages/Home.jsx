import { Link } from 'react-router-dom';
import { Eye, Brain, Shield, Heart, ArrowRight, Activity } from 'lucide-react';

const Home = () => {
  const services = [
    {
      title: 'Eye Disease Detection',
      description: 'AI-powered detection for Glaucoma, Cataract, and Diabetic Retinopathy with 92-96% accuracy',
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
      link: '/eye-disease',
      stats: '92-96% Accuracy'
    },
    {
      title: 'Mental Health Support',
      description: 'Confidential AI chat with crisis detection and PHQ-9 screening',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      link: '/mental-health',
      stats: '95%+ Accuracy'
    },
    {
      title: 'Public Health Info',
      description: 'Real-time COVID stats, health news, and RAG-based health Q&A',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      link: '/public-health',
      stats: 'RAG-Powered'
    },
    {
      title: 'Cognitive Assessment',
      description: 'Speech disorder and dyslexia screening using advanced AI',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
      link: '/cognitive-health',
      stats: '90-100% Accuracy'
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="flex justify-center mb-6">
          <Activity className="w-20 h-20 text-blue-600 animate-pulse" />
        </div>
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          NeuraCare
        </h1>
        <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          AI-Powered Healthcare Platform with 4 Trained Models
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Comprehensive health screening using state-of-the-art machine learning models
          trained on real medical datasets
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/eye-disease"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Get Started
          </Link>
          <Link
            to="/about"
            className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all border-2 border-gray-200"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'AI Models', value: '4', color: 'blue' },
          { label: 'Accuracy', value: '95%+', color: 'purple' },
          { label: 'Diseases Detected', value: '10+', color: 'green' },
          { label: 'Real-time Data', value: '24/7', color: 'pink' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-transform"
          >
            <div className={`text-4xl font-bold text-${stat.color}-600 mb-2`}>
              {stat.value}
            </div>
            <div className="text-gray-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Services Section */}
      <section>
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Our AI Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.title}
                to={service.link}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 bg-gradient-to-r ${service.color} text-white rounded-full text-sm font-semibold`}>
                    {service.stats}
                  </span>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose NeuraCare?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'AI-Powered', desc: 'Trained on real medical datasets' },
            { title: 'High Accuracy', desc: '90-96% detection accuracy' },
            { title: 'Real-time', desc: 'Instant analysis and results' },
            { title: 'Privacy First', desc: 'Your data stays secure' },
            { title: 'RAG Technology', desc: 'Advanced health Q&A' },
            { title: '24/7 Available', desc: 'Access anytime, anywhere' },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-blue-100">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
