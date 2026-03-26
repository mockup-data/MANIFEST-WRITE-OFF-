import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { SearchX } from 'lucide-react';

export const S3bEValuatorBLNotFound: React.FC = () => {
  const { state, updateState } = useAppContext();
  
  // Mock Tradian status for demonstration (could be 'Stored', 'Amendment', or 'Registered')
  const tradianStatus = 'Registered';

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-[var(--danger)] overflow-hidden">
        <div className="bg-[var(--danger)] text-white p-4 font-bold text-lg text-center">
          E-Valuator Record Not Found
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <SearchX className="w-20 h-20 text-[var(--danger)] mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">BL missing in E-Valuator</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 w-full max-w-md mb-6 border border-gray-200 text-left font-mono text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">R-Number:</span>
              <span className="font-bold text-gray-900">{state.rNumber || 'R-2024-0001'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Port:</span>
              <span className="font-bold text-gray-900">{state.port || 'Malé Commercial Harbour'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">BL Searched:</span>
              <span className="font-bold text-gray-900">{state.manifestData?.blNumber || 'BL-998877'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
              <span className="text-gray-500">Tradian Registry:</span>
              <span className="font-bold text-[var(--success)]">FOUND ({tradianStatus})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">E-Valuator Registry:</span>
              <span className="font-bold text-[var(--danger)]">NOT FOUND</span>
            </div>
          </div>

          <p className="text-gray-600 mb-4 max-w-md">
            The Bill of Lading was successfully located in Tradian with status <strong>{tradianStatus}</strong>, but no corresponding assessment record exists in the E-Valuator system.
          </p>
          <p className="text-gray-600 mb-8 max-w-md font-medium">
            Please ensure the BL has been properly assessed in E-Valuator before attempting write-off.
          </p>

          <div className="w-full max-w-md flex items-center gap-4 mb-8">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-sm text-gray-500 font-medium">Alternatively</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <button 
              onClick={() => updateState({ status: 'pending_review' })}
              className="btn-primary w-full"
              style={{ fontFamily: 'Arial', borderWidth: '1px' }}
            >
              Apply for Manual Write OFF
            </button>
            <button 
              onClick={() => updateState({ status: 'idle' })}
              className="btn-ghost w-full"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
