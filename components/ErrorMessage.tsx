import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-700" role="alert">
      <p className="font-bold">{t('errorTitle')}</p>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;