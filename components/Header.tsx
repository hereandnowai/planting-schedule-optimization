import React from 'react';
import { COMPANY_NAME, COMPANY_LOGO_URL } from '../constants';
import { HistoryIcon, SunIcon, MoonIcon, GlobeIcon } from './icons.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface HeaderProps {
  onViewHistory: () => void;
  currentTheme: string;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onViewHistory, currentTheme, onToggleTheme }) => {
  const { t, language, setLanguage, supportedLanguages } = useLanguage();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md p-4 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={COMPANY_LOGO_URL} alt="Company Logo" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-[#1E2F97] dark:text-green-300">{t('headerTitle')}</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('headerSubtitle', COMPANY_NAME)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1E2F97] dark:text-green-300 hidden md:block">{t('personalizedPlantingScheduler')}</h2>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="relative">
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-1.5 sm:p-2 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-teal-500 dark:focus:border-teal-500 appearance-none pr-7 sm:pr-8"
                aria-label={t('languageSelectorLabel')}
              >
                {supportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <GlobeIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={onToggleTheme}
              className="p-1.5 sm:p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-colors"
              title={currentTheme === 'dark' ? t('themeSwitchLight') : t('themeSwitchDark')}
              aria-label={currentTheme === 'dark' ? t('themeSwitchLight') : t('themeSwitchDark')}
            >
              {currentTheme === 'dark' ? <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <button
              onClick={onViewHistory}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              title={t('viewHistoryAriaLabel')}
              aria-label={t('viewHistoryAriaLabel')}
            >
              <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('viewHistory')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;