import React from 'react';
import { useAppContext } from '../context/AppContext';
import { S1Entry } from './screens/S1Entry';
import { S2Validating } from './screens/S2Validating';
import { S3BLNotFound } from './screens/S3BLNotFound';
import { S4FieldMismatch } from './screens/S4FieldMismatch';
import { S5Success } from './screens/S5Success';
import { S6TechnicalError } from './screens/S6TechnicalError';
import { S7AmendmentForm } from './screens/S7AmendmentForm';
import { S8PendingReview } from './screens/S8PendingReview';
import { S9Rejected } from './screens/S9Rejected';
import { S10Payment } from './screens/S10Payment';
import { S11Finalized } from './screens/S11Finalized';
import { S12BLCancel } from './screens/S12BLCancel';
import { OfficerHistory } from './screens/OfficerHistory';
import { OfficerPending } from './screens/OfficerPending';

export const ScreenContainer: React.FC = () => {
  const { state } = useAppContext();

  switch (state.status) {
    case 'idle': return <S1Entry />;
    case 'loading': return <S2Validating />;
    case 'bl_not_found': return <S3BLNotFound />;
    case 'field_mismatch': return <S4FieldMismatch />;
    case 'write_off_success': return <S5Success />;
    case 'ecustoms_error': return <S6TechnicalError />;
    case 'amendment_form': return <S7AmendmentForm />;
    case 'pending_review': return <S8PendingReview />;
    case 'rejected': return <S9Rejected />;
    case 'payment_ready': return <S10Payment />;
    case 'finalizing': return <S2Validating isFinalizing />;
    case 'finalized': return <S11Finalized />;
    case 'bl_cancel_form': return <S12BLCancel />;
    case 'officer_history': return <OfficerHistory />;
    case 'officer_pending': return <OfficerPending />;
    default: return <S1Entry />;
  }
};
