import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

const STEPS = [
  'Extracting BL Number',
  'Checking BL with Tradian',
  'Verifying BL in E-Customs',
  'Cross-checking fields with E-Valuator'
];

export const S2Validating: React.FC<{ isFinalizing?: boolean }> = ({ isFinalizing }) => {
  const { state, updateState } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isFinalizing) {
      const timer = setTimeout(() => {
        updateState({ status: 'finalized' });
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Mock validation flow
    let isMounted = true;
    const runValidation = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (!isMounted) return;
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, 800));
      }
      
      if (!isMounted) return;
      // For demo purposes, we randomly fail or succeed if not using dev controls
      // In a real app, this would call the backend API
      const randomOutcome = Math.random();
      if (randomOutcome > 0.8) {
        updateState({ status: 'write_off_success' });
      } else {
        updateState({ status: 'field_mismatch' });
      }
    };

    runValidation();
    return () => { isMounted = false; };
  }, [isFinalizing, updateState]);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 card-primary-stripe overflow-hidden p-8">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">
            {isFinalizing ? 'Finalizing Write-Off...' : 'Validating Manifest...'}
          </h2>
          <p className="text-gray-500 mt-2">This usually takes 5–15 seconds</p>
        </div>

        {!isFinalizing && (
          <div className="space-y-4 max-w-md mx-auto">
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              
              return (
                <div key={step} className={`flex items-center gap-3 ${isActive ? 'text-gray-900 font-medium' : isPast ? 'text-gray-500' : 'text-gray-300'}`}>
                  {isPast ? (
                    <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-[var(--primary)] animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                  )}
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--primary)]"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};
