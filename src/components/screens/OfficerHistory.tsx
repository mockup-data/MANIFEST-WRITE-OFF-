import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, FileText, CheckCircle, XCircle, Clock, Edit3, Eye, X, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface UploadedDocument {
  name: string;
  type: 'pdf' | 'jpeg';
  url: string;
}

interface HistoryRecord {
  id: string;
  formNumber: string;
  applicant: string;
  date: string;
  status: 'accepted' | 'rejected' | 'late' | 'amendment';
  documents: UploadedDocument[];
  reason: string;
  isManualWriteOff?: boolean;
}

export const OfficerHistory: React.FC = () => {
  const { updateState } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingDocsId, setViewingDocsId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'amendments'), where('status', 'in', ['approved', 'rejected', 'paid', 'finalized']));
    const unsub = onSnapshot(q, (snapshot) => {
      const records: HistoryRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let status: 'accepted' | 'rejected' | 'late' | 'amendment' = 'amendment';
        if (data.status === 'approved' || data.status === 'paid' || data.status === 'finalized') status = 'accepted';
        if (data.status === 'rejected') status = 'rejected';

        records.push({
          id: doc.id,
          formNumber: doc.id,
          applicant: data.brokerUid || 'Unknown Applicant',
          date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : (data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Unknown Date'),
          status: status,
          reason: data.rejectionReason || data.serviceTypes?.join(', ') || 'Amendment Request',
          isManualWriteOff: data.serviceTypes?.includes('manual_write_off'),
          documents: data.serviceTypes?.includes('manual_write_off') ? [] : [
            { name: 'Application_Form.pdf', type: 'pdf', url: '#' },
            { name: 'Original_Manifest.pdf', type: 'pdf', url: '#' },
            { name: 'Original_BL.pdf', type: 'pdf', url: '#' }
          ]
        });
      });
      setHistoryData(records);
    }, (error) => {
      console.error('Firestore Error: ', error);
    });

    return () => unsub();
  }, []);

  const filteredData = historyData.filter(record => 
    record.formNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.applicant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewingRecord = historyData.find(r => r.id === viewingDocsId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle size={12} /> Accepted</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle size={12} /> Rejected</span>;
      case 'late':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><Clock size={12} /> Late</span>;
      case 'amendment':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><Edit3 size={12} /> Amendment</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Document Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[var(--primary)] px-6 py-4 flex justify-between items-center text-white">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <FileText size={20} />
                Application Details - {viewingRecord.formNumber}
              </h4>
              <button 
                onClick={() => setViewingDocsId(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Applicant</h5>
                  <p className="text-sm font-medium text-gray-900">{viewingRecord.applicant}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</h5>
                  <div>{getStatusBadge(viewingRecord.status)}</div>
                </div>
              </div>
              
              <div className="mb-6">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Request Context</h5>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                  "{viewingRecord.reason}"
                </p>
              </div>

              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Uploaded Files</h5>
              {viewingRecord.documents.length > 0 ? (
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
              ) : (
                <p className="text-sm text-gray-500 italic">No documents uploaded for this record.</p>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button 
                onClick={() => setViewingDocsId(null)}
                className="px-8 py-2 text-sm font-bold text-white bg-[var(--primary)] rounded-lg hover:opacity-90 transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Officer Portal</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => updateState({ status: 'officer_pending' })}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Pending Requests
          </button>
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-lg shadow-sm"
          >
            History Log
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--bg-main)] rounded-lg flex items-center justify-center text-[var(--primary)]">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Application History</h3>
              <p className="text-sm text-gray-500">Log of all processed write-off applications</p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search form number or applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Processed
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm font-medium text-gray-900">{record.formNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.applicant}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{record.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setViewingDocsId(record.id)}
                        className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:text-blue-900 transition-colors"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No records found matching your search.
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
