import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Check, X, AlertCircle, Eye, FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';

interface UploadedDocument {
  name: string;
  type: 'pdf' | 'jpeg';
  url: string;
}

interface PendingRequest {
  id: string;
  formNumber: string;
  applicant: string;
  reason: string;
  date: string;
  documents: UploadedDocument[];
  isManualWriteOff?: boolean;
}

const initialPendingData: PendingRequest[] = [
  { 
    id: '1', 
    formNumber: 'R-2024-12455', 
    applicant: 'Ocean Logistics Pvt Ltd', 
    reason: 'Late submission due to vessel delay', 
    date: '12 Oct 2024',
    documents: [
      { name: 'Manifest_Copy.pdf', type: 'pdf', url: '#' },
      { name: 'Vessel_Delay_Notice.jpeg', type: 'jpeg', url: '#' },
      { name: 'Authorization_Letter.pdf', type: 'pdf', url: '#' }
    ]
  },
  { 
    id: '2', 
    formNumber: 'T-2024-2946', 
    applicant: 'Maldives Shipping Co.', 
    reason: 'Amendment of Consignee details', 
    date: '12 Oct 2024',
    documents: [
      { name: 'BL_Original.pdf', type: 'pdf', url: '#' },
      { name: 'Consignee_ID_Copy.jpeg', type: 'jpeg', url: '#' }
    ]
  },
  { 
    id: '3', 
    formNumber: 'R-2024-1247', 
    applicant: 'Global Freight Forwarders', 
    reason: 'Write-off request for bulk cargo', 
    date: '11 Oct 2024',
    documents: [
      { name: 'Cargo_Declaration.pdf', type: 'pdf', url: '#' }
    ]
  },
  { 
    id: '4', 
    formNumber: 'E-2024-2948', 
    applicant: 'Island Traders', 
    reason: 'Amendment of Gross Weight', 
    date: '10 Oct 2024',
    documents: [
      { name: 'Weight_Bridge_Ticket.jpeg', type: 'jpeg', url: '#' },
      { name: 'Export_Invoice.pdf', type: 'pdf', url: '#' }
    ]
  },
  { 
    id: '5', 
    formNumber: 'M-2024-1001', 
    applicant: 'Ocean Logistics Pvt Ltd', 
    reason: 'Manual Write-Off Request (E-Valuator BL not found)', 
    date: '13 Oct 2024',
    documents: [],
    isManualWriteOff: true
  },
];

export const OfficerPending: React.FC = () => {
  const { updateState } = useAppContext();
  const [pendingData, setPendingData] = useState<PendingRequest[]>(initialPendingData);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [viewingDocsId, setViewingDocsId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleAccept = (id: string) => {
    setPendingData(prev => prev.filter(req => req.id !== id));
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const confirmReject = (id: string) => {
    if (!rejectReason.trim()) return;
    const record = pendingData.find(req => req.id === id);
    updateState({ 
      status: 'rejected', 
      rejectionReason: rejectReason,
      amendmentRef: record?.formNumber || null
    });
    setPendingData(prev => prev.filter(req => req.id !== id));
    setRejectingId(null);
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason('');
  };

  const viewingRecord = pendingData.find(r => r.id === viewingDocsId);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Document Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[var(--primary)] px-6 py-4 flex justify-between items-center text-white">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <FileText size={20} />
                Supporting Documents - {viewingRecord.formNumber}
              </h4>
              <button 
                onClick={() => setViewingDocsId(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Applicant</h5>
                <p className="text-sm font-medium text-gray-900">{viewingRecord.applicant}</p>
              </div>
              
              <div className="mb-6">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Request Context</h5>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                  "{viewingRecord.reason}"
                </p>
              </div>

              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Uploaded Files</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {viewingRecord.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[var(--primary)] hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg ${doc.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {doc.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate" title={doc.name}>{doc.name}</p>
                          <button 
                            onClick={() => window.open(doc.url === '#' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : doc.url, '_blank')}
                            className="text-[var(--primary)] hover:underline text-[10px] font-bold whitespace-nowrap flex items-center gap-0.5"
                          >
                            <ExternalLink size={10} />
                            View
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{doc.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => window.open(doc.url === '#' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : doc.url, '_blank')}
                        className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-white rounded-lg transition-all" 
                        title="View"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        onClick={() => window.open(doc.url === '#' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : doc.url, '_blank')}
                        className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-white rounded-lg transition-all" 
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setViewingDocsId(null)}
                className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleAccept(viewingRecord.id);
                  setViewingDocsId(null);
                }}
                className="px-6 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Accept Request
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Officer Portal</h2>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-lg shadow-sm"
          >
            Pending Requests
          </button>
          <button 
            onClick={() => updateState({ status: 'officer_history' })}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            History Log
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-300 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="text-[var(--primary)]" size={20} />
            Pending Write-Off & Amendment Requests
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
            {pendingData.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  Form Number
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  Applicant
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  Reason for Request
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {pendingData.length > 0 ? (
                pendingData.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-300">
                        <div className="font-mono text-sm font-medium text-gray-900">{record.formNumber}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-300">
                        <div className="text-sm text-gray-900">{record.applicant}</div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <div className="text-sm text-gray-700 max-w-xs truncate" title={record.reason}>{record.reason}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-300">
                        <div className="text-sm text-gray-500">{record.date}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {!record.isManualWriteOff && (
                            <button 
                              onClick={() => setViewingDocsId(record.id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 transition-colors"
                              title="View Details & Documents"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleAccept(record.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 transition-colors"
                            title="Accept"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => handleRejectClick(record.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 transition-colors"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {rejectingId === record.id && (
                      <tr className="bg-red-50 border-b border-gray-300">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-1 w-full">
                              <label htmlFor={`reject-${record.id}`} className="block text-xs font-bold text-red-800 mb-1">Reason for Rejection <span className="text-red-500">*</span></label>
                              <input 
                                id={`reject-${record.id}`}
                                type="text" 
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a reason for rejecting this request..."
                                className="w-full px-3 py-2 border border-red-300 rounded focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                autoFocus
                              />
                            </div>
                            <div className="flex gap-2 mt-4 sm:mt-0 sm:pt-5">
                              <button 
                                onClick={cancelReject}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => confirmReject(record.id)}
                                disabled={!rejectReason.trim()}
                                className="px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Confirm Reject
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    No pending requests at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
