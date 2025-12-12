<?php

namespace PromptWars\Services;

use PromptWars\Config\Database;
use PromptWars\Services\LiteLLMService;

class ChallengeService
{
  private $db;
  private $aiService;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
    $this->aiService = new LiteLLMService();
  }

  public function generateChallenge($userId, $topic, $difficulty)
  {
    $userProgress = $this->getUserProgress($userId);
    
    if (!$this->canAccessDifficulty($userProgress, $difficulty, $topic)) {
      throw new \Exception('Complete 2 challenges at the previous difficulty level to unlock this one');
    }

    $challenge = $this->aiService->generateChallenge($topic, $difficulty);
    $this->storeChallenge($userId, $challenge);
    
    return $challenge;
  }

  public function evaluateChallenge(
    $userId,
    $challengeId,
    $userPrompt,
    $challengeObjective = null,
    $challengeConstraints = null,
    $challengeScenario = null
  ) {
    $evaluation = $this->aiService->evaluateChallenge(
      $challengeId,
      $userPrompt,
      $challengeObjective,
      $challengeConstraints,
      $challengeScenario
    );

    $this->storeEvaluation($userId, $challengeId, $evaluation, $userPrompt);
    
    if ($evaluation['passed']) {
      $this->updateUserProgress($userId, $challengeId, $evaluation['score']);
    }

    return $evaluation;
  }

  private function getUserProgress($userId)
  {
    $stmt = $this->db->prepare('
      SELECT challenges_completed, current_level, topic_progress
      FROM user_progress
      WHERE user_id = ?
    ');
    $stmt->execute([$userId]);
    $result = $stmt->fetch(\PDO::FETCH_ASSOC);

    if (!$result) {
      return [
        'completedChallenges' => 0,
        'currentLevel' => 'beginner',
        'topicProgress' => []
      ];
    }

    return [
      'completedChallenges' => $result['challenges_completed'],
      'currentLevel' => $result['current_level'],
      'topicProgress' => json_decode($result['topic_progress'] ?? '{}', true)
    ];
  }

  private function canAccessDifficulty($userProgress, $difficulty, $topic)
  {
    if ($difficulty === 'beginner') return true;

    $topicProgress = $userProgress['topicProgress'][$topic] ?? null;
    if (!$topicProgress) return false;

    $difficultyProgress = $topicProgress['difficultyProgress'] ?? [];

    switch ($difficulty) {
      case 'intermediate':
        return ($difficultyProgress['beginner'] ?? 0) >= 2;
      case 'advanced':
        return ($difficultyProgress['intermediate'] ?? 0) >= 2;
      case 'expert':
        return ($difficultyProgress['advanced'] ?? 0) >= 2;
      default:
        return false;
    }
  }

  private function storeChallenge($userId, $challenge)
  {
    $stmt = $this->db->prepare('
      INSERT INTO challenges (challenge_id, user_id, title, description, topic, difficulty, scenario, objective, constraints, hints, points, estimated_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');

    $stmt->execute([
      $challenge['id'],
      $userId,
      $challenge['title'],
      $challenge['description'] ?? null,
      $challenge['topic'],
      $challenge['difficulty'],
      $challenge['scenario'] ?? null,
      $challenge['objective'] ?? null,
      json_encode($challenge['constraints'] ?? []),
      json_encode($challenge['hints'] ?? []),
      $challenge['points'] ?? 100,
      $challenge['estimatedTime'] ?? '10 minutes',
      'active'
    ]);
  }

  private function storeEvaluation($userId, $challengeId, $evaluation, $userPrompt)
  {
    $stmt = $this->db->prepare('
      INSERT INTO challenge_evaluations (user_id, challenge_id, user_prompt, score, passed, feedback, suggestions, breakdown)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ');

    $stmt->execute([
      $userId,
      $challengeId,
      $userPrompt,
      $evaluation['score'],
      $evaluation['passed'] ? 1 : 0,
      $evaluation['feedback'],
      json_encode($evaluation['suggestions'] ?? []),
      json_encode($evaluation['breakdown'] ?? [])
    ]);
  }

  private function updateUserProgress($userId, $challengeId, $score)
  {
    $this->db->beginTransaction();

    try {
      $progress = $this->getUserProgress($userId);
      $newPoints = $progress['total_points'] + $score;
      $newLevel = $this->calculateLevel($newPoints);

      $stmt = $this->db->prepare('
        UPDATE user_progress
        SET 
          total_points = ?,
          challenges_completed = challenges_completed + 1,
          current_level = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      ');
      $stmt->execute([$newPoints, $newLevel, $userId]);

      $stmt = $this->db->prepare('
        INSERT INTO user_activities (user_id, activity_type, activity_data)
        VALUES (?, ?, ?)
      ');
      $stmt->execute([
        $userId,
        'challenge_completed',
        json_encode(['challengeId' => $challengeId, 'score' => $score])
      ]);

      $gamification = new \PromptWars\Services\GamificationService();
      $gamification->checkAndAwardBadges($userId);
      $gamification->checkAndAwardAchievements($userId);

      $this->db->commit();
    } catch (\Exception $e) {
      $this->db->rollBack();
      throw $e;
    }
  }

  private function calculateLevel($points)
  {
    if ($points >= 20000) return 6;
    if ($points >= 10000) return 5;
    if ($points >= 5000) return 4;
    if ($points >= 2500) return 3;
    if ($points >= 1000) return 2;
    return 1;
  }
}
