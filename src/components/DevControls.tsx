import React, { useState } from 'react';
import { useAppContext, AppStatus } from '../context/AppContext';

const statuses: AppStatus[] = [
  'login', 'idle', 'loading', 'bl_not_found', 'evaluator_bl_not_found', 'field_mismatch',
  'write_off_success', 'ecustoms_error', 'ecustoms_manifest_not_registered', 'amendment_form', 'pending_review',
  'rejected', 'payment_ready', 'finalizing', 'finalized', 'bl_cancel_form',
  'officer_history', 'officer_pending', 'asycuda_not_received', 'late_manifest'
];

export const DevControls: React.FC = () => {
  const { updateState } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-dashed border-gray-400 text-xs shadow-sm">
      <div className="flex justify-between items-center p-2 bg-gray-100 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <span className="font-mono font-bold text-gray-700">Dev Controls (Click to toggle)</span>
        <span className="text-gray-500">{isOpen ? '▼' : '▲'}</span>
      </div>
      {isOpen && (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-white max-h-64 overflow-y-auto">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => updateState({ status })}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-left font-mono text-[10px] truncate"
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
