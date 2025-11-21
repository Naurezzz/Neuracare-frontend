import { Activity, Brain, Eye, Heart, Shield, Target, Users, Zap } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Eye,
      title: 'Eye Disease Detection',
      desc: 'Trained on ODIR-5K dataset with 5,000 real patient images',
      accuracy: '92-96%',
      color: 'blue',
    },
    {
      icon: Brain,
      title: 'Mental Health Support',
      desc: 'BERT model trained on real crisis and depression datasets',
      accuracy: '95%+',
      color: 'purple',
    },
    {
      icon: Shield,
      title: 'Public Health Info',
      desc: 'RAG-powered health Q&A using Groq Llama 3.1',
      accuracy: 'RAG',
      color: 'green',
    },
    {
      icon: Heart,
      title: 'Cognitive Assessment',
      desc: 'Speech and dyslexia models trained on clinical data',
      accuracy: '90-100%',
      color: 'pink',
    },
  ];

  const stats = [
    { icon: Target, label: 'AI Models', value: '4', color: 'blue' },
    { icon: Activity, label: 'Total Accuracy', value: '95%+', color: 'green' },
    { icon: Users, label: 'Conditions Detected', value: '10+', color: 'purple' },
    { icon: Zap, label: 'Real-time Analysis', value: '24/7', color: 'pink' },
  ];

  const team = [
    { name: 'Deep Learning Models', role: 'EfficientNet, BERT, CNN', tech: 'PyTorch' },
    { name: 'Backend Services', role: 'FastAPI Microservices', tech: 'Python' },
    { name: 'API Gateway', role: 'Node.js + Express', tech: 'JavaScript' },
    { name: 'Frontend', role: 'React + Vite', tech: 'React' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Activity className="w-20 h-20 text-blue-600 mx-auto mb-6 animate-pulse" />
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          About NeuraCare
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          AI-powered healthcare platform with 4 custom-trained models providing comprehensive 
          health screening and support services.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
        <p className="text-lg text-center max-w-3xl mx-auto leading-relaxed">
          To make advanced AI-powered healthcare accessible to everyone through accurate, 
          real-time health screening and support. We leverage state-of-the-art machine learning 
          models trained on real medical datasets to provide reliable health assessments.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our AI Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow"
              >
                <div className={`w-16 h-16 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.desc}</p>
                <div className={`inline-block px-4 py-2 bg-${feature.color}-100 text-${feature.color}-800 rounded-full font-semibold`}>
                  {feature.accuracy} Accuracy
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-3xl shadow-xl p-12 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className={`w-12 h-12 text-${stat.color}-600 mx-auto mb-4`} />
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((item) => (
            <div key={item.name} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.role}</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {item.tech}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Training Details */}
      <div className="bg-white rounded-3xl shadow-xl p-12 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Model Training</h2>
        <div className="space-y-6">
          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Eye Disease Model</h3>
            <p className="text-gray-600">
              EfficientNet-B0 trained on ODIR-5K dataset with 5,000 real patient fundus images. 
              Detects Normal, Diabetic Retinopathy, Glaucoma, and Cataract with 92-96% accuracy.
            </p>
            <p className="text-sm text-gray-500 mt-2">Model size: 18.5 MB | Platform: Google Colab</p>
          </div>
          
          <div className="border-l-4 border-purple-600 pl-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mental Health Model</h3>
            <p className="text-gray-600">
              BERT-base trained on real suicide detection and depression datasets with 3,000+ samples. 
              6 intent classes with crisis detection achieving 95%+ accuracy.
            </p>
            <p className="text-sm text-gray-500 mt-2">Model size: 438 MB | Platform: Google Colab</p>
          </div>
          
          <div className="border-l-4 border-green-600 pl-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Speech Analysis Model</h3>
            <p className="text-gray-600">
              CNN trained on Google Speech Commands dataset with 105,829 audio files. 
              Detects speech patterns with 90.50% accuracy.
            </p>
            <p className="text-sm text-gray-500 mt-2">Model size: 407 KB | Platform: Google Colab</p>
          </div>
          
          <div className="border-l-4 border-pink-600 pl-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Dyslexia Screening Model</h3>
            <p className="text-gray-600">
              Neural network trained on research-based eye-tracking features. 
              7 features analyzed achieving 100% accuracy on test data.
            </p>
            <p className="text-sm text-gray-500 mt-2">Model size: 57 KB | Platform: Google Colab</p>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">System Architecture</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <span className="font-bold">Frontend:</span> React + Vite + Tailwind CSS
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <span className="font-bold">API Gateway:</span> Node.js + Express (Port 5000)
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <span className="font-bold">ML Services:</span> FastAPI Microservices (Ports 8001-8004)
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <span className="font-bold">Models:</span> PyTorch + Transformers + EfficientNet
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <span className="font-bold">RAG:</span> Groq Llama 3.1 (14,400 requests/day free)
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <span className="font-bold">Database:</span> MongoDB Atlas + Supabase
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="text-center bg-white rounded-3xl shadow-xl p-12">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 mb-8">
          Experience AI-powered healthcare screening today
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="/eye-disease"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Try Eye Disease Detection
          </a>
          <a
            href="/mental-health"
            className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Mental Health Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
