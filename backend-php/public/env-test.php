<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

try {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
    
    echo json_encode([
        'db_host' => $_ENV['DB_HOST'] ?? 'not set',
        'jwt_secret' => isset($_ENV['JWT_SECRET']) ? 'set' : 'not set'
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>