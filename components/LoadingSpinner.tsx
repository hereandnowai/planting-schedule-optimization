import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const LoadingSpinner: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600 dark:border-green-400"></div>
      <p className="text-green-700 dark:text-green-300 font-medium">{t('loadingText')}</p>
    </div>
  );
};

export default LoadingSpinner;