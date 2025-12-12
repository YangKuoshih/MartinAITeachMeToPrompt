<?php

namespace PromptWars\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class LiteLLMService
{
    private $client;
    private $apiKey;
    private $baseUrl;
    private $model;

    public function __construct()
    {
        $this->apiKey = '';
        $this->baseUrl = $_ENV['LITELLM_BASE_URL'] ?? 'http://localhost:11434';
        $this->model = $_ENV['LITELLM_MODEL'] ?? 'llama2';
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => 60,
            'headers' => [
                'Content-Type' => 'application/json'
            ]
        ]);
    }

    /**
     * Generate challenge based on topic and difficulty
     */
    public function generateChallenge($topic, $difficulty)
    {
        $topicDescriptions = [
            'monetary-policy' => 'Interest rate decisions, inflation targeting, economic indicators',
            'financial-stability' => 'Systemic risk, stress testing, bank supervision',
            'economic-research' => 'Economic data analysis, forecasting, policy research',
            'payment-systems' => 'FedNow, ACH, wire transfers, payment innovation',
            'consumer-protection' => 'Fair lending, compliance, consumer rights',
            'international-affairs' => 'Global markets, foreign exchange, international policy',
            'cyber-security' => 'Threat detection, incident response, security practices',
            'cloud' => 'AWS architecture, cloud security, migration strategies',
            'product-owners' => 'Product management, stakeholder communication, agile practices'
        ];

        switch ($difficulty) {
            case 'beginner':
                $points = 100;
                $estimatedTime = '10 minutes';
                break;
            case 'intermediate':
                $points = 200;
                $estimatedTime = '15 minutes';
                break;
            case 'advanced':
                $points = 300;
                $estimatedTime = '20 minutes';
                break;
            case 'expert':
                $points = 500;
                $estimatedTime = '25 minutes';
                break;
            default:
                $points = 100;
                $estimatedTime = '10 minutes';
        }

        $prompt = "Generate a Federal Reserve prompt engineering challenge as JSON:\n\n" .
            "{\n" .
            "  \"id\": \"fed_{$topic}_{$difficulty}_" . time() . "\",\n" .
            "  \"title\": \"Challenge Title\",\n" .
            "  \"description\": \"Brief description\",\n" .
            "  \"topic\": \"{$topic}\",\n" .
            "  \"difficulty\": \"{$difficulty}\",\n" .
            "  \"scenario\": \"Realistic Federal Reserve scenario\",\n" .
            "  \"objective\": \"What to accomplish\",\n" .
            "  \"constraints\": [\"3-4 requirements\"],\n" .
            "  \"hints\": [\"3-4 helpful tips\"],\n" .
            "  \"points\": {$points},\n" .
            "  \"estimatedTime\": \"{$estimatedTime}\"\n" .
            "}\n\n" .
            "Topic: " . ($topicDescriptions[$topic] ?? $topic) . "\n" .
            "Difficulty: {$difficulty}\n\n" .
            "Create a unique, realistic Federal Reserve {$topic} challenge. Return only valid JSON.";

        $response = $this->chat($prompt, 0.8, 2000);
        
        // Clean JSON from markdown
        $text = preg_replace('/^```json\s*/', '', $response);
        $text = preg_replace('/\s*```$/', '', $text);
        
        return json_decode(trim($text), true);
    }

    /**
     * Evaluate challenge submission
     */
    public function evaluateChallenge(
        $challengeId,
        $userPrompt,
        $challengeObjective,
        $challengeConstraints,
        $challengeScenario
    ) {
        // Backend validation for lazy prompts
        $trimmedPrompt = trim($userPrompt);
        
        if (strlen($trimmedPrompt) < 15) {
            return [
                'score' => 10,
                'passed' => false,
                'feedback' => 'Your prompt is too short. A proper prompt requires clear instructions, context, and structure.',
                'suggestions' => [
                    'Write a complete prompt with specific instructions',
                    'Add context and role definition',
                    'Include constraints and expected output format'
                ],
                'breakdown' => [
                    'constraintAdherence' => 2,
                    'constraintReasoning' => 'Prompt too short to meet any constraints',
                    'scenarioRelevance' => 3,
                    'scenarioReasoning' => 'Insufficient content to address scenario',
                    'objectiveAlignment' => 3,
                    'objectiveReasoning' => 'Cannot achieve objective with minimal input',
                    'techniqueApplication' => 2,
                    'techniqueReasoning' => 'No prompt engineering techniques demonstrated'
                ]
            ];
        }

        // Check if user copied challenge text
        $lowerPrompt = strtolower($trimmedPrompt);
        $lowerScenario = strtolower($challengeScenario ?? '');
        $lowerObjective = strtolower($challengeObjective ?? '');
        
        if (($lowerScenario && strpos($lowerPrompt, $lowerScenario) !== false) ||
            ($lowerObjective && strpos($lowerPrompt, $lowerObjective) !== false)) {
            return [
                'score' => 15,
                'passed' => false,
                'feedback' => 'You copied the challenge text instead of writing a prompt. Create an actual prompt that would instruct an AI to complete the task.',
                'suggestions' => [
                    'Write your own prompt from scratch',
                    'Think about how to instruct an AI to solve this',
                    'Use prompt engineering techniques like role-play or examples'
                ],
                'breakdown' => [
                    'constraintAdherence' => 4,
                    'constraintReasoning' => 'Copied challenge text, not a real prompt',
                    'scenarioRelevance' => 4,
                    'scenarioReasoning' => 'Regurgitated scenario instead of creating prompt',
                    'objectiveAlignment' => 4,
                    'objectiveReasoning' => 'Did not write a prompt to achieve objective',
                    'techniqueApplication' => 3,
                    'techniqueReasoning' => 'No original prompt engineering attempted'
                ]
            ];
        }

        $isFedTopic = (strpos($challengeId, 'fed_') === 0) || 
                      (strpos($challengeId, 'monetary') !== false) ||
                      (strpos($challengeId, 'financial') !== false);

        $fourthCriterion = $isFedTopic
            ? '"fedRelevance": 0-25,\n    "fedReasoning": "Federal Reserve context and domain relevance"'
            : '"techniqueApplication": 0-25,\n    "techniqueReasoning": "Prompt engineering techniques used"';

        $constraintsText = $challengeConstraints && is_array($challengeConstraints)
            ? implode("\n", array_map(function($c, $i) { return ($i + 1) . ". $c"; }, $challengeConstraints, array_keys($challengeConstraints)))
            : 'No specific constraints provided';

        $evaluationPrompt = "Evaluate this prompt engineering submission.\n\n" .
            "CHALLENGE:\n" .
            "Scenario: {$challengeScenario}\n" .
            "Objective: {$challengeObjective}\n" .
            "Constraints: {$constraintsText}\n\n" .
            "USER'S SUBMISSION: {$userPrompt}\n\n" .
            "CRITICAL VALIDATION RULES (MUST FAIL IF ANY VIOLATED):\n" .
            "1. If user just copied the scenario/objective/constraints text → FAIL (score 0-20)\n" .
            "2. If prompt is single word or < 15 characters → FAIL (score 0-15)\n" .
            "3. If prompt shows no prompt engineering effort → FAIL (score 0-30)\n" .
            "4. User must write an ACTUAL PROMPT that would instruct an AI, not just repeat the challenge\n\n" .
            "GRADING (25pts each, strict):\n" .
            "1. Constraint Adherence: Did they follow ALL requirements?\n" .
            "2. Scenario Relevance: Does prompt fit the scenario?\n" .
            "3. Objective Alignment: Will this prompt achieve the goal?\n" .
            "4. " . ($isFedTopic ? 'Fed Relevance' : 'Technique Application') . ": " .
            ($isFedTopic ? 'Fed context accuracy' : 'Proper prompt engineering techniques') . "\n\n" .
            "Return JSON only:\n" .
            "{\n" .
            "  \"score\": 0-100,\n" .
            "  \"passed\": true/false,\n" .
            "  \"feedback\": \"Brief assessment\",\n" .
            "  \"suggestions\": [\"2 improvements\"],\n" .
            "  \"breakdown\": {\n" .
            "    \"constraintAdherence\": 0-25,\n" .
            "    \"constraintReasoning\": \"Met/missed?\",\n" .
            "    \"scenarioRelevance\": 0-25,\n" .
            "    \"scenarioReasoning\": \"Fits scenario?\",\n" .
            "    \"objectiveAlignment\": 0-25,\n" .
            "    \"objectiveReasoning\": \"Achieves goal?\",\n" .
            "    {$fourthCriterion}\n" .
            "  }\n" .
            "}";

        $response = $this->chat($evaluationPrompt, 0.3, 1500);
        
        // Clean JSON from markdown
        $text = preg_replace('/^```json\s*/', '', $response);
        $text = preg_replace('/\s*```$/', '', $text);
        
        $evaluation = json_decode(trim($text), true);
        
        // Enforce passing threshold
        $evaluation['passed'] = ($evaluation['score'] ?? 0) >= 70;
        
        return $evaluation;
    }

    /**
     * Execute playground prompt
     */
    public function executePrompt(
        $prompt,
        $temperature = 0.7,
        $maxTokens = 1000,
        $topK = 40
    ) {
        return $this->chat($prompt, $temperature, $maxTokens);
    }

    /**
     * Generic chat completion
     */
    private function chat($prompt, $temperature = 0.7, $maxTokens = 1000)
    {
        try {
            $response = $this->client->post('/api/generate', [
                'json' => [
                    'model' => $this->model,
                    'prompt' => $prompt,
                    'stream' => false,
                    'options' => [
                        'temperature' => $temperature,
                        'num_predict' => $maxTokens
                    ]
                ]
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            return $body['response'] ?? '';
            
        } catch (GuzzleException $e) {
            error_log('LiteLLM API Error: ' . $e->getMessage());
            throw new \Exception('AI service unavailable: ' . $e->getMessage());
        }
    }
}