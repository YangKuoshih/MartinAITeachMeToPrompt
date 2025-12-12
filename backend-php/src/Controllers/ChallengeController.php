<?php

namespace PromptWars\Controllers;

use PromptWars\Core\Request;
use PromptWars\Core\Response;
use PromptWars\Models\Challenge;
use PromptWars\Services\ChallengeService;

class ChallengeController
{
  public static function getAll(Request $request): Response
  {
    try {
      $challengeModel = new Challenge();
      $challenges = $challengeModel->getAll();
      return Response::json($challenges);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch challenges: ' . $e->getMessage(), 500);
    }
  }

  public static function getRecommended(Request $request): Response
  {
    try {
      $challengeModel = new Challenge();
      $challenges = $challengeModel->getByDifficulty('beginner', 3);
      return Response::json($challenges);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch recommended challenges', 500);
    }
  }

  public static function generate(Request $request): Response
  {
    $userId = $request->user['userId'];
    $topic = $request->getBody('topic');
    $difficulty = $request->getBody('difficulty');

    if (!$topic || !$difficulty) {
      return Response::error('Topic and difficulty required', 400);
    }

    $validTopics = ['basic-prompt-engineering', 'monetary-policy', 'financial-stability', 'economic-research', 'payment-systems', 'consumer-protection', 'international-affairs', 'cyber-security', 'cloud', 'product-owners'];
    $validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

    if (!in_array($topic, $validTopics)) {
      return Response::error('Invalid topic', 400);
    }

    if (!in_array($difficulty, $validDifficulties)) {
      return Response::error('Invalid difficulty', 400);
    }

    try {
      $challengeService = new ChallengeService();
      $challenge = $challengeService->generateChallenge($userId, $topic, $difficulty);
      return Response::json($challenge);
    } catch (\Exception $e) {
      return Response::error($e->getMessage(), $e->getCode() ?: 500);
    }
  }

  public static function evaluate(Request $request): Response
  {
    $userId = $request->user['userId'];
    $challengeId = $request->getBody('challengeId');
    $userPrompt = $request->getBody('userPrompt');
    $challengeObjective = $request->getBody('challengeObjective');
    $challengeConstraints = $request->getBody('challengeConstraints');
    $challengeScenario = $request->getBody('challengeScenario');

    if (!$challengeId || !$userPrompt) {
      return Response::error('Challenge ID and user prompt required', 400);
    }

    if (strlen($userPrompt) > 5000) {
      return Response::error('Prompt too long (max 5000 characters)', 400);
    }

    try {
      $challengeService = new ChallengeService();
      $evaluation = $challengeService->evaluateChallenge(
        $userId,
        $challengeId,
        $userPrompt,
        $challengeObjective,
        $challengeConstraints,
        $challengeScenario
      );
      return Response::json($evaluation);
    } catch (\Exception $e) {
      return Response::error('Failed to evaluate: ' . $e->getMessage(), 500);
    }
  }

  public static function submit(Request $request): Response
  {
    return self::evaluate($request);
  }

  public static function getById(Request $request, string $challengeId): Response
  {
    try {
      $challengeModel = new Challenge();
      $challenge = $challengeModel->getById($challengeId);
      
      if (!$challenge) {
        return Response::error('Challenge not found', 404);
      }

      return Response::json($challenge);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch challenge', 500);
    }
  }

  public static function getUserChallenges(Request $request): Response
  {
    $userId = $request->user['userId'];

    try {
      $challengeModel = new Challenge();
      $challenges = $challengeModel->getUserChallenges($userId);
      return Response::json($challenges);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch user challenges', 500);
    }
  }
}