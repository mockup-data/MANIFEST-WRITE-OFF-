import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { UploadCloud, X, CheckCircle } from 'lucide-react';

const TIER_1_FIELDS = ['Exporter/Shipper', 'Notify Party', 'Place of Discharge', 'Final Destination'];
const TIER_2_FIELDS = ['Consignee', 'Gross Weight', 'Container Number', 'Goods Description', 'BL/AWB Split', 'BL/AWB Number', 'Place of Loading', 'No. of Packages', 'Seal Number', 'Volume'];

export const S7AmendmentForm: React.FC = () => {
  const { state, updateState } = useAppContext();
  
  const [serviceTypes, setServiceTypes] = useState<string[]>(state.prefilledServiceTypes || []);
  const [amendmentTypes, setAmendmentTypes] = useState<string[]>([]);
  const [lateBLCount, setLateBLCount] = useState<number>(1);
  const [contentBefore, setContentBefore] = useState('');
  const [contentAfter, setContentAfter] = useState('');
  const [reason, setReason] = useState('');
  const [ffAccount, setFfAccount] = useState(state.manifestData?.ffAccount || '');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    manifest: null,
    bl: null,
    exporterLetter: null,
    shipperLetter: null,
    applicationForm: null
  });

  // Pre-check failing fields from S4
  useEffect(() => {
    if (state.failedFields && state.failedFields.length > 0) {
      const failedNames = state.failedFields.map(f => f.field);
      setAmendmentTypes(failedNames);
      
      // Pre-fill content before
      const beforeText = state.failedFields.map(f => `${f.field}: ${f.manifestValue}`).join('\n');
      setContentBefore(beforeText);
    }
  }, [state.failedFields]);

  const handleServiceTypeChange = (type: string) => {
    setServiceTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAmendmentTypeChange = (type: string) => {
    setAmendmentTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const calculateFine = () => {
    let fine = 0;
    if (serviceTypes.includes('late_manifest')) fine += 3000 + (lateBLCount * 1000);
    
    const hasTier2 = amendmentTypes.some(t => TIER_2_FIELDS.includes(t) || ['Package Code', 'Packs Number', 'BL Number'].includes(t));
    const hasTier1 = amendmentTypes.some(t => TIER_1_FIELDS.includes(t) || ['Exporter', 'Carrier'].includes(t));
    
    if (hasTier2) fine += 1000;
    else if (hasTier1) fine += 500;
    
    return fine;
  };

  const fine = calculateFine();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationChecked || !files.manifest || !files.bl || !files.applicationForm || !ffAccount.trim()) return;
    
    try {
      const amendmentRef = `AMD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      const amendmentId = amendmentRef;
      
      const { db } = await import('../../firebase');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      await setDoc(doc(db, 'amendments', amendmentId), {
        amendmentRef,
        brokerUid: state.userId,
        rNumber: state.rNumber,
        blNumber: state.blNumber,
        serviceTypes,
        amendmentTypes,
        lateBLCount,
        contentBefore,
        contentAfter,
        reason,
        calculatedFine: fine,
        ffAccount: ffAccount.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      updateState({ 
        status: 'pending_review',
        amendmentRef,
        calculatedFine: fine,
        prefilledServiceTypes: serviceTypes,
        manifestData: {
          ...state.manifestData,
          ffAccount: ffAccount.trim()
        }
      });
    } catch (error) {
      console.error('Error submitting amendment:', error);
      alert('Failed to submit amendment application. Please try again.');
    }
  };

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const removeFile = (key: string) => {
    setFiles(prev => ({ ...prev, [key]: null }));
  };

  const FileUpload = ({ id, label, required }: { id: string, label: string, required?: boolean }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
      {files[id] ? (
        <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-green-100 text-green-700 p-2 rounded">
              <CheckCircle size={20} />
            </div>
            <div className="text-left truncate">
              <p className="text-sm font-medium text-gray-900 truncate">{files[id]?.name}</p>
              <p className="text-xs text-gray-500">{(files[id]?.size! / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button type="button" onClick={() => removeFile(id)} className="text-gray-400 hover:text-red-500 p-1">
            <X size={20} />
          </button>
        </div>
      ) : (
        <>
          <input type="file" id={id} onChange={(e) => handleFileChange(id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,image/*" />
          <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">{label} {required && <span className="text-red-500">*</span>}</p>
          <p className="text-xs text-gray-500">PDF or Image (Max 10MB)</p>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 card-primary-stripe overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Amendment Application (MCS-117)</h2>
          <p className="text-gray-600">
            Submit a request to amend manifest details or file a late manifest.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">
          
          {/* Section 1 */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Manifest Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Vessel/Aircraft Name</label>
                <div className="font-medium text-gray-900">{state.manifestData?.vessel || 'OCEAN EXPLORER'}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Voyage Number</label>
                <div className="font-medium text-gray-900">{state.manifestData?.voyage || 'V-402X'}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date of Arrival</label>
                <div className="font-medium text-gray-900">{state.manifestData?.dateArrival || '12 Oct 2024'}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">BL Number</label>
                <div className="font-medium text-gray-900">{state.manifestData?.blNumber || 'BL-998877'}</div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Service Type</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={serviceTypes.includes('house_bl')} onChange={() => handleServiceTypeChange('house_bl')} className="w-5 h-5 text-[var(--primary)] rounded border-gray-300 focus:ring-[var(--primary)]" />
                <span className="font-medium text-gray-900">Amendment of House BL</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={serviceTypes.includes('master_bl')} onChange={() => handleServiceTypeChange('master_bl')} className="w-5 h-5 text-[var(--primary)] rounded border-gray-300 focus:ring-[var(--primary)]" />
                <span className="font-medium text-gray-900">Amendment of Master BL</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer">
                <input type="checkbox" checked={serviceTypes.includes('late_manifest')} onChange={() => handleServiceTypeChange('late_manifest')} className="w-5 h-5 text-red-600 rounded border-red-300 focus:ring-red-600" />
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-medium text-red-900">Late Submission of Manifest</span>
                  <span className="text-xs font-bold bg-red-200 text-red-800 px-2 py-1 rounded">MVR 3,000 Base Fine</span>
                </div>
              </label>
              {serviceTypes.includes('late_manifest') && (
                <div className="ml-8 p-4 border border-red-200 bg-white rounded-lg flex items-center justify-between">
                  <label htmlFor="lateBLCount" className="text-sm font-medium text-gray-700">
                    Number of Late BLs (MVR 1,000 each)
                  </label>
                  <input
                    type="number"
                    id="lateBLCount"
                    min="1"
                    value={lateBLCount}
                    onChange={(e) => setLateBLCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. Amendment Type</h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Tier I Fields</h4>
                <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">MVR 500 Fine</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIER_1_FIELDS.map(field => (
                  <label key={field} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" checked={amendmentTypes.includes(field)} onChange={() => handleAmendmentTypeChange(field)} className="w-4 h-4 text-[var(--primary)] rounded border-gray-300 focus:ring-[var(--primary)]" />
                    <span className="text-sm text-gray-700">{field}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Tier II Fields</h4>
                <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">MVR 1,000 Fine</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIER_2_FIELDS.map(field => (
                  <label key={field} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" checked={amendmentTypes.includes(field)} onChange={() => handleAmendmentTypeChange(field)} className="w-4 h-4 text-[var(--primary)] rounded border-gray-300 focus:ring-[var(--primary)]" />
                    <span className="text-sm text-gray-700">{field}</span>
                  </label>
                ))}
              </div>
            </div>

            {amendmentTypes.length > 0 && (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="contentBefore" className="block text-sm font-medium text-gray-700 mb-1">Content Before Amendment</label>
                  <textarea
                    id="contentBefore"
                    value={contentBefore}
                    onChange={(e) => setContentBefore(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all bg-white"
                    rows={3}
                    placeholder="Describe the current incorrect details..."
                  />
                </div>
                <div>
                  <label htmlFor="contentAfter" className="block text-sm font-medium text-gray-700 mb-1">Content After Amendment</label>
                  <textarea
                    id="contentAfter"
                    value={contentAfter}
                    onChange={(e) => setContentAfter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all bg-white"
                    rows={3}
                    placeholder="Describe the correct details..."
                  />
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Amendment</label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all bg-white"
                    rows={3}
                    placeholder="Explain why this amendment is necessary..."
                  />
                </div>
              </div>
            )}
          </section>



          {/* Section 4 - Documents */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Supporting Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FileUpload id="applicationForm" label="Application Form" required />
              <FileUpload id="manifest" label="Original Amended Manifest + Stamp" required />
              <FileUpload id="bl" label="Original BL/AWB After Change" required />
              <FileUpload id="exporterLetter" label="No-Objection Letter (Exporter)" />
              <div className="sm:col-span-2 sm:w-1/2 sm:mx-auto w-full">
                <FileUpload id="shipperLetter" label="No-Objection Letter (Shipper)" />
              </div>
            </div>
          </section>

          {/* Section 5 - Payment Details */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Payment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div>
                <label htmlFor="ffAccount" className="block text-sm font-medium text-gray-700 mb-1">
                  Charge to Account (FF Number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="ffAccount"
                  value={ffAccount}
                  onChange={(e) => setFfAccount(e.target.value)}
                  placeholder="e.g. FF-12345"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all bg-white"
                  required
                />
              </div>
              <div className="flex flex-col justify-center sm:items-end">
                <p className="text-sm text-gray-600 mb-1">Total Fine Amount</p>
                <p className="text-2xl font-bold text-[var(--danger)]">
                  MVR {fine.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 - Declaration */}
          <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Declaration</h3>
            
            <div className="space-y-4 mb-6 text-sm text-gray-700">
              <p>I hereby declare that the information provided in this application is true and correct to the best of my knowledge and belief.</p>
              <p>I understand that any false declaration may result in penalties under the Maldives Customs Act.</p>
            </div>

            <label className="flex items-start gap-3 p-4 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-8">
              <input 
                type="checkbox" 
                checked={declarationChecked}
                onChange={(e) => setDeclarationChecked(e.target.checked)}
                className="mt-1 w-5 h-5 text-[var(--primary)] rounded border-gray-300 focus:ring-[var(--primary)]" 
                required
              />
              <span className="font-medium text-gray-900">I agree to the declaration statements above and confirm all attached documents are authentic.</span>
            </label>
          </section>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={() => updateState({ status: 'idle', rNumber: '', blNumber: '', port: '', vesselName: '', deferredPaymentAccount: '', manifestData: null, failedFields: [], calculatedFine: 0, amendmentRef: null, paymentRef: null, prefilledServiceTypes: undefined, rejectionReason: undefined })} className="btn-ghost">Cancel</button>
            <button type="button" className="btn-ghost">Save as Draft</button>
            <button 
              type="submit" 
              disabled={!declarationChecked || !files.manifest || !files.bl || !files.applicationForm || serviceTypes.length === 0 || !ffAccount.trim()}
              className="btn-primary flex-1"
            >
              Submit Amendment Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
