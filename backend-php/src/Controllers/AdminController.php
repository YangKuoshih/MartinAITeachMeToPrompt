<?php

namespace PromptWars\Controllers;

use PromptWars\Core\Request;
use PromptWars\Core\Response;
use PromptWars\Models\Challenge;
use PromptWars\Config\Database;

class AdminController
{
  public static function getLLMConfig(Request $request): Response
  {
    try {
      $db = Database::getInstance()->getConnection();
      $stmt = $db->query('SELECT * FROM llm_config LIMIT 1');
      $config = $stmt->fetch(\PDO::FETCH_ASSOC);

      return Response::json($config ?: []);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch LLM config', 500);
    }
  }

  public static function updateLLMConfig(Request $request): Response
  {
    $data = $request->getBody();

    try {
      $db = Database::getInstance()->getConnection();
      $stmt = $db->prepare('
        INSERT INTO llm_config (model_id, temperature, max_tokens, top_k, top_p)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          model_id = EXCLUDED.model_id,
          temperature = EXCLUDED.temperature,
          max_tokens = EXCLUDED.max_tokens,
          top_k = EXCLUDED.top_k,
          top_p = EXCLUDED.top_p,
          updated_at = CURRENT_TIMESTAMP
      ');

      $stmt->execute([
        $data['model_id'] ?? 'gpt-4',
        $data['temperature'] ?? 0.7,
        $data['max_tokens'] ?? 1000,
        $data['top_k'] ?? 40,
        $data['top_p'] ?? 0.9
      ]);

      return Response::json(['message' => 'LLM config updated']);
    } catch (\Exception $e) {
      return Response::error('Failed to update LLM config', 500);
    }
  }

  public static function getChallenges(Request $request): Response
  {
    try {
      $challengeModel = new Challenge();
      $challenges = $challengeModel->getAll(100);
      return Response::json($challenges);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch challenges', 500);
    }
  }

  public static function createChallenge(Request $request): Response
  {
    $data = $request->getBody();
    $userId = $request->user['userId'];

    if (!isset($data['title']) || !isset($data['difficulty']) || !isset($data['topic'])) {
      return Response::error('Title, difficulty, and topic required', 400);
    }

    try {
      $challengeModel = new Challenge();
      $data['challenge_id'] = 'admin_' . uniqid();
      $data['user_id'] = $userId;
      
      $challengeId = $challengeModel->create($data);
      return Response::json(['challengeId' => $challengeId], 201);
    } catch (\Exception $e) {
      return Response::error('Failed to create challenge', 500);
    }
  }

  public static function updateChallenge(Request $request, string $challengeId): Response
  {
    $data = $request->getBody();

    try {
      $challengeModel = new Challenge();
      $success = $challengeModel->update($challengeId, $data);

      if (!$success) {
        return Response::error('Challenge not found', 404);
      }

      return Response::json(['message' => 'Challenge updated']);
    } catch (\Exception $e) {
      return Response::error('Failed to update challenge', 500);
    }
  }

  public static function deleteChallenge(Request $request, string $challengeId): Response
  {
    try {
      $challengeModel = new Challenge();
      $success = $challengeModel->delete($challengeId);

      if (!$success) {
        return Response::error('Challenge not found', 404);
      }

      return Response::json(['message' => 'Challenge deleted']);
    } catch (\Exception $e) {
      return Response::error('Failed to delete challenge', 500);
    }
  }
}
