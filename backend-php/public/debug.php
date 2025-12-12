<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once __DIR__ . '/../vendor/autoload.php';
    echo json_encode(['status' => 'autoload ok']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>