
export enum GardeningSpaceType {
  INDOOR = "Indoor (windowsill, grow lights)",
  OUTDOOR_GROUND = "Outdoor (in-ground garden beds)",
  CONTAINER = "Outdoor (containers/pots)",
  RAISED_BEDS = "Outdoor (raised beds)",
  BALCONY = "Balcony Garden",
  GREENHOUSE = "Greenhouse"
}

export enum ExperienceLevel {
  BEGINNER = "Beginner (just starting out)",
  INTERMEDIATE = "Intermediate (some experience)",
  ADVANCED = "Advanced (very experienced)"
}

export interface UserInput {
  location: string;
  spaceType: GardeningSpaceType;
  goals: string; // e.g., "grow vegetables for family", "focus on herbs", "attract pollinators"
  experienceLevel: ExperienceLevel;
  specificPlants?: string; // Optional: specific plants user wants to grow
}

export interface LocationAnalysis {
  assumedClimateZone?: string;
  firstFrostDate?: string;
  lastFrostDate?: string;
  notes?: string;
}

export interface PlantRecommendation {
  plantName: string;
  variety?: string;
  suitability: string;
  plantingMethod: string;
  indoorStartWindow?: string;
  outdoorPlantingWindow?: string;
  daysToMaturity?: string;
  careInstructions: string[];
  companionPlants?: string[];
  harvestTime?: string;
  notes?: string;
}

export interface MonthlyTaskItem {
  task: string;
  details?: string;
  category?: string; // e.g., "Sowing", "Maintenance", "Harvesting", "Planning"
}

export interface MonthlySchedule {
  [month: string]: MonthlyTaskItem[]; // e.g., "January", "February", ...
}

export interface SuccessionPlantingTip {
  initialCrop: string;
  followUpCrop: string;
  notes?: string;
  timing?: string;
}

export interface GeneratedSchedule {
  greetingMessage?: string;
  locationAnalysis: LocationAnalysis;
  plantRecommendations: PlantRecommendation[];
  monthlyTasks: MonthlySchedule;
  successionPlantingTips?: SuccessionPlantingTip[];
  generalGardeningAdvice?: string[];
  seasonalOverview?: string;
}

// New type for AI Assistant Chat
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

// Types for Schedule History
export interface HistoricalScheduleEntry {
  id: string;
  savedAt: number;
  location: string; // Store location for quick identification
  schedule: GeneratedSchedule;
  name?: string; // Optional user-defined name
}
