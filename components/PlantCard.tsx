import React from 'react';
import { PlantRecommendation } from '../types';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface PlantCardProps {
  plant: PlantRecommendation;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-2xl font-semibold text-[#1E2F97] dark:text-green-300 mb-2">{plant.plantName} {plant.variety && <span className="text-lg text-green-600 dark:text-green-400">({plant.variety})</span>}</h3>
      
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 italic">{plant.suitability}</p>

      <div className="space-y-2 text-gray-700 dark:text-slate-300">
        <p><strong className="font-medium text-gray-800 dark:text-slate-100">{t('plantingMethodLabel')}</strong> {plant.plantingMethod}</p>
        {plant.indoorStartWindow && <p><strong className="font-medium text-gray-800 dark:text-slate-100">{t('startIndoorsLabel')}</strong> {plant.indoorStartWindow}</p>}
        {plant.outdoorPlantingWindow && <p><strong className="font-medium text-gray-800 dark:text-slate-100">{t('plantOutdoorsLabel')}</strong> {plant.outdoorPlantingWindow}</p>}
        {plant.daysToMaturity && <p><strong className="font-medium text-gray-800 dark:text-slate-100">{t('daysToMaturityLabel')}</strong> {plant.daysToMaturity}</p>}
        {plant.harvestTime && <p><strong className="font-medium text-gray-800 dark:text-slate-100">{t('harvestTimeLabel')}</strong> {plant.harvestTime}</p>}

        {plant.careInstructions && plant.careInstructions.length > 0 && (
          <div>
            <strong className="font-medium text-gray-800 dark:text-slate-100 block mt-2 mb-1">{t('careInstructionsLabel')}</strong>
            <ul className="list-disc list-inside ml-4 space-y-1">
              {plant.careInstructions.map((instr, idx) => <li key={idx} className="text-sm">{instr}</li>)}
            </ul>
          </div>
        )}

        {plant.companionPlants && plant.companionPlants.length > 0 && (
          <p className="mt-2"><strong className="font-medium text-gray-800 dark:text-slate-100">{t('companionsLabel')}</strong> {plant.companionPlants.join(', ')}</p>
        )}
        {plant.notes && <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 italic"><strong className="dark:text-slate-200">{t('notesLabel')}</strong> {plant.notes}</p>}
      </div>
    </div>
  );
};

export default PlantCard;