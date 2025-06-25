import React from 'react';
import { HistoricalScheduleEntry } from '../types';
import { CloseIcon, DeleteIcon, DownloadIcon as LoadIcon, HistoryIcon, SaveIcon } from './icons.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoricalScheduleEntry[];
  onLoadSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
  onSaveCurrentSchedule: () => void;
  hasActiveSchedule: boolean;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadSchedule,
  onDeleteSchedule,
  onSaveCurrentSchedule,
  hasActiveSchedule,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <HistoryIcon className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <h2 id="history-modal-title" className="text-xl font-semibold text-gray-800 dark:text-slate-100">{t('historyModalTitle')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label={t('closeHistoryAriaLabel')}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-gray-50 dark:bg-slate-900">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-slate-400 py-10">
              <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
              <p className="text-lg">{t('noSavedSchedules')}</p>
              <p className="text-sm">{t('savePrompt')}</p>
              {hasActiveSchedule && (
                <button
                  onClick={() => {
                    onSaveCurrentSchedule();
                  }}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center space-x-2 text-sm mx-auto dark:focus:ring-blue-500"
                  aria-label={t('saveCurrentScheduleButton')}
                >
                  <SaveIcon className="w-5 h-5" />
                  <span>{t('saveCurrentScheduleButton')}</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {hasActiveSchedule && (
                 <button
                    onClick={() => {
                        onSaveCurrentSchedule();
                    }}
                    className="w-full mb-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 text-sm dark:focus:ring-blue-500"
                    aria-label={t('saveCurrentScheduleToHistoryButton')}
                    >
                    <SaveIcon className="w-5 h-5" />
                    <span>{t('saveCurrentScheduleToHistoryButton')}</span>
                </button>
              )}
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-slate-600 hover:shadow-lg transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <h3 className="font-semibold text-teal-700 dark:text-teal-400 text-lg">{entry.location || 'Schedule'}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{t('savedAtLabel')} {formatTimestamp(entry.savedAt)}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 truncate max-w-xs sm:max-w-md md:max-w-lg">
                      {entry.schedule.greetingMessage?.replace("Hello from GreenThumb AI! Here is your personalized planting schedule for ", "") || "Personalized planting schedule"}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0 flex-shrink-0">
                    <button
                      onClick={() => onLoadSchedule(entry.id)}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-md text-sm flex items-center space-x-1 transition-colors dark:focus:ring-green-400"
                      aria-label={t('loadScheduleAriaLabel', entry.location || 'this schedule')}
                    >
                      <LoadIcon className="w-4 h-4" />
                      <span>{t('loadButton')}</span>
                    </button>
                    <button
                      onClick={() => onDeleteSchedule(entry.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-md text-sm flex items-center space-x-1 transition-colors dark:focus:ring-red-400"
                      aria-label={t('deleteScheduleAriaLabel', entry.location || 'this schedule')}
                    >
                      <DeleteIcon className="w-4 h-4" />
                      <span>{t('deleteButton')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
         <div className="text-center py-2 text-xs text-gray-400 bg-gray-100 dark:bg-slate-800 dark:text-slate-500 dark:border-t dark:border-slate-700 rounded-b-xl border-t border-gray-200">
            {t('historyStoredInLocalStorage')}
          </div>
      </div>
    </div>
  );
};

export default HistoryModal;