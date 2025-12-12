// Experience and Level System
export interface ExperienceLevel {
  level: number;
  minPoints: number;
  maxPoints: number;
  perks: string[];
}

export interface UserProgress {
  currentPoints: number;
  totalPoints: number;
  level: number;
  currentLevelProgress: number;
  nextLevelPoints: number;
  streak: number;
  multiplier: number;
}

// Achievement System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: string;
  points: number;
  progress: {
    current: number;
    required: number;
  };
  isHidden: boolean;
  unlockedAt?: string;
}

// Challenge System
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'regular';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  points: {
    base: number;
    bonus: number;
  };
  requirements: {
    minLevel?: number;
    prerequisites?: string[];
  };
  timeLimit?: number;
  expiresAt?: string;
  tags: string[];
  reward?: {
    type: 'points' | 'badge' | 'title' | 'multiplier';
    value: any;
  };
}

// Point Calculation
export interface PointsTransaction {
  amount: number;
  type: 'challenge' | 'streak' | 'achievement' | 'bonus';
  multiplier: number;
  description: string;
  timestamp: string;
}

// Experience Levels Configuration
export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  {
    level: 1,
    minPoints: 0,
    maxPoints: 1000,
    perks: ['Beginner - Basic Challenges Access']
  },
  {
    level: 2,
    minPoints: 1001,
    maxPoints: 2500,
    perks: ['Learner - Basic Challenges Access', 'Daily Challenges']
  },
  {
    level: 3,
    minPoints: 2501,
    maxPoints: 5000,
    perks: ['Practitioner - Basic Challenges Access', 'Daily Challenges', 'Achievement Showcase']
  },
  {
    level: 4,
    minPoints: 5001,
    maxPoints: 10000,
    perks: ['Expert - All Challenge Types', 'Daily Challenges', 'Achievement Showcase', 'Create Custom Challenges']
  },
  {
    level: 5,
    minPoints: 10001,
    maxPoints: 20000,
    perks: ['Master - All Features Unlocked', 'Mentor Status Available']
  },
  {
    level: 6,
    minPoints: 20001,
    maxPoints: 999999,
    perks: ['Grand Master - Elite Prompt Engineer']
  }
];

// Point Multipliers
export const MULTIPLIERS = {
  streak: {
    3: 1.1,  // 3-day streak: 10% bonus
    7: 1.25, // 7-day streak: 25% bonus
    14: 1.5, // 14-day streak: 50% bonus
    30: 2.0  // 30-day streak: 100% bonus
  },
  difficulty: {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0,
    expert: 3.0
  },
  quality: {
    poor: 0.5,
    average: 1.0,
    good: 1.25,
    excellent: 1.5
  }
};