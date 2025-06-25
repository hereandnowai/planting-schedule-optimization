import React from 'react';
import { BotIcon, CloseIcon } from './icons.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface AssistantFABProps {
  onClick: () => void;
  isOpen?: boolean;
}

const AssistantFAB: React.FC<AssistantFABProps> = ({ onClick, isOpen }) => {
  const { t } = useLanguage();
  const label = isOpen ? t('closeAssistantAriaLabel') : t('openAssistantAriaLabel');
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-400 transition-all duration-300 ease-in-out transform hover:scale-110 z-[100]`}
      aria-label={label}
      title={label}
    >
      {isOpen ? <CloseIcon className="w-7 h-7" /> : <BotIcon className="w-7 h-7" />}
    </button>
  );
};

export default AssistantFAB;