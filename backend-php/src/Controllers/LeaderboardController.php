<?php

namespace PromptWars\Controllers;

use PromptWars\Core\Request;
use PromptWars\Core\Response;
use PromptWars\Config\Database;

class LeaderboardController
{
  public static function get(Request $request): Response
  {
    $period = $request->getQuery('period') ?? 'all-time';
    $limit = (int)($request->getQuery('limit') ?? 100);

    try {
      $db = Database::getInstance()->getConnection();
      
      $dateFilter = '';
      if ($period === 'weekly') {
        $dateFilter = "WHERE up.updated_at >= NOW() - INTERVAL '7 days'";
      } elseif ($period === 'monthly') {
        $dateFilter = "WHERE up.updated_at >= NOW() - INTERVAL '30 days'";
      }

      $sql = "SELECT u.user_id, u.username, up.total_points, up.challenges_completed, up.current_level,
              ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as rank
              FROM users u
              JOIN user_progress up ON u.user_id = up.user_id
              {$dateFilter}
              ORDER BY up.total_points DESC
              LIMIT ?";
      
      $stmt = $db->prepare($sql);
      $stmt->execute([$limit]);
      $leaderboard = $stmt->fetchAll(\PDO::FETCH_ASSOC);

      return Response::json($leaderboard);
    } catch (\Exception $e) {
      return Response::error('Failed to fetch leaderboard', 500);
    }
  }
}
