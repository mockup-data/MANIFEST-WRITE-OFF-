import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileX } from 'lucide-react';

export const S6bECustomsManifestNotRegistered: React.FC = () => {
  const { state, updateState } = useAppContext();

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-[var(--danger)] overflow-hidden">
        <div className="bg-[var(--danger)] text-white p-4 font-bold text-lg text-center">
          Manifest Not Registered in E-Customs
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <FileX className="w-20 h-20 text-[var(--danger)] mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Manifest Registration Missing</h2>
          
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
              <span className="text-gray-500">E-Customs Status:</span>
              <span className="font-bold text-[var(--danger)]">NOT REGISTERED</span>
            </div>
          </div>

          <p className="text-gray-600 mb-4 max-w-md">
            The Manifest associated with this Bill of Lading has not been registered in the E-Customs system.
          </p>
          <p className="text-gray-600 mb-8 max-w-md font-medium">
            A Manifest Reg.No is required for write-off, which is only generated once the manifest is successfully registered in E-Customs. Please ensure the manifest is registered before proceeding.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-md">
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
