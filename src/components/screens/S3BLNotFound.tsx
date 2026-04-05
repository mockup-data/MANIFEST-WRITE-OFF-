import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SearchX, Info, Loader2 } from 'lucide-react';
import { db } from '../../firebase';

export const S3BLNotFound: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [tradianStatus, setTradianStatus] = useState<'stored' | 'in_amendment' | 'registered'>('stored');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualWriteOff = async () => {
    if (!state.user?.uid) {
      console.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const amendmentRef = `AMD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      await setDoc(doc(db, 'amendments', amendmentRef), {
        amendmentRef,
        rNumber: state.rNumber || 'R-2024-0001',
        blNumber: state.blNumber || state.manifestData?.blNumber || 'BL-998877',
        port: state.port || 'Malé Commercial Harbour',
        vesselName: state.manifestData?.vesselName || 'MV Example',
        serviceTypes: ['manual_write_off'],
        amendmentTypes: ['other'],
        reason: 'Manual Write-Off requested due to BL not found in Tradian/E-Valuator.',
        calculatedFine: 0, // Assuming no fine for manual write-off
        status: 'pending',
        brokerUid: state.user.uid,
        createdAt: serverTimestamp()
      });

      updateState({ 
        status: 'pending_review', 
        amendmentRef: amendmentRef 
      });
    } catch (error) {
      console.error('Error submitting manual write-off:', error);
      // Handle error (e.g., show a toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };
  const getStatusMessage = () => {
    switch (tradianStatus) {
      case 'stored': return 'The BL is currently stored in Tradian but has not been fully registered or submitted to Customs.';
      case 'in_amendment': return 'The BL is currently undergoing an amendment in Tradian and is not available for customs processing.';
      case 'registered': return 'The BL is registered in Tradian but has not synced to the E-Valuator system.';
      default: return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-[var(--danger)] overflow-hidden">
        <div className="bg-[var(--danger)] text-white p-4 font-bold text-lg text-center">
          Bill of Lading Not Found
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <SearchX className="w-20 h-20 text-[var(--danger)] mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">We could not locate your Bill of Lading</h2>
          
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
              <span className="font-bold text-[var(--danger)]">NOT FOUND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">E-Valuator Registry:</span>
              <span className="font-bold text-[var(--danger)]">NOT FOUND</span>
            </div>
          </div>

          <div className="w-full max-w-md mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Tradian BL Status</h3>
            </div>
            <div className="flex gap-2 mb-3">
              <button 
                onClick={() => setTradianStatus('stored')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${tradianStatus === 'stored' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
              >
                Stored
              </button>
              <button 
                onClick={() => setTradianStatus('in_amendment')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${tradianStatus === 'in_amendment' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
              >
                In Amendment
              </button>
              <button 
                onClick={() => setTradianStatus('registered')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${tradianStatus === 'registered' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
              >
                Registered
              </button>
            </div>
            <p className="text-sm text-blue-800">
              {getStatusMessage()}
            </p>
          </div>

          <p className="text-gray-600 mb-4 max-w-md">
            The BL Number has not been received by customs. This means the BL has not been registered by the shipping line in Tradian, and no corresponding record was found in the E-Valuator system.
          </p>
          <p className="text-gray-600 mb-8 max-w-md font-medium">
            Please contact Tradian support to resolve this issue.
          </p>

          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm w-full max-w-md mb-8 text-left">
            <p className="font-bold mb-1">Tradian Support</p>
            <p>Phone: 1616</p>
            <p>Email: support@tradian.gov.mv</p>
          </div>

          <div className="w-full max-w-md flex items-center gap-4 mb-8">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-sm text-gray-500 font-medium">Alternatively</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <button 
              onClick={handleManualWriteOff}
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{ fontFamily: 'Arial', borderWidth: '1px' }}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSubmitting ? 'Submitting...' : 'Apply for Manual Write OFF'}
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
