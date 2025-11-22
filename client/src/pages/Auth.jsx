import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Brain, 
  Shield, 
  Activity, 
  CheckCircle2,
  Loader
} from 'lucide-react';

// --- Internal CSS for Animations ---
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(3deg); }
  }
  .animate-float-slow { animation: float 8s ease-in-out infinite; }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(15px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .form-anim { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`;

// --- Helper: Background Icon ---
const BackgroundIcon = ({ icon: Icon, className }) => (
  <div className={`absolute opacity-10 pointer-events-none select-none ${className}`} aria-hidden="true">
    <Icon className="w-full h-full" />
  </div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log("Form Submitted:", formData);
    }, 1500);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800 relative overflow-hidden">
      <style>{customStyles}</style>
      
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2"></div>
      </div>

      {/* === MAIN CARD (Compact) === */}
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row min-h-[500px] relative z-10">
        
        {/* === LEFT SIDE: BRANDING HERO === */}
        <div className="md:w-5/12 bg-slate-900 relative overflow-hidden p-8 flex flex-col justify-between text-white group">
          
          {/* Animated Background Icons */}
          <BackgroundIcon icon={Brain} className="w-48 h-48 -top-8 -right-8 text-cyan-500 animate-float-slow" />
          <BackgroundIcon icon={Shield} className="w-32 h-32 bottom-10 -left-6 text-blue-500 animate-float-slow" />
          
          {/* Logo */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 mb-6">
              <div className="w-6 h-6 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">VitalCare</span>
            </div>
            
            <h1 className="text-3xl font-bold leading-tight mb-3">
              {isLogin ? "Welcome Back." : "Start Journey."}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {isLogin 
                ? "Access your personalized health dashboard and AI diagnostics securely."
                : "Join thousands taking control of their health with AI insights."
              }
            </p>
          </div>

          {/* Features List */}
          <div className="relative z-10 mt-8 space-y-3">
            {['AI Diagnostics', 'Secure Records', '24/7 Monitoring'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* === RIGHT SIDE: FORM === */}
        <div className="md:w-7/12 p-8 bg-white flex flex-col justify-center relative">
          
          <div className="max-w-sm mx-auto w-full form-anim" key={isLogin ? 'login' : 'signup'}>
            <div className="text-center md:text-left mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {isLogin ? "Sign in" : "Create Account"}
              </h2>
              <p className="text-sm text-slate-500">
                {isLogin ? "New here? " : "Already a member? "}
                <button 
                  onClick={toggleMode}
                  className="text-cyan-600 font-bold hover:text-cyan-700 hover:underline transition-all"
                >
                  {isLogin ? "Create account" : "Sign in"}
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  {isLogin && (
                    <a href="#" className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline">
                      Forgot?
                    </a>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Terms */}
            <p className="text-center text-[10px] text-slate-400 mt-6">
              By continuing, you agree to VitalCare's 
              <a href="#" className="text-slate-600 hover:underline font-bold mx-1">Terms</a> 
              and 
              <a href="#" className="text-slate-600 hover:underline font-bold mx-1">Privacy Policy</a>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;