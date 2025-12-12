<?php

use PromptWars\Controllers\AuthController;
use PromptWars\Controllers\ChallengeController;
use PromptWars\Controllers\ProgressController;
use PromptWars\Controllers\LeaderboardController;
use PromptWars\Controllers\ProfileController;
use PromptWars\Controllers\QuestController;
use PromptWars\Controllers\PlaygroundController;
use PromptWars\Controllers\AdminController;
use PromptWars\Middleware\JwtMiddleware;

// Auth routes (no authentication required)
$router->post('/auth/signup', [AuthController::class, 'signup']);
$router->post('/auth/login', [AuthController::class, 'login']);
$router->post('/auth/verify', [AuthController::class, 'verifyEmail']);
$router->post('/auth/resend-code', [AuthController::class, 'resendCode']);
$router->post('/auth/refresh', [AuthController::class, 'refresh']);
$router->post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes (require authentication)
$auth = new JwtMiddleware();

// Challenges
$router->get('/challenges', $auth->wrap([ChallengeController::class, 'getAll']));
$router->get('/challenges/recommended', $auth->wrap([ChallengeController::class, 'getRecommended']));
$router->post('/challenges/generate', $auth->wrap([ChallengeController::class, 'generate']));
$router->post('/challenges/evaluate', $auth->wrap([ChallengeController::class, 'evaluate']));
$router->post('/challenges/submit', $auth->wrap([ChallengeController::class, 'submit']));

// Progress
$router->get('/progress', $auth->wrap([ProgressController::class, 'get']));
$router->post('/progress/sync', $auth->wrap([ProgressController::class, 'sync']));

// Profile
$router->get('/profile', $auth->wrap([ProfileController::class, 'get']));
$router->get('/profile/activities', $auth->wrap([ProfileController::class, 'getActivities']));

// Leaderboard
$router->get('/leaderboard', $auth->wrap([LeaderboardController::class, 'get']));

// Achievements & Badges
$router->get('/achievements', $auth->wrap([ProgressController::class, 'getAchievements']));
$router->get('/badges', $auth->wrap([ProgressController::class, 'getBadges']));

// Quests
$router->get('/quests', $auth->wrap([QuestController::class, 'getAll']));
$router->get('/quests/{questId}/progress', $auth->wrap([QuestController::class, 'getProgress']));
$router->get('/quests/{questId}/level/{levelNumber}', $auth->wrap([QuestController::class, 'getLevel']));
$router->post('/quests/{questId}/level/{levelNumber}', $auth->wrap([QuestController::class, 'submitLevel']));

// Playground
$router->post('/prompt', $auth->wrap([PlaygroundController::class, 'execute']));
$router->post('/prompt/test', $auth->wrap([PlaygroundController::class, 'test']));

// Admin routes (require admin role)
$router->get('/admin/llm-config', $auth->wrap([AdminController::class, 'getLLMConfig'], ['admin']));
$router->put('/admin/llm-config', $auth->wrap([AdminController::class, 'updateLLMConfig'], ['admin']));
$router->get('/admin/challenges', $auth->wrap([AdminController::class, 'getChallenges'], ['admin']));
$router->post('/admin/challenges', $auth->wrap([AdminController::class, 'createChallenge'], ['admin']));
$router->put('/admin/challenges/{challengeId}', $auth->wrap([AdminController::class, 'updateChallenge'], ['admin']));
$router->delete('/admin/challenges/{challengeId}', $auth->wrap([AdminController::class, 'deleteChallenge'], ['admin']));