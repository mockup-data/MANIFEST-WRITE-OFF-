import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, ArrowRight } from 'lucide-react';

const PORTS = [
  'Malé Commercial Harbour',
  'Hulhumalé Port',
  'Kulhudhuffushi Port',
  'Addu City Port',
  'Gaanifaru Port'
];

export const S1Entry: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [rNumber, setRNumber] = useState(state.rNumber);
  const [blNumber, setBlNumber] = useState(state.blNumber);
  const [port, setPort] = useState(state.port);
  const [vesselName, setVesselName] = useState(state.vesselName);
  const [deferredPaymentAccount, setDeferredPaymentAccount] = useState(state.deferredPaymentAccount);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rNumber.trim() || !blNumber.trim() || !port || !vesselName.trim() || !deferredPaymentAccount.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    // Strict R-Number format: R followed by 4 digits, a slash, and a 4-digit year
    if (!/^R\d{4}\/\d{4}$/.test(rNumber.trim())) {
      setError('R-Number must follow the format R****/YEAR (e.g., R0001/2024).');
      return;
    }

    if (!/^\d{3}$/.test(deferredPaymentAccount)) {
      setError('Deferred payment account must be exactly 3 digits.');
      return;
    }
    
    updateState({ 
      rNumber: rNumber.trim(), 
      blNumber: blNumber.trim(),
      port,
      vesselName: vesselName.trim(),
      deferredPaymentAccount: deferredPaymentAccount.trim(),
      status: 'loading' 
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 card-primary-stripe overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Manifest Write-Off</h2>
          <p className="text-gray-600 mb-8">
            Enter your manifest details to begin the validation and write-off process.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="rNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  R-Number
                </label>
                <input
                  type="text"
                  id="rNumber"
                  value={rNumber}
                  onChange={(e) => setRNumber(e.target.value)}
                  placeholder="e.g. R0001/2024"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                  Port
                </label>
                <select
                  id="port"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all bg-white"
                >
                  <option value="" disabled>Select a port</option>
                  {PORTS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="blNumber" className="block text-sm font-medium text-gray-700 mb-1">
                BL Number
              </label>
              <input
                type="text"
                id="blNumber"
                value={blNumber}
                onChange={(e) => setBlNumber(e.target.value)}
                placeholder="e.g. BL-998877"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="vesselName" className="block text-sm font-medium text-gray-700 mb-1">
                  Vessel Name
                </label>
                <input
                  type="text"
                  id="vesselName"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="e.g. MV Ocean Explorer"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="deferredPaymentAccount" className="block text-sm font-medium text-gray-700 mb-1">
                  Deferred Payment Account
                </label>
                <input
                  type="text"
                  id="deferredPaymentAccount"
                  value={deferredPaymentAccount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setDeferredPaymentAccount(val);
                  }}
                  placeholder="e.g. 123"
                  maxLength={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="text-[var(--danger)] text-sm font-medium">
                {error}
              </div>
            )}

            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex gap-3">
              <div className="mt-0.5">ℹ️</div>
              <p>R-Number must follow the format R****/YEAR (e.g., R0001/2024) and match the port of the original manifest application.</p>
            </div>

            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-lg"
            >
              <Search size={20} />
              Search & Validate
            </button>
          </form>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-4">Authorized Personnel Only</p>
            <button 
              onClick={() => updateState({ status: 'officer_pending' })}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-blue-900 transition-colors"
            >
              Access Officer Portal <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
