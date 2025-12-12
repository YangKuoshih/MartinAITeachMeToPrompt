<?php

namespace PromptWars\Services;

use PromptWars\Config\Database;

class QuestService
{
  private $db;
  private $aiService;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
    $this->aiService = new LiteLLMService();
  }

  public function submitQuestLevel($userId, $questId, $levelNumber, $userPrompt)
  {
    $level = $this->getQuestLevel($questId, $levelNumber);
    if (!$level) {
      throw new \Exception('Quest level not found');
    }

    $evaluation = $this->aiService->evaluateChallenge(
      $questId . '_' . $levelNumber,
      $userPrompt,
      $level['objective'],
      json_decode($level['constraints'], true),
      $level['scenario']
    );

    if ($evaluation['passed']) {
      $this->updateQuestProgress($userId, $questId, $levelNumber);
    }

    return $evaluation;
  }

  private function getQuestLevel($questId, $levelNumber)
  {
    $stmt = $this->db->prepare('SELECT * FROM quest_levels WHERE quest_id = ? AND level_number = ?');
    $stmt->execute([$questId, $levelNumber]);
    return $stmt->fetch(\PDO::FETCH_ASSOC);
  }

  private function updateQuestProgress($userId, $questId, $levelNumber)
  {
    $stmt = $this->db->prepare('
      INSERT INTO quest_progress (user_id, quest_id, completed_levels, total_levels)
      VALUES (?, ?, 1, (SELECT COUNT(*) FROM quest_levels WHERE quest_id = ?))
      ON CONFLICT (user_id, quest_id) DO UPDATE SET
        completed_levels = quest_progress.completed_levels + 1,
        updated_at = CURRENT_TIMESTAMP
    ');
    $stmt->execute([$userId, $questId, $questId]);
  }
}
