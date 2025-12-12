<?php
/**
 * PromptWARS API Entry Point
 */

require_once __DIR__ . '/../vendor/autoload.php';

use PromptWars\Core\Router;
use PromptWars\Core\Request;
use PromptWars\Core\Response;
use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', $_ENV['APP_ENV'] === 'development' ? '1' : '0');

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = explode(',', $_ENV['ALLOWED_ORIGINS']);

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');

try {
    $request = new Request();
    $router = new Router();
    
    // Register routes
    require_once __DIR__ . '/../src/routes.php';
    
    // Dispatch request
    $response = $router->dispatch($request);
    $response->send();
    
} catch (Exception $e) {
    $response = new Response(
        ['error' => 'Internal server error', 'message' => $e->getMessage()],
        500
    );
    $response->send();
}