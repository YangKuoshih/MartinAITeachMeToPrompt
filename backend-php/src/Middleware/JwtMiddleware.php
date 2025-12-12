<?php

namespace PromptWars\Middleware;

use Firebase\JWT\JWT;
use PromptWars\Core\Request;
use PromptWars\Core\Response;

class JwtMiddleware
{
    public function wrap(callable $handler, array $requiredRoles = []): callable
    {
        return function (Request $request, ...$args) use ($handler, $requiredRoles) {
            $token = $request->getBearerToken();
            
            if (!$token) {
                return Response::error('Unauthorized - No token provided', 401);
            }

            try {
                $decoded = JWT::decode($token, $_ENV['JWT_SECRET'], ['HS256']);
                
                // Attach user to request
                $request->user = [
                    'userId' => $decoded->userId,
                    'username' => $decoded->username,
                    'email' => $decoded->email,
                    'groups' => $decoded->groups ?? ['users']
                ];

                // Check role requirements
                if (!empty($requiredRoles)) {
                    $hasRole = false;
                    foreach ($requiredRoles as $role) {
                        if (in_array($role, $request->user['groups'])) {
                            $hasRole = true;
                            break;
                        }
                    }
                    
                    if (!$hasRole) {
                        return Response::error('Forbidden - Insufficient permissions', 403);
                    }
                }

                return call_user_func_array($handler, array_merge([$request], $args));
                
            } catch (\Exception $e) {
                return Response::error('Unauthorized - Invalid token', 401);
            }
        };
    }
}