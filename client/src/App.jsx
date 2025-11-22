import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import EyeDisease from './pages/EyeDisease';
import MentalHealth from './pages/MentalHealth';
import PublicHealth from './pages/PublicHealth';
import CognitiveHealth from './pages/CognitiveHealth';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/eye" element={<EyeDisease />} />
            <Route path="/mental-health" element={<MentalHealth />} />
            <Route path="/care-intel-ai" element={<PublicHealth />} />
            <Route path="/cognitive-health" element={<CognitiveHealth />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
