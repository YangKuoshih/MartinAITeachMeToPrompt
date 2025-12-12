<?php

namespace PromptWars\Models;

use PromptWars\Config\Database;

class Challenge
{
  private $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  public function getAll($limit = 50)
  {
    $stmt = $this->db->prepare('SELECT * FROM challenges ORDER BY created_at DESC LIMIT ?');
    $stmt->execute([$limit]);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  public function getByDifficulty($difficulty, $limit = 10)
  {
    $stmt = $this->db->prepare('SELECT * FROM challenges WHERE difficulty = ? ORDER BY created_at DESC LIMIT ?');
    $stmt->execute([$difficulty, $limit]);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  public function getByTopic($topic, $limit = 10)
  {
    $stmt = $this->db->prepare('SELECT * FROM challenges WHERE topic = ? ORDER BY created_at DESC LIMIT ?');
    $stmt->execute([$topic, $limit]);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  public function getById($challengeId)
  {
    $stmt = $this->db->prepare('SELECT * FROM challenges WHERE challenge_id = ? LIMIT 1');
    $stmt->execute([$challengeId]);
    $result = $stmt->fetch(\PDO::FETCH_ASSOC);
    return $result ?: null;
  }

  public function getUserChallenges($userId, $limit = 20)
  {
    $stmt = $this->db->prepare('SELECT * FROM challenges WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
    $stmt->execute([$userId, $limit]);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  public function create($data)
  {
    $stmt = $this->db->prepare('
      INSERT INTO challenges (
        challenge_id, user_id, title, description, scenario, objective,
        constraints, hints, difficulty, topic, points, estimated_time, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING challenge_id
    ');

    $stmt->execute([
      $data['challenge_id'],
      $data['user_id'],
      $data['title'],
      $data['description'] ?? null,
      $data['scenario'] ?? null,
      $data['objective'] ?? null,
      json_encode($data['constraints'] ?? []),
      json_encode($data['hints'] ?? []),
      $data['difficulty'],
      $data['topic'],
      $data['points'] ?? 100,
      $data['estimated_time'] ?? '10 minutes',
      $data['status'] ?? 'active'
    ]);

    $result = $stmt->fetch(\PDO::FETCH_ASSOC);
    return $result['challenge_id'] ?? null;
  }

  public function update($challengeId, $data)
  {
    $stmt = $this->db->prepare('
      UPDATE challenges SET
        title = ?, description = ?, scenario = ?, objective = ?,
        constraints = ?, hints = ?, difficulty = ?, topic = ?,
        points = ?, estimated_time = ?, updated_at = CURRENT_TIMESTAMP
      WHERE challenge_id = ?
    ');

    return $stmt->execute([
      $data['title'],
      $data['description'] ?? null,
      $data['scenario'] ?? null,
      $data['objective'] ?? null,
      json_encode($data['constraints'] ?? []),
      json_encode($data['hints'] ?? []),
      $data['difficulty'],
      $data['topic'],
      $data['points'] ?? 100,
      $data['estimated_time'] ?? '10 minutes',
      $challengeId
    ]);
  }

  public function delete($challengeId)
  {
    $stmt = $this->db->prepare('DELETE FROM challenges WHERE challenge_id = ?');
    return $stmt->execute([$challengeId]);
  }
}