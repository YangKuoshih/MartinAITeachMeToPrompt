<?php

namespace PromptWars\Services;

use Firebase\JWT\JWT;
use PromptWars\Models\User;

class AuthService
{
    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    public static function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public static function generateAccessToken(string $userId, string $username, string $email, array $groups = ['users']): string
    {
        $payload = [
            'userId' => $userId,
            'username' => $username,
            'email' => $email,
            'groups' => $groups,
            'iat' => time(),
            'exp' => time() + (int)$_ENV['JWT_EXPIRY']
        ];

        return JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
    }

    public static function generateRefreshToken(string $userId): string
    {
        $payload = [
            'userId' => $userId,
            'type' => 'refresh',
            'iat' => time(),
            'exp' => time() + (int)$_ENV['JWT_REFRESH_EXPIRY']
        ];

        return JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
    }

    public static function generateVerificationCode(): string
    {
        return str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public static function generateUserId(string $username): string
    {
        return preg_replace('/[^a-zA-Z0-9-_]/', '', strtolower($username)) . '_' . bin2hex(random_bytes(4));
    }

    public static function validateEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function validatePassword(string $password): bool
    {
        return strlen($password) >= 8;
    }

    public static function validateUsername(string $username): bool
    {
        return preg_match('/^[a-zA-Z0-9_-]{3,50}$/', $username) === 1;
    }
}