import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export const S12BLCancel: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    cancelRequest: null,
    supportingDoc: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (error) {
      console.error('Failed to submit BL cancel request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-[var(--success)] overflow-hidden">
          <div className="bg-[var(--success)] text-white p-4 font-bold text-lg text-center">
            Request Submitted
          </div>
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-[var(--success)] mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">BL Cancel Request Received</h2>
            <p className="text-gray-500 mb-8 font-mono">
              Reference: BLC-{new Date().getFullYear()}-{Math.floor(Math.random() * 10000)}
            </p>
            
            <p className="text-gray-600 mb-8 max-w-md">
              Your request to cancel the Bill of Lading has been submitted to the Tradian team. You will be notified via email once it has been processed.
            </p>

            <button 
              onClick={() => updateState({ status: 'idle', rNumber: '', blNumber: '', port: '', vesselName: '', deferredPaymentAccount: '', manifestData: null, failedFields: [], calculatedFine: 0, amendmentRef: null, paymentRef: null, prefilledServiceTypes: undefined, rejectionReason: undefined })}
              className="btn-primary w-full max-w-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 card-primary-stripe overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit BL Cancel Request</h2>
          <p className="text-gray-600">
            Use this form to request the cancellation of a Bill of Lading in the Tradian system.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Details */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="text-[var(--primary)]" size={20} />
              Manifest Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">R-Number</label>
                <input 
                  type="text" 
                  value={state.rNumber || ''} 
                  disabled 
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input 
                  type="text" 
                  value={state.port || ''} 
                  disabled 
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Uploads */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="text-[var(--primary)]" size={20} />
              Required Documents
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[var(--primary)] transition-colors bg-gray-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">Official Cancellation Request Letter <span className="text-[var(--danger)]">*</span></p>
                    <p className="text-sm text-gray-500 mt-1">Must be on company letterhead and signed by an authorized signatory.</p>
                  </div>
                  <label className="btn-ghost shrink-0 cursor-pointer">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'cancelRequest')}
                      required
                    />
                    <Upload size={16} className="mr-2 inline" />
                    {files.cancelRequest ? 'Change File' : 'Upload File'}
                  </label>
                </div>
                {files.cancelRequest && (
                  <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate">{files.cancelRequest.name}</span>
                    <CheckCircle size={16} className="text-[var(--success)] shrink-0" />
                  </div>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[var(--primary)] transition-colors bg-gray-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">Supporting Documents (Optional)</p>
                    <p className="text-sm text-gray-500 mt-1">Any additional documentation supporting the cancellation request.</p>
                  </div>
                  <label className="btn-ghost shrink-0 cursor-pointer">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'supportingDoc')}
                    />
                    <Upload size={16} className="mr-2 inline" />
                    {files.supportingDoc ? 'Change File' : 'Upload File'}
                  </label>
                </div>
                {files.supportingDoc && (
                  <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate">{files.supportingDoc.name}</span>
                    <CheckCircle size={16} className="text-[var(--success)] shrink-0" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[var(--warning-bg)] border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-[var(--warning)] shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-blue-800">
              By submitting this request, you confirm that the information provided is accurate and that you are authorized to request the cancellation of this Bill of Lading on behalf of your organization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => updateState({ status: 'bl_not_found' })}
              disabled={isSubmitting}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !files.cancelRequest}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
