<?php

namespace PromptWars\Models;

use PromptWars\Config\Database;

class UserProgress
{
  private $db;

  public function __construct()
  {
    $this->db = Database::getInstance();
  }

  public function create($userId)
  {
    $stmt = $this->db->prepare('INSERT INTO user_progress (user_id) VALUES (?)');
    return $stmt->execute([$userId]);
  }

  public function getByUserId($userId)
  {
    $stmt = $this->db->prepare('SELECT * FROM user_progress WHERE user_id = ?');
    $stmt->execute([$userId]);
    $result = $stmt->fetch(\PDO::FETCH_ASSOC);
    return $result ?: null;
  }

  public function update($userId, $data)
  {
    $stmt = $this->db->prepare('
      UPDATE user_progress SET
        total_points = ?,
        challenges_completed = ?,
        current_level = ?,
        streak = ?,
        topic_progress = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    ');

    return $stmt->execute([
      $data['total_points'] ?? 0,
      $data['challenges_completed'] ?? 0,
      $data['current_level'] ?? 'beginner',
      $data['streak'] ?? 0,
      json_encode($data['topic_progress'] ?? []),
      $userId
    ]);
  }

  public function getAchievements($userId)
  {
    $stmt = $this->db->prepare('
      SELECT * FROM achievements
      WHERE user_id = ?
      ORDER BY unlocked_at DESC
    ');
    $stmt->execute([$userId]);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  public function getBadges($userId)
  {
    $stmt = $this->db->prepare('
      SELECT * FROM badges
      WHERE user_id = ?
      ORDER BY earned_at DESC
    ');
    $stmt->execute([$userId]);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }
}