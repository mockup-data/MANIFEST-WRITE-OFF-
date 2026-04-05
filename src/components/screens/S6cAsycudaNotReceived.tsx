import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const S6cAsycudaNotReceived: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualWriteOff = async () => {
    if (!state.userId) {
      alert('You must be logged in to apply for manual write-off.');
      return;
    }

    setIsSubmitting(true);
    try {
      const amendmentRef = `AMD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      const { doc, setDoc } = await import('firebase/firestore');
      
      await setDoc(doc(db, 'amendments', amendmentRef), {
        amendmentRef,
        rNumber: state.rNumber || 'R-2024-0001',
        blNumber: state.blNumber || state.manifestData?.blNumber || 'BL-998877',
        port: state.port || 'Malé Commercial Harbour',
        vesselName: state.vesselName || state.manifestData?.vessel || 'MV OCEAN TRADER',
        serviceTypes: ['manual_write_off'],
        amendmentTypes: ['ASYCUDA Sync Error'],
        lateBLCount: 0,
        contentBefore: 'ASYCUDA: NOT RECEIVED',
        contentAfter: 'ASYCUDA: MANUAL WRITE-OFF',
        reason: 'Manual Write-Off requested due to ASYCUDA sync error.',
        calculatedFine: 0,
        status: 'pending',
        brokerUid: state.userId,
        createdAt: serverTimestamp(),
      });

      updateState({ 
        status: 'pending_review', 
        amendmentRef: amendmentRef,
        calculatedFine: 0,
        prefilledServiceTypes: ['manual_write_off']
      });
    } catch (error) {
      console.error('Error submitting manual write-off:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-orange-300 overflow-hidden">
        <div className="bg-orange-500 text-white p-4 font-bold text-lg text-center">
          ASYCUDA Sync Error
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Manifest Not Received in ASYCUDA</h2>
          
          <p className="text-gray-600 mb-8 max-w-md">
            The manifest has been successfully received by Tradian and E-Customs, but it has not been synced to ASYCUDA. A manual write-off can be performed.
          </p>

          <div className="w-full max-w-md mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-left font-mono text-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Tradian:</span>
              <div className="flex items-center gap-2 text-[var(--success)] font-bold">
                <CheckCircle size={16} /> RECEIVED
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">E-Customs:</span>
              <div className="flex items-center gap-2 text-[var(--success)] font-bold">
                <CheckCircle size={16} /> RECEIVED
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-500">ASYCUDA:</span>
              <div className="flex items-center gap-2 text-orange-500 font-bold">
                <XCircle size={16} /> NOT RECEIVED
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button 
              onClick={handleManualWriteOff}
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Proceed to Manual Write-Off'}
            </button>
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
