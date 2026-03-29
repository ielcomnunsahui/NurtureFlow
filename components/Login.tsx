import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Heart, ShieldCheck, Activity, Users, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-emerald-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Left Side - Branding & Info */}
      <div className="flex-1 bg-emerald-600 p-8 md:p-16 flex flex-col justify-center text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white dark:bg-gray-100 p-3 rounded-2xl">
            <Heart className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">NurtureFlow</h1>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-light mb-8 leading-tight">
          Smart, reliable, and scalable <span className="font-semibold italic">Family Planning Management</span>.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500/30 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Secure Storage</h3>
              <p className="text-emerald-100 text-sm">HIPAA-compliant data handling for sensitive patient records.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500/30 p-2 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Auto-Scheduling</h3>
              <p className="text-emerald-100 text-sm">Intelligent next-visit calculation based on contraceptive type.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500/30 p-2 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Nurse Centric</h3>
              <p className="text-emerald-100 text-sm">Designed for ease of use in low-resource clinical settings.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h3>
            <p className="text-gray-500 dark:text-gray-400">Sign in to access the Family Planning Unit dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            ) : (
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-6 h-6"
              />
            )}
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <div className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Authorized Personnel Only</p>
            <div className="flex justify-center gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
