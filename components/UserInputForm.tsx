import React, { useState } from 'react';
import { UserInput, GardeningSpaceType, ExperienceLevel } from '../types';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface UserInputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const UserInputForm: React.FC<UserInputFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<UserInput>({
    location: '',
    spaceType: GardeningSpaceType.OUTDOOR_GROUND,
    goals: '',
    experienceLevel: ExperienceLevel.BEGINNER,
    specificPlants: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any })); // Type assertion for enum compatibility
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl space-y-6 transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <h2 className="text-3xl font-bold text-center text-[#1E2F97] dark:text-green-300 mb-6">{t('formTitle')}</h2>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('locationLabel')}</label>
        <input
          type="text"
          name="location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-green-600 dark:focus:border-green-600"
          placeholder={t('locationPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="spaceType" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('spaceTypeLabel')}</label>
        <select
          name="spaceType"
          id="spaceType"
          value={formData.spaceType}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-green-600 dark:focus:border-green-600"
        >
          {Object.values(GardeningSpaceType).map(type => (
            <option key={type} value={type}>{t(type)}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="goals" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('goalsLabel')}</label>
        <textarea
          name="goals"
          id="goals"
          value={formData.goals}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-green-600 dark:focus:border-green-600"
          placeholder={t('goalsPlaceholder')}
        />
      </div>
      
      <div>
        <label htmlFor="specificPlants" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('specificPlantsLabel')}</label>
        <input
          type="text"
          name="specificPlants"
          id="specificPlants"
          value={formData.specificPlants || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-green-600 dark:focus:border-green-600"
          placeholder={t('specificPlantsPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('experienceLabel')}</label>
        <select
          name="experienceLevel"
          id="experienceLevel"
          value={formData.experienceLevel}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-green-600 dark:focus:border-green-600"
        >
          {Object.values(ExperienceLevel).map(level => (
            <option key={level} value={level}>{t(level)}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 dark:focus:ring-green-400"
      >
        {isLoading ? t('submitButtonLoading') : t('submitButton')}
      </button>
    </form>
  );
};

export default UserInputForm;