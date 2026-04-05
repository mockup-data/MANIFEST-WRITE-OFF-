import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export const S6TechnicalError: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-[var(--danger)] overflow-hidden">
        <div className="bg-[var(--danger)] text-white p-4 font-bold text-lg text-center">
          E-Customs Registration Error
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <AlertTriangle className="w-16 h-16 text-[var(--danger)] mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">BL found but not registered in E-Customs</h2>
          
          <p className="text-gray-600 mb-8 max-w-md">
            This is a system-level issue. The Bill of Lading exists in Tradian but has not been registered in the E-Customs system. Please contact the IT department.
          </p>

          <div className="w-full max-w-md mb-8">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>Technical Details</span>
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showDetails && (
              <div className="mt-2 p-6 bg-gray-50 border border-gray-200 rounded-lg text-left font-mono text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">BL Number:</span>
                  <span className="font-bold text-gray-900">{state.manifestData?.blNumber || 'BL-998877'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tradian:</span>
                  <span className="font-bold text-[var(--success)]">FOUND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">E-Customs:</span>
                  <span className="font-bold text-[var(--danger)]">NOT REGISTERED</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-500">Error Code:</span>
                  <span className="font-bold text-[var(--danger)]">EC-503</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm w-full max-w-md mb-8 text-left">
            <p className="font-bold mb-1">Customs IT Helpdesk</p>
            <p>Phone: 333 4111</p>
            <p>Email: it.support@customs.gov.mv</p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button 
              onClick={() => updateState({ status: 'idle', rNumber: '', blNumber: '', port: '', vesselName: '', deferredPaymentAccount: '', manifestData: null, failedFields: [], calculatedFine: 0, amendmentRef: null, paymentRef: null, prefilledServiceTypes: undefined, rejectionReason: undefined })}
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
