import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { XCircle } from 'lucide-react';

export const S9Rejected: React.FC = () => {
  const { state, updateState } = useAppContext();

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-[var(--danger)] overflow-hidden">
        <div className="bg-[var(--danger)] text-white p-4 font-bold text-lg text-center">
          Application Rejected
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-[var(--danger)] mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Amendment Application Rejected</h2>
          <p className="text-gray-500 mb-8 font-mono">
            Reference: {state.amendmentRef || `AMD-${new Date().getFullYear()}-102938`}
          </p>
          
          <div className="bg-[var(--danger-bg)] rounded-lg p-6 w-full max-w-md mb-6 border border-red-200 text-left space-y-4">
            <div>
              <span className="text-sm font-bold text-red-900 uppercase tracking-wider">Reviewed by</span>
              <p className="text-red-800">Officer Ahmed Naseem</p>
            </div>
            <div>
              <span className="text-sm font-bold text-red-900 uppercase tracking-wider">Date</span>
              <p className="text-red-800">{new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <span className="text-sm font-bold text-red-900 uppercase tracking-wider">Reason</span>
              <p className="text-red-800 font-medium mt-1 p-3 bg-white rounded border border-red-100">
                {state.rejectionReason || 'The attached No-Objection letter from the Exporter is missing the official company stamp. Please attach a valid stamped document and re-submit.'}
              </p>
            </div>
          </div>

          <p className="text-gray-600 mb-8 max-w-md">
            You may correct the issues noted above and re-submit your application.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            {!state.prefilledServiceTypes?.includes('manual_write_off') && (
              <button 
                onClick={() => updateState({ status: 'amendment_form' })}
                className="btn-primary w-full"
              >
                Re-submit Application
              </button>
            )}
            <button 
              className="btn-ghost w-full"
            >
              Contact Customs Support
            </button>
            <button 
              onClick={() => updateState({ status: 'idle', rNumber: '', blNumber: '', port: '', vesselName: '', deferredPaymentAccount: '', manifestData: null, failedFields: [], calculatedFine: 0, amendmentRef: null, paymentRef: null, prefilledServiceTypes: undefined, rejectionReason: undefined })}
              className="btn-ghost w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
