import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import ChatMessageItem from './ChatMessageItem.tsx';
import { CloseIcon, SendIcon, MicrophoneIcon, BotIcon, StopCircleIcon, SparklesIcon } from './icons.tsx';
import { COMPANY_NAME } from '../constants';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isSendingMessage: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  currentMicTranscript: string;
  assistantError: string | null;
  clearAssistantError: () => void;
}

const AssistantModal: React.FC<AssistantModalProps> = ({
  isOpen,
  onClose,
  chatMessages,
  onSendMessage,
  isSendingMessage,
  isListening,
  onToggleListening,
  currentMicTranscript,
  assistantError,
  clearAssistantError,
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  useEffect(() => {
    if (currentMicTranscript) {
        setInputText(currentMicTranscript);
    }
  }, [currentMicTranscript]);


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (assistantError) clearAssistantError();
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (inputText.trim() && !isSendingMessage) {
      await onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleMicClick = () => {
    onToggleListening();
    if (assistantError) clearAssistantError();
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-modal-title"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col w-full max-w-lg max-h-[90vh] sm:max-h-[80vh] transform transition-all duration-300 ease-out scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <BotIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
            <div>
              <h2 id="assistant-modal-title" className="text-xl font-semibold text-gray-800 dark:text-slate-100">{t('assistantModalTitle')}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('assistantModalSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label={t('closeAssistantAriaLabel')}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50 dark:bg-slate-900">
          {chatMessages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-slate-400 py-8">
              <SparklesIcon className="w-12 h-12 mx-auto mb-2 text-green-500 dark:text-green-400" />
              <p>{t('assistantWelcomeMessageInitial')}</p>
              <p className="text-sm">{t('assistantWelcomePrompt1')}</p>
              <p className="text-xs mt-2" dangerouslySetInnerHTML={{ __html: t('assistantWelcomePrompt2') }}></p>
            </div>
          )}
          {chatMessages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Loading & Error */}
        {isSendingMessage && (
            <div className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700">
                {t('assistantTyping')}
            </div>
        )}
        {assistantError && (
          <div className="p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm border-t border-red-200 dark:border-red-700">
            <strong>{t('assistantErrorPrefix')}</strong> {assistantError}
          </div>
        )}


        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center space-x-2">
            <textarea
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={isListening ? t('assistantInputListeningPlaceholder') : t('assistantInputPlaceholder')}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-colors text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-green-600 dark:focus:border-green-600"
              rows={1}
              disabled={isSendingMessage || isListening}
              aria-label={t('chatMessageInputAriaLabel')}
            />
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isSendingMessage}
              className={`p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
                ${isListening ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 animate-pulse dark:focus:ring-red-500' 
                               : 'bg-green-100 hover:bg-green-200 text-green-700 focus:ring-green-400 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100 dark:focus:ring-green-500'}
                ${isSendingMessage ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label={isListening ? t('assistantStopListeningButtonLabel') : t('assistantStartListeningButtonLabel')}
            >
              {isListening ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
            </button>
            <button
              type="submit"
              disabled={!inputText.trim() || isSendingMessage || isListening}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-slate-600 dark:focus:ring-green-400"
              aria-label={t('assistantSendButtonLabel')}
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
         <div className="text-center py-2 text-xs text-gray-400 bg-gray-50 dark:bg-slate-900 dark:text-slate-500 rounded-b-xl">
            {t('assistantPoweredBy', COMPANY_NAME)}
          </div>
      </div>
    </div>
  );
};

export default AssistantModal;