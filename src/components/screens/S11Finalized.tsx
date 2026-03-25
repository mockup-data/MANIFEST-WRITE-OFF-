import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle, FileText, ExternalLink } from 'lucide-react';

export const S11Finalized: React.FC = () => {
  const { state, updateState } = useAppContext();

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 card-primary-stripe overflow-hidden">
        <div className="bg-[var(--success)] text-white p-8 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 text-[var(--success)]">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Write-Off Finalized</h2>
          <p className="text-green-100 text-lg">
            Manifest {state.rNumber || 'R-2024-0001'} has been successfully written off.
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-[var(--primary)]" size={24} />
                <h3 className="text-lg font-bold text-gray-900">Amendment Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="font-mono font-medium text-gray-900">{state.amendmentRef || 'AMD-2024-102938'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-[var(--success)] flex items-center gap-1">
                    <CheckCircle size={16} /> Approved & Paid
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Finalized</p>
                  <p className="font-medium text-gray-900">
                    {new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-[var(--success)]" size={24} />
                <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Payment Reference</p>
                  <p className="font-mono font-medium text-gray-900">{state.paymentRef || 'PAY-847291'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-bold text-gray-900">
                    MVR {state.calculatedFine?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '1,000.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Method</p>
                  <p className="font-medium text-gray-900">Customs Pre-Payment Account</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 flex items-start gap-4">
            <ExternalLink className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Next Steps</h3>
              <p className="text-blue-800 mb-4">
                The manifest write-off process is complete. The updated status has been synchronized with E-Customs. You can now proceed with cargo clearance.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => updateState({ status: 'idle', rNumber: '', blNumber: '', port: '', vesselName: '', deferredPaymentAccount: '', manifestData: null, failedFields: [], calculatedFine: 0, amendmentRef: null, paymentRef: null })}
              className="btn-primary flex-1"
            >
              Start New Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
