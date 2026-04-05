import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const Login: React.FC = () => {
  const { updateState } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<'officer' | 'broker'>('broker');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: role,
          createdAt: new Date().toISOString()
        });
        
        updateState({ 
          status: role === 'officer' ? 'officer_pending' : 'idle', 
          userRole: role, 
          userId: user.uid 
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Fetch user role
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role;
          updateState({ 
            status: role === 'officer' ? 'officer_pending' : 'idle', 
            userRole: role, 
            userId: user.uid 
          });
        } else {
          // Default to broker if no profile found
          updateState({ status: 'idle', userRole: 'broker', userId: user.uid });
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-primary-stripe">
        <div className="p-8 flex flex-col items-center text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Customs Portal</h2>
          <p className="text-gray-500 mt-1 text-sm">
            {isRegistering ? 'Create a new account' : 'Sign in to access the Write-Off System'}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              {!isRegistering && <a href="#" className="text-xs text-[var(--primary)] hover:underline">Forgot password?</a>}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'officer' | 'broker')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-colors bg-white"
              >
                <option value="broker">Broker</option>
                <option value="officer">Customs Officer</option>
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || !email || !password}
            className="btn-primary w-full py-3 mt-4 flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isRegistering ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100 flex flex-col gap-2">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-[var(--primary)] hover:underline font-medium"
          >
            {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register here'}
          </button>
          <p className="text-xs text-gray-500">
            Secure connection to Maldives Customs Service
          </p>
        </div>
      </div>
    </div>
  );
};
