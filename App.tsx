
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import UserInputForm from './components/UserInputForm.tsx';
import ScheduleDisplay from './components/ScheduleDisplay.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import ErrorMessage from './components/ErrorMessage.tsx';
import AssistantFAB from './components/AssistantFAB.tsx';
import AssistantModal from './components/AssistantModal.tsx';
import HistoryModal from './components/HistoryModal.tsx';
import { UserInput, GeneratedSchedule, ChatMessage, HistoricalScheduleEntry } from './types';
import { getPlantingSchedule, startAppAssistantChat, sendMessageToAssistantChat } from './services/geminiService';
import { speechService } from './services/speechService';
import { COMPANY_LOGO_URL, COMPANY_NAME } from './constants';
import { useLanguage } from './contexts/LanguageContext.tsx'; 

// Main application component
const App: React.FC = () => {
  const { t, language, setLanguage: setAppLanguage } = useLanguage(); 

  // Theme State
  const [theme, setTheme] = useState<string>(() => {
    try {
      const storedTheme = localStorage.getItem('greenThumbAITheme');
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) { /* ignore */ }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('greenThumbAITheme', theme);
    } catch (e) {
      console.error('Could not save theme to localStorage', e);
    }
  }, [theme]);

  // Effect to update HTML lang and dir attributes
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);


  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Main Schedule State
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState<boolean>(true);

  // AI Assistant State
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState<boolean>(false);
  const [assistantChatMessages, setAssistantChatMessages] = useState<ChatMessage[]>([]);
  const [assistantChatSession, setAssistantChatSession] = useState<Chat | null>(null);
  const [isAssistantSending, setIsAssistantSending] = useState<boolean>(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [isListeningToUser, setIsListeningToUser] = useState<boolean>(false);
  const [currentMicTranscript, setCurrentMicTranscript] = useState<string>('');
  
  // History State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [historicalSchedules, setHistoricalSchedules] = useState<HistoricalScheduleEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load history from localStorage on initial mount
    const storedHistory = localStorage.getItem('greenThumbAIHistory');
    if (storedHistory) {
      try {
        setHistoricalSchedules(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse history from localStorage:", e);
        localStorage.removeItem('greenThumbAIHistory'); // Clear corrupted history
      }
    }
  }, []);
  
  const showToast = (messageKey: string, ...args: string[]) => {
    setToastMessage(t(messageKey, ...args));
    setTimeout(() => {
      setToastMessage(null);
    }, 3000); // Toast visible for 3 seconds
  };

  const handleFormSubmit = useCallback(async (data: UserInput) => {
    setIsLoading(true);
    setError(null);
    setSchedule(null);
    setIsWelcomeVisible(false);
    try {
      const generatedSchedule = await getPlantingSchedule(data);
      setSchedule(generatedSchedule);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('errorTitle')); // Generic error from translations
      }
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // --- AI Assistant Logic ---
  const initializeAssistantChat = useCallback(() => {
    if (!assistantChatSession) {
      try {
        const chat = startAppAssistantChat();
        setAssistantChatSession(chat);
        setAssistantChatMessages([]); // Clear previous messages
        setAssistantChatMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            text: t('assistantWelcomeMessage'),
            sender: 'ai',
            timestamp: Date.now()
        }]);
      } catch (e) {
        const errorMsg = (e instanceof Error) ? e.message : t('assistantDefaultError');
        setAssistantError(errorMsg);
      }
    }
  }, [assistantChatSession, t]);
  
  useEffect(() => { // Re-initialize or update greeting if language changes and modal is open or about to open
    if (assistantChatSession && assistantChatMessages.length > 0 && assistantChatMessages[0].sender === 'ai') {
        // Update the initial greeting if language changed
        setAssistantChatMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[0]) {
                 newMessages[0] = { ...newMessages[0], text: t('assistantWelcomeMessage') };
            }
            return newMessages;
        });
    }
  }, [language, t, assistantChatSession]);


  const toggleAssistantModal = () => {
    setIsAssistantModalOpen(prev => {
      const closing = prev;
      if (!closing) { // Opening modal
        initializeAssistantChat();
      } else { // Closing modal
        if (isListeningToUser) {
          speechService.stopListening();
          setIsListeningToUser(false);
          setCurrentMicTranscript('');
        }
      }
      return !prev;
    });
  };

  const clearAssistantError = () => setAssistantError(null);

  const handleSendAssistantMessage = async (text: string) => {
    if (!text.trim() || !assistantChatSession) return;
    clearAssistantError();
    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: text.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };
    setAssistantChatMessages(prev => [...prev, newUserMessage]);
    setIsAssistantSending(true);

    try {
      const aiResponseText = await sendMessageToAssistantChat(assistantChatSession, text.trim());
      const newAiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: Date.now(),
      };
      setAssistantChatMessages(prev => [...prev, newAiMessage]);
    } catch (e) {
      const errorMsg = (e instanceof Error) ? e.message : t('assistantDefaultError');
      setAssistantError(errorMsg);
       setAssistantChatMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        text: t('assistantDefaultError'),
        sender: 'ai',
        timestamp: Date.now()
      }]);
    } finally {
      setIsAssistantSending(false);
    }
  };
  
  const mapLanguageToSpeechCode = (langCode: string): string => {
    switch (langCode) {
      case 'en': return 'en-US';
      case 'es': return 'es-ES';
      case 'fr': return 'fr-FR';
      case 'de': return 'de-DE';
      case 'ta': return 'ta-IN';
      case 'te': return 'te-IN';
      case 'ar': return 'ar-SA'; // Or ar-AE, ar-EG as common choices
      default: return 'en-US';
    }
  };

  const handleToggleListening = () => {
    if (!speechService.isSupported()) {
      setAssistantError("Speech recognition is not supported in your browser.");
      return;
    }
    clearAssistantError();

    if (isListeningToUser) {
      speechService.stopListening();
      setIsListeningToUser(false);
      if (currentMicTranscript.trim()) {
        handleSendAssistantMessage(currentMicTranscript.trim());
      }
      setCurrentMicTranscript('');
    } else {
      setCurrentMicTranscript('');
      const speechLang = mapLanguageToSpeechCode(language);
      speechService.startListening(
        { // Callbacks
            onStart: () => setIsListeningToUser(true),
            onResult: (transcript, isFinal) => {
            setCurrentMicTranscript(transcript);
            if (isFinal) {
                setIsListeningToUser(false);
                speechService.stopListening();
                if (transcript.trim()) {
                    handleSendAssistantMessage(transcript.trim());
                }
                setCurrentMicTranscript('');
            }
            },
            onError: (errorMsg) => {
            setAssistantError(errorMsg); 
            setIsListeningToUser(false);
            setCurrentMicTranscript('');
            },
            onEnd: () => {
            setIsListeningToUser(false);
            }
        }, 
        { lang: speechLang } // Options object with lang property
      );
    }
  };

  // --- History Logic ---
  const toggleHistoryModal = () => {
    setIsHistoryModalOpen(prev => !prev);
  };

  const saveCurrentScheduleToHistory = () => {
    if (!schedule) {
      showToast("toastNoActiveSchedule");
      return;
    }
    let derivedLocationName = "Schedule"; 
    if (schedule.greetingMessage) {
        const greetingLocationMatch = schedule.greetingMessage.match(/for\s+(.+?)(?:\.|$)/i); 
        if (greetingLocationMatch && greetingLocationMatch[1] && greetingLocationMatch[1].trim() !== "") {
            derivedLocationName = greetingLocationMatch[1].trim();
        }
    }
    if ((derivedLocationName === "Schedule" || derivedLocationName === "your area") && schedule.locationAnalysis?.assumedClimateZone) {
        derivedLocationName = schedule.locationAnalysis.assumedClimateZone;
    }
     if (derivedLocationName === "Schedule" && !schedule.locationAnalysis?.assumedClimateZone && schedule.locationAnalysis) {
        derivedLocationName = "Personalized Schedule";
    }


    const newEntry: HistoricalScheduleEntry = {
      id: crypto.randomUUID(),
      savedAt: Date.now(),
      location: derivedLocationName,
      schedule: schedule,
    };
    const updatedHistory = [newEntry, ...historicalSchedules.slice(0, 9)]; 
    setHistoricalSchedules(updatedHistory);
    localStorage.setItem('greenThumbAIHistory', JSON.stringify(updatedHistory));
    showToast("toastScheduleSaved", derivedLocationName);
  };


  const loadScheduleFromHistory = (entryId: string) => {
    const entryToLoad = historicalSchedules.find(entry => entry.id === entryId);
    if (entryToLoad) {
      setSchedule(entryToLoad.schedule);
      setIsWelcomeVisible(false);
      setError(null);
      setIsHistoryModalOpen(false); 
      showToast("toastScheduleLoaded", entryToLoad.location);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const deleteScheduleFromHistory = (entryId: string) => {
    const updatedHistory = historicalSchedules.filter(entry => entry.id !== entryId);
    setHistoricalSchedules(updatedHistory);
    localStorage.setItem('greenThumbAIHistory', JSON.stringify(updatedHistory));
    showToast("toastScheduleDeleted");
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#8bc34a] dark:bg-slate-900">
      <Header 
        onViewHistory={toggleHistoryModal} 
        currentTheme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {isWelcomeVisible && !schedule && !isLoading && !error && (
            <div 
              className={`
                text-center mb-12 p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-xl
                transform transition-all duration-700 ease-out
                hover:shadow-2xl 
                ${isWelcomeVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              `}
            >
               <img 
                src={COMPANY_LOGO_URL} 
                alt={t('welcomeHeading')} 
                className={`
                  w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full shadow-lg animate-gentle-pulse
                  transform transition-all duration-500 ease-out
                  ${isWelcomeVisible ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 translate-y-4'}
                `}
              />
              <h1 
                className={`
                  text-3xl sm:text-4xl font-extrabold text-[#1E2F97] dark:text-green-300 mb-4
                  transform transition-all duration-500 ease-out 
                  ${isWelcomeVisible ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-4'}
                `}
              >
                {t('welcomeHeading')}
              </h1>
              <p 
                className={`
                  text-md sm:text-lg text-[#1E2F97] dark:text-green-400 leading-relaxed
                  transform transition-all duration-500 ease-out
                  ${isWelcomeVisible ? 'opacity-100 translate-y-0 delay-[400ms]' : 'opacity-0 translate-y-4'}
                `}
              >
                {t('welcomeParagraph')}
              </p>
              <div
                className={`
                  mt-8 pt-6 border-t border-green-300 dark:border-green-700
                  transform transition-all duration-500 ease-out
                  ${isWelcomeVisible ? 'opacity-100 translate-y-0 delay-[600ms]' : 'opacity-0 translate-y-4'}
                `}
              >
                <h2 className="text-2xl font-bold text-[#1E2F97] dark:text-green-300 mb-4">
                  {t('howToTitle')}
                </h2>
                <ol className="list-none space-y-3 text-left text-[#1E2F97] dark:text-green-400 max-w-md mx-auto text-sm sm:text-base">
                  {[t('step1'), t('step2'), t('step3')].map((step, index) => (
                    <li 
                      key={index}
                      className={`
                        flex items-start space-x-2
                        transform transition-all duration-500 ease-out
                        ${isWelcomeVisible ? `opacity-100 translate-x-0 delay-[${700 + index*100}ms]` : 'opacity-0 -translate-x-4'}
                      `}
                    >
                      <span className="flex-shrink-0 bg-green-500 text-white rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center">{index + 1}</span>
                      <span dangerouslySetInnerHTML={{ __html: step }}></span>
                    </li>
                  ))}
                </ol>
                <p className={`
                  mt-6 text-green-700 dark:text-green-300 font-semibold animate-bounce
                  transform transition-all duration-500 ease-out
                  ${isWelcomeVisible ? 'opacity-100 translate-y-0 delay-[1000ms]' : 'opacity-0 translate-y-4'}
                `}>
                  {t('getStartedPrompt')}
                </p>
              </div>
            </div>
          )}

          <UserInputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          
          {isLoading && (
            <div className="mt-10 flex justify-center">
              <LoadingSpinner />
            </div>
          )}
          
          {error && (
            <div className="mt-10">
              <ErrorMessage message={error} />
            </div>
          )}
          
          {schedule && !isLoading && !error && (
            <ScheduleDisplay schedule={schedule} />
          )}
        </div>
      </main>
      <Footer />
      <AssistantFAB onClick={toggleAssistantModal} isOpen={isAssistantModalOpen} />
      <AssistantModal
        isOpen={isAssistantModalOpen}
        onClose={toggleAssistantModal}
        chatMessages={assistantChatMessages}
        onSendMessage={handleSendAssistantMessage}
        isSendingMessage={isAssistantSending}
        isListening={isListeningToUser}
        onToggleListening={handleToggleListening}
        currentMicTranscript={currentMicTranscript}
        assistantError={assistantError}
        clearAssistantError={clearAssistantError}
      />
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={toggleHistoryModal}
        history={historicalSchedules}
        onLoadSchedule={loadScheduleFromHistory}
        onDeleteSchedule={deleteScheduleFromHistory}
        onSaveCurrentSchedule={saveCurrentScheduleToHistory}
        hasActiveSchedule={!!schedule}
      />
        {toastMessage && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg z-[2000] animate-fadeInOut dark:bg-slate-700 dark:text-slate-100">
            {toastMessage}
            </div>
        )}
      <style>{`
        body.dark .bg-white\/90 { /* Escaped forward slash for safety in some contexts */
          background-color: rgba(30, 41, 59, 0.9); /* slate-800 with 90% opacity */
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease-in-out;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px) translateX(-50%); }
          10% { opacity: 1; transform: translateY(0) translateX(-50%); }
          90% { opacity: 1; transform: translateY(0) translateX(-50%); }
          100% { opacity: 0; transform: translateY(20px) translateX(-50%); }
        }
        .animate-gentle-pulse {
          animation: gentlePulse 2.5s infinite ease-in-out;
        }
        @keyframes gentlePulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
        }
      `}</style>
    </div>
  );
};

export default App;