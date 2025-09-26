import { useContext } from 'react';

import { OnboardingContext } from './OnboardingContext';
import { OnboardingContextType } from './types';

// Custom hook to use the context
export const useOnboardingContext = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
};