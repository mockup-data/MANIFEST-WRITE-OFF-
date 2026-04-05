import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut } from 'lucide-react';
import { auth } from '../firebase';

export const Header: React.FC = () => {
  const { state, updateState } = useAppContext();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      updateState({ status: 'login', userRole: null, userId: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-[var(--secondary)] shadow-sm border-b border-transparent pt-10 pb-4 px-4 sm:px-6 lg:px-8 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--secondary)] font-bold text-xl">
            M
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Manifest Write-Off Portal</h1>
            <p className="text-xs text-blue-100">Maldives Customs Service</p>
          </div>
        </div>
        
        {state.status !== 'login' && state.userId && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{state.userRole === 'officer' ? 'Customs Officer' : 'Broker'}</p>
              <p className="text-xs text-blue-200">{state.userId.substring(0, 8)}...</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-blue-100 hover:text-white hover:bg-blue-800 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
