import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppStatus = 
  | 'idle' | 'loading' | 'bl_not_found' | 'evaluator_bl_not_found' | 'field_mismatch' 
  | 'write_off_success' | 'ecustoms_error' | 'ecustoms_manifest_not_registered' | 'amendment_form' | 'pending_review' 
  | 'rejected' | 'payment_ready' | 'finalizing' | 'finalized' | 'bl_cancel_form'
  | 'officer_history' | 'officer_pending';

export interface FieldResult {
  field: string;
  manifestValue: string;
  evaluatorValue: string;
  match: boolean;
  fineTier: number;
}

export interface ManifestData {
  vessel: string;
  voyage: string;
  dateArrival: string;
  blNumber: string;
  ffAccount: string;
  consigneeCode: string;
  grossWeight: string;
  packageCode: string;
  packsNumber: string;
  exporter: string;
  consignee: string;
  carrier: string;
}

export interface AppState {
  status: AppStatus;
  rNumber: string;
  blNumber: string;
  port: string;
  vesselName: string;
  deferredPaymentAccount: string;
  year: number;
  manifestData: ManifestData | null;
  fieldResults: FieldResult[];
  failedFields: FieldResult[];
  calculatedFine: number;
  amendmentRef: string | null;
  amendmentData: any | null;
  rejectionReason: string | null;
  paymentRef: string | null;
  writeOffRef: string | null;
  finalizedAt: string | null;
  certificateUrl: string | null;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateState: (updates: Partial<AppState>) => void;
  resetState: () => void;
}

const initialState: AppState = {
  status: 'idle',
  rNumber: '',
  blNumber: '',
  port: '',
  vesselName: '',
  deferredPaymentAccount: '',
  year: new Date().getFullYear(),
  manifestData: null,
  fieldResults: [],
  failedFields: [],
  calculatedFine: 0,
  amendmentRef: null,
  amendmentData: null,
  rejectionReason: null,
  paymentRef: null,
  writeOffRef: null,
  finalizedAt: null,
  certificateUrl: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
  };

  return (
    <AppContext.Provider value={{ state, setState, updateState, resetState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
