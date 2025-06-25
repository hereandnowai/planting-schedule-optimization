import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { GeneratedSchedule, MonthlyTaskItem, SuccessionPlantingTip } from '../types';
import PlantCard from './PlantCard.tsx';
import { ImageIcon, PlanningIcon, SowingIcon, MaintenanceIcon, HarvestingIcon } from './icons.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface ScheduleDisplayProps {
  schedule: GeneratedSchedule | null;
}

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-green-200 rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow dark:border-green-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-green-50 hover:bg-green-100 text-left text-[#1E2F97] font-semibold rounded-t-lg focus:outline-none dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-green-300"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
      </button>
      {isOpen && <div className="p-4 bg-white rounded-b-lg border-t border-green-200 dark:bg-slate-800 dark:border-slate-700">{children}</div>}
    </div>
  );
};

const monthEmojis: { [key: string]: string } = {
  "January": "❄️", "February": "🌱", "March": "🌬️", "April": "🌷",
  "May": "🌸", "June": "☀️", "July": "🍉", "August": "🌻",
  "September": "🍂", "October": "🎃", "November": "🍁", "December": "🌲"
};

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ schedule }) => {
  const { t } = useLanguage();
  const scheduleContentRef = useRef<HTMLDivElement>(null);

  if (!schedule) {
    return null;
  }

  const { 
    greetingMessage, locationAnalysis, plantRecommendations, monthlyTasks, 
    successionPlantingTips, generalGardeningAdvice, seasonalOverview 
  } = schedule;

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const monthOrder = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const openAllAccordionsForCapture = () => {
    if (!scheduleContentRef.current) return;
    const accordions = scheduleContentRef.current.querySelectorAll('button[aria-expanded="false"]');
    accordions.forEach(acc => (acc as HTMLElement).click());
  };
  
  const handleDownloadImage = async () => {
    if (!scheduleContentRef.current) {
        console.error("Image generation failed: schedule content ref is not available.");
        alert("Image generation failed: content not found.");
        return;
    }
    openAllAccordionsForCapture();

    setTimeout(async () => {
        try {
            const scale = 2; 
            const canvas = await html2canvas(scheduleContentRef.current!, { 
                scale: scale, 
                useCORS: true,
                logging: true,
                scrollX: 0,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.scrollWidth,
                windowHeight: document.documentElement.scrollHeight,
                height: scheduleContentRef.current!.scrollHeight,
                width: scheduleContentRef.current!.offsetWidth,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff', // slate-900 or white
            });
            
            // For simplicity, download as a single potentially long image.
            // Splitting logic from original is removed for now, can be re-added if needed.
            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `GreenThumbAI_Schedule.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error generating image:", error);
            let message = "Sorry, there was an issue creating the image.";
            if (error instanceof Error) message += ` Details: ${error.message}`;
            alert(message + " Please check the console for details.");
        }
    }, 1000); 
  };
  
  const getTranslatedTaskCategory = (category?: string): string => {
    if (!category) return '';
    const catLower = category.toLowerCase();
    if (catLower.includes('plan')) return t('taskCategoryPlanning');
    if (catLower.includes('sow') || catLower.includes('seed') || catLower.includes('plant')) return t('taskCategorySowing');
    if (catLower.includes('maintain') || catLower.includes('care') || catLower.includes('water') || catLower.includes('fertilize')) return t('taskCategoryMaintenance');
    if (catLower.includes('harvest')) return t('taskCategoryHarvesting');
    return category; // Fallback to original category if no match
  };


  const getTaskIcon = (category?: string) => {
    if (!category) return <div className="w-5 h-5 mr-2 shrink-0"></div>;
    const cat = category.toLowerCase();
    if (cat.includes('plan')) return <PlanningIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2 shrink-0" />;
    if (cat.includes('sow') || cat.includes('seed') || cat.includes('plant')) return <SowingIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2 shrink-0" />;
    if (cat.includes('maintain') || cat.includes('care') || cat.includes('water') || cat.includes('fertilize')) return <MaintenanceIcon className="w-5 h-5 text-purple-500 dark:text-purple-400 mr-2 shrink-0" />;
    if (cat.includes('harvest')) return <HarvestingIcon className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 shrink-0" />;
    return <div className="w-5 h-5 mr-2 shrink-0"></div>; 
  };


  return (
    <div className="mt-10 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-8" >
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-green-200 dark:border-slate-700 gap-4">
        {greetingMessage && (
          <h2 className="text-3xl font-bold text-[#1E2F97] dark:text-green-300 text-center sm:text-left flex-grow">
            {greetingMessage}
          </h2>
        )}
        <div className="relative shrink-0">
            <button
              onClick={handleDownloadImage}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center space-x-2 text-sm dark:bg-green-500 dark:hover:bg-green-600"
              aria-label={t('saveScheduleImageAriaLabel')}
            >
              <ImageIcon className="w-5 h-5" />
              <span>{t('saveAsImageButton')}</span>
            </button>
        </div>
      </div>
      
      <div ref={scheduleContentRef} id="schedule-content-for-download" className="bg-white dark:bg-slate-800">
        {locationAnalysis && (
          <AccordionItem title={t('locationAnalysisTitle')} defaultOpen={true}>
            <div className="space-y-2 text-gray-700 dark:text-slate-300">
              {locationAnalysis.assumedClimateZone && <p><strong className="font-medium text-gray-800 dark:text-slate-100">{t('climateZoneLabel')}</strong> {locationAnalysis.assumedClimateZone}</p>}
              {locationAnalysis.lastFrostDate && <p><strong className="font-medium text-gray-800 dark:text-slate-100">{t('lastFrostLabel')}</strong> {locationAnalysis.lastFrostDate}</p>}
              {locationAnalysis.firstFrostDate && <p><strong className="font-medium text-gray-800 dark:text-slate-100">{t('firstFrostLabel')}</strong> {locationAnalysis.firstFrostDate}</p>}
              {locationAnalysis.notes && <p className="mt-2 text-sm italic"><strong className="dark:text-slate-200">{t('notesLabel')}</strong> {locationAnalysis.notes}</p>}
            </div>
          </AccordionItem>
        )}

        {seasonalOverview && (
           <AccordionItem title={t('seasonalOverviewTitle')}>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{seasonalOverview}</p>
           </AccordionItem>
        )}

        {plantRecommendations && plantRecommendations.length > 0 && (
          <AccordionItem title={t('plantRecommendationsTitle')} defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plantRecommendations.map((plant, idx) => (
                <PlantCard key={idx} plant={plant} />
              ))}
            </div>
          </AccordionItem>
        )}

        {monthlyTasks && Object.keys(monthlyTasks).length > 0 && (
          <AccordionItem title={t('monthlyTasksTitle')} defaultOpen={true}>
            <div className="space-y-6">
              {monthOrder.map(month => {
                const tasks = monthlyTasks[month];
                if (!tasks || tasks.length === 0) return null;
                
                const emoji = monthEmojis[month] || '🗓️';

                return (
                  <div key={month} className={`p-4 rounded-lg shadow-inner ${month === currentMonth ? 'bg-lime-50 dark:bg-green-900/50 border-2 border-green-400 dark:border-green-600' : 'bg-green-50 dark:bg-slate-700/50'}`}>
                    <h4 className={`text-xl font-semibold mb-3 ${month === currentMonth ? 'text-[#1E2F97] dark:text-green-300' : 'text-green-700 dark:text-green-400'}`}>
                      <span className="mr-2">{emoji}</span>{month} {month === currentMonth && <span className="text-sm font-normal text-green-500 dark:text-green-400">{t('currentMonthSuffix')}</span>}
                    </h4>
                    {tasks.length > 0 ? (
                      <ul className="space-y-2">
                        {tasks.map((task: MonthlyTaskItem, idx: number) => (
                          <li key={idx} className="p-3 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-gray-200 dark:border-slate-600 flex items-start">
                             {getTaskIcon(task.category)}
                             <div className="flex-grow">
                              <strong className="text-green-600 dark:text-green-400">{task.category ? `[${getTranslatedTaskCategory(task.category)}] ` : ''}{task.task}</strong>
                              {task.details && <p className="text-sm text-gray-600 dark:text-slate-400 ml-0">{task.details}</p>}
                             </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-slate-400">{t('noTasksForMonth')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </AccordionItem>
        )}

        {successionPlantingTips && successionPlantingTips.length > 0 && (
          <AccordionItem title={t('successionPlantingTitle')}>
            <ul className="space-y-3">
              {successionPlantingTips.map((tip: SuccessionPlantingTip, idx: number) => (
                <li key={idx} className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md shadow-sm border border-indigo-200 dark:border-indigo-700">
                  <p className="font-medium text-indigo-700 dark:text-indigo-300">
                    <strong >{t('initialCropLabel')}</strong> {tip.initialCrop} ➔ <strong >{t('followUpCropLabel')}</strong> {tip.followUpCrop}
                  </p>
                  {tip.timing && <p className="text-sm text-indigo-600 dark:text-indigo-400"><strong>{t('timingLabel')}</strong> {tip.timing}</p>}
                  {tip.notes && <p className="text-sm text-gray-600 dark:text-slate-400 mt-1"><em>{tip.notes}</em></p>}
                </li>
              ))}
            </ul>
          </AccordionItem>
        )}

        {generalGardeningAdvice && generalGardeningAdvice.length > 0 && (
          <AccordionItem title={t('generalAdviceTitle')}>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-slate-300 pl-4">
              {generalGardeningAdvice.map((advice, idx) => (
                <li key={idx}>{advice}</li>
              ))}
            </ul>
          </AccordionItem>
        )}
      </div>
    </div>
  );
};

export default ScheduleDisplay;