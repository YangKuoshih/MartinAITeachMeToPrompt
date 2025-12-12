<?php

namespace PromptWars\Models;

use PromptWars\Config\Database;

class User
{
    public static function create(array $data): ?string
    {
        $sql = "INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, verification_code, verification_expires) 
                VALUES (:user_id, :username, :email, :password_hash, :first_name, :last_name, :verification_code, :verification_expires) 
                RETURNING user_id";
        
        $result = Database::fetchOne($sql, $data);
        return $result['user_id'] ?? null;
    }

    public static function findByEmail(string $email): ?array
    {
        $sql = "SELECT * FROM users WHERE email = :email LIMIT 1";
        return Database::fetchOne($sql, ['email' => $email]);
    }

    public static function findByUsername(string $username): ?array
    {
        $sql = "SELECT * FROM users WHERE username = :username LIMIT 1";
        return Database::fetchOne($sql, ['username' => $username]);
    }

    public static function findByUserId(string $userId): ?array
    {
        $sql = "SELECT * FROM users WHERE user_id = :user_id LIMIT 1";
        return Database::fetchOne($sql, ['user_id' => $userId]);
    }

    public static function verifyEmail(string $email, string $code): bool
    {
        $sql = "UPDATE users SET email_verified = true, verification_code = NULL, verification_expires = NULL 
                WHERE email = :email AND verification_code = :code AND verification_expires > NOW()";
        return Database::execute($sql, ['email' => $email, 'code' => $code]);
    }

    public static function updateVerificationCode(string $email, string $code, string $expires): bool
    {
        $sql = "UPDATE users SET verification_code = :code, verification_expires = :expires WHERE email = :email";
        return Database::execute($sql, ['email' => $email, 'code' => $code, 'expires' => $expires]);
    }

    public static function setResetCode(string $email, string $code, string $expires): bool
    {
        $sql = "UPDATE users SET reset_code = :code, reset_expires = :expires WHERE email = :email";
        return Database::execute($sql, ['email' => $email, 'code' => $code, 'expires' => $expires]);
    }

    public static function resetPassword(string $email, string $code, string $passwordHash): bool
    {
        $sql = "UPDATE users SET password_hash = :password_hash, reset_code = NULL, reset_expires = NULL 
                WHERE email = :email AND reset_code = :code AND reset_expires > NOW()";
        return Database::execute($sql, ['email' => $email, 'code' => $code, 'password_hash' => $passwordHash]);
    }

    public static function updatePassword(string $userId, string $passwordHash): bool
    {
        $sql = "UPDATE users SET password_hash = :password_hash, password_change_required = false WHERE user_id = :user_id";
        return Database::execute($sql, ['user_id' => $userId, 'password_hash' => $passwordHash]);
    }
}