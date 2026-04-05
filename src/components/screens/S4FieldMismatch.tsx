import React, { useEffect, useState } from 'react';
import { useAppContext, FieldResult } from '../../context/AppContext';
import { CheckCircle, XCircle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const mockFields: FieldResult[] = [
  { field: 'Gross Weight', manifestValue: '1200 kg', evaluatorValue: '1200 kg', match: true, fineTier: 1000 },
  { field: 'Package Code', manifestValue: 'CTN', evaluatorValue: 'CTN', match: true, fineTier: 1000 },
  { field: 'Packs Number', manifestValue: '50', evaluatorValue: '50', match: true, fineTier: 1000 },
  { field: 'Exporter', manifestValue: 'Global Exports Ltd', evaluatorValue: 'Global Exports LLC', match: false, fineTier: 500 },
  { field: 'Consignee', manifestValue: 'Maldives Imports', evaluatorValue: 'Maldives Imports', match: true, fineTier: 1000 },
  { field: 'Carrier', manifestValue: 'Oceanic Lines', evaluatorValue: 'Oceanic Lines', match: true, fineTier: 500 },
  { field: 'BL Number', manifestValue: 'BL-998877', evaluatorValue: 'BL-998877-A', match: false, fineTier: 1000 },
];

export const S4FieldMismatch: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields = state.fieldResults.length > 0 ? state.fieldResults : mockFields;
  const failedFields = fields.filter(f => !f.match);
  const calculatedFine = failedFields.reduce((max, f) => Math.max(max, f.fineTier), 0);

  useEffect(() => {
    if (state.fieldResults.length === 0) {
      updateState({ fieldResults: fields, failedFields, calculatedFine });
    }
  }, []);

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
        amendmentTypes: failedFields.map(f => f.field),
        lateBLCount: 0,
        contentBefore: failedFields.map(f => `${f.field}: ${f.manifestValue}`).join('\n'),
        contentAfter: failedFields.map(f => `${f.field}: ${f.evaluatorValue}`).join('\n'),
        reason: 'Manual Write-Off requested due to field mismatch.',
        calculatedFine: calculatedFine,
        status: 'pending',
        brokerUid: state.userId,
        createdAt: serverTimestamp(),
      });

      updateState({ 
        status: 'pending_review', 
        amendmentRef: amendmentRef,
        calculatedFine: calculatedFine,
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
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-[var(--warning)] overflow-hidden">
        <div className="bg-[var(--warning)] text-white p-4 font-bold text-lg text-center">
          Write-Off Unsuccessful — Data Mismatch Detected
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            <span className="font-bold text-gray-900">{failedFields.length} field(s)</span> do not match the E-Valuator record. Review the comparison below.
          </p>

          <div className="overflow-x-auto mb-8 rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm border-b border-gray-200">
                  <th className="p-4 font-medium">Field Name</th>
                  <th className="p-4 font-medium">Your Manifest Value</th>
                  <th className="p-4 font-medium">E-Valuator Value</th>
                  <th className="p-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {fields.map((f, i) => (
                  <tr key={i} className={`border-b border-gray-100 last:border-0 ${f.match ? 'bg-white border-l-4 border-l-[var(--success)]' : 'bg-[var(--danger-bg)] border-l-4 border-l-[var(--danger)]'}`}>
                    <td className="p-4 font-medium text-gray-900">{f.field}</td>
                    <td className={`p-4 ${!f.match ? 'text-[var(--danger)] font-medium' : 'text-gray-600'}`}>{f.manifestValue}</td>
                    <td className={`p-4 ${!f.match ? 'text-[var(--danger)] font-medium' : 'text-gray-600'}`}>{f.evaluatorValue}</td>
                    <td className="p-4 text-center">
                      {f.match ? (
                        <CheckCircle className="w-5 h-5 text-[var(--success)] mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[var(--danger)] mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[var(--warning-bg)] border border-blue-200 rounded-lg p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{failedFields.length} field(s) require correction</h3>
              <p className="text-sm text-gray-600">before this manifest can be written off.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Fine applicable:</p>
              <p className="text-xl font-bold text-[var(--danger)]">MVR {calculatedFine.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={handleManualWriteOff}
                disabled={isSubmitting}
                className="text-[var(--primary)] hover:underline text-sm font-medium px-4 py-2 text-center border border-[var(--primary)] rounded-lg disabled:opacity-50"
                style={{ fontFamily: 'Arial', borderWidth: '1px' }}
              >
                {isSubmitting ? 'Submitting...' : 'Apply for Manual Write OFF'}
              </button>
              <button 
                onClick={() => updateState({ status: 'amendment_form' })}
                className="btn-primary"
              >
                Apply for Amendment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
