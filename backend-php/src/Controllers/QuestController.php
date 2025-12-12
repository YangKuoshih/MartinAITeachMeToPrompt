<?php

namespace PromptWars\Controllers;

use PromptWars\Core\Request;
use PromptWars\Core\Response;
use PromptWars\Config\Database;

class QuestController
{
  public static function getAll(Request $request): Response
  {
    try {
      $db = Database::getInstance()->getConnection();
      $stmt = $db->query('SELECT * FROM quests ORDER BY quest_order ASC');
      $quests = $stmt->fetchAll(\PDO::FETCH_ASSOC);

      return Response::json($quests);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch quests', 500);
    }
  }

  public static function getProgress(Request $request, string $questId): Response
  {
    $userId = $request->user['userId'];

    try {
      $db = Database::getInstance()->getConnection();
      $stmt = $db->prepare('
        SELECT * FROM quest_progress
        WHERE user_id = ? AND quest_id = ?
      ');
      $stmt->execute([$userId, $questId]);
      $progress = $stmt->fetch(\PDO::FETCH_ASSOC);

      return Response::json($progress ?: ['completed_levels' => 0, 'total_levels' => 0]);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch quest progress', 500);
    }
  }

  public static function getLevel(Request $request, string $questId, int $levelNumber): Response
  {
    try {
      $db = Database::getInstance()->getConnection();
      $stmt = $db->prepare('
        SELECT * FROM quest_levels
        WHERE quest_id = ? AND level_number = ?
      ');
      $stmt->execute([$questId, $levelNumber]);
      $level = $stmt->fetch(\PDO::FETCH_ASSOC);

      if (!$level) {
        return Response::error('Level not found', 404);
      }

      return Response::json($level);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch level', 500);
    }
  }

  public static function submitLevel(Request $request, $questId, $levelNumber): Response
  {
    $userId = $request->user['userId'];
    $userPrompt = $request->getBody('userPrompt');

    if (!$userPrompt) {
      return Response::error('User prompt required', 400);
    }

    try {
      $questService = new \PromptWars\Services\QuestService();
      $evaluation = $questService->submitQuestLevel($userId, $questId, $levelNumber, $userPrompt);
      return Response::json($evaluation);
    } catch (\Exception $e) {
      return Response::error($e->getMessage(), 500);
    }
  }
}
