<?php

namespace PromptWars\Controllers;

use PromptWars\Core\Request;
use PromptWars\Core\Response;
use PromptWars\Models\UserProgress;

class ProgressController
{
  public static function get(Request $request): Response
  {
    $userId = $request->user['userId'];

    try {
      $progressModel = new UserProgress();
      $progress = $progressModel->getByUserId($userId);

      if (!$progress) {
        return Response::error('Progress not found', 404);
      }

      return Response::json($progress);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch progress', 500);
    }
  }

  public static function sync(Request $request): Response
  {
    $userId = $request->user['userId'];
    $data = $request->getBody();

    try {
      $progressModel = new UserProgress();
      $progressModel->update($userId, $data);
      return Response::json(['message' => 'Progress synced successfully']);
    } catch (\Exception $e) {
      return Response::error('Failed to sync progress', 500);
    }
  }

  public static function getAchievements(Request $request): Response
  {
    $userId = $request->user['userId'];

    try {
      $progressModel = new UserProgress();
      $achievements = $progressModel->getAchievements($userId);
      return Response::json($achievements);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch achievements', 500);
    }
  }

  public static function getBadges(Request $request): Response
  {
    $userId = $request->user['userId'];

    try {
      $progressModel = new UserProgress();
      $badges = $progressModel->getBadges($userId);
      return Response::json($badges);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch badges', 500);
    }
  }
}
