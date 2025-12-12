<?php

namespace PromptWars\Core;

class Request
{
    private $method;
    private $path;
    private $headers;
    private $query;
    private $body;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $this->headers = getallheaders() ?: [];
        $this->query = $_GET;
        $this->body = $this->parseBody();
    }

    private function parseBody()
    {
        $contentType = $this->headers['Content-Type'] ?? '';
        
        if (strpos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            return json_decode($raw, true) ?? [];
        }
        
        return $_POST;
    }

    public function getMethod()
    {
        return $this->method;
    }

    public function getPath()
    {
        return rtrim($this->path, '/');
    }

    public function getHeader($name)
    {
        return $this->headers[$name] ?? null;
    }

    public function getQuery($key = null)
    {
        return $key ? ($this->query[$key] ?? null) : $this->query;
    }

    public function getBody($key = null)
    {
        if ($key) {
            return is_array($this->body) ? ($this->body[$key] ?? null) : null;
        }
        return $this->body;
    }

    public function getBearerToken()
    {
        $auth = $this->getHeader('Authorization');
        if ($auth && preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }
}