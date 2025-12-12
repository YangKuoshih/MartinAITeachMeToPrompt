<?php

namespace PromptWars\Controllers;

use PromptWars\Core\Request;
use PromptWars\Core\Response;
use PromptWars\Models\User;
use PromptWars\Config\Database;

class ProfileController
{
  public static function get(Request $request): Response
  {
    $userId = $request->user['userId'];

    try {
      $userModel = new User();
      $user = $userModel->findById($userId);

      if (!$user) {
        return Response::error('User not found', 404);
      }

      unset($user['password_hash']);
      return Response::json($user);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch profile', 500);
    }
  }

  public static function getActivities(Request $request): Response
  {
    $userId = $request->user['userId'];
    $limit = (int)($request->getQuery('limit') ?? 20);

    try {
      $db = Database::getInstance()->getConnection();
      $stmt = $db->prepare('
        SELECT * FROM user_activities
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      ');
      $stmt->execute([$userId, $limit]);
      $activities = $stmt->fetchAll(\PDO::FETCH_ASSOC);

      return Response::json($activities);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch activities', 500);
    }
  }
}
