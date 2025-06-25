import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { translations, Translations, supportedLanguages } from '../translations'; // Ensure this path is correct

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, ...args: (string | number)[]) => string; // Translation function
  supportedLanguages: Array<{ code: string; name: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    try {
      const storedLang = localStorage.getItem('greenThumbAILang');
      if (storedLang && supportedLanguages.some(l => l.code === storedLang)) {
        return storedLang;
      }
    } catch (e) {
      console.error("Could not read language from localStorage", e);
    }
    return supportedLanguages[0]?.code || 'en'; // Default to first supported language or 'en'
  });

  useEffect(() => {
    try {
      localStorage.setItem('greenThumbAILang', currentLanguage);
    } catch (e) {
      console.error("Could not save language to localStorage", e);
    }
  }, [currentLanguage]);

  const t = useCallback((key: string, ...args: (string | number)[]): string => {
    const langTranslations: Record<string, string> = translations[currentLanguage] || translations['en'] || {};
    let translation = langTranslations[key] !== undefined ? langTranslations[key] : key; // Fallback to key if not found

    if (args.length > 0) {
      args.forEach((arg, index) => {
        translation = translation.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
      });
    }
    return translation;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ language: currentLanguage, setLanguage: setCurrentLanguage, t, supportedLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
