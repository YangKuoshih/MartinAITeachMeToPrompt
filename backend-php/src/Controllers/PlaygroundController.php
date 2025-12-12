<?php

namespace PromptWars\Controllers;

use PromptWars\Core\Request;
use PromptWars\Core\Response;
use PromptWars\Services\LiteLLMService;

class PlaygroundController
{
    public static function execute(Request $request): Response
    {
        $prompt = $request->getBody('prompt');
        $temperature = $request->getBody('temperature') ?? 0.7;
        $maxTokens = $request->getBody('max_tokens') ?? 1000;
        $topK = $request->getBody('top_k') ?? 40;

        if (!$prompt || strlen($prompt) > 5000) {
            return Response::error('Invalid prompt', 400);
        }

        if ($temperature < 0 || $temperature > 1) {
            return Response::error('Temperature must be between 0 and 1', 400);
        }

        if ($maxTokens < 1 || $maxTokens > 4096) {
            return Response::error('Max tokens must be between 1 and 4096', 400);
        }

        try {
            $aiService = new LiteLLMService();
            $response = $aiService->executePrompt($prompt, $temperature, $maxTokens, $topK);
            return Response::json(['response' => $response]);
        } catch (\Exception $e) {
            return Response::error('Failed to process prompt: ' . $e->getMessage(), 500);
        }
    }

    public static function test(Request $request): Response
    {
        return self::execute($request);
    }
}