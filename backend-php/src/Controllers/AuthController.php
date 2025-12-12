<?php

namespace PromptWars\Controllers;

use PromptWars\Core\Request;
use PromptWars\Core\Response;
use PromptWars\Models\User;
use PromptWars\Models\UserProgress;
use PromptWars\Services\AuthService;
use PromptWars\Services\EmailService;

class AuthController
{
    public static function signup(Request $request): Response
    {
        $username = $request->getBody('username');
        $password = $request->getBody('password');
        $firstName = $request->getBody('firstName');
        $lastName = $request->getBody('lastName');

        // Validation
        if (!AuthService::validateUsername($username)) {
            return Response::error('Invalid username format', 400);
        }
        if (!AuthService::validatePassword($password)) {
            return Response::error('Password must be at least 8 characters', 400);
        }

        // Check if user exists
        $email = $username; // Using username as email for now
        if (!AuthService::validateEmail($email)) {
            return Response::error('Invalid email format', 400);
        }

        if (User::findByEmail($email)) {
            return Response::error('Email already registered', 400);
        }
        if (User::findByUsername($username)) {
            return Response::error('Username already taken', 400);
        }

        // Create user
        $userId = AuthService::generateUserId($username);
        $passwordHash = AuthService::hashPassword($password);
        $verificationCode = AuthService::generateVerificationCode();
        $verificationExpires = date('Y-m-d H:i:s', strtotime('+24 hours'));

        $userData = [
            'user_id' => $userId,
            'username' => $username,
            'email' => $email,
            'password_hash' => $passwordHash,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'verification_code' => $verificationCode,
            'verification_expires' => $verificationExpires
        ];

        $createdUserId = User::create($userData);
        if (!$createdUserId) {
            return Response::error('Failed to create user', 500);
        }

        // Initialize user progress
        UserProgress::create($userId, $username);

        // Send verification email
        $emailService = new EmailService();
        $emailService->sendVerificationEmail($email, $username, $verificationCode);

        return Response::success([
            'userId' => $userId,
            'username' => $username,
            'email' => $email
        ], 'User created successfully. Please check your email for verification code.');
    }

    public static function login(Request $request): Response
    {
        $username = $request->getBody('username') ?? $request->getBody('email');
        $password = $request->getBody('password');

        if (!$username || !$password) {
            return Response::error('Username/email and password required', 400);
        }

        // Find user
        $user = User::findByUsername($username) ?? User::findByEmail($username);
        if (!$user) {
            return Response::error('Invalid credentials', 401);
        }

        // Verify password
        if (!AuthService::verifyPassword($password, $user['password_hash'])) {
            return Response::error('Invalid credentials', 401);
        }

        // Check email verification
        if (!$user['email_verified']) {
            return Response::error('Email not verified. Please check your email.', 403);
        }

        // Check if password change is required
        if (!empty($user['password_change_required'])) {
            return Response::json([
                'passwordChangeRequired' => true,
                'userId' => $user['user_id'],
                'username' => $user['username'],
                'email' => $user['email']
            ], 200);
        }

        // Generate tokens
        $groups = is_string($user['groups']) ? explode(',', trim($user['groups'], '{}')) : $user['groups'];
        $accessToken = AuthService::generateAccessToken(
            $user['user_id'],
            $user['username'],
            $user['email'],
            $groups
        );
        $refreshToken = AuthService::generateRefreshToken($user['user_id']);

        return Response::json([
            'token' => $accessToken,
            'refreshToken' => $refreshToken,
            'user' => [
                'userId' => $user['user_id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'groups' => $user['groups']
            ]
        ]);
    }

    public static function verifyEmail(Request $request): Response
    {
        $email = $request->getBody('email');
        $code = $request->getBody('code');

        if (!$email || !$code) {
            return Response::error('Email and code required', 400);
        }

        if (User::verifyEmail($email, $code)) {
            return Response::success(null, 'Email verified successfully');
        }

        return Response::error('Invalid or expired verification code', 400);
    }

    public static function resendCode(Request $request): Response
    {
        $email = $request->getBody('email');

        if (!$email) {
            return Response::error('Email required', 400);
        }

        $user = User::findByEmail($email);
        if (!$user) {
            return Response::error('User not found', 404);
        }

        if ($user['email_verified']) {
            return Response::error('Email already verified', 400);
        }

        $code = AuthService::generateVerificationCode();
        $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

        User::updateVerificationCode($email, $code, $expires);

        $emailService = new EmailService();
        $emailService->sendVerificationEmail($email, $user['username'], $code);

        return Response::success(null, 'Verification code sent');
    }

    public static function refresh(Request $request): Response
    {
        $refreshToken = $request->getBody('refreshToken');

        if (!$refreshToken) {
            return Response::error('Refresh token required', 400);
        }

        try {
            $decoded = \Firebase\JWT\JWT::decode($refreshToken, $_ENV['JWT_SECRET'], ['HS256']);
            
            if ($decoded->type !== 'refresh') {
                return Response::error('Invalid token type', 400);
            }

            $user = User::findByUserId($decoded->userId);
            if (!$user) {
                return Response::error('User not found', 404);
            }

            $groups = is_string($user['groups']) ? explode(',', trim($user['groups'], '{}')) : $user['groups'];
            $accessToken = AuthService::generateAccessToken(
                $user['user_id'],
                $user['username'],
                $user['email'],
                $groups
            );

            return Response::json(['accessToken' => $accessToken]);
            
        } catch (\Exception $e) {
            return Response::error('Invalid refresh token', 401);
        }
    }

    public static function forgotPassword(Request $request): Response
    {
        $email = $request->getBody('email');

        if (!$email) {
            return Response::error('Email required', 400);
        }

        $user = User::findByEmail($email);
        if (!$user) {
            // Don't reveal if user exists
            return Response::success(null, 'If the email exists, a reset code has been sent');
        }

        $code = AuthService::generateVerificationCode();
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

        User::setResetCode($email, $code, $expires);

        $emailService = new EmailService();
        $emailService->sendPasswordResetEmail($email, $user['username'], $code);

        return Response::success(null, 'If the email exists, a reset code has been sent');
    }

    public static function resetPassword(Request $request): Response
    {
        $email = $request->getBody('email');
        $code = $request->getBody('code');
        $newPassword = $request->getBody('newPassword');

        if (!$email || !$code || !$newPassword) {
            return Response::error('Email, code, and new password required', 400);
        }

        if (!AuthService::validatePassword($newPassword)) {
            return Response::error('Password must be at least 8 characters', 400);
        }

        $passwordHash = AuthService::hashPassword($newPassword);

        if (User::resetPassword($email, $code, $passwordHash)) {
            return Response::success(null, 'Password reset successfully');
        }

        return Response::error('Invalid or expired reset code', 400);
    }
}