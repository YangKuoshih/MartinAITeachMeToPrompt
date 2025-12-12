declare global {
  interface Window {
    refreshDashboard?: () => void;
    refreshLeaderboard?: () => void;
    refreshProfile?: () => void;
  }
}

export {};