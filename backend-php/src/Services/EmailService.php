<?php

namespace PromptWars\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private PHPMailer $mailer;

    public function __construct()
    {
        $this->mailer = new PHPMailer(true);
        
        $this->mailer->isSMTP();
        $this->mailer->Host = $_ENV['SMTP_HOST'];
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $_ENV['SMTP_USER'];
        $this->mailer->Password = $_ENV['SMTP_PASSWORD'];
        $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mailer->Port = (int)$_ENV['SMTP_PORT'];
        $this->mailer->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
    }

    public function sendVerificationEmail(string $to, string $username, string $code): bool
    {
        try {
            $this->mailer->addAddress($to);
            $this->mailer->Subject = 'Verify Your PromptWARS Account';
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->getVerificationEmailTemplate($username, $code);
            
            return $this->mailer->send();
        } catch (Exception $e) {
            error_log('Email send failed: ' . $e->getMessage());
            return false;
        }
    }

    public function sendPasswordResetEmail(string $to, string $username, string $code): bool
    {
        try {
            $this->mailer->addAddress($to);
            $this->mailer->Subject = 'Reset Your PromptWARS Password';
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->getPasswordResetTemplate($username, $code);
            
            return $this->mailer->send();
        } catch (Exception $e) {
            error_log('Email send failed: ' . $e->getMessage());
            return false;
        }
    }

    private function getVerificationEmailTemplate(string $username, string $code): string
    {
        return "
            <h2>Welcome to PromptWARS, {$username}!</h2>
            <p>Your verification code is: <strong>{$code}</strong></p>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
        ";
    }

    private function getPasswordResetTemplate(string $username, string $code): string
    {
        return "
            <h2>Password Reset Request</h2>
            <p>Hi {$username},</p>
            <p>Your password reset code is: <strong>{$code}</strong></p>
            <p>This code will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        ";
    }
}