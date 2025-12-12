<?php

namespace PromptWars\Services;

use PromptWars\Config\Database;

class GamificationService
{
  private $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  public function calculateLevel($points)
  {
    if ($points >= 20000) return 6;
    if ($points >= 10000) return 5;
    if ($points >= 5000) return 4;
    if ($points >= 2500) return 3;
    if ($points >= 1000) return 2;
    return 1;
  }

  public function checkAndAwardBadges($userId)
  {
    $progress = $this->getUserProgress($userId);
    $badges = [];

    if ($progress['challenges_completed'] >= 1 && !$this->hasBadge($userId, 'first_challenge')) {
      $badges[] = $this->awardBadge($userId, 'first_challenge', 'First Challenge', 'common');
    }

    if ($progress['challenges_completed'] >= 10 && !$this->hasBadge($userId, 'challenger')) {
      $badges[] = $this->awardBadge($userId, 'challenger', 'Challenger', 'rare');
    }

    if ($progress['challenges_completed'] >= 50 && !$this->hasBadge($userId, 'expert')) {
      $badges[] = $this->awardBadge($userId, 'expert', 'Expert', 'epic');
    }

    if ($progress['total_points'] >= 10000 && !$this->hasBadge($userId, 'point_master')) {
      $badges[] = $this->awardBadge($userId, 'point_master', 'Point Master', 'legendary');
    }

    return $badges;
  }

  public function checkAndAwardAchievements($userId)
  {
    $progress = $this->getUserProgress($userId);
    $achievements = [];

    if ($progress['challenges_completed'] >= 1 && !$this->hasAchievement($userId, 'first_steps')) {
      $achievements[] = $this->awardAchievement($userId, 'first_steps', 'First Steps', 'Complete your first challenge');
    }

    if ($progress['streak'] >= 7 && !$this->hasAchievement($userId, 'week_streak')) {
      $achievements[] = $this->awardAchievement($userId, 'week_streak', 'Week Streak', 'Complete challenges for 7 days straight');
    }

    if ($progress['total_points'] >= 1000 && !$this->hasAchievement($userId, 'point_collector')) {
      $achievements[] = $this->awardAchievement($userId, 'point_collector', 'Point Collector', 'Earn 1000 points');
    }

    return $achievements;
  }

  private function getUserProgress($userId)
  {
    $stmt = $this->db->prepare('SELECT * FROM user_progress WHERE user_id = ?');
    $stmt->execute([$userId]);
    return $stmt->fetch(\PDO::FETCH_ASSOC);
  }

  private function hasBadge($userId, $badgeId)
  {
    $stmt = $this->db->prepare('SELECT COUNT(*) FROM badges WHERE user_id = ? AND badge_id = ?');
    $stmt->execute([$userId, $badgeId]);
    return $stmt->fetchColumn() > 0;
  }

  private function hasAchievement($userId, $achievementId)
  {
    $stmt = $this->db->prepare('SELECT COUNT(*) FROM achievements WHERE user_id = ? AND achievement_id = ?');
    $stmt->execute([$userId, $achievementId]);
    return $stmt->fetchColumn() > 0;
  }

  private function awardBadge($userId, $badgeId, $name, $rarity)
  {
    $stmt = $this->db->prepare('INSERT INTO badges (user_id, badge_id, name, rarity) VALUES (?, ?, ?, ?)');
    $stmt->execute([$userId, $badgeId, $name, $rarity]);
    return ['badge_id' => $badgeId, 'name' => $name, 'rarity' => $rarity];
  }

  private function awardAchievement($userId, $achievementId, $name, $description)
  {
    $stmt = $this->db->prepare('INSERT INTO achievements (user_id, achievement_id, name, description) VALUES (?, ?, ?, ?)');
    $stmt->execute([$userId, $achievementId, $name, $description]);
    return ['achievement_id' => $achievementId, 'name' => $name, 'description' => $description];
  }
}
