// Generic icon mapper for the application
// Maps functional names to emoji icons

export const getNavigationIcon = (path: string): string => {
  const iconMap: { [key: string]: string } = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/challenges': 'challenges',
    '/prompt-quest': 'quest',
    '/playground': 'playground',
    '/reference': 'reference',
    '/gamification': 'badges',
    '/leaderboard': 'leaderboard',
    '/help-faq': 'reference',
    '/profile': 'profile',
    '/admin': 'admin',
  };
  return iconMap[path] || 'dashboard';
};

export const getRankIcon = (level: number): string => {
  if (level >= 6) return 'grand-master';
  if (level >= 5) return 'master';
  if (level >= 4) return 'expert';
  if (level >= 3) return 'practitioner';
  if (level >= 2) return 'beginner';
  return 'beginner';
};

export const getRankName = (level: number): string => {
  if (level >= 6) return 'Grand Master';
  if (level >= 5) return 'Master';
  if (level >= 4) return 'Expert';
  if (level >= 3) return 'Practitioner';
  if (level >= 2) return 'Learner';
  return 'Beginner';
};

export const getBadgeIcon = (badgeType: string): string => {
  const badgeIcons: { [key: string]: string } = {
    'first-steps': 'beginner',
    'getting-consistent': 'expert',
    'point-collector': 'trophy',
    'speed-demon': 'lightning',
    'perfect-score': 'grand-master',
    'legendary': 'grand-master'
  };
  return badgeIcons[badgeType] || 'default';
};

export const getLeaderboardIcon = (position: number): string => {
  if (position === 1) return 'gold-medal';
  if (position === 2) return 'silver-medal';
  if (position === 3) return 'bronze-medal';
  return 'default';
};

export const getQuestIcon = (questId: string): string => {
  const questIcons: { [key: string]: string } = {
    'mystery-quest': 'quest',
    'arctic-quest': 'quest',
    'treasure-hunt': 'quest',
    'expert-trials': 'quest',
    'time-paradox': 'quest'
  };
  return questIcons[questId] || 'quest';
};

export const getDarkModeIcon = (isDark: boolean): string => {
  return isDark ? 'moon' : 'sun';
};
