import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Clock, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const S6dLateManifest: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [isChecking, setIsChecking] = useState(true);
  const [existingAmendment, setExistingAmendment] = useState<any>(null);

  // Fine calculation: Initial 3000 + (1000 per late BL, assuming 1 for this example)
  const fineAmount = 3000 + 1000;

  useEffect(() => {
    const checkExistingAmendment = async () => {
      if (!state.blNumber) {
        setIsChecking(false);
        return;
      }

      try {
        const q = query(collection(db, 'amendments'), where('blNumber', '==', state.blNumber));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
          docs.sort((a, b) => {
            const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
            const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          setExistingAmendment(docs[0]);
        }
      } catch (error) {
        console.error("Error checking for existing amendment:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingAmendment();
  }, [state.blNumber]);

  const handleAction = () => {
    if (existingAmendment) {
      if (existingAmendment.status === 'approved') {
        updateState({ 
          status: 'payment_ready', 
          calculatedFine: existingAmendment.calculatedFine || fineAmount,
          amendmentRef: existingAmendment.id,
          prefilledServiceTypes: existingAmendment.serviceTypes || []
        });
      } else if (existingAmendment.status === 'pending') {
        updateState({ 
          status: 'pending_review', 
          calculatedFine: existingAmendment.calculatedFine || fineAmount,
          amendmentRef: existingAmendment.id,
          prefilledServiceTypes: existingAmendment.serviceTypes || []
        });
      } else if (existingAmendment.status === 'paid' || existingAmendment.status === 'finalized') {
        updateState({ 
          status: 'finalized', 
          calculatedFine: existingAmendment.calculatedFine || fineAmount,
          amendmentRef: existingAmendment.id,
          paymentRef: existingAmendment.paymentRef,
          prefilledServiceTypes: existingAmendment.serviceTypes || []
        });
      } else {
        // Rejected or other
        updateState({ 
          status: 'amendment_form', 
          calculatedFine: fineAmount,
          prefilledServiceTypes: ['late_manifest']
        });
      }
    } else {
      updateState({ 
        status: 'amendment_form', 
        calculatedFine: fineAmount,
        prefilledServiceTypes: ['late_manifest']
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-orange-300 overflow-hidden">
        <div className="bg-orange-500 text-white p-4 font-bold text-lg text-center">
          Late Manifest Submission
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <Clock className="w-16 h-16 text-orange-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Manifest Received Late</h2>
          
          <p className="text-gray-600 mb-8 max-w-md">
            The manifest has been received, but it was submitted late. This requires an amendment application and incurs a fine.
          </p>

          <div className="w-full max-w-md mb-8 p-6 bg-orange-50 border border-orange-200 rounded-lg text-left text-sm space-y-3">
            <div className="flex items-center gap-2 text-orange-800 font-bold mb-2">
              <AlertCircle size={18} />
              <span>Late Submission Fine</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-700">Initial Fine:</span>
              <span className="font-mono font-bold text-orange-900">MVR 3,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-700">Late BLs (1):</span>
              <span className="font-mono font-bold text-orange-900">MVR 1,000</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-orange-200">
              <span className="text-orange-800 font-bold">Total Fine:</span>
              <span className="font-mono font-bold text-orange-900 text-lg">MVR {fineAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            {isChecking ? (
              <button disabled className="btn-primary w-full flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Checking Status...
              </button>
            ) : (
              <button 
                onClick={handleAction}
                className="btn-primary w-full"
              >
                {existingAmendment 
                  ? (existingAmendment.status === 'approved' ? 'Proceed to Payment' 
                    : existingAmendment.status === 'pending' ? 'View Pending Application' 
                    : existingAmendment.status === 'paid' || existingAmendment.status === 'finalized' ? 'View Finalized Record'
                    : 'Submit Amendment Application')
                  : 'Submit Amendment Application'}
              </button>
            )}
            <button 
              onClick={() => updateState({ status: 'idle', rNumber: '', blNumber: '', port: '', vesselName: '', deferredPaymentAccount: '', manifestData: null, failedFields: [], calculatedFine: 0, amendmentRef: null, paymentRef: null, prefilledServiceTypes: undefined, rejectionReason: undefined })}
              className="text-gray-500 hover:text-gray-700 text-sm mt-4 underline"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
