<?php

$baseUrl = 'http://localhost:8000';

// Login
$ch = curl_init($baseUrl . '/auth/login');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'test@example.com', 'password' => 'testpass123']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result = json_decode(curl_exec($ch), true);
curl_close($ch);

$token = $result['token'];
echo "Token: " . substr($token, 0, 30) . "...\n\n";

// Test prompt
echo "Testing /prompt/test...\n";
$ch = curl_init($baseUrl . '/prompt/test');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['prompt' => 'Say hi', 'temperature' => 0.7]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token", 'Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP $httpCode: " . substr($response, 0, 150) . "\n";