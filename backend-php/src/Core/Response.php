<?php

namespace PromptWars\Core;

class Response
{
    private $data;
    private $statusCode;
    private $headers;

    public function __construct($data, $statusCode = 200, $headers = [])
    {
        $this->data = $data;
        $this->statusCode = $statusCode;
        $this->headers = $headers;
    }

    public function send()
    {
        http_response_code($this->statusCode);
        
        header('Content-Type: application/json');
        foreach ($this->headers as $key => $value) {
            header("$key: $value");
        }
        
        echo json_encode($this->data);
        exit;
    }

    public static function json($data, $statusCode = 200)
    {
        return new self($data, $statusCode);
    }

    public static function error($message, $statusCode = 400)
    {
        return new self(['error' => $message], $statusCode);
    }

    public static function success($data = null, $message = 'Success')
    {
        return new self([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 200);
    }
}