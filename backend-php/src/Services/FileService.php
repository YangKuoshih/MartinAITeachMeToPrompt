<?php

namespace PromptWars\Services;

class FileService
{
  private $uploadDir;
  private $maxFileSize = 5242880; // 5MB

  public function __construct()
  {
    $this->uploadDir = $_ENV['UPLOAD_DIR'] ?? __DIR__ . '/../../uploads';
    if (!is_dir($this->uploadDir)) {
      mkdir($this->uploadDir, 0755, true);
    }
  }

  public function upload($file, $userId)
  {
    if ($file['error'] !== UPLOAD_ERR_OK) {
      throw new \Exception('Upload failed');
    }

    if ($file['size'] > $this->maxFileSize) {
      throw new \Exception('File too large');
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $allowed = ['jpg', 'jpeg', 'png', 'pdf', 'txt'];
    if (!in_array(strtolower($ext), $allowed)) {
      throw new \Exception('Invalid file type');
    }

    $filename = uniqid($userId . '_') . '.' . $ext;
    $path = $this->uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $path)) {
      throw new \Exception('Failed to save file');
    }

    return ['filename' => $filename, 'path' => $path];
  }

  public function delete($filename)
  {
    $path = $this->uploadDir . '/' . basename($filename);
    if (file_exists($path)) {
      return unlink($path);
    }
    return false;
  }
}
