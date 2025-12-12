import { API } from '../utils/api';
import {
  ExperienceLevel,
  UserProgress,
  Achievement,
  Challenge,
  PointsTransaction,
  EXPERIENCE_LEVELS,
  MULTIPLIERS
} from '../types/gamification';

export class GamificationService {
  // Calculate points for a challenge completion
  async calculateChallengePoints(
    challenge: Challenge,
    quality: 'poor' | 'average' | 'good' | 'excellent',
    streak: number
  ): Promise<PointsTransaction> {
    const basePoints = challenge.points.base;
    const difficultyMultiplier = MULTIPLIERS.difficulty[challenge.difficulty];
    const qualityMultiplier = MULTIPLIERS.quality[quality];
    
    // Calculate streak multiplier
    let streakMultiplier = 1;
    if (streak >= 30) streakMultiplier = MULTIPLIERS.streak[30];
    else if (streak >= 14) streakMultiplier = MULTIPLIERS.streak[14];
    else if (streak >= 7) streakMultiplier = MULTIPLIERS.streak[7];
    else if (streak >= 3) streakMultiplier = MULTIPLIERS.streak[3];

    const totalMultiplier = difficultyMultiplier * qualityMultiplier * streakMultiplier;
    const totalPoints = Math.round(basePoints * totalMultiplier);

    return {
      amount: totalPoints,
      type: 'challenge',
      multiplier: totalMultiplier,
      description: `Completed ${challenge.title}`,
      timestamp: new Date().toISOString()
    };
  }

  // Update user progress
  async updateProgress(transaction: PointsTransaction): Promise<UserProgress> {
    try {
      const response = await API.put('/api/progress', { transaction });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Check and award achievements
  async checkAchievements(progress: UserProgress): Promise<Achievement[]> {
    try {
      const response = await API.post('/api/achievements/check', { progress });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get level info for points
  getLevelInfo(points: number): ExperienceLevel {
    return EXPERIENCE_LEVELS.find(
      level => points >= level.minPoints && points <= level.maxPoints
    ) || EXPERIENCE_LEVELS[0];
  }

  // Calculate level progress percentage
  calculateLevelProgress(points: number): number {
    const currentLevel = this.getLevelInfo(points);
    const pointsInLevel = points - currentLevel.minPoints;
    const levelRange = currentLevel.maxPoints - currentLevel.minPoints;
    return Math.min(100, (pointsInLevel / levelRange) * 100);
  }

  // Get daily challenges
  async getDailyChallenges(): Promise<Challenge[]> {
    try {
      const response = await API.get('/api/challenges/daily');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Submit challenge solution
  async submitChallenge(
    challengeId: string,
    solution: string
  ): Promise<{
    success: boolean;
    quality: 'poor' | 'average' | 'good' | 'excellent';
    feedback: string;
    points: PointsTransaction;
    achievements?: Achievement[];
  }> {
    try {
      const response = await API.post(`/api/challenges/${challengeId}/submit`, { solution });
      return response;
    } catch (error) {
      throw error;
    }
  }
}