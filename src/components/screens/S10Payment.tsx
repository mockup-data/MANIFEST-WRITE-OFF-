import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CreditCard, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const S10Payment: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [paymentMethod, setPaymentMethod] = useState<'bml' | 'card' | 'account'>('account');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentRef = `PAY-${Math.floor(Math.random() * 1000000)}`;

      if (state.amendmentRef) {
        const docRef = doc(db, 'amendments', state.amendmentRef);
        await updateDoc(docRef, {
          status: 'paid',
          paymentRef: paymentRef,
          paidAt: new Date().toISOString()
        });
      }

      // Simulate success
      updateState({ status: 'finalizing', paymentRef });
    } catch (err) {
      console.error(err);
      setError('Payment processing failed. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 card-primary-stripe overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Payment Required</h2>
          <div className="bg-[var(--warning-bg)] text-[var(--warning)] px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            Pending Payment
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Reference</span>
                <span className="font-mono font-medium text-gray-900">{state.amendmentRef || 'AMD-2024-102938'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Description</span>
                <span className="font-medium text-gray-900">Manifest Amendment Fine</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>R-Number</span>
                <span className="font-medium text-gray-900">{state.rNumber || 'R-2024-0001'}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-[var(--danger)]">
                  MVR {state.calculatedFine?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '1,000.00'}
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setPaymentMethod('account')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                paymentMethod === 'account' 
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Wallet size={32} />
              <span className="font-bold text-center">Customs Account</span>
              {paymentMethod === 'account' && <CheckCircle size={20} className="absolute top-3 right-3 text-[var(--primary)]" />}
            </button>
            
            <button
              onClick={() => setPaymentMethod('bml')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                paymentMethod === 'bml' 
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">BML</div>
              <span className="font-bold text-center">BML Gateway</span>
              {paymentMethod === 'bml' && <CheckCircle size={20} className="absolute top-3 right-3 text-[var(--primary)]" />}
            </button>
            
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                paymentMethod === 'card' 
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <CreditCard size={32} />
              <span className="font-bold text-center">Credit/Debit Card</span>
              {paymentMethod === 'card' && <CheckCircle size={20} className="absolute top-3 right-3 text-[var(--primary)]" />}
            </button>
          </div>

          {paymentMethod === 'account' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm">
                Payment will be deducted from your registered Customs Pre-Payment Account. Ensure you have sufficient balance before proceeding.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 flex items-start gap-3 border border-red-200">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Pay MVR {state.calculatedFine?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '1,000.00'}
                </>
              )}
            </button>
            <button 
              onClick={() => updateState({ status: 'idle', rNumber: '', blNumber: '', port: '', vesselName: '', deferredPaymentAccount: '', manifestData: null, failedFields: [], calculatedFine: 0, amendmentRef: null, paymentRef: null, prefilledServiceTypes: undefined, rejectionReason: undefined })}
              disabled={isProcessing}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
