import React from 'react';
import { COMPANY_NAME } from '../constants';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-800 text-white text-center p-6 mt-12 dark:bg-slate-900 transition-colors duration-300">
      <p dangerouslySetInnerHTML={{ __html: t('footerCopyright', new Date().getFullYear().toString(), COMPANY_NAME) }}></p>
      <p className="text-sm text-gray-400">{t('footerTagline')}</p>
    </footer>
  );
};

export default Footer;