import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';

export const S5Success: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [showDetails, setShowDetails] = useState(false);
  const manifestRegNo = React.useMemo(() => `${new Date().getFullYear()} ${Math.floor(Math.random() * 900 + 100)}`, []);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-[var(--primary)] overflow-hidden">
        <div id="manifestRegNoHeader" className="bg-[var(--primary)] text-white p-4 font-bold text-lg text-center">
          Manifest Reg.No
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <CheckCircle2 className="w-20 h-20 text-[var(--success)] mb-6" />
          </motion.div>
          <h2 id="manifestRegNoValue" className="text-2xl font-bold text-gray-900 mb-2">{manifestRegNo}</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            All 7 validation fields matched the E-Valuator record.
          </p>
          
          <div className="bg-[var(--bg-main)] rounded-lg p-6 w-full max-w-md mb-6 border border-blue-200 text-left font-mono text-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">R-Number:</span>
              <span className="font-bold text-gray-900">{state.rNumber || 'R-2024-0001'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Port:</span>
              <span className="font-bold text-gray-900">{state.port || 'Malé Commercial Harbour'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">BL Number:</span>
              <span className="font-bold text-gray-900">{state.blNumber || state.manifestData?.blNumber || 'BL-998877'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Written Off:</span>
              <span className="font-bold text-gray-900">{new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-blue-300 mt-3">
              <span className="text-gray-600">Vessel Name:</span>
              <span className="font-bold text-[var(--primary)] text-base">{state.vesselName || state.manifestData?.vessel || 'MV OCEAN TRADER'}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-2">
              <p className="text-amber-800 font-bold text-[15px] text-center italic">
                Vessel Name and Manifest Reg.No must be exact for successful write off
              </p>
            </div>
          </div>

          <div className="w-full max-w-md mb-8">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>View Field Comparison</span>
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showDetails && (
              <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg text-sm text-left">
                <ul className="space-y-2">
                  {['Gross Weight', 'Package Code', 'Packs Number', 'Exporter', 'Consignee', 'Carrier', 'BL Number'].map(field => (
                    <li key={field} className="flex items-center justify-between text-gray-600">
                      <span>{field}</span>
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button 
              onClick={() => updateState({ status: 'idle', rNumber: '', blNumber: '', port: '', vesselName: '', deferredPaymentAccount: '', manifestData: null, failedFields: [], calculatedFine: 0, amendmentRef: null, paymentRef: null, prefilledServiceTypes: undefined, rejectionReason: undefined })}
              className="btn-ghost w-full"
            >
              Write Off Another Manifest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
